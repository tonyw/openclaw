#!/usr/bin/env python3
"""
混合选股策略主脚本

结合 Tushare 基本面数据和 ZTrader MCP 技术面数据进行选股。

用法:
    python3 run_stock_selector.py --strategy value_growth --concept "字节跳动"
    python3 run_stock_selector.py --strategy custom --min_pe 0 --max_pe 30 --min_growth 20
"""

import os
import sys
import json
import subprocess
import pandas as pd
import time
from datetime import datetime
from contextlib import contextmanager
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
import hashlib
import pickle
import logging
from typing import Dict, List, Optional, Any

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== 计时工具 ====================

timings = {}

@contextmanager
def timer(step_name):
    """计时上下文管理器"""
    start = time.time()
    print(f"\n⏱️  [{step_name}] 开始...")
    yield
    elapsed = time.time() - start
    print(f"✅ [{step_name}] 完成，耗时：{elapsed:.2f}秒")
    timings[step_name] = elapsed

# ==================== 缓存机制 ====================

CACHE_DIR = Path.home() / '.cache' / 'hybrid_selector'
CACHE_DIR.mkdir(parents=True, exist_ok=True)

def get_cache_key(func_name: str, **kwargs) -> str:
    """生成缓存 key"""
    key_str = f"{func_name}:{json.dumps(kwargs, sort_keys=True, default=str)}"
    return hashlib.md5(key_str.encode()).hexdigest()

def load_from_cache(cache_key: str, expire_seconds: int = 3600) -> Optional[Any]:
    """从缓存加载数据"""
    cache_file = CACHE_DIR / f"{cache_key}.pkl"
    
    if cache_file.exists():
        cache_time = cache_file.stat().st_mtime
        if time.time() - cache_time < expire_seconds:
            try:
                with open(cache_file, 'rb') as f:
                    data = pickle.load(f)
                logger.debug(f"缓存命中：{cache_key[:16]}...")
                return data
            except Exception as e:
                logger.warning(f"缓存读取失败：{e}")
    
    return None

def save_to_cache(cache_key: str, data: Any) -> None:
    """保存数据到缓存"""
    cache_file = CACHE_DIR / f"{cache_key}.pkl"
    try:
        with open(cache_file, 'wb') as f:
            pickle.dump(data, f)
        logger.debug(f"缓存保存：{cache_key[:16]}...")
    except Exception as e:
        logger.warning(f"缓存保存失败：{e}")

def with_cache(expire_seconds: int = 3600):
    """缓存装饰器"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            # 生成缓存 key
            cache_key = get_cache_key(func.__name__, **kwargs)
            
            # 尝试从缓存加载
            cached = load_from_cache(cache_key, expire_seconds)
            if cached is not None:
                return cached
            
            # 执行函数
            result = func(*args, **kwargs)
            
            # 保存到缓存
            save_to_cache(cache_key, result)
            
            return result
        return wrapper
    return decorator

# ==================== ZTrader MCP 调用 ====================

def call_ztrader_tool(tool_name, **params):
    """
    通过 mcporter 调用 ZTrader MCP 工具
    
    重要：使用 name:'value' 格式传递参数，不要用 --params JSON
    
    Args:
        tool_name: ZTrader 工具名称
        **params: 工具参数
    
    Returns:
        查询结果列表，失败返回 []
    
    示例:
        call_ztrader_tool('get_kpl_concepts_by_name', name='HBM')
        call_ztrader_tool('get_dc_members', ts_code='BK0970.DC')
    """
    try:
        # 构建参数部分：name:'value' 格式
        param_parts = []
        for key, value in params.items():
            if isinstance(value, str):
                param_parts.append(f"{key}:'{value}'")
            else:
                param_parts.append(f"{key}:{value}")
        
        params_str = ' '.join(param_parts)
        
        # 构建命令
        cmd = f"mcporter call ztrader.{tool_name} {params_str}"
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            response = json.loads(result.stdout)
            return response.get('result', [])
        else:
            logger.warning(f"ZTrader 调用失败：{result.stderr}")
            return []
    except Exception as e:
        logger.warning(f"ZTrader 调用异常：{e}")
        return []

def get_concept_stocks_ztrader(concept_keywords, limit=100):
    """
    使用 ZTrader 获取概念板块成分股
    
    Args:
        concept_keywords: 概念关键词列表，如 ['HBM', '芯片']
        limit: 返回数量限制
    
    Returns:
        股票代码集合
    """
    all_stocks = set()
    
    for keyword in concept_keywords:
        # 方法 1: 查询开盘啦 (KPL) 题材
        kpl_results = call_ztrader_tool('get_kpl_concepts_by_name', name=keyword)
        
        if kpl_results:
            logger.info(f"  KPL 题材 '{keyword}': 找到 {len(kpl_results)} 条记录")
            # 获取最新日期的题材代码
            if kpl_results and 'ts_code' in kpl_results[0]:
                ts_code = kpl_results[0]['ts_code']
                # 获取成分股
                members = call_ztrader_tool('get_concept_stocks', concept_name=keyword, limit=limit)
                if members:
                    for m in members:
                        if 'con_code' in m:
                            all_stocks.add(m['con_code'])
        
        # 方法 2: 查询东财板块
        dc_indices = call_ztrader_tool('get_dc_indices', keyword=keyword, limit=limit)
        
        if dc_indices:
            logger.info(f"  东财板块 '{keyword}': 找到 {len(dc_indices)} 个板块")
            # 获取成分股
            for idx in dc_indices[:5]:
                if 'ts_code' in idx:
                    members = call_ztrader_tool('get_dc_members', ts_code=idx['ts_code'])
                    if members:
                        for m in members:
                            all_stocks.add(m.get('con_code', m.get('ts_code')))
    
    return all_stocks

def get_technical_data_ztrader(ts_code, days=60):
    """使用 ZTrader 获取技术面数据"""
    result = {}
    
    # K 线数据
    kline = call_ztrader_tool('get_stock_kline', {'code': ts_code, 'days': days})
    if kline:
        result['kline'] = kline
    
    # 技术指标
    technical = call_ztrader_tool('get_stock_technical', {'code': ts_code, 'days': days})
    if technical:
        result['technical'] = technical
    
    # AI 预测评分
    ai_predict = call_ztrader_tool('get_ai_predict', {'code': ts_code})
    if ai_predict:
        result['ai_score'] = ai_predict.get('score')
    
    return result

# ==================== Tushare 基本面查询 ====================

def get_token():
    """从文件或环境变量获取 token"""
    token_file = os.path.expanduser('~/.tushare_token')
    if os.path.exists(token_file):
        with open(token_file, 'r') as f:
            return f.read().strip()
    return os.environ.get('TUSHARE_TOKEN')

@with_cache(expire_seconds=86400)  # 24 小时缓存
def check_fundamentals_tushare(ts_code, min_consecutive_quarters=6, min_growth=0):
    """
    使用 Tushare 检查基本面条件
    
    返回：dict
        - passed: 是否符合条件
        - pe: PE
        - profit_4q: 最近 4 季净利润
        - yoy_growth: 同比增长率
        - consecutive: 连续盈利季度数
    """
    import tushare as ts
    
    token = get_token()
    if not token:
        return {'passed': False, 'error': 'No token'}
    
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
            return {'passed': False, 'error': 'No data'}
        
        df = df.sort_values('end_date', ascending=False).drop_duplicates('end_date')
        profit_col = 'n_income_attr_p' if 'n_income_attr_p' in df.columns else 'n_income'
        
        # 连续盈利季度
        consecutive = 0
        for i in range(len(df)):
            if df.iloc[i][profit_col] > 0:
                consecutive += 1
            else:
                break
        
        if consecutive < min_consecutive_quarters:
            return {'passed': False, 'reason': f'连续盈利{consecutive}季度 < {min_consecutive_quarters}'}
        
        # 同比增长
        if len(df) < 8:
            return {'passed': False, 'reason': '数据不足'}
        
        recent_4q = df.iloc[0:4][profit_col].sum()
        last_4q = df.iloc[4:8][profit_col].sum()
        
        if last_4q <= 0:
            return {'passed': False, 'reason': '去年同期利润<=0'}
        
        yoy = (recent_4q - last_4q) / last_4q * 100
        if yoy < min_growth:
            return {'passed': False, 'reason': f'同比增长{yoy:.2f}% < {min_growth}%'}
        
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
        
        return {
            'passed': True,
            'pe': pe,
            'profit_4q': recent_4q,
            'yoy_growth': yoy,
            'consecutive': consecutive
        }
        
    except Exception as e:
        return {'passed': False, 'error': str(e)}

def get_stock_names(stock_codes) -> Dict[str, str]:
    """获取股票名称映射"""
    import tushare as ts
    
    token = get_token()
    if not token:
        return {}
    
    ts.set_token(token)
    pro = ts.pro_api()
    
    df = pro.stock_basic(exchange='', list_status='L', fields='ts_code,name')
    return dict(zip(df['ts_code'], df['name']))

def check_fundamentals_batch(
    stock_pool: set,
    min_consecutive_quarters: int = 6,
    min_growth: float = 0,
    max_workers: int = 10
) -> Dict[str, Dict]:
    """
    并发查询基本面数据
    
    Args:
        stock_pool: 股票池
        min_consecutive_quarters: 最小连续盈利季度数
        min_growth: 最小净利润增长率 (%)
        max_workers: 最大并发数
    
    Returns:
        通过筛选的股票及其数据
    """
    fundamental_results = {}
    failed_stocks = []
    
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        # 提交所有任务
        future_to_stock = {
            executor.submit(
                check_fundamentals_tushare,
                ts_code,
                min_consecutive_quarters,
                min_growth
            ): ts_code for ts_code in stock_pool
        }
        
        # 收集结果
        for future in as_completed(future_to_stock):
            ts_code = future_to_stock[future]
            try:
                result = future.result()
                if result.get('passed'):
                    fundamental_results[ts_code] = result
                else:
                    reason = result.get('reason', result.get('error', '未知原因'))
                    logger.debug(f"  ✗ {ts_code} 未通过：{reason}")
            except Exception as e:
                failed_stocks.append((ts_code, str(e)))
                logger.warning(f"  ✗ {ts_code} 查询失败：{e}")
    
    if failed_stocks:
        logger.warning(f"共 {len(failed_stocks)} 只股票查询失败")
    
    return fundamental_results

# ==================== 选股策略 ====================

def calculate_composite_score(
    fundamentals: Dict,
    technicals: Dict,
    weights: Optional[Dict] = None
) -> tuple:
    """
    计算综合评分
    
    评分维度：
    - 盈利能力 (20%): 连续盈利季度数
    - 成长能力 (20%): 净利润同比增长
    - 估值水平 (20%): PE 倒数
    - 趋势强度 (15%): 均线排列
    - 资金流向 (15%): DDX
    - 形态评分 (10%): AI 评分
    
    Returns:
        (score, score_breakdown)
    """
    weights = weights or {
        'profitability': 0.20,
        'growth': 0.20,
        'valuation': 0.20,
        'trend': 0.15,
        'money_flow': 0.15,
        'pattern': 0.10
    }
    
    score = 0
    breakdown = {}
    
    # 基本面评分 (60%)
    # 盈利能力：连续盈利季度数 (0-20 季度映射到 0-100 分)
    consecutive = fundamentals.get('consecutive', 0)
    profitability_score = min(consecutive / 20, 1.0) * 100
    score += profitability_score * weights['profitability']
    breakdown['profitability'] = profitability_score
    
    # 成长能力：净利润同比增长 (0-50% 映射到 0-100 分)
    yoy_growth = fundamentals.get('yoy_growth', 0)
    growth_score = min(max(yoy_growth, 0) / 50, 1.0) * 100
    score += growth_score * weights['growth']
    breakdown['growth'] = growth_score
    
    # 估值水平：PE 倒数 (PE 越低分越高，PE<20 得满分)
    pe = fundamentals.get('pe')
    if pe and pe > 0:
        valuation_score = min(20 / pe, 1.0) * 100
    else:
        valuation_score = 50  # 无 PE 数据给平均分
    score += valuation_score * weights['valuation']
    breakdown['valuation'] = valuation_score
    
    # 技术面评分 (40%)
    if technicals:
        # 趋势强度
        kline = technicals.get('kline', [])
        if len(kline) >= 20:
            recent_close = kline[0].get('close', 0)
            ma20 = sum([k.get('close', 0) for k in kline[:20]]) / 20
            trend_score = 100 if recent_close > ma20 else 0
        else:
            trend_score = 50
        score += trend_score * weights['trend']
        breakdown['trend'] = trend_score
        
        # 形态评分 (AI 评分)
        ai_score = technicals.get('ai_score', 50)
        pattern_score = ai_score if ai_score else 50
        score += pattern_score * weights['pattern']
        breakdown['pattern'] = pattern_score
        
        # 资金流向
        ddx = technicals.get('ddx', 0)
        money_flow_score = min(max(ddx * 100, 0), 100)
        score += money_flow_score * weights['money_flow']
        breakdown['money_flow'] = money_flow_score
    else:
        # 无技术面数据，给平均分
        score += 50 * (weights['trend'] + weights['pattern'] + weights['money_flow'])
        breakdown['trend'] = 50
        breakdown['pattern'] = 50
        breakdown['money_flow'] = 50
    
    return min(score, 100), breakdown

def strategy_value_growth(stock, fundamentals, technicals, params):
    """策略 A: 价值成长 + 趋势确认"""
    reasons = []
    
    # 使用综合评分模型
    score, breakdown = calculate_composite_score(fundamentals, technicals)
    
    # 生成入选理由
    if fundamentals.get('pe') and fundamentals['pe'] < params.get('max_pe', 50):
        reasons.append(f"PE 合理 ({fundamentals['pe']:.1f})")
    
    if fundamentals['yoy_growth'] > 0:
        reasons.append(f"增长良好 ({fundamentals['yoy_growth']:.1f}%)")
    
    if fundamentals['consecutive'] >= 10:
        reasons.append(f"持续盈利 ({fundamentals['consecutive']}季度)")
    
    ai_score = technicals.get('ai_score') if technicals else None
    if ai_score and ai_score >= 75:
        reasons.append(f"AI 评分高 ({ai_score})")
    
    return {
        'score': round(score, 2),
        'score_breakdown': breakdown,
        'reasons': reasons,
        'passed': score >= params.get('min_total_score', 60)
    }

def strategy_low_value_reversal(stock, fundamentals, technicals, params):
    """策略 B: 低估值 + 底部反转"""
    score = 0
    reasons = []
    
    # 低估值评分
    if fundamentals['pe'] and fundamentals['pe'] < params.get('max_pe', 30):
        score += 30
        reasons.append(f"低 PE ({fundamentals['pe']:.1f})")
    
    # 技术面反转信号
    technical = technicals.get('technical', {})
    if technical.get('kdj_golden_cross'):
        score += 30
        reasons.append("KDJ 金叉")
    
    if technical.get('white_yellow_golden_cross'):
        score += 25
        reasons.append("黄白线金叉")
    
    # 底部放量
    kline = technicals.get('kline', [])
    if len(kline) >= 10:
        recent_vol = kline[0].get('vol', 0)
        avg_vol = sum([k.get('vol', 0) for k in kline[:10]]) / 10
        if recent_vol > avg_vol * 1.5:
            score += 15
            reasons.append("底部放量")
    
    return {
        'score': score,
        'reasons': reasons,
        'passed': score >= params.get('min_total_score', 50)
    }

def strategy_concept_hotspot(stock, fundamentals, technicals, params):
    """策略 C: 概念热点 + 业绩支撑"""
    score = 0
    reasons = []
    
    # 业绩支撑
    if fundamentals['yoy_growth'] > params.get('min_growth', 20):
        score += 30
        reasons.append(f"高增长 ({fundamentals['yoy_growth']:.1f}%)")
    
    if fundamentals['consecutive'] >= 6:
        score += 20
        reasons.append("持续盈利")
    
    # 资金热度
    money_flow = technicals.get('money_flow', {})
    if money_flow.get('net_inflow', 0) > 0:
        score += 25
        reasons.append("资金净流入")
    
    # 近期强势
    kline = technicals.get('kline', [])
    if len(kline) >= 5:
        recent_gain = (kline[0].get('close', 0) - kline[4].get('close', 0)) / kline[4].get('close', 1) * 100
        if recent_gain > 10:
            score += 25
            reasons.append(f"近期强势 (+{recent_gain:.1f}%)")
    
    return {
        'score': score,
        'reasons': reasons,
        'passed': score >= params.get('min_total_score', 50)
    }

STRATEGIES = {
    'value_growth': strategy_value_growth,
    'low_value_reversal': strategy_low_value_reversal,
    'concept_hotspot': strategy_concept_hotspot,
}

# ==================== 主流程 ====================

def main():
    parser = argparse.ArgumentParser(description='混合选股策略')
    parser.add_argument('--strategy', type=str, default='value_growth',
                       choices=['value_growth', 'low_value_reversal', 'concept_hotspot', 'custom'],
                       help='选股策略')
    parser.add_argument('--concept', type=str, default='',
                       help='概念板块关键词，多个用逗号分隔')
    parser.add_argument('--stocks', type=str, default='',
                       help='自定义股票池，多个用逗号分隔')
    parser.add_argument('--min_pe', type=float, default=0,
                       help='最小 PE')
    parser.add_argument('--max_pe', type=float, default=50,
                       help='最大 PE')
    parser.add_argument('--min_growth', type=float, default=0,
                       help='最小净利润增长率 (%)')
    parser.add_argument('--consecutive_quarters', type=int, default=6,
                       help='连续盈利季度数')
    parser.add_argument('--min_ai_score', type=float, default=75,
                       help='最小 AI 评分')
    parser.add_argument('--min_total_score', type=float, default=60,
                       help='最小综合评分')
    parser.add_argument('--output', type=str, default='stock_selection_results.csv',
                       help='输出文件名')
    parser.add_argument('--verbose', action='store_true',
                       help='详细输出')
    
    args = parser.parse_args()
    
    total_start = time.time()
    
    print("=" * 80)
    print(f"混合选股策略：{args.strategy}")
    print("=" * 80)
    
    # ========== Step 1: 获取股票池 ==========
    with timer("Step 1: 获取股票池"):
        stock_pool = set()
        
        # 从概念板块获取
        if args.concept:
            concepts = [c.strip() for c in args.concept.split(',')]
            concept_stocks = get_concept_stocks_ztrader(concepts)
            stock_pool.update(concept_stocks)
            print(f"  从概念板块获取：{len(concept_stocks)}只")
        
        # 自定义股票池
        if args.stocks:
            custom_stocks = set([s.strip() for s in args.stocks.split(',')])
            stock_pool.update(custom_stocks)
            print(f"  自定义股票池：{len(custom_stocks)}只")
        
        # 如果都没有，使用默认字节跳动概念股
        if not stock_pool:
            stock_pool = {
                '300058.SZ', '300785.SZ', '002027.SZ', '300781.SZ', '300792.SZ',
                '002555.SZ', '002624.SZ', '002605.SZ',
                '300251.SZ', '300413.SZ', '002739.SZ', '300133.SZ', '002292.SZ',
                '001316.SZ', '002405.SZ', '300088.SZ', '300666.SZ', '300269.SZ',
                '002315.SZ', '300144.SZ',
            }
            print(f"  使用默认股票池：{len(stock_pool)}只")
    
    # ========== Step 2: 获取股票名称 ==========
    with timer("Step 2: 获取股票名称"):
        stock_names = get_stock_names(stock_pool)
        print(f"  获取名称映射：{len(stock_names)}只")
    
    # ========== Step 3: 基本面筛选（并发） ==========
    with timer("Step 3: 基本面筛选 (Tushare)"):
        fundamental_results = check_fundamentals_batch(
            stock_pool,
            min_consecutive_quarters=args.consecutive_quarters,
            min_growth=args.min_growth,
            max_workers=10  # 10 个并发线程
        )
        
        if args.verbose:
            for ts_code in fundamental_results.keys():
                print(f"  ✓ {ts_code} 基本面通过")
        
        print(f"  基本面通过：{len(fundamental_results)}只")
    
    # ========== Step 4: 技术面确认 ==========
    with timer("Step 4: 技术面确认 (ZTrader MCP)"):
        technical_results = {}
        
        for ts_code in fundamental_results.keys():
            tech_data = get_technical_data_ztrader(ts_code)
            if tech_data:
                technical_results[ts_code] = tech_data
        
        print(f"  获取技术面数据：{len(technical_results)}只")
    
    # ========== Step 5: 策略评分 ==========
    with timer("Step 5: 策略评分"):
        strategy_func = STRATEGIES.get(args.strategy, strategy_value_growth)
        
        params = {
            'min_pe': args.min_pe,
            'max_pe': args.max_pe,
            'min_growth': args.min_growth,
            'min_ai_score': args.min_ai_score,
            'min_total_score': args.min_total_score,
        }
        
        qualified_stocks = []
        
        for ts_code in fundamental_results.keys():
            fundamentals = fundamental_results[ts_code]
            technicals = technical_results.get(ts_code, {})
            
            eval_result = strategy_func(ts_code, fundamentals, technicals, params)
            
            if eval_result['passed']:
                name = stock_names.get(ts_code, 'Unknown')
                qualified_stocks.append({
                    'ts_code': ts_code,
                    'name': name,
                    'PE': round(fundamentals['pe'], 2) if fundamentals['pe'] else None,
                    '最近 4 季净利润 (万元)': round(fundamentals['profit_4q'] / 10000, 2),
                    '同比增长 (%)': round(fundamentals['yoy_growth'], 2),
                    '连续盈利季度': fundamentals['consecutive'],
                    'AI 评分': technicals.get('ai_score'),
                    '综合评分': eval_result['score'],
                    '入选理由': '; '.join(eval_result['reasons'])
                })
        
        print(f"  策略筛选通过：{len(qualified_stocks)}只")
    
    # ========== Step 6: 排序输出 ==========
    with timer("Step 6: 排序输出"):
        if qualified_stocks:
            df_result = pd.DataFrame(qualified_stocks)
            df_result = df_result.sort_values('综合评分', ascending=False)
            
            print()
            print("=" * 80)
            print("筛选结果（按综合评分排序）:")
            print("=" * 80)
            print(df_result.to_string(index=False))
            print("=" * 80)
            
            # 保存
            df_result.to_csv(args.output, index=False, encoding='utf-8-sig')
            print(f"\n结果已保存到：{args.output}")
        else:
            print("\n没有股票符合所有条件")
    
    # ========== 总耗时 ==========
    total_elapsed = time.time() - total_start
    timings['总耗时'] = total_elapsed
    
    print()
    print("=" * 80)
    print("⏱️  各环节耗时统计:")
    print("=" * 80)
    for step, elapsed in timings.items():
        pct = (elapsed / total_elapsed) * 100 if total_elapsed > 0 else 0
        bar = '█' * int(pct / 5)
        print(f"  {step:40} {elapsed:6.2f}秒  ({pct:5.1f}%) {bar}")
    print("=" * 80)

if __name__ == '__main__':
    main()
