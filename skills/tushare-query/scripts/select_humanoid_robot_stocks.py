#!/usr/bin/env python
"""
选人形机器人题材股票：
- 最近 6 个季度盈利
- 最近一年每个季度环比都增长
- 按实时 PE 从低到高排序

用法：
    python select_humanoid_robot_stocks.py
"""

import sys
import os
import tushare as ts
import pandas as pd
from datetime import datetime, timedelta
import time

def get_token():
    """从文件或环境变量获取 token"""
    token_file = os.path.expanduser('~/.tushare_token')
    if os.path.exists(token_file):
        with open(token_file, 'r') as f:
            return f.read().strip()
    env_token = os.environ.get('TUSHARE_TOKEN')
    if env_token:
        return env_token
    print("错误：未找到 Tushare token")
    sys.exit(1)

def get_humanoid_robot_stocks():
    """获取人形机器人概念成分股"""
    token = get_token()
    ts.set_token(token)
    pro = ts.pro_api()
    
    # 使用东财板块数据
    df_dc = pro.dc_index()
    
    # 找人形机器人相关板块
    keywords = ['人形机器人', '机器人']
    matched_concepts = []
    
    for kw in keywords:
        match = df_dc[df_dc['name'].str.contains(kw, case=False, na=False)]
        for _, row in match.iterrows():
            matched_concepts.append({
                'ts_code': row['ts_code'],
                'name': row['name']
            })
    
    # 去重
    seen = set()
    unique_concepts = []
    for c in matched_concepts:
        if c['ts_code'] not in seen:
            seen.add(c['ts_code'])
            unique_concepts.append(c)
    
    if not unique_concepts:
        print("未找到人形机器人相关板块")
        return []
    
    print(f"匹配到的东财板块:")
    for c in unique_concepts:
        print(f"  - {c['ts_code']}: {c['name']}")
    print()
    
    # 获取成分股
    all_stocks = set()
    for concept in unique_concepts:
        try:
            df_members = pro.dc_member(ts_code=concept['ts_code'])
            if not df_members.empty and 'con_code' in df_members.columns:
                all_stocks.update(df_members['con_code'].dropna().unique())
        except Exception as e:
            print(f"获取 {concept['name']} 成分股失败：{e}")
    
    return list(all_stocks)

def get_quarterly_profits(code, pro):
    """
    获取股票单季度净利润数据
    使用利润表累计数据计算单季度值
    返回：按时间倒序的单季度净利润列表 [最新季度，上一季度，...]
    """
    try:
        # 查询利润表
        df_income = pro.income(ts_code=code, fields='ts_code,end_date,n_income')
        
        if df_income.empty:
            return None
        
        # 按报告期末排序（倒序，最新在前）
        df_income = df_income.sort_values('end_date', ascending=False)
        
        # 去重
        df_income = df_income.drop_duplicates(subset=['end_date'], keep='first')
        
        # 只保留季度末数据
        df_income['month_day'] = df_income['end_date'].astype(str).str[-4:]
        df_income = df_income[df_income['month_day'].isin(['0331', '0630', '0930', '1231'])]
        
        if len(df_income) < 6:
            return None
        
        # 取最近 8 个季度
        df_income = df_income.head(8).reset_index(drop=True)
        
        # 计算单季度净利润
        quarterly_profits = []
        for i in range(len(df_income)):
            end_date = str(df_income.iloc[i]['end_date'])
            month_day = end_date[-4:]
            cumulative = df_income.iloc[i]['n_income']
            
            if month_day == '1231':
                # Q4: 单季 = 全年累计（本身就是单季度值）
                # 但需要减去前 3 季度累计
                if i + 1 < len(df_income) and str(df_income.iloc[i+1]['end_date'])[-4:] == '0930':
                    single_quarter = cumulative - df_income.iloc[i+1]['n_income']
                else:
                    single_quarter = cumulative
            elif month_day == '0331':
                # Q1: 单季 = Q1 累计（本身就是单季度值）
                single_quarter = cumulative
            else:
                # Q2, Q3: 单季 = 本季度累计 - 上季度累计
                if i + 1 < len(df_income):
                    single_quarter = cumulative - df_income.iloc[i+1]['n_income']
                else:
                    single_quarter = cumulative
            
            quarterly_profits.append(single_quarter)
        
        return quarterly_profits[:8]
        
    except Exception as e:
        return None

def check_profit_condition(profits):
    """
    检查是否满足：
    1. 最近 6 个季度都盈利
    2. 最近 4 个季度（一年）环比增长
    
    profits: 按时间倒序的单季度净利润列表 [最新季度，上一季度，...]
    """
    if profits is None or len(profits) < 6:
        return False, "数据不足"
    
    recent_6 = profits[:6]
    
    # 检查是否有空值
    if any(p is None or pd.isna(p) for p in recent_6):
        return False, "数据不完整"
    
    # 检查最近 6 个季度是否都盈利（净利润 > 0）
    for i, p in enumerate(recent_6):
        if p <= 0:
            return False, f"第{i+1}近季度亏损"
    
    # 检查最近 4 个季度环比增长
    for i in range(3):
        if profits[i] <= profits[i+1]:
            return False, f"第{i+1}季度环比未增长"
    
    return True, "满足条件"

def get_stock_pe(code, pro):
    """获取股票当前 PE（TTM）"""
    try:
        today = datetime.now().strftime('%Y%m%d')
        df = pro.daily(ts_code=code, start_date=today, end_date=today)
        
        if df.empty:
            for days_ago in range(1, 15):
                date = (datetime.now() - timedelta(days=days_ago)).strftime('%Y%m%d')
                df = pro.daily(ts_code=code, start_date=date, end_date=date)
                if not df.empty:
                    break
        
        if df.empty:
            return None
        
        close = df['close'].iloc[0]
        
        df_indicator = pro.fina_indicator(ts_code=code)
        if df_indicator.empty:
            return None
        
        df_indicator = df_indicator.sort_values('end_date', ascending=False).head(1)
        
        if 'pe_ttm' in df_indicator.columns:
            pe_ttm = df_indicator['pe_ttm'].iloc[0]
            if pe_ttm and pe_ttm > 0:
                return pe_ttm
        
        if 'eps' in df_indicator.columns:
            eps = df_indicator['eps'].iloc[0]
        elif 'basic_eps' in df_indicator.columns:
            eps = df_indicator['basic_eps'].iloc[0]
        else:
            return None
        
        if eps and eps > 0:
            return close / eps
        
        return None
        
    except Exception as e:
        return None

def main():
    token = get_token()
    ts.set_token(token)
    pro = ts.pro_api()
    
    print("=" * 80)
    print("人形机器人题材股票筛选")
    print("条件：最近 6 个季度盈利，最近一年每个季度环比增长")
    print("排序：按 PE 从低到高")
    print("=" * 80)
    print()
    
    # 获取成分股
    print("正在获取人形机器人概念成分股...")
    stocks = get_humanoid_robot_stocks()
    
    if not stocks:
        print("未找到人形机器人概念成分股")
        return
    
    print(f"共找到 {len(stocks)} 只成分股")
    print()
    
    # 筛选
    print("正在筛选财务数据...")
    qualified_stocks = []
    api_count = 0
    
    for i, code in enumerate(stocks):
        if (i + 1) % 50 == 0:
            print(f"  处理进度：{i+1}/{len(stocks)} (已找到 {len(qualified_stocks)} 只符合)")
            time.sleep(0.5)  # 限流
        
        profits = get_quarterly_profits(code, pro)
        api_count += 1
        if api_count >= 450:
            print("  达到 API 限流，等待 65 秒...")
            time.sleep(65)
            api_count = 0
        
        if profits is None:
            continue
        
        is_qualified, reason = check_profit_condition(profits)
        if is_qualified:
            pe = get_stock_pe(code, pro)
            api_count += 1
            if pe and pe > 0:
                qualified_stocks.append({
                    'code': code,
                    'pe': pe,
                    'profits': profits[:6]
                })
    
    print()
    print(f"筛选出 {len(qualified_stocks)} 只符合条件的股票")
    print()
    
    if not qualified_stocks:
        print("没有股票满足所有条件（6 季度盈利 + 4 季度环比增长）")
        print()
        print("放宽条件：仅筛选最近 6 个季度盈利的股票...")
        
        api_count = 0
        for i, code in enumerate(stocks):
            if (i + 1) % 50 == 0:
                print(f"  处理进度：{i+1}/{len(stocks)}")
                time.sleep(0.5)
            
            profits = get_quarterly_profits(code, pro)
            api_count += 1
            if api_count >= 450:
                time.sleep(65)
                api_count = 0
            
            if profits is None:
                continue
            
            recent_6 = profits[:6]
            if all(p is not None and p > 0 for p in recent_6):
                pe = get_stock_pe(code, pro)
                api_count += 1
                if pe and pe > 0:
                    qualified_stocks.append({
                        'code': code,
                        'pe': pe,
                        'profits': profits[:6]
                    })
        
        qualified_stocks.sort(key=lambda x: x['pe'])
        
        if not qualified_stocks:
            print("仍然没有股票满足条件")
            return
        
        print()
        print("=" * 80)
        print("筛选结果（放宽条件：仅最近 6 季度盈利，按 PE 从低到高排序）")
        print("=" * 80)
    else:
        qualified_stocks.sort(key=lambda x: x['pe'])
        print("=" * 80)
        print("筛选结果（按 PE 从低到高排序）")
        print("=" * 80)
    
    # 获取股票名称
    print("正在获取股票信息...")
    df_basic = pro.stock_basic(fields='ts_code,name,industry,market,list_status')
    stock_names = dict(zip(df_basic['ts_code'], df_basic['name']))
    
    print()
    print(f"{'序号':<6} {'代码':<12} {'名称':<12} {'PE':<10} {'最近 6 季度净利润 (万元)'}")
    print("-" * 80)
    
    for i, stock in enumerate(qualified_stocks):
        name = stock_names.get(stock['code'], '未知')
        profits_str = ' → '.join([f"{p/10000:.1f}" for p in stock['profits']])
        print(f"{i+1:<6} {stock['code']:<12} {name:<12} {stock['pe']:<10.2f} {profits_str}")
    
    print("=" * 80)
    print(f"共 {len(qualified_stocks)} 只股票满足条件")
    print("=" * 80)

if __name__ == '__main__':
    main()
