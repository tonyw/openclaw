#!/usr/bin/env python3
"""
选人形机器人题材股票（快速版，只处理前 100 只）
条件：最近 6 个季度盈利，最近一年每个季度环比增长
排序：按 PE 从低到高
"""

import tushare as ts
import pandas as pd
from datetime import datetime, timedelta
import time
import os

def get_token():
    token_file = os.path.expanduser('~/.tushare_token')
    with open(token_file, 'r') as f:
        return f.read().strip()

def get_quarterly_profits(code, pro):
    """获取单季度净利润（元），倒序 [最新，上一季，...]"""
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
            md = str(df.iloc[i]['end_date'])[-4:]
            if i + 1 < len(df):
                if md == '0331':
                    quarterly.append(cum)
                else:
                    quarterly.append(cum - df.iloc[i+1]['n_income'])
            else:
                quarterly.append(cum)
        return quarterly[:8]
    except:
        return None

def check_condition(profits):
    """检查 6 季度盈利 + 4 季度环比增长"""
    if not profits or len(profits) < 6:
        return False
    recent = profits[:6]
    if any(p is None or p <= 0 for p in recent):
        return False
    for i in range(3):
        if profits[i] <= profits[i+1]:
            return False
    return True

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
    
    # 获取人形机器人成分股
    df_dc = pro.dc_index()
    concepts = df_dc[df_dc['name'].str.contains('人形机器人|机器人', case=False, na=False)]
    
    all_stocks = set()
    for _, row in concepts.head(3).iterrows():
        try:
            members = pro.dc_member(ts_code=row['ts_code'])
            if not members.empty and 'con_code' in members.columns:
                all_stocks.update(members['con_code'].dropna().unique()[:100])
        except:
            pass
    
    stocks = list(all_stocks)[:100]
    print(f"处理 {len(stocks)} 只人形机器人概念股...")
    
    qualified = []
    for i, code in enumerate(stocks):
        if (i+1) % 20 == 0:
            print(f"进度：{i+1}/{len(stocks)}")
        
        profits = get_quarterly_profits(code, pro)
        if profits and check_condition(profits):
            pe = get_pe(code, pro)
            if pe and pe > 0:
                qualified.append({'code': code, 'pe': pe, 'profits': profits[:6]})
        
        time.sleep(0.15)  # 降速避免限流
    
    if not qualified:
        print("\n前 100 只股票中没有满足严格条件的")
        print("尝试放宽条件（仅 6 季度盈利）...")
        for i, code in enumerate(stocks):
            profits = get_quarterly_profits(code, pro)
            if profits and all(p and p > 0 for p in profits[:6]):
                pe = get_pe(code, pro)
                if pe and pe > 0:
                    qualified.append({'code': code, 'pe': pe, 'profits': profits[:6]})
            time.sleep(0.15)
    
    qualified.sort(key=lambda x: x['pe'])
    
    df_basic = pro.stock_basic(fields='ts_code,name')
    names = dict(zip(df_basic['ts_code'], df_basic['name']))
    
    print(f"\n找到 {len(qualified)} 只股票:")
    print(f"{'序号':<4} {'代码':<12} {'名称':<10} {'PE':<8} {'最近 6 季度净利润 (万元)'}")
    print("-" * 70)
    for i, s in enumerate(qualified[:20]):
        name = names.get(s['code'], '?')
        p_str = ' → '.join([f"{p/10000:.1f}" for p in s['profits']])
        print(f"{i+1:<4} {s['code']:<12} {name:<10} {s['pe']:<8.2f} {p_str}")

if __name__ == '__main__':
    main()
