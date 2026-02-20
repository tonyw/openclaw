---
name: ztrader
description: 一个用于 A 股股票信息，选股相关的 MCP 服务，提供 A 股主板股票技术分析和每日量化选股，包含 Pipeline 选股漏斗、AI 预测评分、股票信息查询、技术指标查询、题材概念查询（开盘啦、东财行业与题材）、大盘指数等功能。当用户询问 A 股选股、股票技术分析、投资建议、股票技术指标、板块题材、东财概念/行业成分等相关问题时使用本技能。
---

# ZTrader MCP 股票分析技能

## 核心功能

1. Pipeline 多阶段选股漏斗：基于交易日 A 股主板股票收盘价层层筛选得到优质股票池
2. AI 预测评分：对 **Pipeline 多阶段选股** 最终选股结果中的股票进行综合打分，给出短线交易建议
3. 股票基础信息、技术指标、资金流向、题材概念查询（开盘啦、东财概念/行业/地域板块及成分）

## 使用说明

1. ZTrader 是一套基于最小风险的选股工具。它是一种右侧交易（上涨趋势）体系的量化策略。目标是在上涨趋势的股票中寻找风险最小买入点（这里统称为 B1 买入点，这是 buy-1 的缩写）。Pipeline 多阶段选股最终留下的股票就是以当天收盘价为止，寻找 A 股主板中所有满足 B1 的股票。AI 预测评分是从 K 线图形上对每只 B1 股票打分。
2. AI 预测评分是纯技术面的评价，并不是说分数高的次日就一定涨，更不能说就比分数低的涨势好。
3. 对于 AI 预测评的正确理解：第一，从指标技术面上高分比低分票更符合 B1 选股策略，从长期回测看更具有概率优势。第二，低分票一定是在指标上有硬伤（比如前期涨幅过大，或者低位吸筹不足），在历史经验中有过惨痛教训。或者大多数人的交易心态容易被后续波动影响，对于持股人的心态或者交易技术有很强要求。所以，低分票不一定涨势不如高分飘，而是低分票的风险更大，对于交易者的心态和交易技术与纪律要求更高。
4. 处理股票相关问题时，优先读取 [references/MCP_Skills_Documentation.md](references/MCP_Skills_Documentation.md) 查看详细的工具使用规范
5. 推荐流程：
   - 5.1 大盘分析，核心分析点位，资金情况，整体情绪面
   - 5.2 行业/题材分析
   - 5.3 当日龙头分析
   - 5.4 对于次日的 AI 量化选股
   - 5.5 针对 AI 选股的个股点评，结合大盘，题材，资金流动情况，个股在题材中的地位、历史战绩
   - 5.6 针对 AI 选出股票的舆情分析（需要使用外部联网搜索工具）
6. 严格按照参考文档中的工具调用场景选择合适的工具，避免错误调用
7. ZTrader 做不了什么：ZTrader 无法提供股票基本面信息，基于消息（新闻）的情绪题材面，分时粒度的交易信息。
8. ZTrader 有哪些局限：ZTrader 提供的开盘啦（KPL）题材数据来自 Tushare 的 kpl_concept（题材库）、kpl_concept_cons（题材成分）接口；题材成分接口因源站改版暂无新增数据。题材信息仅作辅助分析，无法确保股票与题材相关度，新型题材出现初期尤需谨慎。

---

## MCP 服务配置

### 配置信息

| 项目               | 值                                  |
| ------------------ | ----------------------------------- |
| **MCP 服务器名称** | `ztrader`                           |
| **服务地址**       | `http://localhost:8000/mcp/v1/sse`  |
| **配置文件路径**   | `~/.mcporter/mcporter.json`         |
| **可用工具数量**   | 16 个                               |
| **服务状态检查**   | `curl http://localhost:8000/health` |

### 配置文件内容

```json
// ~/.mcporter/mcporter.json
{
  "mcpServers": {
    "ztrader": {
      "url": "http://localhost:8000/mcp/v1/sse"
    },
    "bocha-search-mcp": {
      "command": "/home/wangxin/miniconda3/bin/uv",
      "args": [
        "--directory",
        "/home/wangxin/workspace/bocha-search-mcp",
        "run",
        "bocha-search-mcp"
      ],
      "env": {
        "BOCHA_API_KEY": "sk-xxx"
      }
    }
  }
}
```

### 常用命令

```bash
# 查看 MCP 服务器列表
mcporter list

# 查看 ZTrader 可用工具
mcporter describe ztrader

# 调用工具示例
mcporter call ztrader get_stock_basic --params '{"code": "001316.SZ"}'
mcporter call ztrader get_dc_indices --params '{"trade_date": "20250219", "limit": 10}'
mcporter call ztrader get_dc_members --params '{"ts_code": "BK1234.DC", "trade_date": "20250219"}'
mcporter call ztrader get_stock_kline --params '{"code": "001316.SZ", "days": 60}'
mcporter call ztrader get_ai_predict --params '{"code": "001316.SZ"}'
```

### 可用工具列表

**股票信息类：**

- `search_stocks(keyword, limit?)` - 搜索股票
- `get_stock_basic(code)` - 获取股票基础信息
- `get_stock_indicators(code, trade_date?)` - 获取估值指标（PE/PB 等）

**行情数据类：**

- `get_stock_kline(code, days?)` - 获取 K 线数据
- `get_stock_white_yellow(code, days?)` - 获取黄白线指标

**技术分析类：**

- `get_stock_technical(code, days?)` - 获取技术指标
- `get_ddx_ddy(code, days?)` - 获取 DDX/DDY 大单动向
- `get_stock_money_flow(code, days?)` - 获取资金流向

**题材概念类：**

- `get_kpl_concepts(code, limit?)` - 获取股票所属开盘啦概念
- `get_concept_stocks(concept_name, limit?)` - 获取概念成分股
- `get_dc_indices(trade_date?, idx_type?, keyword?, limit?)` - 获取东财板块列表
- `get_dc_members(ts_code, trade_date?, limit?)` - 获取东财板块成分股

**选股策略类：**

- `get_pipeline_results(stage, trade_date?, pipeline_version?, limit?)` - Pipeline 选股结果
- `get_ai_predict(code, trade_date?, pipeline_version?)` - AI 预测评分
- `get_ai_predict_by_date(trade_date, pipeline_version?, limit?)` - 按日期获取 AI 预测

**指数数据类：**

- `get_index_daily(index_code, days?)` - 获取大盘指数日线

### 服务健康检查

```bash
# 检查服务状态
curl http://localhost:8000/health
# 返回：{"status":"healthy"}

# 列出所有 MCP 服务器
mcporter list
# 返回：ztrader (16 tools), bocha-search-mcp (2 tools)
```

### 注意事项

1. **数据源**：ZTrader 的数据存储在本地数据库中，需要定期从 Tushare 同步更新
2. **服务启动**：ZTrader MCP 服务需要独立运行在 `localhost:8000`
3. **返回空值处理**：如果查询返回 `null` 或 `[]`，可能是数据库中无对应数据，建议回退到 Tushare 直接查询
4. **日期格式**：部分接口接受 `YYYY-MM-DD` 或 `YYYYMMDD` 格式，建议查阅具体接口文档

---

## 相关文档

- **详细工具文档**：[references/MCP_Skills_Documentation.md](references/MCP_Skills_Documentation.md)
- **Tushare 官方文档**：https://tushare.pro/document/2
- **MCP 配置文档**：`~/.mcporter/mcporter.json`
