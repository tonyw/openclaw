#!/usr/bin/env python3
"""
使用 ZTrader MCP 查询 HBM 存储概念股，筛选持续盈利股票，按 PE 排序

用法:
    python3 query_hbm_ztrader.py
"""

import os
import sys
import json
import subprocess
import pandas as pd
import time
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed

def get_token():
    """获取 Tushare token"""
    token_file = os.path.expanduser('~/.tushare_token')
    if os.path.exists(token_file):
        with open(token_file, 'r') as f:
            return f.read().strip()
    return os.environ.get('TUSHARE_TOKEN')

def call_ztrader_tool(tool_name, **params):
    """通过 mcporter 调用 ZTrader MCP 工具"""
    try:
        # 构建参数部分
        param_parts = []
        for key, value in params.items():
            if isinstance(value, str):
                param_parts.append(f"{key}:'{value}'")
            else:
                param_parts.append(f"{key}:{value}")
        
        params_str = ' '.join(param_parts)
        
        cmd = f"mcporter call ztrader.{tool_name} {params_str}"
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            response = json.loads(result.stdout)
            return response.get('result', [])
        else:
            print(f"ZTrader 调用失败：{result.stderr}")
            return []
    except Exception as e:
        print(f"ZTrader 调用异常：{e}")
        return []

def check_stock_fundamentals(ts_code):
    """查询单只股票的基本面和 PE（使用 Tushare）"""
    import tushare as ts
    
    token = get_token()
    if not token:
        return None
    
    ts.set_token(token)
    pro = ts.pro_api()
    
    try:
        # 查询利润表
        df_income = pro.income(
            ts_code=ts_code,
            fields='ts_code,end_date,n_income_attr_p',
            limit=8
        )
        
        if df_income.empty:
            return None
        
        df_income = df_income.sort_values('end_date', ascending=False).drop_duplicates('end_date')
        profit_col = 'n_income_attr_p' if 'n_income_attr_p' in df_income.columns else 'n_income'
        
        # 检查连续盈利
        consecutive = 0
        for i in range(len(df_income)):
            if df_income.iloc[i][profit_col] > 0:
                consecutive += 1
            else:
                break
        
        if consecutive < 4:  # 至少连续 4 季度盈利
            return None
        
        # 计算 PE
        df_daily = pro.daily(ts_code=ts_code, limit=1)
        df_fina = pro.fina_indicator(ts_code=ts_code, limit=1)
        
        if df_daily.empty or df_fina.empty:
            return None
        
        close = df_daily.iloc[0]['close']
        eps = df_fina.iloc[0].get('eps')
        
        if not eps or eps <= 0:
            return None
        
        pe = close / eps
        
        # 获取股票名称
        df_basic = pro.stock_basic(ts_code=ts_code, fields='ts_code,name,industry')
        name = df_basic.iloc[0]['name'] if not df_basic.empty else 'Unknown'
        industry = df_basic.iloc[0]['industry'] if not df_basic.empty else ''
        
        return {
            'ts_code': ts_code,
            'name': name,
            'industry': industry,
            'PE': round(pe, 2),
            '收盘价': round(close, 2),
            'EPS': round(eps, 4),
            '连续盈利季度': consecutive,
            '最新净利润 (万元)': round(df_income.iloc[0][profit_col] / 10000, 2)
        }
        
    except Exception as e:
        return None

def main():
    print("=" * 80)
    print("HBM 存储概念股 - ZTrader MCP + Tushare 基本面筛选")
    print("=" * 80)
    print()
    
    start_time = time.time()
    
    # Step 1: 使用 ZTrader 获取 HBM 存储概念
    print("Step 1: 通过 ZTrader MCP 查询 HBM 存储概念...")
    hbm_concepts = call_ztrader_tool('get_kpl_concepts_by_name', name='HBM')
    
    if not hbm_concepts:
        print("  未找到 HBM 相关概念")
        return
    
    print(f"  找到 {len(hbm_concepts)} 条 HBM 概念记录")
    
    # Step 2: 获取 HBM 存储概念股成分（使用东财半导体板块替代）
    print()
    print("Step 2: 获取成分股...")
    
    # 由于 get_concept_stocks 返回空，使用东财半导体板块
    dc_members = call_ztrader_tool('get_dc_members', ts_code='BK0970.DC')
    
    if not dc_members:
        print("  未获取到成分股")
        return
    
    # 提取股票代码
    stock_codes = set()
    for member in dc_members:
        if 'con_code' in member:
            stock_codes.add(member['con_code'])
    
    print(f"  获取到 {len(stock_codes)} 只半导体概念股")
    
    # Step 3: 并发查询基本面数据
    print()
    print("Step 3: 并发查询基本面数据（Tushare）...")
    
    results = []
    
    with ThreadPoolExecutor(max_workers=10) as executor:
        future_to_stock = {
            executor.submit(check_stock_fundamentals, ts_code): ts_code 
            for ts_code in stock_codes
        }
        
        for i, future in enumerate(as_completed(future_to_stock)):
            ts_code = future_to_stock[future]
            try:
                result = future.result()
                if result:
                    results.append(result)
                    print(f"✓ {ts_code} {result['name']} - PE: {result['PE']:.2f}")
            except Exception as e:
                pass
            
            if (i + 1) % 10 == 0:
                print(f"  进度：{i+1}/{len(stock_codes)}")
    
    print()
    print("=" * 80)
    print(f"查询完成：{len(results)} 只股票符合连续盈利条件")
    print("=" * 80)
    
    if results:
        # 按 PE 排序（从低到高）
        df_result = pd.DataFrame(results)
        df_result = df_result.sort_values('PE')
        
        print()
        print("按 PE 从低到高排序:")
        print("-" * 100)
        print(df_result.to_string(index=False))
        print("-" * 100)
        
        # 保存
        output_file = f'hbm_ztrader_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
        df_result.to_csv(output_file, index=False, encoding='utf-8-sig')
        print(f"\n结果已保存到：{output_file}")
        
        # 统计
        print()
        print("📊 统计信息:")
        print(f"  最低 PE: {df_result['PE'].min():.2f} ({df_result.iloc[0]['name']})")
        print(f"  最高 PE: {df_result['PE'].max():.2f} ({df_result.iloc[-1]['name']})")
        print(f"  平均 PE: {df_result['PE'].mean():.2f}")
        print(f"  中位数 PE: {df_result['PE'].median():.2f}")
    else:
        print("\n没有股票符合连续盈利条件")
    
    elapsed = time.time() - start_time
    print()
    print("=" * 80)
    print(f"总耗时：{elapsed:.2f}秒")
    print("=" * 80)

if __name__ == '__main__':
    main()
