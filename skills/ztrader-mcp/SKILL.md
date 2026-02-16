---
name: ztrader-mcp
description: 提供A股主板股票技术分析和选股能力，包含Pipeline选股漏斗、AI预测评分、股票信息查询、技术指标查询、题材概念查询等功能。当用户询问A股选股、股票技术分析、投资建议、股票技术指标、板块题材等相关问题时使用本技能。
---

# ZTrader MCP 股票分析技能

## 核心功能

1. Pipeline多阶段选股漏斗：基于交易日A股主板股票收盘价层层筛选得到优质股票池
2. AI预测评分：对选股结果中的股票进行综合打分，给出短线交易建议
3. 股票基础信息、技术指标、资金流向、题材概念查询

## 使用说明

1. 处理股票相关问题时，优先读取 [references/MCP_Skills_Documentation.md](references/MCP_Skills_Documentation.md) 查看详细的工具使用规范
2. 推荐流程：先调用 `get_pipeline_results(stage="ddy_filtered")` 获取最终选股结果，再对感兴趣的股票调用 `get_ai_predict` 获取评分，评分≥85分的股票具备短线交易价值
3. 严格按照参考文档中的工具调用场景选择合适的工具，避免错误调用
