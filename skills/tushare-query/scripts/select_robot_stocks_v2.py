#!/usr/bin/env python3
"""
选人形机器人题材股票
条件：最近 6 个季度盈利，最近 4 个季度环比增长
排序：按 PE 从低到高
"""

import tushare as ts
import pandas as pd
import time
import os

def get_token():
    token_file = os.path.expanduser('~/.tushare_token')
    with open(token_file, 'r') as f:
        return f.read().strip()

def get_quarterly_profits(code, pro):
    """获取单季度净利润（元），倒序 [最新季度，上一季，...]"""
    try:
        df = pro.income(ts_code=code, fields='ts_code,end_date,n_income')
        if df.empty:
            return None
        
        df = df.sort_values('end_date', ascending=False)
        df = df.drop_duplicates(subset=['end_date'], keep='first')
        df['md'] = df['end_date'].astype(str).str[-4:]
        df = df[df['md'].isin(['0331', '0630', '0930', '1231'])].head(8).reset_index(drop=True)
        
        if len(df) < 6:
            return None
        
        quarterly = []
        for i in range(len(df)):
            cum = df.iloc[i]['n_income']
            if i + 1 < len(df):
                # 单季 = 本季度累计 - 上季度累计
                quarterly.append(cum - df.iloc[i+1]['n_income'])
            else:
                # 最后一个季度（最早），直接用累计值（假设是 Q1）
                quarterly.append(cum)
        return quarterly[:8]
    except Exception as e:
        return None

def check_strict(profits):
    """严格条件：6 季度盈利 + 4 季度环比增长"""
    if not profits or len(profits) < 6:
        return False, "数据不足"
    recent = profits[:6]
    for i, p in enumerate(recent):
        if p is None or p <= 0:
            return False, f"Q{i+1}亏损"
    for i in range(3):
        if profits[i] <= profits[i+1]:
            return False, f"Q{i+1}未环比增长"
    return True, "符合"

def check_loose(profits):
    """宽松条件：仅 6 季度盈利"""
    if not profits or len(profits) < 6:
        return False
    return all(p and p > 0 for p in profits[:6])

def get_pe(code, pro):
    try:
        df = pro.fina_indicator(ts_code=code)
        if df.empty:
            return None
        df = df.sort_values('end_date', ascending=False).head(1)
        if 'pe_ttm' in df.columns and df['pe_ttm'].iloc[0] and df['pe_ttm'].iloc[0] > 0:
            return df['pe_ttm'].iloc[0]
        return None
    except:
        return None

def main():
    token = get_token()
    ts.set_token(token)
    pro = ts.pro_api()
    
    print("=" * 80)
    print("人形机器人题材股票筛选")
    print("条件：最近 6 季度盈利 + 最近 4 季度环比增长 | 放宽：仅 6 季度盈利")
    print("=" * 80)
    
    # 获取人形机器人成分股
    df_dc = pro.dc_index()
    concepts = df_dc[df_dc['name'].str.contains('人形机器人', case=False, na=False)]
    
    all_stocks = set()
    for _, row in concepts.iterrows():
        try:
            members = pro.dc_member(ts_code=row['ts_code'])
            if not members.empty and 'con_code' in members.columns:
                all_stocks.update(members['con_code'].dropna().unique())
        except:
            pass
    
    stocks = list(all_stocks)
    print(f"共 {len(stocks)} 只成分股，开始筛选...")
    
    qualified_strict = []
    qualified_loose = []
    
    for i, code in enumerate(stocks):
        if (i+1) % 100 == 0:
            print(f"进度：{i+1}/{len(stocks)} | 严格：{len(qualified_strict)} | 宽松：{len(qualified_loose)}")
            time.sleep(1)
        
        profits = get_quarterly_profits(code, pro)
        if not profits:
            continue
        
        is_strict, reason = check_strict(profits)
        if is_strict:
            pe = get_pe(code, pro)
            if pe:
                qualified_strict.append({'code': code, 'pe': pe, 'profits': profits[:6]})
        elif check_loose(profits):
            pe = get_pe(code, pro)
            if pe:
                qualified_loose.append({'code': code, 'pe': pe, 'profits': profits[:6]})
        
        # 控制 API 调用频率
        if (i+1) % 400 == 0:
            print("  等待 API 限流恢复...")
            time.sleep(65)
    
    print(f"\n严格条件：{len(qualified_strict)}只 | 宽松条件：{len(qualified_loose)}只")
    
    # 输出结果
    df_basic = pro.stock_basic(fields='ts_code,name')
    names = dict(zip(df_basic['ts_code'], df_basic['name']))
    
    if qualified_strict:
        qualified_strict.sort(key=lambda x: x['pe'])
        print("\n" + "=" * 80)
        print("严格条件结果（6 季度盈利 +4 季度环比增长，按 PE 排序）")
        print("=" * 80)
        print(f"{'序号':<4} {'代码':<12} {'名称':<10} {'PE':<8} {'最近 6 季度净利润 (万元)'}")
        for i, s in enumerate(qualified_strict):
            name = names.get(s['code'], '?')
            p_str = ' → '.join([f"{p/10000:.1f}" for p in s['profits']])
            print(f"{i+1:<4} {s['code']:<12} {name:<10} {s['pe']:<8.2f} {p_str}")
    else:
        print("\n⚠️ 没有股票满足严格条件（6 季度盈利 +4 季度环比增长）")
        
        if qualified_loose:
            qualified_loose.sort(key=lambda x: x['pe'])
            print("\n" + "=" * 80)
            print("放宽条件结果（仅 6 季度盈利，按 PE 排序）- 前 30 只")
            print("=" * 80)
            print(f"{'序号':<4} {'代码':<12} {'名称':<10} {'PE':<8} {'最近 6 季度净利润 (万元)'}")
            for i, s in enumerate(qualified_loose[:30]):
                name = names.get(s['code'], '?')
                p_str = ' → '.join([f"{p/10000:.1f}" for p in s['profits']])
                print(f"{i+1:<4} {s['code']:<12} {name:<10} {s['pe']:<8.2f} {p_str}")
            print(f"\n共 {len(qualified_loose)} 只，以上为前 30 只")

if __name__ == '__main__':
    main()
