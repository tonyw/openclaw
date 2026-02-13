# Tencent IM + 花生壳内网穿透配置脚本

这个脚本帮助你一键配置 OpenClaw 的 Tencent IM 通道，配合花生壳（HSK）内网穿透服务，实现无公网IP下的 Webhook 消息接收。

## 功能

- ✅ 检测系统环境和依赖
- ✅ 指导花生壳安装（Mac/Linux）
- ✅ 配置花生壳映射
- ✅ 自动更新 OpenClaw Gateway 配置
- ✅ 重启服务并测试连通性
- ✅ 生成配置摘要

## 前置要求

1. **已购买花生壳套餐**（推荐「无忧+标准版」）
   - 官网：https://hsk.oray.com/price
   - 价格：约 98-168 元/年

2. **已安装 OpenClaw** 并完成初始配置

3. **系统要求**
   - macOS（Intel/Apple Silicon）
   - Linux（Debian/Ubuntu/CentOS）

## 使用方法

### 1. 运行脚本

**重要：必须使用 `bash` 运行，不要用 `sh`**

```bash
cd /path/to/openclaw

# ✅ 正确 - 使用 bash
bash scripts/setup-tencent-im-hsk.sh

# 或先赋予执行权限再运行
chmod +x scripts/setup-tencent-im-hsk.sh
./scripts/setup-tencent-im-hsk.sh

# ❌ 错误 - 使用 sh 会报错
sh scripts/setup-tencent-im-hsk.sh  # 不要这样运行！
```

> ⚠️ **注意**：在 Ubuntu/Debian 上，`sh` 默认指向 `dash`，不支持本脚本使用的一些高级特性。请始终使用 `bash`。

### 2. 按提示操作

脚本会分步骤引导你：

1. **检查环境** - 确认系统和依赖
2. **安装花生壳** - 下载安装客户端（如未安装）
3. **配置映射** - 输入花生壳公网域名
4. **更新配置** - 自动修改 `openclaw.json`
5. **重启服务** - 重启 OpenClaw Gateway
6. **测试连通** - 验证 Webhook 可访问性
7. **显示摘要** - 输出腾讯云配置信息

### 3. 配置腾讯云 IM

脚本完成后，会显示类似信息：

```
Tencent IM Webhook 地址:
  http://xxx.vicp.fun/webhook/tencent-im
```

去腾讯云控制台配置：

1. 访问：https://console.cloud.tencent.com/im/callback-setting
2. 填写回调 URL：`http://xxx.vicp.fun/webhook/tencent-im`
3. 勾选回调命令：
   - ☑ C2C.CallbackAfterSendMsg（单聊消息）
   - ☑ Group.CallbackAfterSendMsg（群聊消息）
4. 保存并启用

## 脚本修改的配置

脚本会自动修改 `~/.openclaw/openclaw.json`：

```json
{
  "gateway": {
    "bind": "lan",
    "controlUi": {
      "allowInsecureAuth": true
    }
  },
  "channels": {
    "tencent-im": {
      "connectionMode": "webhook",
      "webhookPort": 18794,
      "webhookPath": "/webhook/tencent-im"
    }
  }
}
```

> ⚠️ 修改前会自动备份原配置到 `openclaw.json.backup.YYYYMMDD_HHMMSS`

## 故障排查

### 花生壳连接不上

```bash
# 检查花生壳是否运行
pgrep -x "花生壳"  # macOS
pgrep -x "phddns"  # Linux

# 重启花生壳
# macOS: 在应用程序中重启「花生壳」
# Linux: sudo systemctl restart phddns
```

### OpenClaw Gateway 未启动

```bash
# 查看状态
systemctl --user status openclaw-gateway

# 手动重启
systemctl --user restart openclaw-gateway
# 或
pnpm openclaw gateway restart
```

### Webhook 测试失败

1. 确认花生壳客户端已登录且映射显示「在线」
2. 确认 OpenClaw Gateway 正在运行
3. 检查防火墙是否放行 18794 端口
4. 查看日志：`journalctl --user -u openclaw-gateway -f`

## 相关链接

- [花生壳官网](https://hsk.oray.com)
- [腾讯云 IM 控制台](https://console.cloud.tencent.com/im)
- [OpenClaw 文档](https://docs.openclaw.ai)

## 许可证

与 OpenClaw 项目保持一致。
