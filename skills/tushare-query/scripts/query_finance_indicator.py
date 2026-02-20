#!/usr/bin/env python3
"""
查询财务指标数据

用法：
    python3 query_finance_indicator.py <ts_code>
    
示例：
    python3 query_finance_indicator.py 001316.SZ
"""

import sys
import os
import tushare as ts
import pandas as pd

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

def query_finance_indicator(ts_code):
    """查询主要财务指标"""
    token = get_token()
    ts.set_token(token)
    pro = ts.pro_api()
    
    try:
        df = pro.fina_indicator(ts_code=ts_code)
        
        if df.empty:
            print(f"未找到财务指标数据：{ts_code}")
            return None
        
        # 选择关键指标
        key_cols = [
            'ts_code', 'ann_date', 'end_date',
            'basic_eps', 'diluted_eps',  # 基本/稀释每股收益
            'roe', 'roe_wa',  # 净资产收益率
            'gross_margin', 'oper_margin', 'net_profit_margin',  # 利润率
            'current_ratio', 'quick_ratio',  # 偿债能力
            'turnover_days', 'inv_turn_days'  # 运营能力
        ]
        
        available_cols = [col for col in key_cols if col in df.columns]
        result = df[available_cols].head(8)
        
        # 打印结果
        print("=" * 80)
        print(f"财务指标：{ts_code}")
        print("=" * 80)
        print(result.to_string(index=False))
        print(f"\n共 {len(df)} 期数据")
        print("=" * 80)
        
        return result
        
    except Exception as e:
        print(f"查询失败：{e}")
        return None

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    
    ts_code = sys.argv[1]
    query_finance_indicator(ts_code)
