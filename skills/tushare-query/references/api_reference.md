# Tushare API 接口参考

## 基础信息类

### stock_basic - 股票列表

```python
pro.stock_basic(
    exchange='',           # 交易所：SSE 上交所/SZSE 深交所/BSE 北交所
    list_status='L',       # 上市状态：L 上市/D 退市/P 暂停
    fields='ts_code,symbol,name,area,industry,market,list_date'
)
```

### trade_cal - 交易日历

```python
pro.trade_cal(
    exchange='SSE',
    start_date='20250101',
    end_date='20251231',
    is_open='1'            # 1 开市/0 休市
)
```

---

## 行情数据类

### daily - 日线行情

```python
pro.daily(
    ts_code='001316.SZ',
    start_date='20250101',
    end_date='20251231'
)
# 返回字段：ts_code, trade_date, open, high, low, close, pre_close,
#          change, pct_chg, vol, amount
```

### weekly/monthly - 周线/月线

```python
pro.weekly(ts_code='001316.SZ')
pro.monthly(ts_code='001316.SZ')
```

### min - 分钟线

```python
pro.min(
    ts_code='001316.SZ',
    trade_date='20250219',
    min='5'                # 分钟数：1/5/15/30/60
)
```

### adj_factor - 复权因子

```python
pro.adj_factor(
    ts_code='001316.SZ',
    trade_date='20250219'
)
```

---

## 财务数据类

### fina_indicator - 财务指标

```python
pro.fina_indicator(
    ts_code='001316.SZ',
    start_date='20240101',
    end_date='20251231'
)
# 主要字段：
# basic_eps - 基本每股收益
# diluted_eps - 稀释每股收益
# roe - 净资产收益率
# gross_margin - 销售毛利率
# oper_margin - 营业利润率
# net_profit_margin - 销售净利率
# current_ratio - 流动比率
# quick_ratio - 速动比率
```

### income - 利润表

```python
pro.income(
    ts_code='001316.SZ',
    start_date='20240101',
    end_date='20251231',
    fields='ts_code,ann_date,end_date,total_revenue,op,profit,net_profit'
)
# 主要字段：
# total_revenue - 营业总收入
# op - 营业利润
# profit - 利润总额
# net_profit - 净利润
# deduct_net_profit - 扣非净利润
```

### balancesheet - 资产负债表

```python
pro.balancesheet(
    ts_code='001316.SZ',
    start_date='20240101',
    end_date='20251231'
)
# 主要字段：
# total_assets - 总资产
# total_hldr_eqy_exc_min_int - 净资产
# total_liab - 总负债
```

### cashflow - 现金流量表

```python
pro.cashflow(
    ts_code='001316.SZ',
    start_date='20240101',
    end_date='20251231'
)
# 主要字段：
# oper_cash_inflow - 经营活动现金流入
# oper_cash_outflow - 经营活动现金流出
# invest_cash_inflow - 投资活动现金流入
# finance_cash_inflow - 筹资活动现金流入
```

### perf_express - 业绩快报

```python
pro.perf_express(
    ts_code='001316.SZ',
    start_date='20240101',
    end_date='20251231'
)
# 主要字段：
# total_revenue - 营业收入
# total_revenue_yoy - 营收同比
# op - 营业利润
# op_yoy - 营业利润同比
# profit - 净利润
# profit_yoy - 净利润同比
# eps - 每股收益
# roe - 净资产收益率
```

### forecast - 业绩预告

```python
pro.forecast(
    ts_code='001316.SZ',
    start_date='20240101',
    end_date='20251231'
)
# 主要字段：
# type - 业绩预告类型
# net_profit_min/max - 净利润预测区间
# yoy_min/max - 同比变动区间
```

---

## 资金流向类

### moneyflow - 资金流向

```python
pro.moneyflow(
    ts_code='001316.SZ',
    start_date='20250101',
    end_date='20251231'
)
# 主要字段：
# buy_sm_amount - 小单买入金额
# sell_sm_amount - 小单卖出金额
# buy_md_amount - 中单买入金额
# sell_md_amount - 中单卖出金额
# buy_lg_amount - 大单买入金额
# sell_lg_amount - 大单卖出金额
# buy_elg_amount - 超大单买入金额
# sell_elg_amount - 超大单卖出金额
```

### north_flow - 北向资金

```python
pro.north_flow(
    trade_date='20250219'
)
```

### top10_holders - 十大股东

```python
pro.top10_holders(
    ts_code='001316.SZ',
    ann_date='20250331'
)
```

---

## 板块概念类

### concept_class - 概念分类

```python
pro.concept_class(
    src='ts'               # 来源：ts 同花顺/eastmoney 东方财富
)
```

### index_member - 指数成分股

```python
pro.index_member(
    index_code='881100.TI'  # 概念代码
)
```

### dc_index - 东财板块

```python
pro.dc_index(
    trade_date='20250219'
)
```

---

## 指数数据类

### index_daily - 指数日线

```python
pro.index_daily(
    ts_code='000001.SH',   # 上证指数
    start_date='20250101',
    end_date='20251231'
)
```

### index_classify - 指数分类

```python
pro.index_classify(
    level='L1',            # L1 一级/L2 二级
    src='SW'               # SW 申万
)
```

---

## 其他常用接口

### report_rc - 券商研报

```python
pro.report_rc(
    ts_code='001316.SZ',
    start_date='20250101',
    end_date='20251231'
)
```

### holdernumber - 股东人数

```python
pro.holdernumber(
    ts_code='001316.SZ'
)
```

### margin_detail - 融资融券

```python
pro.margin_detail(
    ts_code='001316.SZ',
    trade_date='20250219'
)
```

---

## 使用示例

### 示例 1：查询股票完整信息

```python
import tushare as ts

ts.set_token('your_token')
pro = ts.pro_api()

# 基础信息
basic = pro.stock_basic(ts_code='001316.SZ')

# 日线行情
daily = pro.daily(ts_code='001316.SZ', start_date='20250101')

# 财务指标
fina = pro.fina_indicator(ts_code='001316.SZ')

# 合并分析
print(f"{basic['name'].iloc[0]} - {basic['industry'].iloc[0]}")
print(f"最新收盘价：{daily['close'].iloc[0]}")
print(f"每股收益：{fina['basic_eps'].iloc[0]}")
```

### 示例 2：查询概念板块

```python
# 查找人工智能相关概念
concepts = pro.concept_class(src='ts')
ai_concepts = concepts[concepts['name'].str.contains('人工智能')]

# 获取成分股
for _, concept in ai_concepts.iterrows():
    members = pro.index_member(index_code=concept['ts_code'])
    print(f"{concept['name']}: {len(members)} 只成分股")
```

### 示例 3：财务数据分析

```python
# 获取利润表
income = pro.income(ts_code='001316.SZ', start_date='20230101')

# 计算同比增长
income = income.sort_values('ann_date', ascending=False)
revenue_growth = (income['total_revenue'].iloc[0] / income['total_revenue'].iloc[1] - 1) * 100
print(f"营收同比增长：{revenue_growth:.2f}%")
```

---

## 注意事项

1. **数据更新**：
   - 日线：交易日 17:30 后
   - 财务：财报披露后
   - 资金流：实时

## 相关文档

- [Tushare 首页](https://tushare.pro)
- [接口文档](https://tushare.pro/document/2)
- [积分说明](https://tushare.pro/document/1?doc_id=13)
- [社区论坛](https://tushare.pro/user/comment)
