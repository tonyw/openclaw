#!/usr/bin/env python3
"""
查询日线行情数据

用法：
    python3 query_daily.py <ts_code> [start_date] [end_date]
    
示例：
    python3 query_daily.py 001316.SZ 20250101 20251231
    python3 query_daily.py 600519.SH
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

def query_daily(ts_code, start_date=None, end_date=None):
    """查询日线行情"""
    token = get_token()
    ts.set_token(token)
    pro = ts.pro_api()
    
    try:
        # 默认查询最近 3 个月
        if not end_date:
            end_date = pd.Timestamp.now().strftime('%Y%m%d')
        if not start_date:
            start_date = (pd.Timestamp.now() - pd.Timedelta(days=90)).strftime('%Y%m%d')
        
        df = pro.daily(
            ts_code=ts_code,
            start_date=start_date,
            end_date=end_date
        )
        
        if df.empty:
            print(f"未找到数据：{ts_code} ({start_date} - {end_date})")
            return None
        
        # 打印结果
        print("=" * 80)
        print(f"日线行情：{ts_code} ({start_date} - {end_date})")
        print("=" * 80)
        print(df[['trade_date', 'open', 'high', 'low', 'close', 'vol', 'amount']].head(10).to_string(index=False))
        print(f"\n共 {len(df)} 条记录")
        print("=" * 80)
        
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
    
    query_daily(ts_code, start_date, end_date)
