#!/usr/bin/env python3
"""
选股策略：字节跳动/豆包概念 + 连续 6 季度盈利 + 最近一年利润同比增长 + 按 PE 排序

混合方案：
- ZTrader: 获取概念板块成分股、股票基本信息
- Tushare: 获取财务数据（利润表、PE 等）

用法：
    python3 select_bytemd_stocks_hybrid.py
"""

import os
import sys
import json
import subprocess
import pandas as pd
from datetime import datetime

# ==================== ZTrader MCP 工具调用 ====================

def call_ztrader_tool(tool_name, params):
    """通过 mcporter 调用 ZTrader MCP 工具"""
    try:
        cmd = [
            'openclaw', 'mcp', 'call', 'ztrader', tool_name,
            '--params', json.dumps(params)
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            return json.loads(result.stdout)
        else:
            print(f"  ZTrader 调用失败：{result.stderr}")
            return None
    except Exception as e:
        print(f"  ZTrader 调用异常：{e}")
        return None

def get_concept_stocks_ztrader(concept_keyword):
    """
    使用 ZTrader 获取概念板块成分股
    """
    print(f"正在通过 ZTrader 查询概念：{concept_keyword}...")
    
    # 1. 查询东财概念列表
    indices = call_ztrader_tool('get_dc_indices', {
        'trade_date': datetime.now().strftime('%Y%m%d'),
        'type': 'concept'
    })
    
    if not indices:
        return set()
    
    # 2. 匹配概念名称
    matched = []
    for idx in indices:
        if concept_keyword in idx.get('name', ''):
            matched.append(idx)
    
    if not matched:
        print(f"  未找到匹配的概念：{concept_keyword}")
        return set()
    
    print(f"  找到 {len(matched)} 个相关概念:")
    for m in matched[:5]:
        print(f"    - {m['ts_code']}: {m['name']}")
    
    # 3. 获取成分股
    all_stocks = set()
    for concept in matched[:3]:  # 取前 3 个概念
        members = call_ztrader_tool('get_dc_members', {
            'ts_code': concept['ts_code'],
            'trade_date': datetime.now().strftime('%Y%m%d')
        })
        if members:
            for m in members:
                all_stocks.add(m.get('con_code', m.get('ts_code')))
    
    print(f"  获取成分股 {len(all_stocks)} 只")
    return all_stocks

def get_stock_info_ztrader(ts_code):
    """使用 ZTrader 获取股票基本信息"""
    result = call_ztrader_tool('get_stock_basic', {'ts_code': ts_code})
    if result:
        return {
            'ts_code': result.get('ts_code'),
            'name': result.get('name'),
            'industry': result.get('industry'),
            'market': result.get('market')
        }
    return None

# ==================== Tushare 财务数据查询 ====================

def get_token():
    """从文件或环境变量获取 token"""
    token_file = os.path.expanduser('~/.tushare_token')
    if os.path.exists(token_file):
        with open(token_file, 'r') as f:
            return f.read().strip()
    return os.environ.get('TUSHARE_TOKEN')

def check_profit_condition_tushare(ts_code, quarters=6):
    """
    使用 Tushare 检查财务条件
    返回：(是否符合条件，PE, 最近 4 季净利润，净利润同比增长率，连续盈利季度数)
    """
    import tushare as ts
    
    token = get_token()
    if not token:
        return False, None, None, None, 0
    
    ts.set_token(token)
    pro = ts.pro_api()
    
    try:
        # 查询利润表
        df = pro.income(
            ts_code=ts_code,
            fields='ts_code,ann_date,end_date,n_income,n_income_attr_p',
            limit=20
        )
        
        if df.empty:
            return False, None, None, None, 0
        
        df = df.sort_values('end_date', ascending=False).drop_duplicates('end_date')
        profit_col = 'n_income_attr_p' if 'n_income_attr_p' in df.columns else 'n_income'
        
        # 连续盈利季度
        consecutive = 0
        for i in range(len(df)):
            if df.iloc[i][profit_col] > 0:
                consecutive += 1
            else:
                break
        
        if consecutive < quarters:
            return False, None, None, None, consecutive
        
        # 同比增长
        if len(df) < 8:
            return False, None, None, None, consecutive
        
        recent_4q = df.iloc[0:4][profit_col].sum()
        last_4q = df.iloc[4:8][profit_col].sum()
        
        if last_4q <= 0:
            return False, None, None, None, consecutive
        
        yoy = (recent_4q - last_4q) / last_4q * 100
        if yoy <= 0:
            return False, None, None, None, consecutive
        
        # PE 计算
        pe = None
        try:
            df_daily = pro.daily(ts_code=ts_code, limit=1)
            df_fina = pro.fina_indicator(ts_code=ts_code, limit=1)
            if not df_daily.empty and not df_fina.empty:
                eps = df_fina.iloc[0].get('eps')
                close = df_daily.iloc[0].get('close')
                if eps and close and eps > 0:
                    pe = close / eps
        except:
            pass
        
        return True, pe, recent_4q, yoy, consecutive
        
    except Exception as e:
        return False, None, None, None, 0

# ==================== 主流程 ====================

def main():
    print("=" * 80)
    print("选股策略：字节跳动/豆包概念 + 连续 6 季度盈利 + 利润同比增长")
    print("(混合方案：ZTrader 获取概念成分股 + Tushare 获取财务数据)")
    print("=" * 80)
    print()
    
    # 方案 1: 使用 ZTrader 获取概念成分股（需要 mcporter 配置）
    # concept_stocks = get_concept_stocks_ztrader('字节')
    
    # 方案 2: 手动维护股票池（当前使用）
    bytemd_stocks = {
        '300058.SZ', '300785.SZ', '002027.SZ', '300781.SZ', '300792.SZ',
        '002555.SZ', '002624.SZ', '002605.SZ',
        '300251.SZ', '300413.SZ', '002739.SZ', '300133.SZ', '002292.SZ',
        '001316.SZ', '002405.SZ', '300088.SZ', '300666.SZ', '300269.SZ',
        '002315.SZ', '300144.SZ',
    }
    
    print(f"待筛选股票总数：{len(bytemd_stocks)}")
    print()
    
    # 筛选
    qualified_stocks = []
    
    for i, ts_code in enumerate(sorted(bytemd_stocks)):
        if (i + 1) % 5 == 0:
            print(f"进度：{i+1}/{len(bytemd_stocks)}")
        
        passed, pe, profit, yoy, consec = check_profit_condition_tushare(ts_code, quarters=6)
        
        if passed:
            # 可选：用 ZTrader 获取股票信息
            # stock_info = get_stock_info_ztrader(ts_code)
            # name = stock_info['name'] if stock_info else 'Unknown'
            
            # 当前使用 Tushare 获取名称
            import tushare as ts
            ts.set_token(get_token())
            pro = ts.pro_api()
            df = pro.stock_basic(ts_code=ts_code, fields='ts_code,name')
            name = df.iloc[0]['name'] if not df.empty else 'Unknown'
            
            qualified_stocks.append({
                'ts_code': ts_code,
                'name': name,
                'PE': round(pe, 2) if pe else None,
                '最近 4 季净利润 (万元)': round(profit / 10000, 2) if profit else None,
                '同比增长 (%)': round(yoy, 2) if yoy else None,
                '连续盈利季度': consec
            })
            pe_str = f"{pe:.2f}" if pe else "N/A"
            print(f"  ✓ {ts_code} {name} - PE: {pe_str}")
    
    print()
    print("=" * 80)
    print(f"筛选结果：{len(qualified_stocks)} 只股票符合条件")
    print("=" * 80)
    
    if qualified_stocks:
        df_result = pd.DataFrame(qualified_stocks)
        df_with_pe = df_result[df_result['PE'].notna()].sort_values('PE')
        df_without_pe = df_result[df_result['PE'].isna()]
        df_result = pd.concat([df_with_pe, df_without_pe])
        
        print()
        print("按 PE 从低到高排序:")
        print("-" * 100)
        for _, row in df_result.iterrows():
            pe_str = f"{row['PE']:.2f}" if row['PE'] else "N/A"
            print(f"{row['ts_code']} {row['name']:10} PE: {pe_str:8}  "
                  f"净利润：{row['最近 4 季净利润 (万元)']:10.2f}万元  "
                  f"同比增长：{row['同比增长 (%)']:6.2f}%  "
                  f"连续盈利：{row['连续盈利季度']}季度")
        print("-" * 100)
        
        df_result.to_csv('bytemd_qualified_stocks_hybrid.csv', index=False, encoding='utf-8-sig')
        print(f"\n结果已保存到：bytemd_qualified_stocks_hybrid.csv")
    
    print("=" * 80)

if __name__ == '__main__':
    main()
