---
name: tushare-query
description: 从 Tushare 财经数据接口查询 A 股股票数据。支持查询股票基础信息、行情数据、财务数据（业绩快报/财报）、技术指标、资金流向、板块概念等。使用场景：查询股票财务数据、行情数据、技术指标、股东信息、行业板块成分等财经数据查询需求。
---

# Tushare 数据查询技能

## 核心功能

本技能提供从 Tushare 财经数据接口查询 A 股股票相关数据的能力。

### 支持的数据类型

1. **股票基础信息** - 股票代码、名称、行业、上市日期等
2. **行情数据** - 日线、周线、月线、分钟线、复权因子
3. **财务数据** - 业绩快报、财报（利润表/资产负债表/现金流量表）、财务指标
4. **技术指标** - MACD、KDJ、RSI、布林带等（需计算）
5. **资金流向** - 主力资金、北向资金、龙虎榜
6. **板块概念** - 行业板块、概念板块、板块成分股
7. **指数数据** - 大盘指数、行业指数行情
8. **其他数据** - 股东信息、限售解禁、融资融券等

## 使用说明

### 1. 环境准备

Tushare 需要 API token 才能访问数据。token 已配置在环境中，无需用户重复提供。

**token 存储位置：** `~/.tushare_token` 或环境变量 `TUSHARE_TOKEN`

### 2. 基本使用方法

#### 方式一：使用 Python 脚本查询（推荐）

在使用python版本的Tushare工具前，需要通过conda命令切换到tushare的python环境。命令是

```bash
  # 激活环境
  conda activate py312

  # 验证安装
  python -c "import tushare; print(tushare.__version__)"
```

这里一定要注意 ** 要使用python命令，而不是python3命令 **。conda默认一定会激活python，但是不一定会激活python3。如果使用python3命令，很有可能无法找到tushare这个package。

**_ 注意tushare有链接限制，每分钟访问次数要低于500次 _**

```bash
# 查询股票基础信息
python scripts/query_stock_basic.py 001316.SZ

# 查询日线行情
python scripts/query_daily.py 001316.SZ 20250101 20251231

# 查询财务指标
python scripts/query_finance_indicator.py 001316.SZ

# 查询业绩快报
python scripts/query_performance_express.py 001316.SZ
```

#### 方式二：直接使用 Python 代码

```python
import tushare as ts

# 初始化
ts.set_token('your_token')
pro = ts.pro_api()

# 查询股票基础信息
df = pro.stock_basic(exchange='', list_status='L', fields='ts_code,symbol,name,area,industry,market,list_date')

# 查询日线行情
df = pro.daily(ts_code='001316.SZ', start_date='20250101', end_date='20251231')

# 查询财务指标
df = pro.fina_indicator(ts_code='001316.SZ')

# 查询业绩快报
df = pro.perf_express(ts_code='001316.SZ', start_date='20250101', end_date='20251231')
```

### 3. 常用接口速查

详细接口文档见 [references/api_reference.md](references/api_reference.md)

| 数据类型   | 接口名             | 说明                   |
| ---------- | ------------------ | ---------------------- |
| 股票列表   | `stock_basic`      | A 股上市公司基本信息   |
| 日线行情   | `daily`            | 日线行情数据（前复权） |
| 周线/月线  | `weekly`/`monthly` | 周线/月线行情          |
| 分钟线     | `min`              | 分钟级别行情           |
| 财务指标   | `fina_indicator`   | 主要财务指标           |
| 利润表     | `income`           | 利润表数据             |
| 资产负债表 | `balancesheet`     | 资产负债表数据         |
| 现金流量表 | `cashflow`         | 现金流量表数据         |
| 业绩快报   | `perf_express`     | 业绩快报数据           |
| 业绩预告   | `forecast`         | 业绩预告数据           |
| 股东人数   | `top10_holders`    | 十大股东/流通股东      |
| 板块成分   | `index_member`     | 指数成分股             |
| 概念板块   | `concept_class`    | 概念分类               |

## 脚本说明

### scripts/query_stock_basic.py

查询股票基础信息（代码、名称、行业、上市日期等）

### scripts/query_daily.py

查询日线行情数据（开高低收、成交量、成交额等）

### scripts/query_finance_indicator.py

查询主要财务指标（每股收益、净资产收益率、毛利率等）

### scripts/query_performance_express.py

查询业绩快报数据（营收、净利润、同比增长等）

### scripts/query_concept_stocks.py

查询概念板块成分股

## 注意事项

1. **数据权限**：部分高级接口需要 Tushare 积分才能访问，当前 token 权限请查阅 [Tushare 积分说明](https://tushare.pro/document/1?doc_id=13)
2. **调用频率**：基础权限每分钟最多请求 100 次，请避免高频调用
3. **日期格式**：Tushare 使用 YYYYMMDD 格式，如 20250101
4. **股票代码**：使用 ts_code 格式，如 001316.SZ（深交所）、600000.SH（上交所）
5. **数据时效**：日线数据通常在交易日 17:30 后更新，财务数据按财报披露时间更新

## 故障排查

### 常见问题

1. **Token 错误**：检查 `~/.tushare_token` 文件是否存在且内容正确
2. **权限不足**：部分接口需要更高积分，见 [接口文档](https://tushare.pro/document/2)
3. **数据为空**：检查股票代码是否正确、日期范围是否有数据

### 获取帮助

- Tushare 官方文档：https://tushare.pro/document/2
- 接口列表：https://tushare.pro/document/2?doc_id=28
- 社区论坛：https://tushare.pro/user/comment

## Token 配置

当前使用的 Tushare token 已配置在系统中，无需每次提供。

如需更新 token，运行：

```bash
echo "your_new_token" > ~/.tushare_token
```
