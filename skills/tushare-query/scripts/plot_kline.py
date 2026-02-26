#!/usr/bin/env python3
"""
绘制股票 K 线图（蜡烛图 + 成交量）
支持：蜡烛图、均线、成交量柱状图

用法：
    python3 plot_kline.py <股票代码> [天数]
    python3 plot_kline.py 000333.SZ 60
"""

import sys
import os
import tushare as ts
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei', 'DejaVu Sans']
plt.rcParams['axes.unicode_minus'] = False

def get_token():
    token_file = os.path.expanduser('~/.tushare_token')
    with open(token_file, 'r') as f:
        return f.read().strip()

def fetch_kline(code, days=60):
    """获取 K 线数据"""
    token = get_token()
    ts.set_token(token)
    pro = ts.pro_api()
    
    # 获取日线数据
    end_date = datetime.now().strftime('%Y%m%d')
    start_date = (datetime.now() - pd.Timedelta(days=days*2)).strftime('%Y%m%d')
    
    df = pro.daily(ts_code=code, start_date=start_date, end_date=end_date)
    
    if df.empty:
        print(f"未获取到 {code} 的数据")
        return None
    
    # 按日期排序
    df = df.sort_values('trade_date').tail(days).reset_index(drop=True)
    
    # 转换日期格式
    df['trade_date'] = pd.to_datetime(df['trade_date'])
    
    return df

def plot_kline(df, code, name=""):
    """绘制 K 线图"""
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(14, 8), gridspec_kw={'height_ratios': [3, 1]}, sharex=True)
    
    # 准备数据
    dates = df['trade_date']
    open_prices = df['open']
    close_prices = df['close']
    high_prices = df['high']
    low_prices = df['low']
    volumes = df['vol']
    
    # 计算涨跌颜色
    colors = ['red' if close_prices[i] >= open_prices[i] else 'green' for i in range(len(df))]
    
    # 绘制蜡烛图
    for i in range(len(df)):
        # 绘制实体
        ax1.bar(dates[i], close_prices[i] - open_prices[i], bottom=open_prices[i], 
                color=colors[i], edgecolor=colors[i], width=0.8)
        # 绘制上下影线
        ax1.plot([dates[i], dates[i]], [low_prices[i], high_prices[i]], color=colors[i], linewidth=1)
    
    # 绘制均线
    if len(df) >= 5:
        ma5 = df['close'].rolling(5).mean()
        ax1.plot(dates, ma5, label='MA5', color='orange', linewidth=1)
    if len(df) >= 10:
        ma10 = df['close'].rolling(10).mean()
        ax1.plot(dates, ma10, label='MA10', color='blue', linewidth=1)
    if len(df) >= 20:
        ma20 = df['close'].rolling(20).mean()
        ax1.plot(dates, ma20, label='MA20', color='purple', linewidth=1)
    
    ax1.set_ylabel('价格 (元)', fontsize=12)
    ax1.legend(loc='upper left')
    ax1.grid(True, alpha=0.3)
    ax1.set_title(f'{code} {name} K 线图', fontsize=14)
    
    # 绘制成交量
    vol_colors = ['red' if close_prices[i] >= open_prices[i] else 'green' for i in range(len(df))]
    ax2.bar(dates, volumes, color=vol_colors, alpha=0.7, width=0.8)
    ax2.set_ylabel('成交量 (手)', fontsize=12)
    ax2.set_xlabel('日期', fontsize=12)
    ax2.grid(True, alpha=0.3)
    
    # 格式化 x 轴日期
    ax2.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
    ax2.xaxis.set_major_locator(mdates.AutoDateLocator())
    plt.setp(ax2.xaxis.get_majorticklabels(), rotation=45, ha='right')
    
    plt.tight_layout()
    
    # 保存图表
    output_path = f'/tmp/kline_{code.replace(".", "_")}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.png'
    plt.savefig(output_path, dpi=150, bbox_inches='tight')
    print(f"K 线图已保存：{output_path}")
    
    return output_path

def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    
    code = sys.argv[1]
    days = int(sys.argv[2]) if len(sys.argv) > 2 else 60
    
    print(f"获取 {code} 最近 {days} 个交易日的 K 线数据...")
    df = fetch_kline(code, days)
    
    if df is None:
        sys.exit(1)
    
    # 获取股票名称
    token = get_token()
    ts.set_token(token)
    pro = ts.pro_api()
    basic = pro.stock_basic(ts_code=code, fields='ts_code,name')
    name = basic['name'].iloc[0] if not basic.empty else ""
    
    print(f"股票：{code} {name}")
    print(f"数据范围：{df['trade_date'].iloc[0].strftime('%Y-%m-%d')} ~ {df['trade_date'].iloc[-1].strftime('%Y-%m-%d')}")
    print(f"收盘价：{df['close'].iloc[0]:.2f} ~ {df['close'].iloc[-1]:.2f} 元")
    
    plot_kline(df, code, name)

if __name__ == '__main__':
    main()
