---
name: bocha-search
description: 博查搜索 - 实时联网搜索服务，支持新闻、天气、百科、股票等多种垂直领域
metadata:
  openclaw:
    emoji: "🔍"
    requires: {}
---

# 博查搜索 (Bocha Search)

当需要获取**实时或联网信息**时，使用博查搜索 API。

## 何时使用

- 用户问"查一下 / 搜一下 / 最近 / 最新 / 现在……"
- 需要新闻、天气、百科、股票、火车票等**时效性或垂直领域**信息

## 环境变量

需要设置 `BOCHA_API_KEY` 环境变量

## 调用方式

使用 `exec` 工具执行以下 curl 命令：

### 1. Web 搜索 (Bocha Web Search)

```bash
curl -X POST "https://api.bochaai.com/v1/websearch" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BOCHA_API_KEY" \
  -d '{
    "query": "<搜索词>",
    "count": 10,
    "freshness": "noLimit"
  }'
```

### 2. AI 搜索 (Bocha AI Search) - 推荐

```bash
curl -X POST "https://api.bochaai.com/v1/aisearch" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BOCHA_API_KEY" \
  -d '{
    "query": "<搜索词>",
    "count": 10,
    "freshness": "noLimit"
  }'
```

## 参数说明

| 参数      | 说明                                                                                                    |
| --------- | ------------------------------------------------------------------------------------------------------- |
| query     | 搜索词（必填）                                                                                          |
| count     | 返回条数（1-50，默认10）                                                                                |
| freshness | 时间范围：`YYYY-MM-DD`, `YYYY-MM-DD..YYYY-MM-DD`, `noLimit`, `oneYear`, `oneMonth`, `oneWeek`, `oneDay` |

## 输出处理

1. 解析 JSON 响应
2. 提取标题、URL、摘要等关键信息
3. 以友好的格式呈现给用户
