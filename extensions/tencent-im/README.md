# Tencent IM 插件

OpenClaw 的腾讯云即时通讯（IM）通道插件，支持通过 REST API 发送和接收消息。

## 功能特性

- **单聊消息（C2C）**：一对一私聊
- **群聊消息**：支持群组对话
- **媒体消息**：支持图片、文件
- **身份模拟**：可使用管理员凭证代表任意用户发送消息
- **双模式支持**：WebSocket 实时模式 + Webhook 回调模式
- **多账号管理**：支持配置多个独立账号

## 工作原理

本插件基于腾讯云 IM 的 REST API 实现：

1. **管理员认证**：使用具有管理员权限的账号进行 API 调用认证
2. **发送消息**：可以指定任意用户作为消息发送方（`From_Account`）
3. **接收消息**：支持两种模式
   - **WebSocket 模式**：登录 TIM 客户端实时接收消息
   - **Webhook 模式**：通过 HTTP 回调接收消息推送

## 前置条件

1. 腾讯云账号并开通 [即时通信 IM](https://console.cloud.tencent.com/im) 服务
2. 创建应用并获取 `SDKAppID`
3. 获取管理员账号和密钥（或预生成的 UserSig）

## 配置说明

### 最小配置

```json
{
  "channels": {
    "tencent-im": {
      "enabled": true,
      "sdkAppId": "1400123456",
      "adminUserId": "@TIM#ADMIN_1400123456",
      "userId": "openclaw_bot",
      "secretKey": "your-secret-key"
    }
  }
}
```

### 完整配置

```json
{
  "channels": {
    "tencent-im": {
      "enabled": true,
      "sdkAppId": "1400123456",
      "secretKey": "your-secret-key",
      "adminUserId": "@TIM#ADMIN_1400123456",
      "userId": "openclaw_bot",
      "connectionMode": "webhook",
      "webhookPort": 18794,
      "webhookPath": "/webhook/tencent-im",
      "dmPolicy": "pairing",
      "allowFrom": [],
      "groupPolicy": "allowlist",
      "groupAllowFrom": [],
      "requireMention": false,
      "textChunkLimit": 2000,
      "mediaMaxMb": 20,
      "accounts": {
        "secondary": {
          "enabled": true,
          "sdkAppId": "1400yyyyyy",
          "secretKey": "another-secret-key",
          "adminUserId": "@TIM#ADMIN_1400yyyyyy",
          "userId": "bot_secondary"
        }
      }
    }
  }
}
```

### 配置项说明

| 配置项           | 类型    | 默认值                  | 说明                                      |
| ---------------- | ------- | ----------------------- | ----------------------------------------- |
| `enabled`        | boolean | `true`                  | 是否启用该通道                            |
| `sdkAppID`       | string  | -                       | 腾讯云 IM 应用的 SDKAppID                 |
| `secretKey`      | string  | -                       | 密钥（用于动态生成 UserSig）              |
| `userSig`        | string  | -                       | 预生成的 UserSig（与 secretKey 二选一）   |
| `adminUserId`    | string  | `userId`                | 管理员账号（用于 API 认证）               |
| `userId`         | string  | -                       | 默认消息发送者                            |
| `connectionMode` | string  | `"websocket"`           | 连接模式：`websocket` 或 `webhook`        |
| `webhookPort`    | number  | `18794`                 | Webhook 服务监听端口                      |
| `webhookPath`    | string  | `"/webhook/tencent-im"` | Webhook 回调路径                          |
| `dmPolicy`       | string  | `"pairing"`             | 单聊策略：`open`、`pairing`、`allowlist`  |
| `allowFrom`      | array   | `[]`                    | 允许的单聊发送者列表                      |
| `groupPolicy`    | string  | `"allowlist"`           | 群聊策略：`open`、`allowlist`、`disabled` |
| `groupAllowFrom` | array   | `[]`                    | 允许的群聊来源                            |
| `requireMention` | boolean | `false`                 | 群聊是否需要 @提及                        |
| `textChunkLimit` | number  | `2000`                  | 消息分片长度限制                          |
| `mediaMaxMb`     | number  | `20`                    | 媒体文件大小限制（MB）                    |

## 连接模式

### WebSocket 模式（默认）

插件登录 TIM 客户端，实时接收消息。

```json
{
  "connectionMode": "websocket"
}
```

**特点**：

- 实时接收消息
- 需要保持长连接
- 适合长期运行的服务器

### Webhook 模式

通过 HTTP 回调接收消息推送，适合部署在云端服务器。

```json
{
  "connectionMode": "webhook",
  "webhookPort": 18794,
  "webhookPath": "/webhook/tencent-im"
}
```

**配置步骤**：

1. 在 [腾讯云 IM 控制台](https://console.cloud.tencent.com/im) 进入「回调配置」
2. 添加回调 URL：`http://你的服务器IP:18794/webhook/tencent-im`
3. 勾选需要的回调命令：
   - `C2C.CallbackBeforeSendMsg` / `C2C.CallbackAfterSendMsg`（单聊）
   - `Group.CallbackBeforeSendMsg` / `Group.CallbackAfterSendMsg`（群聊）
4. 配置服务器防火墙，开放对应端口

**特点**：

- 无需保持长连接
- 适合云服务器部署
- 需要公网可访问的地址

## 发送消息

### 命令行

```bash
# 发送单聊消息
openclaw message send --channel tencent-im --to "user:123456" --message "你好！"

# 发送群聊消息
openclaw message send --channel tencent-im --to "group:789012" --message "大家好！"

# 简化格式（自动识别为用户ID）
openclaw message send --channel tencent-im --to "123456" --message "你好！"
```

### 目标格式

| 格式              | 说明           | 示例           |
| ----------------- | -------------- | -------------- |
| `user:<userId>`   | 单聊用户       | `user:123456`  |
| `group:<groupId>` | 群聊群组       | `group:789012` |
| `<userId>`        | 自动识别为用户 | `123456`       |
| `C2C<userId>`     | TIM 单聊格式   | `C2C123456`    |
| `GROUP<groupId>`  | TIM 群聊格式   | `GROUP789012`  |

### 身份模拟（发送者伪造）

使用 REST API 可以直接发送时指定任意发送者：

```typescript
import { sendMessageTencentIM } from "@openclaw/tencent-im";

// 以 user005 身份发送
await sendMessageTencentIM({
  cfg: config,
  to: "user:target_user",
  text: "你好！",
  fromUserId: "user005", // 指定发送者
});

// 以另一个机器人身份发送
await sendMessageTencentIM({
  cfg: config,
  to: "group:my_group",
  text: "系统公告",
  fromUserId: "system_bot",
});
```

**注意**：发送者可以是应用内任意用户，但 API 调用本身使用 `adminUserId` 进行认证。

## 安全策略

### 单聊策略（dmPolicy）

- **`open`**：接受任何人的消息
- **`pairing`**（默认）：需要通过配对流程或加入 allowlist
- **`allowlist`**：仅接受 allowlist 中用户的消息

### 群聊策略（groupPolicy）

- **`open`**：接受所有群聊消息
- **`allowlist`**（默认）：仅接受指定群组的消息
- **`disabled`**：禁用群聊功能

### allowlist 配置

```json
{
  "allowFrom": ["user:123456", "789012"],
  "groupAllowFrom": ["group:111222", "333444"]
}
```

## 多账号配置

支持同时配置多个独立的腾讯云 IM 账号：

```json
{
  "channels": {
    "tencent-im": {
      "enabled": true,
      "sdkAppId": "1400xxxxxx",
      "secretKey": "...",
      "adminUserId": "@TIM#ADMIN_1400xxxxxx",
      "userId": "bot_primary",
      "accounts": {
        "secondary": {
          "enabled": true,
          "sdkAppId": "1400yyyyyy",
          "secretKey": "...",
          "adminUserId": "@TIM#ADMIN_1400yyyyyy",
          "userId": "bot_secondary"
        }
      }
    }
  }
}
```

使用指定账号发送：

```bash
openclaw message send --channel tencent-im --account secondary --to "user:123" --message "你好"
```

## 常见问题

### 错误 60010："set the identifier field to admin account"

**原因**：`adminUserId` 没有管理员权限。

**解决方案**：

1. 使用默认管理员：`@TIM#ADMIN_{SDKAppID}`
2. 在腾讯云控制台为账号添加管理员权限

### 错误 70050："User not found"

**原因**：发送者或接收者不存在。

**解决方案**：

- 使用 REST API 先导入用户
- 确保用户至少登录过一次

### 消息发送成功但对方收不到

**检查项**：

1. UserSig 是否有效（未过期）
2. 目标用户是否存在于应用中
3. 群聊场景下机器人是否在群组中
4. 安全策略是否拦截了消息

### 收不到消息回调

**检查项**：

1. Webhook URL 是否公网可访问
2. 服务器防火墙/安全组是否放行端口
3. 腾讯云控制台是否启用了对应回调
4. 检查 Gateway 日志：`~/.openclaw/logs/gateway.log`

## API 限制

- **消息编辑**：腾讯云 IM 不支持编辑已发送的消息
- **表情回应**：不支持消息表情回应
- **话题回复**：不支持话题/线程功能
- **频率限制**：REST API 有调用频率限制（请参考腾讯云官方文档）

## 部署建议

### 本地开发

```json
{
  "connectionMode": "websocket"
}
```

### 云服务器部署

```json
{
  "connectionMode": "webhook",
  "webhookPort": 18794,
  "webhookPath": "/webhook/tencent-im"
}
```

配合 Nginx 反向代理使用 HTTPS：

```nginx
location /webhook/tencent-im {
    proxy_pass http://127.0.0.1:18794;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## 相关链接

- [腾讯云 IM 控制台](https://console.cloud.tencent.com/im)
- [腾讯云 IM 文档](https://cloud.tencent.com/document/product/269)
- [UserSig 生成工具](https://console.cloud.tencent.com/im/tool-usersig)
