#!/usr/bin/env python3
"""
查询 HBM 芯片概念股，筛选持续盈利股票，按 PE 排序

用法:
    python3 query_hbm_stocks.py
"""

import os
import sys
import pandas as pd
import time
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed

# HBM 芯片相关概念股（手动维护）
HBM_STOCK_POOL = {
    # HBM 产业链
    '603005.SH',  # 晶方科技 - 封装测试
    '002156.SZ',  # 通富微电 - 封装
    '600584.SH',  # 长电科技 - 封装
    '002049.SZ',  # 紫光国微 - 芯片设计
    '688008.SH',  # 澜起科技 - 内存接口芯片
    '300474.SZ',  # 景嘉微 - GPU
    '688041.SH',  # 海光信息 - CPU
    '002371.SZ',  # 北方华创 - 设备
    '688012.SH',  # 中微公司 - 设备
    '603986.SH',  # 兆易创新 - 存储芯片
    '300604.SZ',  # 长川科技 - 测试设备
    '002185.SZ',  # 华天科技 - 封装
    '002180.SZ',  # 纳思达 - 芯片
    '600703.SH',  # 三安光电 - LED 芯片
    '300666.SZ',  # 江丰电子 - 靶材
    '300672.SZ',  # 国科微 - 芯片
    '688126.SH',  # 沪硅产业 - 硅片
    '603893.SH',  # 瑞芯微 - SoC 芯片
    '688037.SH',  # 芯源微 - 设备
    '300327.SZ',  # 中颖电子 - 芯片
}

def get_token():
    """获取 Tushare token"""
    token_file = os.path.expanduser('~/.tushare_token')
    if os.path.exists(token_file):
        with open(token_file, 'r') as f:
            return f.read().strip()
    return os.environ.get('TUSHARE_TOKEN')

def check_stock(ts_code):
    """查询单只股票的基本面和 PE"""
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
        # print(f"{ts_code} 查询失败：{e}")
        return None

def main():
    print("=" * 80)
    print("HBM 芯片概念股 - 持续盈利筛选")
    print("=" * 80)
    print()
    
    start_time = time.time()
    
    # 并发查询
    print(f"正在查询 {len(HBM_STOCK_POOL)} 只 HBM 概念股...")
    print()
    
    results = []
    
    with ThreadPoolExecutor(max_workers=10) as executor:
        future_to_stock = {
            executor.submit(check_stock, ts_code): ts_code 
            for ts_code in HBM_STOCK_POOL
        }
        
        for i, future in enumerate(as_completed(future_to_stock)):
            ts_code = future_to_stock[future]
            try:
                result = future.result()
                if result:
                    results.append(result)
                    print(f"✓ {ts_code} {result['name']} - PE: {result['PE']:.2f}")
            except Exception as e:
                print(f"✗ {ts_code} 查询失败")
        
        if (i + 1) % 5 == 0:
            print(f"  进度：{i+1}/{len(HBM_STOCK_POOL)}")
    
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
        output_file = f'hbm_stocks_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
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
