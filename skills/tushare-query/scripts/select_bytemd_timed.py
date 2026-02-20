#!/usr/bin/env python3
"""
选股策略：字节跳动/豆包概念 + 连续 6 季度盈利 + 最近一年利润同比增长 + 按 PE 排序

混合方案：
- ZTrader: 获取概念板块成分股、股票基本信息
- Tushare: 获取财务数据（利润表、PE 等）

用法：
    python3 select_bytemd_timed.py
"""

import os
import sys
import json
import subprocess
import pandas as pd
import time
from datetime import datetime
from contextlib import contextmanager

# ==================== 计时工具 ====================

@contextmanager
def timer(step_name):
    """计时上下文管理器"""
    start = time.time()
    print(f"\n⏱️  [{step_name}] 开始...")
    yield
    elapsed = time.time() - start
    print(f"✅ [{step_name}] 完成，耗时：{elapsed:.2f}秒")
    timings[step_name] = elapsed

timings = {}

# ==================== ZTrader MCP 工具调用 ====================

def call_ztrader_tool(tool_name, params):
    """通过 mcporter 调用 ZTrader MCP 工具"""
    try:
        # 尝试使用 openclaw mcp call
        cmd = [
            'openclaw', 'mcp', 'call', 'ztrader', tool_name,
            '--params', json.dumps(params)
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            return json.loads(result.stdout)
        else:
            return None
    except Exception as e:
        return None

def get_concept_stocks_ztrader(concept_keywords):
    """
    使用 ZTrader 获取概念板块成分股（东财数据）
    """
    all_stocks = set()
    
    for keyword in concept_keywords:
        # 1. 查询东财概念列表
        indices = call_ztrader_tool('get_dc_indices', {
            'trade_date': datetime.now().strftime('%Y%m%d'),
            'type': 'concept'
        })
        
        if not indices:
            continue
        
        # 2. 匹配概念名称
        matched = [idx for idx in indices if keyword in idx.get('name', '')]
        
        if not matched:
            continue
        
        # 3. 获取成分股
        for concept in matched[:3]:
            members = call_ztrader_tool('get_dc_members', {
                'ts_code': concept['ts_code'],
                'trade_date': datetime.now().strftime('%Y%m%d')
            })
            if members:
                for m in members:
                    all_stocks.add(m.get('con_code', m.get('ts_code')))
    
    return all_stocks

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
    total_start = time.time()
    
    print("=" * 80)
    print("选股策略：字节跳动/豆包概念 + 连续 6 季度盈利 + 利润同比增长")
    print("(混合方案：ZTrader 获取概念成分股 + Tushare 获取财务数据)")
    print("=" * 80)
    
    # ========== Step 1: 获取概念成分股 ==========
    with timer("Step 1: 获取概念板块成分股 (ZTrader)"):
        # 方案 A: 使用 ZTrader 获取（需要 mcporter 配置）
        # concept_keywords = ['字节', '豆包', '头条', '抖音']
        # concept_stocks = get_concept_stocks_ztrader(concept_keywords)
        
        # 方案 B: 手动维护股票池（当前使用，因为 ZTrader MCP 可能未配置）
        concept_stocks = {
            '300058.SZ', '300785.SZ', '002027.SZ', '300781.SZ', '300792.SZ',
            '002555.SZ', '002624.SZ', '002605.SZ',
            '300251.SZ', '300413.SZ', '002739.SZ', '300133.SZ', '002292.SZ',
            '001316.SZ', '002405.SZ', '300088.SZ', '300666.SZ', '300269.SZ',
            '002315.SZ', '300144.SZ',
        }
        print(f"  股票池数量：{len(concept_stocks)} 只")
    
    # ========== Step 2: 获取股票基本信息 ==========
    with timer("Step 2: 获取股票基本信息 (Tushare)"):
        import tushare as ts
        ts.set_token(get_token())
        pro = ts.pro_api()
        df_basic = pro.stock_basic(exchange='', list_status='L', fields='ts_code,name')
        stock_names = dict(zip(df_basic['ts_code'], df_basic['name']))
        print(f"  获取股票名称映射：{len(stock_names)} 只")
    
    # ========== Step 3: 筛选符合条件的股票 ==========
    with timer("Step 3: 财务条件筛选 (Tushare)"):
        qualified_stocks = []
        
        for i, ts_code in enumerate(sorted(concept_stocks)):
            if (i + 1) % 5 == 0:
                print(f"  进度：{i+1}/{len(concept_stocks)}")
            
            passed, pe, profit, yoy, consec = check_profit_condition_tushare(ts_code, quarters=6)
            
            if passed:
                name = stock_names.get(ts_code, 'Unknown')
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
        
        print(f"  符合条件：{len(qualified_stocks)} 只")
    
    # ========== Step 4: 排序输出 ==========
    with timer("Step 4: 排序与输出"):
        if qualified_stocks:
            df_result = pd.DataFrame(qualified_stocks)
            df_with_pe = df_result[df_result['PE'].notna()].sort_values('PE')
            df_without_pe = df_result[df_result['PE'].isna()]
            df_result = pd.concat([df_with_pe, df_without_pe])
            
            print()
            print("=" * 80)
            print("筛选结果（按 PE 从低到高排序）:")
            print("=" * 80)
            print("-" * 100)
            for _, row in df_result.iterrows():
                pe_str = f"{row['PE']:.2f}" if row['PE'] else "N/A"
                print(f"{row['ts_code']} {row['name']:10} PE: {pe_str:8}  "
                      f"净利润：{row['最近 4 季净利润 (万元)']:10.2f}万元  "
                      f"同比增长：{row['同比增长 (%)']:6.2f}%  "
                      f"连续盈利：{row['连续盈利季度']}季度")
            print("-" * 100)
            
            # 保存
            output_file = f'bytemd_qualified_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
            df_result.to_csv(output_file, index=False, encoding='utf-8-sig')
            print(f"\n结果已保存到：{output_file}")
    
    # ========== 总耗时 ==========
    total_elapsed = time.time() - total_start
    timings['总耗时'] = total_elapsed
    
    print()
    print("=" * 80)
    print("⏱️  各环节耗时统计:")
    print("=" * 80)
    for step, elapsed in timings.items():
        pct = (elapsed / total_elapsed) * 100
        bar = '█' * int(pct / 5)
        print(f"  {step:40} {elapsed:6.2f}秒  ({pct:5.1f}%) {bar}")
    print("=" * 80)

if __name__ == '__main__':
    main()
