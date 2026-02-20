#!/usr/bin/env python3
"""
查询财务业绩数据（使用利润表）

用法：
    python3 query_performance.py <ts_code> [start_date] [end_date]
    
示例：
    python3 query_performance.py 001316.SZ
    python3 query_performance.py 001316.SZ 20240101 20251231

注：业绩快报接口需要较高权限，本脚本使用利润表数据替代
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

def query_performance(ts_code, start_date=None, end_date=None):
    """查询利润表数据（替代业绩快报）"""
    token = get_token()
    ts.set_token(token)
    pro = ts.pro_api()
    
    try:
        # 默认查询最近 2 年
        if not end_date:
            end_date = pd.Timestamp.now().strftime('%Y%m%d')
        if not start_date:
            start_date = (pd.Timestamp.now() - pd.Timedelta(days=730)).strftime('%Y%m%d')
        
        df = pro.income(
            ts_code=ts_code,
            start_date=start_date,
            end_date=end_date,
            fields='ts_code,ann_date,end_date,total_revenue,op,profit,net_profit,deduct_net_profit'
        )
        
        if df.empty:
            print(f"未找到利润表数据：{ts_code}")
            return None
        
        # 打印结果
        print("=" * 100)
        print(f"利润表数据：{ts_code} ({start_date} - {end_date})")
        print("=" * 100)
        print(df.head(10).to_string(index=False))
        print(f"\n共 {len(df)} 期数据")
        print("=" * 100)
        
        return df
        
    except Exception as e:
        print(f"查询失败：{e}")
        return None

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    
    ts_code = sys.argv[1]
    start_date = sys.argv[2] if len(sys.argv) > 2 else None
    end_date = sys.argv[3] if len(sys.argv) > 3 else None
    
    query_performance(ts_code, start_date, end_date)
