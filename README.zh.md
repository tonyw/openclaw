# 🦞 OpenClaw — 个人AI助手

<p align="center">
    <picture>
        <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/openclaw/openclaw/main/docs/assets/openclaw-logo-text-dark.png">
        <img src="https://raw.githubusercontent.com/openclaw/openclaw/main/docs/assets/openclaw-logo-text.png" alt="OpenClaw" width="500">
    </picture>
</p>

<p align="center">
  <strong>蜕变！蜕变！</strong>
</p>

<p align="center">
  <a href="https://github.com/openclaw/openclaw/actions/workflows/ci.yml?branch=main"><img src="https://img.shields.io/github/actions/workflow/status/openclaw/openclaw/ci.yml?branch=main&style=for-the-badge" alt="CI状态"></a>
  <a href="https://github.com/openclaw/openclaw/releases"><img src="https://img.shields.io/github/v/release/openclaw/openclaw?include_prereleases&style=for-the-badge" alt="GitHub发布"></a>
  <a href="https://discord.gg/clawd"><img src="https://img.shields.io/discord/1456350064065904867?label=Discord&logo=discord&logoColor=white&color=5865F2&style=for-the-badge" alt="Discord"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="MIT许可证"></a>
</p>

**OpenClaw** 是一个在你自己设备上运行的*个人AI助手*。
它在你常用的通信渠道上回复你（WhatsApp、Telegram、Slack、Discord、Google Chat、Signal、iMessage、Microsoft Teams、WebChat），以及扩展渠道如 BlueBubbles、Matrix、Zalo 和 Zalo Personal。它可以在 macOS/iOS/Android 上语音对话，并可以渲染一个你可以控制的实时画布。Gateway只是控制平面——产品就是助手本身。

如果你想要一个个人的、单用户的助手，感觉本地化、快速且始终在线，这就是它。

[官网](https://openclaw.ai) · [文档](https://docs.openclaw.ai) · [DeepWiki](https://deepwiki.com/openclaw/openclaw) · [入门指南](https://docs.openclaw.ai/start/getting-started) · [更新](https://docs.openclaw.ai/install/updating) · [展示](https://docs.openclaw.ai/start/showcase) · [FAQ](https://docs.openclaw.ai/start/faq) · [向导](https://docs.openclaw.ai/start/wizard) · [Nix](https://github.com/openclaw/nix-openclaw) · [Docker](https://docs.openclaw.ai/install/docker) · [Discord](https://discord.gg/clawd)

推荐设置：在终端中运行 onboarding 向导 (`openclaw onboard`)。
该向导会一步步指导你设置 gateway、工作区、渠道和技能。CLI向导是推荐的路径，适用于 **macOS、Linux 和 Windows（通过WSL2；强烈推荐）**。
适用于 npm、pnpm 或 bun。
新安装？从这里开始：[入门指南](https://docs.openclaw.ai/start/getting-started)

**订阅（OAuth）：**

- **[Anthropic](https://www.anthropic.com/)** (Claude Pro/Max)
- **[OpenAI](https://openai.com/)** (ChatGPT/Codex)

模型说明：虽然支持任何模型，但我强烈推荐 **Anthropic Pro/Max (100/200) + Opus 4.6**，因为它具有长上下文强度和更好的提示注入抵抗力。参见 [Onboarding](https://docs.openclaw.ai/start/onboarding)。

## 模型（选择 + 认证）

- 模型配置 + CLI: [Models](https://docs.openclaw.ai/concepts/models)
- 认证配置文件轮换（OAuth vs API keys）+ 回退: [Model failover](https://docs.openclaw.ai/concepts/model-failover)

## 安装（推荐）

运行时: **Node ≥22**。

```bash
npm install -g openclaw@latest
# 或: pnpm add -g openclaw@latest

openclaw onboard --install-daemon
```

该向导会安装 Gateway 守护进程（launchd/systemd用户服务），使其保持运行。

## 快速开始（TL;DR）

运行时: **Node ≥22**。

完整初学者指南（认证、配对、渠道）：[入门指南](https://docs.openclaw.ai/start/getting-started)

```bash
openclaw onboard --install-daemon

openclaw gateway --port 18789 --verbose

# 发送消息
openclaw message send --to +1234567890 --message "Hello from OpenClaw"

# 与助手对话（可选择传送到任何已连接渠道：WhatsApp/Telegram/Slack/Discord/Google Chat/Signal/iMessage/BlueBubbles/Microsoft Teams/Matrix/Zalo/Zalo Personal/WebChat）
openclaw agent --message "Ship checklist" --thinking high
```

升级？[更新指南](https://docs.openclaw.ai/install/updating)（并运行 `openclaw doctor`）。

## 开发渠道

- **stable**: 标记的发布版本 (`vYYYY.M.D` 或 `vYYYY.M.D-<patch>`), npm dist-tag `latest`。
- **beta**: 预发布标签 (`vYYYY.M.D-beta.N`), npm dist-tag `beta` (macOS应用可能缺失)。
- **dev**: `main` 的移动头部, npm dist-tag `dev` (发布时)。

切换渠道 (git + npm): `openclaw update --channel stable|beta|dev`。
详情: [开发渠道](https://docs.openclaw.ai/install/development-channels)。

## 从源码构建（开发）

从源码构建时优先使用 `pnpm`。Bun 是可选的，用于直接运行 TypeScript。

```bash
git clone https://github.com/openclaw/openclaw.git
cd openclaw

pnpm install
pnpm ui:build # 首次运行时自动安装 UI 依赖
pnpm build

pnpm openclaw onboard --install-daemon

# 开发循环（TS 更改时自动重载）
pnpm gateway:watch
```

注意: `pnpm openclaw ...` 直接运行 TypeScript（通过 `tsx`）。`pnpm build` 生成 `dist/` 用于通过 Node / 打包的 `openclaw` 二进制文件运行。

## 安全默认设置（DM访问）

OpenClaw 连接到真实的消息传递界面。将入站 DM 视为**不受信任的输入**。

完整安全指南: [Security](https://docs.openclaw.ai/gateway/security)

Telegram/WhatsApp/Signal/iMessage/Microsoft Teams/Discord/Google Chat/Slack 的默认行为：

- **DM配对** (`dmPolicy="pairing"` / `channels.discord.dm.policy="pairing"` / `channels.slack.dm.policy="pairing"`): 未知发件人收到一个短配对码，机器人不处理他们的消息。
- 批准方式: `openclaw pairing approve <channel> <code>`（然后发件人被添加到本地允许列表存储）。
- 公共入站 DM 需要明确选择加入：设置 `dmPolicy="open"` 并在渠道允许列表 (`allowFrom` / `channels.discord.dm.allowFrom` / `channels.slack.dm.allowFrom`) 中包含 `"*"`。

运行 `openclaw doctor` 以显示有风险/配置错误的 DM 策略。

## 亮点

- **[本地优先 Gateway](https://docs.openclaw.ai/gateway)** — 会话、渠道、工具和事件的单一控制平面。
- **[多渠道收件箱](https://docs.openclaw.ai/channels)** — WhatsApp、Telegram、Slack、Discord、Google Chat、Signal、BlueBubbles (iMessage)、iMessage (遗留)、Microsoft Teams、Matrix、Zalo、Zalo Personal、WebChat、macOS、iOS/Android。
- **[多代理路由](https://docs.openclaw.ai/gateway/configuration)** — 将入站渠道/账户/对端路由到隔离的代理（工作区 + 每代理会话）。
- **[语音唤醒](https://docs.openclaw.ai/nodes/voicewake) + [对话模式](https://docs.openclaw.ai/nodes/talk)** — 使用 ElevenLabs 的 macOS/iOS/Android 始终在线语音。
- **[实时画布](https://docs.openclaw.ai/platforms/mac/canvas)** — 具有 [A2UI](https://docs.openclaw.ai/platforms/mac/canvas#canvas-a2ui) 的代理驱动可视化工作区。
- **[一流工具](https://docs.openclaw.ai/tools)** — 浏览器、画布、节点、cron、会话和 Discord/Slack 操作。
- **[配套应用](https://docs.openclaw.ai/platforms/macos)** — macOS 菜单栏应用 + iOS/Android [节点](https://docs.openclaw.ai/nodes)。
- **[Onboarding](https://docs.openclaw.ai/start/wizard) + [技能](https://docs.openclaw.ai/tools/skills)** — 向导驱动的设置，带有捆绑/托管/工作区技能。

## 工作原理（简短）

```
WhatsApp / Telegram / Slack / Discord / Google Chat / Signal / iMessage / BlueBubbles / Microsoft Teams / Matrix / Zalo / Zalo Personal / WebChat
               │
               ▼
┌───────────────────────────────┐
│            Gateway            │
│       (控制平面)         │
│     ws://127.0.0.1:18789      │
└──────────────┬────────────────┘
               │
               ├─ Pi agent (RPC)
               ├─ CLI (openclaw …)
               ├─ WebChat UI
               ├─ macOS app
               └─ iOS / Android nodes
```

## 关键子系统

- **[Gateway WebSocket 网络](https://docs.openclaw.ai/concepts/architecture)** — 用于客户端、工具和事件的单一 WS 控制平面（加上运维：[Gateway runbook](https://docs.openclaw.ai/gateway)）。
- **[Tailscale 暴露](https://docs.openclaw.ai/gateway/tailscale)** — 用于 Gateway 仪表板 + WS 的 Serve/Funnel（远程访问：[Remote](https://docs.openclaw.ai/gateway/remote)）。
- **[浏览器控制](https://docs.openclaw.ai/tools/browser)** — 具有 CDP 控制的 openclaw 托管 Chrome/Chromium。
- **[Canvas + A2UI](https://docs.openclaw.ai/platforms/mac/canvas)** — 代理驱动的可视化工作区（A2UI 主机：[Canvas/A2UI](https://docs.openclaw.ai/platforms/mac/canvas#canvas-a2ui)）。
- **[语音唤醒](https://docs.openclaw.ai/nodes/voicewake) + [对话模式](https://docs.openclaw.ai/nodes/talk)** — 始终在线的语音和连续对话。
- **[节点](https://docs.openclaw.ai/nodes)** — Canvas、相机快照/剪辑、屏幕录制、`location.get`、通知，加上 macOS 独有的 `system.run`/`system.notify`。

## 文档

- [从文档索引开始导航和了解"内容在哪里"。](https://docs.openclaw.ai)
- [阅读架构概述了解 gateway + 协议模型。](https://docs.openclaw.ai/concepts/architecture)
- [使用完整配置参考当你需要每个键和示例时。](https://docs.openclaw.ai/gateway/configuration)
- [按照操作手册运行 Gateway。](https://docs.openclaw.ai/gateway)
- [了解 Control UI/Web 界面如何工作以及如何安全地暴露它们。](https://docs.openclaw.ai/web)
- [了解通过 SSH 隧道或 tailnets 的远程访问。](https://docs.openclaw.ai/gateway/remote)
- [按照 onboarding 向导流程进行引导设置。](https://docs.openclaw.ai/start/wizard)
- [通过 webhook 界面连接外部触发器。](https://docs.openclaw.ai/automation/webhook)
- [设置 Gmail Pub/Sub 触发器。](https://docs.openclaw.ai/automation/gmail-pubsub)
- [了解 macOS 菜单栏配套应用的详细信息。](https://docs.openclaw.ai/platforms/mac/menu-bar)
- [平台指南：Windows (WSL2)](https://docs.openclaw.ai/platforms/windows)、[Linux](https://docs.openclaw.ai/platforms/linux)、[macOS](https://docs.openclaw.ai/platforms/macos)、[iOS](https://docs.openclaw.ai/platforms/ios)、[Android](https://docs.openclaw.ai/platforms/android)
- [使用故障排除指南调试常见故障。](https://docs.openclaw.ai/channels/troubleshooting)
- [在暴露任何内容之前查看安全指南。](https://docs.openclaw.ai/gateway/security)

## 社区

参见 [CONTRIBUTING.md](CONTRIBUTING.md) 了解指南、维护者和如何提交 PR。
欢迎 AI/vibe-coded PR！🤖

特别感谢 [Mario Zechner](https://mariozechner.at/) 的支持和
[pi-mono](https://github.com/badlogic/pi-mono)。
特别感谢 Adam Doppelt 提供的 lobster.bot。

感谢所有贡献者：

<p align="left">
  <a href="https://github.com/steipete"><img src="https://avatars.githubusercontent.com/u/58493?v=4&s=48" width="48" height="48" alt="steipete" title="steipete"/></a> <a href="https://github.com/joshp123"><img src="https://avatars.githubusercontent.com/u/1497361?v=4&s=48" width="48" height="48" alt="joshp123" title="joshp123"/></a> <a href="https://github.com/cpojer"><img src="https://avatars.githubusercontent.com/u/13352?v=4&s=48" width="48" height="48" alt="cpojer" title="cpojer"/></a> <a href="https://github.com/mbelinky"><img src="https://avatars.githubusercontent.com/u/132747814?v=4&s=48" width="48" height="48" alt="Mariano Belinky" title="Mariano Belinky"/></a> <a href="https://github.com/sebslight"><img src="https://avatars.githubusercontent.com/u/19554889?v=4&s=48" width="48" height="48" alt="sebslight" title="sebslight"/></a> <a href="https://github.com/Takhoffman"><img src="https://avatars.githubusercontent.com/u/781889?v=4&s=48" width="48" height="48" alt="Takhoffman" title="Takhoffman"/></a> <a href="https://github.com/quotentiroler"><img src="https://avatars.githubusercontent.com/u/40643627?v=4&s=48" width="48" height="48" alt="quotentiroler" title="quotentiroler"/></a> <a href="https://github.com/bohdanpodvirnyi"><img src="https://avatars.githubusercontent.com/u/31819391?v=4&s=48" width="48" height="48" alt="bohdanpodvirnyi" title="bohdanpodvirnyi"/></a> <a href="https://github.com/tyler6204"><img src="https://avatars.githubusercontent.com/u/64381258?v=4&s=48" width="48" height="48" alt="tyler6204" title="tyler6204"/></a> <a href="https://github.com/iHildy"><img src="https://avatars.githubusercontent.com/u/25069719?v=4&s=48" width="48" height="48" alt="iHildy" title="iHildy"/></a>
  <a href="https://github.com/jaydenfyi"><img src="https://avatars.githubusercontent.com/u/213395523?v=4&s=48" width="48" height="48" alt="jaydenfyi" title="jaydenfyi"/></a> <a href="https://github.com/gumadeiras"><img src="https://avatars.githubusercontent.com/u/5599352?v=4&s=48" width="48" height="48" alt="gumadeiras" title="gumadeiras"/></a> <a href="https://github.com/joaohlisboa"><img src="https://avatars.githubusercontent.com/u/8200873?v=4&s=48" width="48" height="48" alt="joaohlisboa" title="joaohlisboa"/></a> <a href="https://github.com/mneves75"><img src="https://avatars.githubusercontent.com/u/2423436?v=4&s=48" width="48" height="48" alt="mneves75" title="mneves75"/></a> <a href="https://github.com/MatthieuBizien"><img src="https://avatars.githubusercontent.com/u/173090?v=4&s=48" width="48" height="48" alt="MatthieuBizien" title="MatthieuBizien"/></a> <a href="https://github.com/Glucksberg"><img src="https://avatars.githubusercontent.com/u/80581902?v=4&s=48" width="48" height="48" alt="Glucksberg" title="Glucksberg"/></a> <a href="https://github.com/MaudeBot"><img src="https://avatars.githubusercontent.com/u/255777700?v=4&s=48" width="48" height="48" alt="MaudeBot" title="MaudeBot"/></a> <a href="https://github.com/rahthakor"><img src="https://avatars.githubusercontent.com/u/8470553?v=4&s=48" width="48" height="48" alt="rahthakor" title="rahthakor"/></a> <a href="https://github.com/vrknetha"><img src="https://avatars.githubusercontent.com/u/20596261?v=4&s=48" width="48" height="48" alt="vrknetha" title="vrknetha"/></a> <a href="https://github.com/vignesh07"><img src="https://avatars.githubusercontent.com/u/1436853?v=4&s=48" width="48" height="48" alt="vignesh07" title="vignesh07"/></a>
  <!-- 更多贡献者省略，详见原文件 -->
</p>

## Molty

OpenClaw 是为 **Molty** 构建的，一个太空龙虾 AI 助手。🦞
由 Peter Steinberger 和社区创建。

- [openclaw.ai](https://openclaw.ai)
- [soul.md](https://soul.md)
- [steipete.me](https://steipete.me)
- [@openclaw](https://x.com/openclaw)
