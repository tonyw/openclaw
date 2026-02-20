#!/usr/bin/env python3
"""
查询股票基础信息

用法：
    python3 query_stock_basic.py <ts_code>
    
示例：
    python3 query_stock_basic.py 001316.SZ
    python3 query_stock_basic.py 600519.SH
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
    print("请设置环境变量 TUSHARE_TOKEN 或创建文件 ~/.tushare_token")
    sys.exit(1)

def query_stock_basic(ts_code):
    """查询股票基础信息"""
    token = get_token()
    ts.set_token(token)
    pro = ts.pro_api()
    
    try:
        # 查询股票基本信息
        df = pro.stock_basic(
            exchange='',
            list_status='L',
            fields='ts_code,symbol,name,area,industry,market,list_date'
        )
        
        # 筛选指定股票
        if ts_code:
            result = df[df['ts_code'] == ts_code]
            if result.empty:
                # 尝试模糊匹配
                result = df[df['symbol'] == ts_code.split('.')[0]]
        
        if result.empty:
            print(f"未找到股票：{ts_code}")
            print("\n可用的股票查询方式:")
            print("  - 使用完整代码：001316.SZ, 600519.SH")
            print("  - 或使用搜索功能")
            return None
            
        # 打印结果
        print("=" * 60)
        print(f"股票基础信息：{ts_code}")
        print("=" * 60)
        for _, row in result.iterrows():
            print(f"股票代码：  {row['ts_code']}")
            print(f"股票简称：  {row['name']}")
            print(f"所属区域：  {row['area']}")
            print(f"所属行业：  {row['industry']}")
            print(f"市场类型：  {row['market']}")
            print(f"上市日期：  {row['list_date']}")
        print("=" * 60)
        
        return result
        
    except Exception as e:
        print(f"查询失败：{e}")
        return None

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    
    ts_code = sys.argv[1]
    query_stock_basic(ts_code)
