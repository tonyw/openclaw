---
name: bocha-search
description: 在需要检索互联网实时信息时使用博查搜索（Bocha Search）。适用于新闻、天气、百科、股票、出行等需要联网或时效性数据的场景。当用户问题涉及“查一下”“搜一下”“最近”“最新”或明确要求联网检索时优先使用本技能。
metadata:
  openclaw:
    emoji: "🔍"
    requires: {}
---

# 博查搜索 (Bocha Search)

当用户需要**实时或联网信息**时，使用博查搜索获取网页与结构化结果。

## 何时使用

- 用户问“查一下 / 搜一下 / 最近 / 最新 / 现在……”
- 需要新闻、天气、百科、股票、火车票、医疗等**时效性或垂直领域**信息
- 需要从互联网获取**当前事实**或**多源摘要**时

## 工具说明

博查 MCP 提供两个工具（若已配置博查 MCP，会以工具形式出现）：

1. **Bocha Web Search**：全网网页搜索，返回标题、URL、摘要、发布时间等。
2. **Bocha AI Search**：在网页搜索基础上增加垂直领域**结构化模态卡**（天气卡、百科卡、股票卡等），适合需要结构化数据的场景。

## 调用方式

### 方式一：直接使用 MCP 工具（推荐）

若运行环境已挂载博查 MCP（如 Cursor / Claude Desktop 等），直接调用对应工具：

- **Bocha Web Search**：必填 `query`；可选 `freshness`、`count`（1–50，默认 10）。
- **Bocha AI Search**：参数同上，适合需要模态卡（天气、股票等）时使用。

### 方式二：通过 mcporter 调用

若通过 mcporter 连接博查 MCP，使用：

```bash
mcporter call bocha-search-mcp.bocha_web_search query="<搜索词>" count=10
```

或 AI Search（含模态卡）：

```bash
mcporter call bocha-search-mcp.bocha_ai_search query="<搜索词>" count=10
```

**参数说明：**

| 参数        | 说明                                                                                                                    |
| ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| `query`     | 搜索词（必填）                                                                                                          |
| `count`     | 返回条数，1–50，默认 10                                                                                                 |
| `freshness` | 时间范围：`YYYY-MM-DD`、`YYYY-MM-DD..YYYY-MM-DD`、`noLimit`、`oneYear`、`oneMonth`、`oneWeek`、`oneDay`，默认 `noLimit` |

## 使用建议

- 先判断是否需要**实时/联网**：若仅需常识或代码知识，可不调用搜索。
- 需要**结构化数据**（如股价、天气）时优先用 **Bocha AI Search**；仅需网页列表时用 **Bocha Web Search**。
- 对时效性强的问法（“最近”“今天”“最新”），可设置 `freshness`（如 `oneDay`、`oneWeek`）以缩小时间范围。
