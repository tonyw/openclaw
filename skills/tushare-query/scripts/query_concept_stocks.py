#!/usr/bin/env python
"""
查询概念板块成分股

用法：
    python query_concept_stocks.py <concept_name>
    
示例：
    python query_concept_stocks.py 人工智能
    python query_concept_stocks.py 新能源车
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

def query_concept_stocks(concept_name):
    """查询概念板块成分股"""
    token = get_token()
    ts.set_token(token)
    pro = ts.pro_api()
    
    try:
        # 先查询概念分类
        df_concept = pro.concept_class(
            src='ts',
            fields='ts_code,name,src'
        )
        
        # 模糊匹配概念名称
        matched = df_concept[df_concept['name'].str.contains(concept_name, case=False, na=False)]
        
        if matched.empty:
            print(f"未找到概念：{concept_name}")
            print("\n尝试搜索以下相关概念:")
            # 显示部分概念列表
            print(df_concept['name'].head(20).tolist())
            return None
        
        print("=" * 80)
        print(f"匹配到的概念板块 (搜索词：{concept_name})")
        print("=" * 80)
        
        for _, row in matched.iterrows():
            print(f"  - {row['ts_code']}: {row['name']}")
        print()
        
        # 获取第一个匹配概念的成分股
        concept_code = matched.iloc[0]['ts_code']
        df_members = pro.index_member(index_code=concept_code)
        
        if df_members.empty:
            print(f"未找到成分股数据：{concept_name}")
            return None
        
        print("=" * 80)
        print(f"概念板块成分股：{matched.iloc[0]['name']} ({concept_code})")
        print("=" * 80)
        print(f"成分股数量：{len(df_members)}")
        print()
        
        # 显示前 20 只股票
        if 'con_code' in df_members.columns and 'con_name' in df_members.columns:
            print(df_members[['con_code', 'con_name']].head(20).to_string(index=False))
        elif 'ts_code' in df_members.columns:
            print(df_members['ts_code'].head(20).tolist())
        
        print(f"\n共 {len(df_members)} 只成分股")
        print("=" * 80)
        
        return df_members
        
    except Exception as e:
        print(f"查询失败：{e}")
        return None

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    
    concept_name = sys.argv[1]
    query_concept_stocks(concept_name)
