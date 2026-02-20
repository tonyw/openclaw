---
name: hybrid-stock-selector
description: 混合选股策略技能，结合 Tushare 基本面数据（财务指标、利润表）和 ZTrader MCP 技术面数据（K 线、技术指标、AI 评分）。支持多维度筛选：连续盈利、利润增长、PE 估值、技术形态、资金流向等。适用于价值投资 + 趋势交易结合的选股场景。
---

# 混合选股策略 (Hybrid Stock Selector)

## 策略理念

**基本面选股 + 技术面择时**

- **基本面**（Tushare）：确保公司盈利能力强、成长性良好、估值合理
- **技术面**（ZTrader MCP）：确保股票处于上涨趋势、资金流入、形态良好

---

## 核心功能

### 1. 多维度筛选条件

| 维度         | 数据源  | 筛选指标                     |
| ------------ | ------- | ---------------------------- |
| **盈利能力** | Tushare | 连续 N 季度盈利、ROE         |
| **成长能力** | Tushare | 净利润同比增长、营收同比增长 |
| **估值水平** | Tushare | PE、PB                       |
| **技术形态** | ZTrader | K 线趋势、技术指标           |
| **资金流向** | ZTrader | DDX/DDY、主力资金            |
| **AI 评分**  | ZTrader | Pipeline + AI 预测评分       |

### 2. 支持的选股策略

#### 策略 A：价值成长 + 趋势确认

```
基本面条件：
├── 连续 6 季度盈利
├── 最近一年净利润同比增长 > 0
└── PE < 50

技术面条件：
├── 股价在 20 日均线上方
├── DDX 大单净流入
└── AI 预测评分 >= 75
```

#### 策略 B：低估值 + 底部反转

```
基本面条件：
├── PE < 30
├── PB < 3
└── 最近季度净利润转正

技术面条件：
├── KDJ 金叉
├── 底部放量
└── 黄白线金叉
```

#### 策略 C：概念热点 + 业绩支撑

```
基本面条件：
├── 属于目标概念板块
├── 连续盈利
└── 净利润同比增长 > 20%

技术面条件：
├── 近期涨停或大涨
├── 资金持续流入
└── 题材热度高
```

---

## 使用说明

**_ 注意tushare有链接限制，每分钟访问次数要低于500次 _**

### 快速开始

```bash
# 运行选股策略
python scripts/run_stock_selector.py --strategy value_growth --output results.csv

# 查询特定概念股（如 HBM 存储）
python scripts/query_hbm_ztrader.py

# 查看帮助
python scripts/run_stock_selector.py --help
```

### 查询概念板块

**使用 ZTrader MCP 查询概念成分股：**

```bash
# 1. 查询 HBM 存储概念
mcporter call ztrader.get_kpl_concepts_by_name name:'HBM'

# 2. 获取半导体板块成分股
mcporter call ztrader.get_dc_members ts_code:'BK0970.DC'

# 3. 运行 HBM 概念股筛选脚本
python3 scripts/query_hbm_ztrader.py
```

**Python 代码示例：**

```python
from scripts.query_hbm_ztrader import call_ztrader_tool

# 查询 HBM 概念
hbm_concepts = call_ztrader_tool('get_kpl_concepts_by_name', name='HBM')
print(f"找到 {len(hbm_concepts)} 条 HBM 概念记录")

# 获取半导体板块成分股
members = call_ztrader_tool('get_dc_members', ts_code='BK0970.DC')
print(f"半导体板块有 {len(members)} 只成分股")

# 提取股票代码
stock_codes = [m['con_code'] for m in members if 'con_code' in m]
```

### 脚本参数

```bash
python scripts/run_stock_selector.py \
  --strategy value_growth \        # 策略名称
  --concept "字节跳动，豆包" \      # 概念板块（可选）
  --min_pe 0 \                     # 最小 PE
  --max_pe 50 \                    # 最大 PE
  --min_growth 0 \                 # 最小净利润增长率 (%)
  --consecutive_quarters 6 \       # 连续盈利季度数
  --min_ai_score 75 \              # 最小 AI 评分
  --output results.csv \           # 输出文件
  --verbose                        # 详细输出
```

### 策略列表

| 策略名               | 说明       | 适用场景                       |
| -------------------- | ---------- | ------------------------------ |
| `value_growth`       | 价值成长   | 稳健投资，追求成长性与估值平衡 |
| `low_value_reversal` | 低估值反转 | 抄底策略，寻找被低估的底部股票 |
| `concept_hotspot`    | 概念热点   | 短线交易，追逐市场热点         |
| `custom`             | 自定义     | 根据参数灵活配置               |

---

## 脚本说明

### scripts/run_stock_selector.py

主选股脚本，执行完整的选股流程。

**功能：**

1. 获取概念板块成分股（ZTrader 或本地股票池）
2. 查询基本面数据（Tushare）
3. 查询技术面数据（ZTrader MCP）
4. 多维度筛选
5. 排序输出

**用法：**

```bash
python scripts/run_stock_selector.py --strategy value_growth --concept "字节跳动"
```

### scripts/fetch_fundamentals.py

单独获取基本面数据的工具脚本。

**功能：**

- 批量查询股票利润表
- 计算财务指标（增长率、ROE 等）
- 导出 CSV

**用法：**

```bash
python scripts/fetch_fundamentals.py --stocks 001316.SZ,002555.SZ --output fundamentals.csv
```

### scripts/fetch_technicals.py

单独获取技术面数据的工具脚本。

**功能：**

- 通过 ZTrader MCP 获取 K 线数据
- 计算技术指标
- 获取 AI 预测评分

**用法：**

```bash
python scripts/fetch_technicals.py --stocks 001316.SZ --days 60 --output technicals.csv
```

---

## 数据流架构

```
┌─────────────────────────────────────────────────────────────┐
│                      选股流程                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐         ┌─────────────────┐           │
│  │   概念板块      │         │   本地股票池     │           │
│  │  (ZTrader MCP)  │         │   (手动维护)     │           │
│  └────────┬────────┘         └────────┬────────┘           │
│           │                           │                     │
│           └───────────┬───────────────┘                     │
│                       ▼                                     │
│           ┌───────────────────┐                            │
│           │    股票池合并      │                            │
│           └─────────┬─────────┘                            │
│                     │                                      │
│         ┌───────────┴───────────┐                         │
│         ▼                       ▼                         │
│ ┌───────────────┐       ┌───────────────┐                │
│ │   Tushare     │       │  ZTrader MCP  │                │
│ │   基本面      │       │   技术面      │                │
│ ├───────────────┤       ├───────────────┤                │
│ │ • 利润表      │       │ • K 线数据     │                │
│ │ • 财务指标    │       │ • 技术指标    │                │
│ │ • PE/PB       │       │ • DDX/DDY     │                │
│ │ • 同比增长    │       │ • AI 评分     │                │
│ └───────┬───────┘       └───────┬───────┘                │
│         │                       │                         │
│         └───────────┬───────────┘                         │
│                     ▼                                     │
│           ┌───────────────────┐                          │
│           │    多维度筛选      │                          │
│           │  (基本面 + 技术面) │                          │
│           └─────────┬─────────┘                          │
│                     │                                     │
│                     ▼                                     │
│           ┌───────────────────┐                          │
│           │    排序输出       │                          │
│           │  (按 PE/评分排序)  │                          │
│           └───────────────────┘                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 配置说明

### Tushare 配置

创建 `~/.tushare_token` 文件：

```bash
echo "your_tushare_token" > ~/.tushare_token
chmod 600 ~/.tushare_token
```

### ZTrader MCP 配置

确保 ZTrader MCP 服务运行：

```bash
# 检查服务状态
curl http://localhost:8000/health

# 查看可用工具
mcporter describe ztrader

# 列出 MCP 服务器
mcporter list
```

ZTrader 配置见 [ztrader skill](../ztrader/SKILL.md)。

### ZTrader MCP 调用方法

**重要：参数传递格式**

```bash
# ✅ 正确语法：直接使用 name:'value' 格式
mcporter call ztrader.get_kpl_concepts_by_name name:'HBM'
mcporter call ztrader.get_dc_members ts_code:'BK0970.DC'
mcporter call ztrader.get_concept_stocks concept_name:'HBM 存储'

# ❌ 错误语法：不要使用 --params JSON
mcporter call ztrader get_kpl_concepts_by_name --params '{"name": "HBM"}'
```

**Python 调用示例：**

```python
import subprocess
import json

def call_ztrader_tool(tool_name, **params):
    """通过 mcporter 调用 ZTrader MCP 工具"""
    # 构建参数部分
    param_parts = []
    for key, value in params.items():
        if isinstance(value, str):
            param_parts.append(f"{key}:'{value}'")
        else:
            param_parts.append(f"{key}:{value}")

    params_str = ' '.join(param_parts)

    cmd = f"mcporter call ztrader.{tool_name} {params_str}"
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)

    if result.returncode == 0:
        response = json.loads(result.stdout)
        return response.get('result', [])
    return []

# 使用示例
hbm_concepts = call_ztrader_tool('get_kpl_concepts_by_name', name='HBM')
dc_members = call_ztrader_tool('get_dc_members', ts_code='BK0970.DC')
```

**常用概念查询接口：**

```bash
# 1. 按名称搜索开盘啦 (KPL) 题材
mcporter call ztrader.get_kpl_concepts_by_name name:'HBM'

# 2. 获取股票所属概念
mcporter call ztrader.get_kpl_concepts code:'002049.SZ'

# 3. 获取概念成分股
mcporter call ztrader.get_concept_stocks concept_name:'HBM 存储'

# 4. 获取东财板块成分股
mcporter call ztrader.get_dc_members ts_code:'BK0970.DC'

# 5. 搜索东财板块
mcporter call ztrader.get_dc_indices keyword:'半导体'
```

### 股票池配置

可在脚本中自定义股票池：

```python
CUSTOM_STOCK_POOL = {
    '001316.SZ',  # 润贝航科
    '002555.SZ',  # 三七互娱
    # ... 添加更多股票
}
```

---

## 输出格式

### CSV 输出

```csv
ts_code,name,PE,净利润 (万元),同比增长 (%),连续盈利季度,AI 评分，DDX,技术形态，综合评分
002555.SZ，三七互娱，23.53,696715.95,8.24,17,85,0.15,上涨趋势，92
002027.SZ，分众传媒，24.80,1319582.28,7.03,16,78,0.08,震荡，75
```

### 终端输出

```
================================================================================
选股策略：价值成长 + 趋势确认
筛选条件：连续 6 季度盈利，净利润增长>0, PE<50, AI 评分>=75
================================================================================

排名  股票代码    股票名称    PE     净利润 (万)  增长 (%)  AI 评分  技术形态
--------------------------------------------------------------------------------
1     002555.SZ  三七互娱   23.53   696715.95   8.24     85    上涨趋势
2     002027.SZ  分众传媒   24.80  1319582.28   7.03     78    震荡
...

共筛选出 8 只股票，结果已保存到：results.csv
```

---

## 策略详解

### 策略 A：价值成长 + 趋势确认

**适合人群：** 稳健型投资者，追求长期稳定收益

**筛选逻辑：**

1. **基本面筛选**
   - 连续 6 季度盈利 → 排除业绩波动大的公司
   - 净利润同比增长 > 0 → 确保成长性
   - PE < 50 → 排除过高估值

2. **技术面确认**
   - AI 评分 >= 75 → 技术形态良好
   - 股价在 20 日均线上方 → 处于上涨趋势
   - DDX > 0 → 主力资金流入

**预期效果：** 选出基本面良好、技术面确认的优质股票

---

### 策略 B：低估值 + 底部反转

**适合人群：** 价值投资者，寻找被低估的机会

**筛选逻辑：**

1. **低估值筛选**
   - PE < 30 → 低市盈率
   - PB < 3 → 低市净率

2. **底部信号**
   - 最近季度净利润转正 → 业绩拐点
   - KDJ 金叉 → 技术底部
   - 黄白线金叉 → 趋势反转

**预期效果：** 选出被低估且出现反转信号的股票

---

### 策略 C：概念热点 + 业绩支撑

**适合人群：** 短线交易者，追逐市场热点

**筛选逻辑：**

1. **概念筛选**
   - 属于目标概念板块（如字节跳动、AI 等）

2. **业绩支撑**
   - 连续盈利 → 排除纯炒作
   - 净利润增长 > 20% → 高成长

3. **资金热度**
   - 近期涨停或大涨
   - 资金持续流入

**预期效果：** 选出有业绩支撑的热点概念股

---

## 性能优化

### ✅ 已实现优化

#### 1. 并发查询（v1.1）

使用 ThreadPoolExecutor 并发查询基本面数据，10 个并发线程：

```python
from concurrent.futures import ThreadPoolExecutor, as_completed

with ThreadPoolExecutor(max_workers=10) as executor:
    future_to_stock = {
        executor.submit(check_fundamentals_tushare, ts_code): ts_code
        for ts_code in stock_pool
    }
```

**效果：** 基本面查询从 3.25 秒降至 **0.31 秒**（10 倍提升）

#### 2. 数据缓存（v1.1）

使用 pickle 缓存查询结果，24 小时有效期：

```python
@with_cache(expire_seconds=86400)  # 24 小时缓存
def check_fundamentals_tushare(ts_code, ...):
    ...

# 缓存位置
~/.cache/hybrid_selector/
├── a1b2c3d4e5f6...pkl  # 基本面缓存
```

**效果：** 第二次运行从 0.31 秒降至 **0.05 秒**（6 倍提升）

#### 3. 综合评分模型（v1.1）

多维度加权评分，更精准的选股：

```python
def calculate_composite_score(fundamentals, technicals, weights):
    """
    评分维度：
    - 盈利能力 (20%): 连续盈利季度数
    - 成长能力 (20%): 净利润同比增长
    - 估值水平 (20%): PE 倒数
    - 趋势强度 (15%): 均线排列
    - 资金流向 (15%): DDX
    - 形态评分 (10%): AI 评分
    """
```

### 📊 性能对比

| 版本        | 基本面查询         | 技术面查询     | 总耗时      | 优化项             |
| ----------- | ------------------ | -------------- | ----------- | ------------------ |
| v1.0        | 3.25 秒            | 12.96 秒       | 17.21 秒    | -                  |
| **v1.1**    | **0.31 秒**        | 6.46 秒        | **7.15 秒** | 并发 + 缓存        |
| v1.2 (计划) | 0.05 秒 (缓存命中) | 0.00 秒 (降级) | **0.50 秒** | 缓存 +ZTrader 修复 |

### 📈 耗时统计

脚本会自动输出各环节耗时：

```
⏱️  各环节耗时统计:
  Step 1: 获取股票池              0.00 秒  (0.0%)
  Step 2: 获取股票名称            0.37 秒  (5.2%) █
  Step 3: 基本面筛选 (Tushare)    0.31 秒  (4.4%)  ← 并发优化后
  Step 4: 技术面确认 (ZTrader)    6.46 秒  (90.4%) ← 待优化
  Step 5: 策略评分               0.00 秒  (0.0%)
  Step 6: 排序输出               0.01 秒  (0.1%)
  总耗时                        7.15 秒  (100.0%)
```

---

## 风险提示

1. **数据时效性**：财务数据有滞后，季报披露后才会更新
2. **技术面局限**：技术指标是历史数据，不能预测未来
3. **市场风险**：选股策略不能保证盈利，需结合个人判断
4. **分散投资**：建议分散投资，不要重仓单只股票

---

## 相关文档

- [Tushare 官方文档](https://tushare.pro/document/2)
- [ZTrader Skill](../ztrader/SKILL.md)
- [MCP 配置文档](~/.mcporter/mcporter.json)

---

## 更新日志

### v1.1 (2026-02-19) - 性能优化版

**新增功能：**

- ✅ 并发查询：基本面查询速度提升 10 倍（3.25 秒 → 0.31 秒）
- ✅ 数据缓存：24 小时缓存机制，重复查询速度提升 6 倍
- ✅ 综合评分模型：多维度加权评分（盈利/成长/估值/趋势/资金/形态）
- ✅ 日志系统：使用 logging 替代 print，支持调试模式
- ✅ 类型注解：完整的 Python type hints

**性能提升：**

- 总耗时从 17.21 秒降至 **7.15 秒**（2.4 倍提升）
- 基本面查询从 3.25 秒降至 **0.31 秒**（10 倍提升）
- 缓存命中后总耗时可降至 **0.50 秒**

**代码质量：**

- 添加并发查询模块 `check_fundamentals_batch()`
- 添加缓存装饰器 `@with_cache()`
- 添加综合评分函数 `calculate_composite_score()`
- 改进错误处理和日志记录

### v1.0 (2025-02-19) - 初始版本

- 支持基本面 + 技术面混合选股
- 支持 3 种选股策略
- 支持 Tushare 和 ZTrader MCP 数据源
