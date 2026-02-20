#!/usr/bin/env python3
"""
选股策略：字节跳动/豆包概念 + 连续 6 季度盈利 + 最近一年利润同比增长 + 按 PE 排序

用法：
    python3 select_bytemd_stocks.py
"""

import os
import sys
import tushare as ts
import pandas as pd
from datetime import datetime

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

def check_profit_condition(ts_code, quarters=6):
    """
    检查连续 N 个季度是否盈利，且最近一年净利润同比增长
    
    返回：(是否符合条件，PE, 最近 4 季净利润，净利润同比增长率，连续盈利季度数)
    """
    token = get_token()
    ts.set_token(token)
    pro = ts.pro_api()
    
    try:
        # 查询利润表 - 使用正确的字段名
        df = pro.income(
            ts_code=ts_code,
            fields='ts_code,ann_date,end_date,n_income,n_income_attr_p',
            limit=20
        )
        
        if df.empty:
            return False, None, None, None, 0
        
        # 按报告期排序
        df = df.sort_values('end_date', ascending=False).drop_duplicates('end_date')
        
        # 使用归母净利润（如果有），否则用净利润
        profit_col = 'n_income_attr_p' if 'n_income_attr_p' in df.columns else 'n_income'
        
        # 检查连续盈利季度数
        consecutive_profit_quarters = 0
        for i in range(len(df)):
            net_profit = df.iloc[i][profit_col]
            if pd.notna(net_profit) and net_profit > 0:
                consecutive_profit_quarters += 1
            else:
                break
        
        # 检查是否满足连续盈利季度数
        if consecutive_profit_quarters < quarters:
            return False, None, None, None, consecutive_profit_quarters
        
        # 检查最近一年净利润同比增长（对比去年同期 4 个季度总和）
        if len(df) < 8:  # 至少需要 8 个季度数据
            return False, None, None, None, consecutive_profit_quarters
        
        # 计算最近 4 个季度总和
        recent_4q_profit = df.iloc[0:4][profit_col].sum()
        # 计算去年 4 个季度总和
        last_year_4q_profit = df.iloc[4:8][profit_col].sum()
        
        if pd.isna(recent_4q_profit) or pd.isna(last_year_4q_profit):
            return False, None, None, None, consecutive_profit_quarters
        
        if last_year_4q_profit <= 0:
            return False, None, None, None, consecutive_profit_quarters
        
        # 计算同比增长率
        yoy_growth = (recent_4q_profit - last_year_4q_profit) / last_year_4q_profit * 100
        
        # 要求同比增长
        if yoy_growth <= 0:
            return False, None, None, None, consecutive_profit_quarters
        
        # 获取 PE (手动计算：PE = 收盘价 / 每股收益)
        pe = None
        try:
            # 获取最新收盘价
            df_daily = pro.daily(ts_code=ts_code, limit=1)
            if not df_daily.empty:
                close_price = df_daily.iloc[0]['close']
                
                # 获取每股收益
                df_fina = pro.fina_indicator(ts_code=ts_code, limit=1)
                if not df_fina.empty and 'eps' in df_fina.columns:
                    eps = df_fina.iloc[0]['eps']
                    if pd.notna(eps) and eps > 0:
                        # 年化 PE (如果是季度数据，需要乘以 4)
                        # 但 tushare 的 eps 已经是 TTM 或最新报告期
                        # 这里简单用收盘价/eps
                        pe = close_price / eps
        except Exception as e:
            pass
        
        return True, pe, recent_4q_profit, yoy_growth, consecutive_profit_quarters
        
    except Exception as e:
        # print(f"  {ts_code} 查询失败：{e}")
        return False, None, None, None, 0

def main():
    print("=" * 80)
    print("选股策略：字节跳动/豆包概念 + 连续 6 季度盈利 + 最近一年利润同比增长")
    print("=" * 80)
    print()
    
    # 字节跳动/豆包产业链相关股票（手动维护）
    bytemd_stocks = {
        # 营销/广告合作
        '300058.SZ',  # 蓝色光标
        '300785.SZ',  # 值得买
        '002027.SZ',  # 分众传媒
        '300781.SZ',  # 因赛集团
        '300792.SZ',  # 壹网壹创
        
        # 游戏合作
        '002555.SZ',  # 三七互娱
        '002624.SZ',  # 完美世界
        '002605.SZ',  # 姚记科技
        
        # 内容/影视
        '300251.SZ',  # 光线传媒
        '300413.SZ',  # 芒果超媒
        '002739.SZ',  # 万达电影
        '300133.SZ',  # 华策影视
        '002292.SZ',  # 奥飞娱乐
        
        # 科技/供应链
        '001316.SZ',  # 润贝航科
        '002405.SZ',  # 四维图新
        '300088.SZ',  # 长信科技
        '300666.SZ',  # 江丰电子
        '300269.SZ',  # 联建光电
        '002315.SZ',  # 焦点科技
        
        # 其他
        '300144.SZ',  # 宋城演艺
    }
    
    # 获取股票基本信息
    token = get_token()
    ts.set_token(token)
    pro = ts.pro_api()
    
    df_basic = pro.stock_basic(
        exchange='',
        list_status='L',
        fields='ts_code,name,area,industry'
    )
    
    print(f"待筛选股票总数：{len(bytemd_stocks)}")
    print()
    print("股票列表:")
    for ts_code in sorted(bytemd_stocks):
        name_row = df_basic[df_basic['ts_code'] == ts_code]
        name = name_row.iloc[0]['name'] if not name_row.empty else 'Unknown'
        print(f"  - {ts_code} {name}")
    print()
    print("开始筛选...")
    print()
    
    # 筛选符合条件的股票
    qualified_stocks = []
    total = len(bytemd_stocks)
    
    for i, ts_code in enumerate(sorted(bytemd_stocks)):
        if (i + 1) % 5 == 0:
            print(f"进度：{i+1}/{total}")
        
        passed, pe, profit, yoy, consec_q = check_profit_condition(ts_code, quarters=6)
        
        if passed:
            name_row = df_basic[df_basic['ts_code'] == ts_code]
            name = name_row.iloc[0]['name'] if not name_row.empty else 'Unknown'
            
            qualified_stocks.append({
                'ts_code': ts_code,
                'name': name,
                'PE': round(pe, 2) if pe and pd.notna(pe) else None,
                '最近 4 季净利润 (万元)': round(profit / 10000, 2) if profit and pd.notna(profit) else None,
                '同比增长 (%)': round(yoy, 2) if yoy and pd.notna(yoy) else None,
                '连续盈利季度': consec_q
            })
            pe_str = f"{pe:.2f}" if pe and pd.notna(pe) else "N/A"
            print(f"  ✓ {ts_code} {name} - PE: {pe_str}, 同比增长：{yoy:.2f}%, 连续盈利：{consec_q}季度")
    
    print()
    print("=" * 80)
    print(f"筛选结果：{len(qualified_stocks)} 只股票符合条件")
    print("=" * 80)
    
    if qualified_stocks:
        # 按 PE 排序
        df_result = pd.DataFrame(qualified_stocks)
        
        # 分离有 PE 和无 PE 的
        df_with_pe = df_result[df_result['PE'].notna()].sort_values('PE')
        df_without_pe = df_result[df_result['PE'].isna()]
        
        # 合并
        df_result = pd.concat([df_with_pe, df_without_pe])
        
        print()
        print("按 PE 从低到高排序:")
        print("-" * 100)
        for _, row in df_result.iterrows():
            pe_str = f"{row['PE']:.2f}" if row['PE'] else "N/A"
            print(f"{row['ts_code']} {row['name']:10} PE: {pe_str:8}  净利润：{row['最近 4 季净利润 (万元)']:10.2f}万元  同比增长：{row['同比增长 (%)']:6.2f}%  连续盈利：{row['连续盈利季度']}季度")
        print("-" * 100)
        
        # 保存到文件
        output_file = 'bytemd_qualified_stocks.csv'
        df_result.to_csv(output_file, index=False, encoding='utf-8-sig')
        print(f"\n结果已保存到：{output_file}")
    else:
        print("没有股票符合所有条件")
    
    print("=" * 80)

if __name__ == '__main__':
    main()
