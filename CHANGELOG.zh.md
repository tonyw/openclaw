# 更新日志

文档: https://docs.openclaw.ai

## 2026.2.10

### 变更

- 版本对齐: 将 manifest 和 package 版本升级到 `2026.2.10`; 在下次 macOS 发布前保持 `appcast.xml` 不变。
- CLI: 添加 `openclaw logs --local-time` 以在本地时区显示日志时间戳。(#13818) 感谢 @xialonglee。
- 配置: 避免在配置快照编辑期间编辑 `maxTokens` 等字段，防止 `/config` 中的往返验证失败。(#14006) 感谢 @constansino。

### 修复

- Ollama: 使用配置的 `models.providers.ollama.baseUrl` 进行模型发现，并将 `/v1` 端点规范化为原生 Ollama API 根路径。(#14131) 感谢 @shtse8。
- Slack: 当频道消息以机器人提及前缀开头时（例如 `@Bot /new`），检测控制命令。(#14142) 感谢 @beefiker。

## 2026.2.9

### 新增

- 命令: 添加 `commands.allowFrom` 配置用于单独的命令授权，允许运营者将斜杠命令限制给特定用户，同时保持对其他人的聊天开放。(#12430) 感谢 @thewilloftheshadow。
- Docker: 为 Docker 工作流添加 ClawDock shell 助手。(#12817) 感谢 @Olshansk。
- iOS: alpha 节点应用 + 设置码引导。(#11756) 感谢 @mbelinky。
- 频道: 全面的 BlueBubbles 和频道清理。(#11093) 感谢 @tyler6204。
- 频道: IRC 一级频道支持。(#11482) 感谢 @vignesh07。
- 插件: 设备配对 + 手机控制插件（Telegram `/pair`，iOS/Android 节点控制）。(#11755) 感谢 @mbelinky。
- 工具: 添加 Grok (xAI) 作为 `web_search` 提供商。(#12419) 感谢 @tmchow。
- 网关: 为 Web UI 添加代理管理 RPC 方法（`agents.create`、`agents.update`、`agents.delete`）。(#11045) 感谢 @advaitpaliwal。
- 网关: 将思考事件流式传输到 WS 客户端，并独立于详细级别广播工具事件。(#10568) 感谢 @nk1tz。
- Web UI: 在聊天历史中显示压缩分隔线。(#11341) 感谢 @Takhoffman。
- 代理: 在代理信封中包含运行时 shell。(#1835) 感谢 @Takhoffman。
- 代理: 当 ZAI 是主要提供商时，自动选择 `zai/glm-4.6v` 进行图像理解。(#10267) 感谢 @liuy。
- 路径: 添加 `OPENCLAW_HOME` 用于覆盖内部路径解析使用的 home 目录。(#12091) 感谢 @sebslight。
- 引导: 为 OpenAI 和 Anthropic 兼容端点添加自定义提供商流程。(#11106) 感谢 @MackDing。
- 钩子: 将 webhook 代理运行路由到特定的 `agentId`，添加 `hooks.allowedAgentIds` 控制，并在提供未知 ID 时回退到默认代理。(#13672) 感谢 @BillChirico。

### 修复

- Discord: 添加执行批准清理选项，在批准/拒绝/超时后删除 DM。(#13205) 感谢 @thewilloftheshadow。
- 会话: 修剪陈旧条目，限制会话存储大小，轮换大型存储，接受持续时间/大小阈值，默认为仅警告维护，并在保留窗口后修剪 cron 运行会话。(#13083) 感谢 @skyfallsin、@Glucksberg、@gumadeiras。
- CI: 实现流水线和工作流顺序。感谢 @quotentiroler。
- WhatsApp: 保留入站文档的原始文件名。(#12691) 感谢 @akramcodez。
- Telegram: 加强引用解析；保留引用上下文；避免 QUOTE_TEXT_INVALID；避免嵌套回复引用错误分类。(#12156) 感谢 @rybnikov。
- Telegram: 通过重试而不使用 `message_thread_id` 来恢复使用陈旧话题线程 ID 时的主动发送。(#11620)
- Discord: 在发送时自动创建论坛/媒体线程帖子，使用分块跟进回复和论坛发送的媒体处理。(#12380) 感谢 @magendary、@thewilloftheshadow。
- Discord: 限制网关重连尝试以避免无限重试循环。(#12230) 感谢 @Yida-Dev。
- Telegram: 使用 `<tg-spoiler>` HTML 标签渲染 markdown 剧透内容。(#11543) 感谢 @ezhikkk。
- Telegram: 将命令注册截断为 100 个条目，以避免启动时出现 `BOT_COMMANDS_TOO_MUCH` 失败。(#12356) 感谢 @arosstale。
- Telegram: 将 DM `allowFrom` 与发送者用户 ID 匹配（回退到聊天 ID）并澄清配对日志。(#12779) 感谢 @liuxiaopai-ai。
- 配对/Telegram: 在批准命令中包含实际配对码，通过共享配对消息构建器路由 Telegram 配对回复，并添加回归检查以防止 `<code>` 占位符漂移。
- 引导: QuickStart 现在自动安装 shell 补全（仅在 Manual 中提示）。
- 引导/提供商: 添加 LiteLLM 提供商引导，并在强制 API 密钥认证模式时保留自定义 LiteLLM 代理基础 URL。(#12823) 感谢 @ryan-crabbe。
- Docker: 使 `docker-setup.sh` 兼容 macOS Bash 3.2 和空额外挂载。(#9441) 感谢 @mateusz-michalik。
- 认证: 在存储/解析凭据之前，从粘贴的 API 密钥和令牌中去除嵌入的换行符。
- 代理: 从消息工具和流式输出中去除推理标签和降级的工具标记，以防止泄漏。(#11053、#13453) 感谢 @liebertar、@meaadore1221-afk、@gumadeiras。
- 浏览器: 防止卡住的 `act:evaluate` 阻塞浏览器工具，并使取消操作立即停止等待。(#13498) 感谢 @onutc。
- 安全/网关: 默认拒绝缺失的连接 `scopes`（没有隐式的 `operator.admin`）。
- Web UI: 使聊天刷新平滑滚动到最新消息，并在手动刷新期间抑制新消息徽章闪烁。
- Web UI: 在 `config.set` 和 `config.apply` 之前将表单编辑器值强制转换为模式类型，防止数字和布尔字段被序列化为字符串。(#13468) 感谢 @mcaxtr。
- 工具/web_search: 在网络搜索缓存键中包含提供商特定设置，并为 Grok 传递 `inlineCitations`。(#12419) 感谢 @tmchow。
- 工具/web_search: 修复 xAI Responses API 输出块的 Grok 响应解析。(#13049) 感谢 @ereid7。
- 工具/web_search: 规范化直接的 Perplexity 模型 ID，同时保持 OpenRouter 模型 ID 不变。(#12795) 感谢 @cdorsey。
- 模型故障转移: 将 HTTP 400 错误视为符合故障转移条件，启用自动模型回退。(#1879) 感谢 @orenyomtov。
- 错误: 防止在对话提及"上下文溢出"主题时出现误报的上下文溢出检测。(#2078) 感谢 @sbking。
- 错误: 通过将 `sanitizeUserFacingText` 重写限制在错误上下文中，避免重写/吞没提及错误关键词的正常助手回复。(#12988) 感谢 @Takhoffman。
- 配置: 在运行时配置加载期间重新水合 state-dir `.env`，以便 `${VAR}` 替换保持可解析。(#12748) 感谢 @rodrigouroz。
- 网关: 不再出现压缩后失忆；注入的转录本写入现在保留 Pi 会话 `parentId` 链，以便代理能够再次记住。(#12283) 感谢 @Takhoffman。
- 网关: 修复多代理 sessions.usage 发现。(#11523) 感谢 @Takhoffman。
- 代理: 从超大工具结果导致的上下文溢出中恢复（预先限制 + 回退截断）。(#11579) 感谢 @tyler6204。
- 子代理/压缩: 稳定公告时间并在重试期间保留压缩指标。(#11664) 感谢 @tyler6204。
- Cron: 共享隔离的公告流程并加强调度/交付可靠性。(#11641) 感谢 @tyler6204。
- Cron 工具: 当 LLM 为添加请求省略 `job` 包装器时恢复平面参数。(#12124) 感谢 @tyler6204。
- 网关/CLI: 当 `gateway.bind=lan` 时，使用 LAN IP 进行探测 URL 和控制 UI 链接。(#11448) 感谢 @AnonO6。
- CLI: 通过提升源根和缩短捆绑/全局/工作区插件路径，使 `openclaw plugins list` 输出可扫描。
- 钩子: 修复自 2026.2.2 以来损坏的捆绑钩子（tsdown 迁移）。(#9295) 感谢 @patrickshao。
- 安全/插件: 使用 `--ignore-scripts` 安装插件和钩子依赖项以防止生命周期脚本执行。
- 路由: 通过在路由解析时加载配置来按消息刷新绑定，以便绑定更改无需重启即可应用。(#11372) 感谢 @juanpablodlc。
- 执行批准: 以等宽字体渲染转发的命令，以便更安全地批准扫描。(#11937) 感谢 @sebslight。
- 配置: 将 `maxTokens` 限制为 `contextWindow` 以防止无效的模型配置。(#5516) 感谢 @lailoo。
- 思考: 为 `github-copilot/gpt-5.2-codex` 和 `github-copilot/gpt-5.2` 允许 xhigh。(#11646) 感谢 @LatencyTDH。
- 思考: 为具有推理能力的模型遵守 `/think off`。(#9564) 感谢 @liuy。
- Discord: 支持论坛/媒体线程创建启动消息，连接 `message thread create --message`，并加强路由。(#10062) 感谢 @jarvis89757。
- 路径: 结构性解析 `OPENCLAW_HOME` 派生的 home 路径，并修复工具元缩短中的 Windows 驱动器号处理。(#12125) 感谢 @mcaxtr。
- 记忆: 为 Voyage 嵌入设置 `input_type` 以改进检索。(#10818) 感谢 @mcinteerj。
- 记忆: 默认为记忆索引禁用异步批处理嵌入（通过 `agents.defaults.memorySearch.remote.batch.enabled` 选择加入）。(#13069) 感谢 @mcinteerj。
- 记忆/QMD: 在代理之间重用默认模型缓存，而不是每个代理重新下载。(#12114) 感谢 @tyler6204。
- 记忆/QMD: 默认在后台运行启动刷新，添加可配置的 QMD 维护超时，在回退失败后重试 QMD，并将 QMD 查询范围限定为 OpenClaw 管理的集合。(#9690、#9705、#10042) 感谢 @vignesh07。
- 记忆/QMD: 在网关启动时初始化 QMD 后端，以便后台更新计时器在进程重新加载后重新启动。(#10797) 感谢 @vignesh07。
- 配置/记忆: 自动将旧版顶级 `memorySearch` 设置迁移到 `agents.defaults.memorySearch`。(#11278、#9143) 感谢 @vignesh07。
- 媒体理解: 识别用于转录的 `.caf` 音频附件。(#10982) 感谢 @succ985。
- 状态目录: 遵守 `OPENCLAW_STATE_DIR` 用于默认设备身份和画布存储路径。(#4824) 感谢 @kossoy。

## 2026.2.6

### 变更

- Cron: 新作业的默认 `wakeMode` 现在是 `"now"`（之前是 `"next-heartbeat"`）。(#10776) 感谢 @tyler6204。
- Cron: `cron run` 默认为强制执行；使用 `--due` 限制为仅到期的任务。(#10776) 感谢 @tyler6204。
- 模型: 支持 Anthropic Opus 4.6 和 OpenAI Codex gpt-5.3-codex（前向兼容回退）。(#9853、#10720、#9995) 感谢 @TinyTb、@calvin-hpnet、@tyler6204。
- 提供商: 添加 xAI (Grok) 支持。(#9885) 感谢 @grp06。
- 提供商: 添加百度千帆支持。(#8868) 感谢 @ide-rea。
- Web UI: 添加令牌使用仪表板。(#10072) 感谢 @Takhoffman。
- 记忆: 原生 Voyage AI 支持。(#7078) 感谢 @mcinteerj。
- 会话: 限制 sessions_history 负载以减少上下文溢出。(#10000) 感谢 @gut-puncture。
- CLI: 在帮助输出中按字母顺序排序命令。(#8068) 感谢 @deepsoumya617。
- CI: 优化流水线吞吐量（macOS 整合、Windows 性能、工作流并发）。(#10784) 感谢 @mcaxtr。
- 代理: 将 pi-mono 升级到 0.52.7；为 Opus 4.6 模型 ID 添加嵌入式前向兼容回退。

### 新增

- Cron: 从仪表板运行历史深度链接到会话聊天。(#10776) 感谢 @tyler6204。
- Cron: 在运行日志条目中的每次运行会话键和 cron 会话的默认标签。(#10776) 感谢 @tyler6204。
- Cron: 模式中的旧版 payload 字段兼容性（`deliver`、`channel`、`to`、`bestEffortDeliver`）。(#10776) 感谢 @tyler6204。

### 修复

- Cron: 调度器可靠性（计时器漂移、重启追赶、锁争用、陈旧运行标记）。(#10776) 感谢 @tyler6204。
- Cron: 存储迁移加固（旧版字段迁移、解析错误处理、显式传递模式持久化）。(#10776) 感谢 @tyler6204。
- 记忆: 为 Voyage 嵌入设置 `input_type` 以改进检索。(#10818) 感谢 @mcinteerj。
- 记忆/QMD: 默认在后台运行启动刷新，添加可配置的 QMD 维护超时，在回退失败后重试 QMD，并将 QMD 查询范围限定为 OpenClaw 管理的集合。(#9690、#9705、#10042) 感谢 @vignesh07。
- 媒体理解: 识别用于转录的 `.caf` 音频附件。(#10982) 感谢 @succ985。
- Telegram: 在消息工具 + 子代理公告中自动注入 DM 话题 threadId。(#7235) 感谢 @Lukavyi。
- 安全: 要求对 Gateway 画布主机和 A2UI 资源进行认证。(#9518) 感谢 @coygeek。
- Cron: 修复调度和提醒交付回归；加强下一次运行重新计算 + 计时器重新设置 + 旧版调度字段。(#9733、#9823、#9948、#9932) 感谢 @tyler6204、@pycckuu、@j2h4u、@fujiwara-tofu-shop。
- 更新: 在更新流程中加固 Control UI 资源处理。(#10146) 感谢 @gumadeiras。
- 安全: 添加技能/插件代码安全扫描器；从 config.get 网关响应中编辑凭据。(#9806、#9858) 感谢 @abdelsfane。
- 执行批准: 将裸字符串白名单条目强制转换为对象。(#9903) 感谢 @mcaxtr。
- Slack: 为 /new 和 /reset 添加提及 stripPatterns。(#9971) 感谢 @ironbyte-rgb。
- Chrome 扩展: 修复捆绑路径解析。(#8914) 感谢 @kelvinCB。
- 压缩/错误: 允许在上下文溢出时进行多次压缩重试；显示清晰的计费错误。(#8928、#8391) 感谢 @Glucksberg。

## 2026.2.3

### 变更

- Telegram: 从 `bot-handlers.ts` 中移除最后一个 `@ts-nocheck`，直接使用 Grammy 类型，去重 `StickerMetadata`。`src/telegram/` 中剩余的 `@ts-nocheck` 为零。(#9206)
- Telegram: 从 `bot-message.ts` 中移除 `@ts-nocheck`，通过 `Omit<BuildTelegramMessageContextParams>` 键入依赖项，将 `allMedia` 扩展到 `TelegramMediaRef[]`。(#9180)
- Telegram: 从 `bot.ts` 中移除 `@ts-nocheck`，修复重复的 `bot.catch` 错误处理程序（Grammy 覆盖），移除无效的反应 `message_thread_id` 路由，加强贴纸缓存保护。(#9077)
- 引导: 添加 Cloudflare AI Gateway 提供商设置和文档。(#7914) 感谢 @roerohan。
- 引导: 添加 Moonshot (.cn) 认证选择，并在保留默认值时保持中国基础 URL。(#7180) 感谢 @waynelwz。
- 文档: 通过拆分文本和 Enter 来澄清 tmux send-keys 的 TUI。(#7737) 感谢 @Wangnov。
- 文档: 为 zh-CN 镜像落地页改版（功能、快速入门、文档目录、网络模型、致谢）。(#8994) 感谢 @joshp123。
- 消息: 跨频道添加每频道和每账户的 responsePrefix 覆盖。(#9001) 感谢 @mudrii。
- Cron: 为隔离作业添加公告传递模式（CLI + Control UI）和传递模式配置。
- Cron: 将隔离作业默认为公告传递；在工具输入中接受 ISO 8601 `schedule.at`。
- Cron: 硬迁移隔离作业到公告/无传递；删除旧版发布到主/payload 传递字段和 `atMs` 输入。
- Cron: 默认在成功后删除一次性作业；为 CLI 添加 `--keep-after-run`。
- Cron: 在公告传递期间抑制消息工具，以便摘要一致地发布。
- Cron: 避免在隔离运行直接发送消息时出现重复传递。

### 修复

- 心跳: 允许多账户频道的显式 accountId 路由。(#8702) 感谢 @lsh411。
- TUI/网关: 处理非流式终结，为非本地聊天运行刷新历史，并避免针对目标工具流的事件间隙警告。(#8432) 感谢 @gumadeiras。
- Shell 补全: 自动检测并将慢速动态模式迁移到缓存文件以加快终端启动；在 doctor/update/onboard 中添加补全健康检查。
- Telegram: 在内联模型选择中遵守会话模型覆盖。(#8193) 感谢 @gildo。
- Web UI: 修复默认/非默认代理的代理模型选择保存，并包装长工作区路径。感谢 @Takhoffman。
- Web UI: 当设置 `gateway.controlUi.basePath` 时解析头部 logo 路径。(#7178) 感谢 @Yeom-JinHo。
- Web UI: 将按钮样式应用于新消息指示器。
- 引导: 从非交互式 API 密钥标志推断认证选择。(#8484) 感谢 @f-trycua。
- 安全: 将不受信任的频道元数据排除在系统提示之外（Slack/Discord）。感谢 @KonstantinMirin。
- 安全: 强制对消息工具附件进行沙盒化媒体路径。(#9182) 感谢 @victormier。
- 安全: 要求对网关 URL 覆盖进行显式凭据验证以防止凭据泄漏。(#8113) 感谢 @victormier。
- 安全: 将 `whatsapp_login` 工具限制为所有者发送者，并默认拒绝非所有者上下文。(#8768) 感谢 @victormier。
- 语音通话: 使用主机白名单/代理信任加强 webhook 验证，并保持 ngrok 环回绕过。
- 语音通话: 为匿名入站呼叫 ID 添加白名单策略的回归覆盖。(#8104) 感谢 @victormier。
- Cron: 在 CLI `--at` 解析中接受纪元时间戳和 0ms 持续时间。
- Cron: 在存储文件重新创建或 mtime 更改时重新加载存储数据。
- Cron: 直接交付公告运行，遵守传递模式，并尊重唤醒模式的摘要。(#8540) 感谢 @tyler6204。
- Telegram: 在转发消息中包含 forward_from_chat 元数据并加强 cron 交付目标检查。(#8392) 感谢 @Glucksberg。
- macOS: 修复 cron payload 摘要渲染和 ISO 8601 格式化程序并发安全。
- Discord: 对代理组件（按钮/选择菜单）强制执行 DM 白名单，遵守配对存储批准和标签匹配。(#11254) 感谢 @thedudeabidesai。

## 2026.2.2-3

### 修复

- 更新: 为 pre-tsdown 更新导入提供旧版守护进程 CLI shim（修复 npm 更新后的守护进程重启）。

## 2026.2.2-2

### 变更

- 文档: 将 BlueBubbles 推广为推荐的 iMessage 集成；将 imsg 频道标记为旧版。(#8415) 感谢 @tyler6204。

### 修复

- CLI 状态: 从捆绑的 dist 输出解析构建信息（修复 npm 构建中的"未知"提交）。

## 2026.2.2-1

### 修复

- CLI 状态: 回退到构建信息进行版本检测（修复 beta 构建中的"未知"）。感谢 @gumadeira。

## 2026.2.2

### 变更

- 飞书: 添加飞书/Lark 插件支持 + 文档。(#7313) 感谢 @jiulingyun (openclaw-cn)。
- Web UI: 添加代理仪表板，用于管理代理文件、工具、技能、模型、频道和 cron 作业。
- 子代理: 除非请求特定的外部接收者，否则不鼓励直接使用消息工具。
- 记忆: 为工作区记忆实现选择加入的 QMD 后端。(#3160) 感谢 @vignesh07。
- 安全: 添加健康检查技能和引导审计指南。(#7641) 感谢 @Takhoffman。
- 配置: 允许通过 `agents.defaults.subagents.thinking`（和每个代理的 `agents.list[].subagents.thinking`）设置默认子代理思考级别。(#7372) 感谢 @tyler6204。
- 文档: zh-CN 翻译种子 + 润色、流水线指南、导航/落地页更新和拼写修复。(#8202、#6995、#6619、#7242、#7303、#7415) 感谢 @AaronWander、@taiyi747、@Explorer1092、@rendaoyuan、@joshp123、@lailoo。
- 文档: 添加 zh-CN i18n 护栏以避免编辑生成的翻译。(#8416) 感谢 @joshp123。

### 修复

- 文档: 完成将 QMD 记忆文档重命名为引用 OpenClaw 状态目录。
- 引导: 保持 TUI 流程独占（跳过补全提示 + 后台 Web UI 种子）。
- 引导: 删除现在由安装/更新处理的补全提示。
- TUI: 在 TUI 处于活动状态时阻止引导输出，并在退出时恢复终端状态。
- CLI: 在状态目录中缓存 shell 补全脚本，并在配置文件中获取缓存的文件。
- Zsh 补全: 转义选项描述以避免无效选项错误。
- 代理: 修复格式错误的工具调用和会话转录本。(#7473) 感谢 @justinhuangcode。
- fix(代理): 在调用 AbortSignal.any() 之前验证 AbortSignal 实例 (#7277)（感谢 @Elarwei001）
- fix(webchat): 在流式传输和刷新期间尊重用户滚动位置 (#7226)（感谢 @marcomarandiz）
- Telegram: 从 grammY 长轮询超时错误中恢复。(#7466) 感谢 @macmimi23。
- 媒体理解: 跳过文件文本提取中的二进制媒体。(#7475) 感谢 @AlexZhangji。
- 安全: 当频道类型查找失败时，对 Slack 斜杠命令强制执行访问组门控。
- 安全: 在跳过设备身份的网关连接之前，需要经过验证的共享密钥认证。
- 安全: 用 SSRF 检查保护技能安装程序下载（阻止私有/localhost URL）。
- fix(lobster): 通过 lobsterPath/cwd 注入阻止任意执行 (GHSA-4mhr-g7xj-cg8j)。(#5335) 感谢 @vignesh07。
- 安全: 清理 WhatsApp accountId 以防止路径遍历。(#4610)
- 安全: 限制 MEDIA 路径提取以防止 LFI。(#4930)
- 安全: 针对沙盒根目录验证消息工具 filePath/path。(#6398)
- 安全: 阻止主机执行的 LD*/DYLD* 环境覆盖。(#4896) 感谢 @HassanFleyah。
- 安全: 加强网络工具内容包装 + 文件解析保护措施。(#4058) 感谢 @VACInc。
- 安全: 强制执行 Twitch `allowFrom` 白名单门控（拒绝非白名单发送者）。感谢 @MegaManSec。

## 2026.2.1

### 变更

- 文档: 引导/安装/i18n/执行批准/Control UI/exe.dev/cacheRetention 更新 + 杂项导航/拼写。(#3050、#3461、#4064、#4675、#4729、#4763、#5003、#5402、#5446、#5474、#5663、#5689、#5694、#5967、#6270、#6300、#6311、#6416、#6487、#6550、#6789)
- Telegram: 使用共享配对存储。(#6127) 感谢 @obviyus。
- 代理: 添加 OpenRouter 应用归属标头。感谢 @alexanderatallah。
- 代理: 添加系统提示安全护栏。(#5445) 感谢 @joshp123。
- 代理: 将 pi-ai 更新到 0.50.9，并将 cacheControlTtl 重命名为 cacheRetention（带向后兼容映射）。
- 代理: 使用 systemPrompt/skills/contextFiles 扩展 CreateAgentSessionOptions。
- 代理: 添加工具策略一致性快照（无运行时行为更改）。(#6011)
- 认证: 更新 MiniMax OAuth 提示 + 门户认证说明文本。
- Discord: 继承线程父级绑定进行路由。(#3892) 感谢 @aerolalit。
- 网关: 向代理和 chat.send 消息注入时间戳。(#3705) 感谢 @conroywhitney、@CashWilliams。
- 网关: TLS 监听器要求最低 TLS 1.3。(#5970) 感谢 @loganaden。
- Web UI: 优化聊天布局 + 扩展会话活动持续时间。
- CI: 添加正式一致性 + 别名一致性检查。(#5723、#5807)

### 修复

- 安全: 使用 SSRF 保护保护远程媒体获取（阻止私有/localhost、DNS 固定）。
- 更新: 清理陈旧的全局安装重命名目录，并延长网关更新超时以避免 npm ENOTEMPTY 失败。
- 插件: 验证插件/钩子安装路径并拒绝遍历式名称。
- Telegram: 为文件获取添加下载超时。(#6914) 感谢 @hclsys。
- Telegram: 强制执行 DM 与论坛发送的线程规范。(#6833) 感谢 @obviyus。
- 流式传输: 在段落边界上刷新块流式传输以进行换行分块。(#7014)
- 流式传输: 稳定部分流式传输过滤器。
- 自动回复: 避免在 /new 问候提示中引用工作区文件。(#5706) 感谢 @bravostation。
- 工具: 对齐工具执行适配器/签名（旧版 + 参数顺序 + 参数规范化）。
- 工具: 将 `"*"` 工具白名单条目视为有效，以避免虚假未知条目警告。
- 技能: 将 session-logs 路径从 .clawdbot 更新到 .openclaw。(#4502)
- Slack: 加强媒体获取限制和 Slack 文件 URL 验证。(#6639) 感谢 @davidiach。
- Lint: 在导入排序后满足大括号规则。(#6310)
- 进程: 通过在需要时附加 `.cmd` 来解决 Windows `spawn()` 对 npm 系列 CLI 的失败。(#5815) 感谢 @thejhinvirtuoso。
- Discord: 为白名单和标签解析 PluralKit 代理发送者。(#5838) 感谢 @thewilloftheshadow。
- Tlon: 为 SSE 客户端获取调用添加超时（CWE-400）。(#5926)
- 记忆搜索: L2 归一化本地嵌入向量以修复语义搜索。(#5332)
- 代理: 将嵌入式运行器 + 类型与 pi-coding-agent API 更新对齐（pi 0.51.0）。
- 代理: 确保在嵌入式运行器中应用 OpenRouter 归属标头。
- 代理: 为压缩保护限制上下文窗口解析。(#6187) 感谢 @iamEvanYT。
- 系统提示: 使用 session_status 解决覆盖和提示以获取当前日期/时间。(#1897、#1928、#2108、#3677)
- 代理: 修复 Pi 提示模板参数语法。(#6543)
- 子代理: 修复公告故障转移竞争（始终发出生命周期结束；timeout=0 表示无超时）。(#6621)
- Teams: 门控媒体认证重试。
- Telegram: 恢复草稿流式部分。(#5543) 感谢 @obviyus。
- 引导: 更友好的 Windows 引导消息。(#6242) 感谢 @shanselman。
- TUI: 防止在模型选择器中使用数字搜索时崩溃。
- 代理: 将 before_tool_call 插件钩子连接到工具执行。(#6570、#6660) 感谢 @ryancnelson。
- 浏览器: 保护 Chrome 扩展中继 CDP 会话。
- Docker: 使用容器端口作为网关命令而不是主机端口。(#5110) 感谢 @mise42。
- Docker: 默认启动网关 CMD 用于容器部署。(#6635) 感谢 @kaizen403。

## 2026.1.31

### 变更

- 文档: 引导/安装/i18n/执行批准/Control UI/exe.dev/cacheRetention 更新 + 杂项导航/拼写。(#3050、#3461、#4064、#4675、#4729、#4763、#5003、#5402、#5446、#5474、#5663、#5689、#5694、#5967、#6270、#6300、#6311、#6416、#6487、#6550、#6789)
- Telegram: 使用共享配对存储。(#6127) 感谢 @obviyus。
- 代理: 添加 OpenRouter 应用归属标头。感谢 @alexanderatallah。
- 代理: 添加系统提示安全护栏。(#5445) 感谢 @joshp123。
- 代理: 将 pi-ai 更新到 0.50.9，并将 cacheControlTtl 重命名为 cacheRetention（带向后兼容映射）。
- 代理: 使用 systemPrompt/skills/contextFiles 扩展 CreateAgentSessionOptions。
- 代理: 添加工具策略一致性快照（无运行时行为更改）。(#6011)
- 认证: 更新 MiniMax OAuth 提示 + 门户认证说明文本。
- Discord: 继承线程父级绑定进行路由。(#3892) 感谢 @aerolalit。
- 网关: 向代理和 chat.send 消息注入时间戳。(#3705) 感谢 @conroywhitney、@CashWilliams。
- 网关: TLS 监听器要求最低 TLS 1.3。(#5970) 感谢 @loganaden。
- Web UI: 优化聊天布局 + 扩展会话活动持续时间。
- CI: 添加正式一致性 + 别名一致性检查。(#5723、#5807)

### 修复

- 安全: 使用 SSRF 保护保护远程媒体获取（阻止私有/localhost、DNS 固定）。
- 更新: 清理陈旧的全局安装重命名目录，并延长网关更新超时以避免 npm ENOTEMPTY 失败。
- 插件: 验证插件/钩子安装路径并拒绝遍历式名称。
- Telegram: 为文件获取添加下载超时。(#6914) 感谢 @hclsys。
- Telegram: 强制执行 DM 与论坛发送的线程规范。(#6833) 感谢 @obviyus。
- 流式传输: 在段落边界上刷新块流式传输以进行换行分块。(#7014)
- 流式传输: 稳定部分流式传输过滤器。
- 自动回复: 避免在 /new 问候提示中引用工作区文件。(#5706) 感谢 @bravostation。
- 工具: 对齐工具执行适配器/签名（旧版 + 参数顺序 + 参数规范化）。
- 工具: 将 `"*"` 工具白名单条目视为有效，以避免虚假未知条目警告。
- 技能: 将 session-logs 路径从 .clawdbot 更新到 .openclaw。(#4502)
- Slack: 加强媒体获取限制和 Slack 文件 URL 验证。(#6639) 感谢 @davidiach。
- Lint: 在导入排序后满足大括号规则。(#6310)
- 进程: 通过在需要时附加 `.cmd` 来解决 Windows `spawn()` 对 npm 系列 CLI 的失败。(#5815) 感谢 @thejhinvirtuoso。
- Discord: 为白名单和标签解析 PluralKit 代理发送者。(#5838) 感谢 @thewilloftheshadow。
- Tlon: 为 SSE 客户端获取调用添加超时（CWE-400）。(#5926)
- 记忆搜索: L2 归一化本地嵌入向量以修复语义搜索。(#5332)
- 代理: 将嵌入式运行器 + 类型与 pi-coding-agent API 更新对齐（pi 0.51.0）。
- 代理: 确保在嵌入式运行器中应用 OpenRouter 归属标头。
- 代理: 为压缩保护限制上下文窗口解析。(#6187) 感谢 @iamEvanYT。
- 系统提示: 使用 session_status 解决覆盖和提示以获取当前日期/时间。(#1897、#1928、#2108、#3677)
- 代理: 修复 Pi 提示模板参数语法。(#6543)
- 子代理: 修复公告故障转移竞争（始终发出生命周期结束；timeout=0 表示无超时）。(#6621)
- Teams: 门控媒体认证重试。
- Telegram: 恢复草稿流式部分。(#5543) 感谢 @obviyus。
- 引导: 更友好的 Windows 引导消息。(#6242) 感谢 @shanselman。
- TUI: 防止在模型选择器中使用数字搜索时崩溃。
- 代理: 将 before_tool_call 插件钩子连接到工具执行。(#6570、#6660) 感谢 @ryancnelson。
- 浏览器: 保护 Chrome 扩展中继 CDP 会话。
- Docker: 使用容器端口作为网关命令而不是主机端口。(#5110) 感谢 @mise42。
- Docker: 默认启动网关 CMD 用于容器部署。(#6635) 感谢 @kaizen403。

## 2026.1.30

### 变更

- CLI: 添加 `completion` 命令（Zsh/Bash/PowerShell/Fish），并在 postinstall/引导期间自动设置。
- CLI: 添加每代理的 `models status`（`--agent` 过滤器）。(#4780) 感谢 @jlowin。
- 代理: 将 Kimi K2.5 添加到合成模型目录。(#4407) 感谢 @manikv12。
- 认证: 将 Kimi Coding 切换到内置提供商；规范化 OAuth 配置文件电子邮件。
- 认证: 添加 MiniMax OAuth 插件 + 引导选项。(#4521) 感谢 @Maosghoul。
- 代理: 更新 pi SDK/API 使用和依赖项。
- Web UI: 在聊天命令后刷新会话并改进会话显示名称。
- 构建: 将 TypeScript 构建移动到 `tsdown` + `tsgo`（更快的构建、CI 类型检查），更新 tsconfig 目标，并清理 lint 规则。
- 构建: 对齐 npm tar 覆盖和 bin 元数据，以便在 npm 发布中保留 `openclaw` CLI 入口点。
- 文档: 添加 pi/pi-dev 文档并更新 OpenClaw 品牌 + 安装链接。
- Docker E2E: 稳定网关就绪性、插件安装/manifest 和清理/doctor 切换入口点检查。

### 修复

- 安全: 限制媒体解析器中的本地路径提取以防止 LFI。(#4880)
- 网关: 防止令牌默认值变成字面意义上的 "undefined"。(#4873) 感谢 @Hisleren。
- Control UI: 修复 npm 全局安装的资源解析。(#4909) 感谢 @YuriNachos。
- macOS: 避免网关发现中的 stderr 管道背压。(#3304) 感谢 @abhijeet117。
- Telegram: 为非规范化 ID 规范化账户令牌查找。(#5055) 感谢 @jasonsschin。
- Telegram: 保留交付线程回退并修复交付上下文中的 threadId 处理。
- Telegram: 修复重叠样式/链接的 HTML 嵌套。(#4578) 感谢 @ThanhNguyxn。
- Telegram: 接受反应操作中的数字 messageId/chatId。(#4533) 感谢 @Ayush10。
- Telegram: 通过 undici fetch 遵守每代理代理调度程序。(#4456) 感谢 @spiceoogway。
- Telegram: 将技能命令范围限定为每机器人绑定的代理。(#4360) 感谢 @robhparker。
- BlueBubbles: 通过 messageId 去抖动以保留文本+图像消息中的附件。(#4984)
- 路由: 对子代理公告交付优先使用 requesterOrigin 而不是陈旧的会话条目。(#4957)
- 扩展: 恢复嵌入式扩展发现类型。
- CLI: 修复 `tui:dev` 端口解析。
- LINE: 修复状态命令 TypeError。(#4651)
- OAuth: 当刷新令牌仍然有效时跳过过期令牌警告。(#4593)
- 构建: 在 Dockerfile 中跳过冗余的 UI 安装步骤。(#4584) 感谢 @obviyus。

## 2026.1.29

### 变更

- 品牌重塑: 将 npm 包/CLI 重命名为 `openclaw`，添加 `openclaw` 兼容性 shim，并将扩展移动到 `@openclaw/*` 范围。
- 引导: 加强 beta + 访问控制预期的安全警告文本。
- 引导: 在非交互式流程中添加 Venice API 密钥。(#1893) 感谢 @jonisjongithub。
- 配置: 自动迁移旧版状态/配置路径，并在旧版文件名之间保持配置解析一致。
- 网关: 警告通过查询参数传递的钩子令牌；记录头部认证首选项。(#2200) 感谢 @YuriNachos。
- 网关: 添加危险的 Control UI 设备认证绕过标志 + 审计警告。(#2248)
- Doctor: 在没有认证的情况下警告网关暴露。(#2016) 感谢 @Alex-Alaniz。
- Web UI: 在 WebChat 中保持子代理公告回复可见。(#1977) 感谢 @andrescardonas7。
- 浏览器: 通过网关/节点路由浏览器控制；移除独立浏览器控制命令和控制 URL 配置。
- 浏览器: 在可用时通过节点代理路由 `browser.request`；遵守代理超时；从 `gateway.port` 派生浏览器端口。
- 浏览器: 回退到 URL 匹配以进行扩展中继目标解析。(#1999) 感谢 @jonit-dev。
- Telegram: 允许媒体发送的标题参数。(#1888) 感谢 @mguellsegarra。
- Telegram: 支持插件 sendPayload channelData（媒体/按钮）并验证插件命令。(#1917) 感谢 @JoshuaLelon。
- Telegram: 在流式传输禁用时避免阻塞回复。(#1885) 感谢 @ivancasco。
- Telegram: 添加可选的静默发送标志（禁用通知）。(#2382) 感谢 @Suksham-sharma。
- Telegram: 支持通过 message(action="edit") 编辑已发送的消息。(#2394) 感谢 @marcelomar21。
- Telegram: 支持消息工具和入站上下文的引用回复。(#2900) 感谢 @aduk059。
- Telegram: 使用视觉缓存添加贴纸接收/发送。(#2629) 感谢 @longjos。
- Telegram: 将贴纸像素发送给视觉模型。(#2650)
- Telegram: 在重启哨兵通知中保留话题 ID。(#1807) 感谢 @hsrvc。
- Discord: 为存在/成员添加可配置的特权网关意图。(#2266) 感谢 @kentaro。
- Slack: 在流式回复后清除确认反应。(#2044) 感谢 @fancyboi999。
- Matrix: 将插件 SDK 切换到 @vector-im/matrix-bot-sdk。
- Tlon: 将线程回复 ID 格式化为 @ud。(#1837) 感谢 @wca4a。
- 工具: 添加每发送者组工具策略并修复优先级。(#1757) 感谢 @adam91holt。
- 代理: 在压缩保护修剪期间总结丢失的消息。(#2509) 感谢 @jogi47。
- 代理: 使用完整的模式文档扩展 cron 工具描述。(#1988) 感谢 @tomascupr。
- 代理: 在执行允许列表检查中遵守 tools.exec.safeBins。(#2281)
- 记忆搜索: 允许记忆索引的额外路径（忽略符号链接）。(#3600) 感谢 @kira-ariaki。
- 技能: 为 Nano Banana Pro 技能添加多图像输入支持。(#1958) 感谢 @tyler6204。
- 技能: 为 GitHub、Notion、Slack、Discord 添加缺失的依赖元数据。(#1995) 感谢 @jackheuberger。
- 命令: 使用 Telegram 分页对 /help 和 /commands 输出进行分组。(#2504) 感谢 @hougangdev。
- 路由: 添加每账户 DM 会话范围并记录多账户隔离。(#3095) 感谢 @jarvis-sam。
- 路由: 预编译会话键正则表达式。(#1697) 感谢 @Ray0907。
- CLI: 使用 Node 的模块编译缓存以加快启动。(#2808) 感谢 @pi0。
- 认证: 在 ASCII 提示后显示可复制的 Google 认证 URL。(#1787) 感谢 @robbyczgw-cla。
- TUI: 在渲染选择列表时避免宽度溢出。(#1686) 感谢 @mossein。
- macOS: 完成 macOS 源、捆绑标识符和共享工具包路径的 OpenClaw 应用重命名。(#2844) 感谢 @fal3。
- 品牌: 更新 launchd 标签、移动捆绑 ID 和日志子系统到 bot.molt（旧版捆绑 ID 迁移）。感谢 @thewilloftheshadow。
- macOS: 将项目本地 `node_modules/.bin` PATH 首选项限制为调试构建（减少 PATH 劫持风险）。
- macOS: 在远程目标中保留自定义 SSH 用户名。(#2046) 感谢 @algal。
- macOS: 通过将 Textual 升级到 0.3.1 避免渲染代码块时崩溃。(#2033) 感谢 @garricn。
- 更新: 忽略 dist/control-ui 进行脏检查并在 ui 构建后恢复。(#1976) 感谢 @Glucksberg。
- 构建: 在构建期间捆绑 A2UI 资源并停止跟踪生成的包。(#2455) 感谢 @0oAstro。
- CI: 为 macOS 检查增加 Node 堆大小。(#1890) 感谢 @realZachi。
- 配置: 在 ${VAR} 替换之前应用 config.env。(#1813) 感谢 @spanishflu-est1918。
- 网关: 在组合存储时优先使用最新的会话元数据。(#1823) 感谢 @emanuelst。
- 文档: 收紧 Fly 私有部署步骤。(#2289) 感谢 @dguido。
- 文档: 添加迁移到新机器的指南。(#2381)
- 文档: 添加 Northflank 一键部署指南。(#2167) 感谢 @AdeboyeDN。
- 文档: 将 Vercel AI Gateway 添加到提供商侧边栏。(#1901) 感谢 @jerilynzheng。
- 文档: 添加 Render 部署指南。(#1975) 感谢 @anurag。
- 文档: 添加 Claude Max API 代理指南。(#1875) 感谢 @atalovesyou。
- 文档: 添加 DigitalOcean 部署指南。(#1870) 感谢 @0xJonHoldsCrypto。
- 文档: 添加 Oracle Cloud (OCI) 平台指南 + 交叉链接。(#2333) 感谢 @hirefrank。
- 文档: 添加 Raspberry Pi 安装指南。(#1871) 感谢 @0xJonHoldsCrypto。
- 文档: 添加 GCP Compute Engine 部署指南。(#1848) 感谢 @hougangdev。
- 文档: 添加 LINE 频道指南。感谢 @thewilloftheshadow。
- 文档: 为 Control UI 刷新致谢两位贡献者。(#1852) 感谢 @EnzeD。
- 文档: 保持文档头部固定，以便在滚动时导航栏保持可见。(#2445) 感谢 @chenyuan99。
- 文档: 更新 exe.dev 安装说明。(#https://github.com/openclaw/openclaw/pull/3047) 感谢 @zackerthescar。

### 破坏性变更

- **破坏性变更:** 移除网关认证模式 "none"；网关现在需要令牌/密码（仍允许 Tailscale Serve 身份）。

### 修复

- 技能: 更新 session-logs 路径以使用 ~/.openclaw。(#4502) 感谢 @bonald。
- Telegram: 通过在回退之前跟踪规范化跳过来避免静默空回复。(#3796)
- 提及: 即使存在显式提及时也遵守 mentionPatterns。(#3303) 感谢 @HirokiKobayashi-R。
- Discord: 在目标解析中恢复用户名目录查找。(#3131) 感谢 @bonald。
- 代理: 将 MiniMax 基础 URL 测试期望与默认提供商配置对齐。(#3131) 感谢 @bonald。
- 代理: 防止对超大图像错误进行重试并显示大小限制。(#2871) 感谢 @Suksham-sharma。
- 代理: 为内联模型继承提供商 baseUrl/api。(#2740) 感谢 @lploc94。
- 记忆搜索: 保持自动提供商模型默认值，仅在配置时包含远程。(#2576) 感谢 @papago2355。
- Telegram: 在本机命令上下文中包含 AccountId 以进行多代理路由。(#2942) 感谢 @Chloe-VP。
- Telegram: 在媒体提取中处理视频笔记附件。(#2905) 感谢 @mylukin。
- TTS: 在运行时读取 OPENAI_TTS_BASE_URL 而不是模块加载以遵守 config.env。(#3341) 感谢 @hclsys。
- macOS: 在向上滚动发送新消息时自动滚动到底部。(#2471) 感谢 @kennyklee。
- Web UI: 在输入时自动扩展聊天撰写文本区域（具有合理最大高度）。(#2950) 感谢 @shivamraut101。
- 网关: 防止因瞬态网络错误（获取失败、超时、DNS）而崩溃。添加了致命错误检测，仅在真正关键的错误时退出。修复 #2895、#2879、#2873。(#2980) 感谢 @elliotsecops。
- 代理: 保护频道工具 listActions 以避免插件崩溃。(#2859) 感谢 @mbelinky。
- Discord: 阻止 resolveDiscordTarget 将目录参数传递到消息目标解析器。修复 #3167。感谢 @thewilloftheshadow。
- Discord: 避免在用户名匹配时将裸频道名称解析为用户 DM。感谢 @thewilloftheshadow。
- Discord: 修复目标解析的目录配置类型导入。感谢 @thewilloftheshadow。
- 提供商: 更新 MiniMax API 端点和兼容模式。(#3064) 感谢 @hlbbbbbbb。
- Telegram: 在轮询中将更多网络错误视为可恢复。(#3013) 感谢 @ryancontent。
- Discord: 解析用户名为用户 ID 以进行出站消息。(#2649) 感谢 @nonggialiang。
- 提供商: 将 Moonshot Kimi 模型引用更新为 kimi-k2.5。(#2762) 感谢 @MarvinCui。
- 网关: 在未处理的拒绝中抑制 AbortError 和瞬态网络错误。(#2451) 感谢 @Glucksberg。
- TTS: 在仅文本命令上保持 /tts 状态回复并避免重复的块流音频。(#2451) 感谢 @Glucksberg。
- 安全: 固定 npm 覆盖以保持 tar@7.5.4 用于安装工具链。
- 安全: 正确测试配置包含的 Windows ACL 审计。(#2403) 感谢 @dominicnunez。
- CLI: 在解析 argv 时识别版本化 Node 可执行文件。(#2490) 感谢 @David-Marsh-Photo。
- CLI: 避免在旋转器下提示网关运行时。(#2874)
- BlueBubbles: 合并入站 URL 链接预览消息。(#1981) 感谢 @tyler6204。
- Cron: 允许在事件过滤器中包含 "heartbeat" 的 payload。(#2219) 感谢 @dwfinkelstein。
- CLI: 在注册插件命令时避免为全局帮助/版本加载配置。(#2212) 感谢 @dial481。
- 代理: 在引导记忆上下文时包含 memory.md。(#2318) 感谢 @czekaj。
- 代理: 在进程终止时释放会话锁并覆盖更多信号。(#2483) 感谢 @janeexai。
- 代理: 在模型故障转移期间跳过冷却的提供商。(#2143) 感谢 @YiWang24。
- Telegram: 加强轮询 + 重试行为以应对瞬态网络错误和 Node 22 传输问题。(#2420) 感谢 @techboss。
- Telegram: 忽略非论坛组 message_thread_id，同时保留 DM 线程会话。(#2731) 感谢 @dylanneve1。
- Telegram: 每行包装推理斜体以避免原始下划线。(#2181) 感谢 @YuriNachos。
- Telegram: 为交付和机器人调用集中化 API 错误日志。(#2492) 感谢 @altryne。
- 语音通话: 为 ngrok URL 强制执行 Twilio webhook 签名验证；默认禁用 ngrok 免费层绕过。
- 安全: 通过通过本地 tailscaled 验证身份来加强 Tailscale Serve 认证。
- 媒体: 修复文本附件 MIME 错误分类与 CSV/TSV 推断和 UTF-16 检测；为文件输出添加 XML 属性转义。(#3628) 感谢 @frankekn。
- 构建: 将 memory-core 对等依赖与 lockfile 对齐。
- 安全: 添加 mDNS 发现模式，最小默认以减少信息泄露。(#1882) 感谢 @orlyjamie。
- 安全: 使用 DNS 固定加强 URL 获取以减少重新绑定风险。感谢 Chris Zheng。
- Web UI: 改进 WebChat 图像粘贴预览并允许仅图像发送。(#1925) 感谢 @smartprogrammer93。
- 安全: 默认包装外部钩子内容，可选择每个钩子退出。(#1827) 感谢 @mertcicekci0。
- 网关: 默认认证现在是故障关闭（需要令牌/密码；仍允许 Tailscale Serve 身份）。
- 网关: 除非存在受信任的代理标头，否则将环回 + 非本地主机连接视为远程。
- 引导: 从引导/配置流程和 CLI 标志中删除不受支持的网关认证 "关闭" 选项。

## 2026.1.24-3

### 修复

- Slack: 修复由于跨源重定向缺少 Authorization 标头而导致图像下载失败。(#1936) 感谢 @sanderhelgesen。
- 网关: 加强反向代理处理以进行本地客户端检测和未经认证的代理连接。(#1795) 感谢 @orlyjamie。
- 安全审计: 将禁用认证的环回 Control UI 标记为严重。(#1795) 感谢 @orlyjamie。
- CLI: 恢复 claude-cli 会话并将 CLI 回复流式传输到 TUI 客户端。(#1921) 感谢 @rmorse。

## 2026.1.24-2

### 修复

- 打包: 在 npm tarball 中包含 dist/link-understanding 输出（修复安装时缺少的 apply.js 导入）。

## 2026.1.24-1

### 修复

- 打包: 在 npm tarball 中包含 dist/shared 输出（修复安装时缺少的 reasoning-tags 导入）。

## 2026.1.24

### 亮点

- 提供商: Ollama 发现 + 文档；Venice 指南升级 + 交叉链接。(#1606) 感谢 @abhaymundhara。https://docs.openclaw.ai/providers/ollama https://docs.openclaw.ai/providers/venice
- 频道: LINE 插件（消息 API）具有丰富的回复 + 快速回复。(#1630) 感谢 @plum-dawg。
- TTS: Edge 回退（无密钥）+ `/tts` 自动模式。(#1668、#1667) 感谢 @steipete、@sebslight。https://docs.openclaw.ai/tts
- 执行批准: 通过 `/approve` 在所有频道（包括插件）中进行聊天批准。(#1621) 感谢 @czekaj。https://docs.openclaw.ai/tools/exec-approvals https://docs.openclaw.ai/tools/slash-commands
- Telegram: DM 话题作为单独的会话 + 出站链接预览切换。(#1597、#1700) 感谢 @rohannagpal、@zerone0x。https://docs.openclaw.ai/channels/telegram

### 变更

- 频道: 添加 LINE 插件（消息 API），具有丰富的回复、快速回复和插件 HTTP 注册。(#1630) 感谢 @plum-dawg。
- TTS: 添加 Edge TTS 提供商回退，默认为无密钥 Edge，在格式失败时进行 MP3 重试。(#1668) 感谢 @steipete。https://docs.openclaw.ai/tts
- TTS: 添加自动模式枚举（off/always/inbound/tagged），具有每会话 `/tts` 覆盖。(#1667) 感谢 @sebslight。https://docs.openclaw.ai/tts
- Telegram: 将 DM 话题视为单独的会话，并使用线程后缀保持 DM 历史限制稳定。(#1597) 感谢 @rohannagpal。
- Telegram: 添加 `channels.telegram.linkPreview` 以切换出站链接预览。(#1700) 感谢 @zerone0x。https://docs.openclaw.ai/channels/telegram
- 网络搜索: 为有时间范围的结果添加 Brave 新鲜度过滤器参数。(#1688) 感谢 @JonUleis。https://docs.openclaw.ai/tools/web
- UI: 刷新 Control UI 仪表板设计系统（颜色、图标、排版）。(#1745、#1786) 感谢 @EnzeD、@mousberg。
- 执行批准: 将所有频道的批准提示转发到聊天，并为所有频道（包括插件）提供 `/approve`。(#1621) 感谢 @czekaj。https://docs.openclaw.ai/tools/exec-approvals https://docs.openclaw.ai/tools/slash-commands
- 网关: 在网关工具中公开 config.patch，具有安全的部分更新 + 重启哨兵。(#1653) 感谢 @Glucksberg。
- 诊断: 为目标调试日志添加诊断标志（配置 + 环境覆盖）。https://docs.openclaw.ai/diagnostics/flags
- 文档: 扩展 FAQ（迁移、调度、并发、模型推荐、OpenAI 订阅认证、Pi 大小、可黑客安装、文档 SSL 解决方案）。
- 文档: 添加详细的安装程序故障排除指南。
- 文档: 添加具有本地/托管选项 + VPS/节点指南的 macOS VM 指南。(#1693) 感谢 @f-trycua。
- 文档: 添加 Bedrock EC2 实例角色设置 + IAM 步骤。(#1625) 感谢 @sergical。https://docs.openclaw.ai/bedrock
- 文档: 更新 Fly.io 指南说明。
- 开发: 添加 prek 预提交钩子 + dependabot 配置以进行每周更新。(#1720) 感谢 @dguido。

### 修复

- Web UI: 修复配置/调试布局溢出、滚动和代码块大小。(#1715) 感谢 @saipreetham589。
- Web UI: 在活动运行期间显示停止按钮，空闲时切换回新会话。(#1664) 感谢 @ndbroadbent。
- Web UI: 在重新连接时清除陈旧的断开连接横幅；允许使用不支持的模式路径保存表单，但阻止缺失模式。(#1707) 感谢 @Glucksberg。
- Web UI: 在聊天气泡中隐藏内部 `message_id` 提示。
- 网关: 允许 Control UI 仅令牌认证跳过设备配对，即使存在设备身份（`gateway.controlUi.allowInsecureAuth`）。(#1679) 感谢 @steipete。
- Matrix: 使用预检大小保护解密 E2EE 媒体附件。(#1744) 感谢 @araa47。
- BlueBubbles: 将电话号码目标路由到 DM，避免泄露路由 ID，并自动创建缺失的 DM（需要 Private API）。(#1751) 感谢 @tyler6204。https://docs.openclaw.ai/channels/bluebubbles
- BlueBubbles: 在缺少短 ID 时在回复标签中保留 part-index GUID。
- iMessage: 不区分大小写地规范化 chat_id/chat_guid/chat_identifier 前缀，并保持带服务前缀的句柄稳定。(#1708) 感谢 @aaronn。
- Signal: 通过 signal-cli 修复反应发送（组/UUID 目标 + CLI 作者标志）。(#1651) 感谢 @vilkasdev。
- Signal: 添加可配置的 signal-cli 启动超时 + 外部守护进程模式文档。(#1677) https://docs.openclaw.ai/channels/signal
- Telegram: 在 Node 22 上为上传设置 fetch duplex="half" 以避免 sendPhoto 失败。(#1684) 感谢 @commdata2338。
- Telegram: 在 Node 上使用包装的 fetch 进行长轮询以规范化 AbortSignal 处理。(#1639)
- Telegram: 遵守出站 API 调用的每代理代理。(#1774) 感谢 @radek-paclt。
- Telegram: 当语音笔记被隐私设置阻止时回退到文本。(#1725) 感谢 @foeken。
- 语音通话: 在初始 Twilio webhook 上返回出站对话呼叫的流 TwiML。(#1634)
- 语音通话: 序列化 Twilio TTS 播放并在插入时取消以防止重叠。(#1713) 感谢 @dguido。
- Google Chat: 收紧电子邮件白名单匹配、打字清理、媒体上限和引导/文档/测试。(#1635) 感谢 @iHildy。
- Google Chat: 规范化空间目标而不使用双 `spaces/` 前缀。
- 代理: 在上下文溢出提示错误之前自动压缩。(#1627) 感谢 @rodrigouroz。
- 代理: 对自动压缩恢复使用活动认证配置文件。
- 媒体理解: 当主要模型已经支持视觉时跳过图像理解。(#1747) 感谢 @tyler6204。
- 模型: 默认缺失的自定义提供商字段，以便接受最小配置。
- 消息: 跨频道保持换行分块对围栏 markdown 块的安全。
- 消息: 将换行分块视为段落感知（空行分割）以保持列表和标题在一起。(#1726) 感谢 @tyler6204。
- TUI: 在网关重新连接后重新加载历史以恢复会话状态。(#1663)
- 心跳: 规范化目标标识符以进行一致的路由。
- 执行: 保留提升的询问，除非是完全模式。(#1616) 感谢 @ivancasco。
- 执行: 当 PTY 生成失败时将 Windows 平台标签视为 Windows 以进行节点 shell 选择。(#1760) 感谢 @ymat19。
- 网关: 在服务安装环境中包含内联配置环境变量。(#1735) 感谢 @Seredeep。
- 网关: 当 tailscale.mode 关闭时跳过 Tailscale DNS 探测。(#1671)
- 网关: 减少迟延调用 + 远程节点探测的日志噪音；去抖动技能刷新。(#1607) 感谢 @petter-b。
- 网关: 澄清 Control UI/WebChat 认证错误提示以获取缺失的令牌。(#1690)
- 网关: 当绑定到 127.0.0.1 时监听 IPv6 环回，以便本地主机 webhook 工作。
- 网关: 将锁定文件存储在临时目录中以避免持久卷上的陈旧锁定。(#1676)
- macOS: 默认直接传输 `ws://` URL 到端口 18789；记录 `gateway.remote.transport`。(#1603) 感谢 @ngutman。
- 测试: 在 CI macOS 上限制 Vitest 工作线程以减少超时。(#1597) 感谢 @rohannagpal。
- 测试: 避免嵌入式运行器流 mock 中的假计时器依赖以减少 CI 不稳定。(#1597) 感谢 @rohannagpal。
- 测试: 增加嵌入式运行器排序测试超时以减少 CI 不稳定。(#1597) 感谢 @rohannagpal。

## 2026.1.23-1

### 修复

- 打包: 在 npm tarball 中包含 dist/tts 输出（修复缺少的 dist/tts/tts.js）。

## 2026.1.23

### 亮点

- TTS: 将 Telegram TTS 移入核心 + 默认启用模型驱动的 TTS 标签以获得表现力丰富的音频回复。(#1559) 感谢 @Glucksberg。https://docs.openclaw.ai/tts
- 网关: 添加 `/tools/invoke` HTTP 端点以进行直接工具调用（强制执行认证 + 工具策略）。(#1575) 感谢 @vignesh07。https://docs.openclaw.ai/gateway/tools-invoke-http-api
- 心跳: 每频道可见性控制（正常/警报/指示器）。(#1452) 感谢 @dlauer。https://docs.openclaw.ai/gateway/heartbeat
- 部署: 添加 Fly.io 部署支持 + 指南。(#1570) https://docs.openclaw.ai/platforms/fly
- 频道: 添加 Tlon/Urbit 频道插件（DM、组提及、线程回复）。(#1544) 感谢 @wca4a。https://docs.openclaw.ai/channels/tlon

### 变更

- 频道: 允许内置 + 插件频道的每群组工具允许/拒绝策略。(#1546) 感谢 @adam91holt。https://docs.openclaw.ai/multi-agent-sandbox-tools
- 代理: 添加 Bedrock 自动发现默认值 + 配置覆盖。(#1553) 感谢 @fal3。https://docs.openclaw.ai/bedrock
- CLI: 添加 `openclaw system` 用于系统事件 + 心跳控制；移除独立的 `wake`。(commit 71203829d) https://docs.openclaw.ai/cli/system
- CLI: 添加实时认证探测到 `openclaw models status` 以进行每配置文件验证。(commit 40181afde) https://docs.openclaw.ai/cli/models
- CLI: 默认在 `openclaw update` 后重启网关；添加 `--no-restart` 以跳过。(commit 2c85b1b40)
- 浏览器: 为远程网关添加节点主机代理自动路由（每网关/节点可配置）。(commit c3cb26f7c)
- 插件: 为工作流添加可选的 `llm-task` 仅 JSON 工具。(#1498) 感谢 @vignesh07。https://docs.openclaw.ai/tools/llm-task
- Markdown: 添加每频道表格转换（Signal/WhatsApp 用项目符号，其他用代码块）。(#1495) 感谢 @odysseus0。
- 代理: 仅保留系统提示时区并将当前时间移至 `session_status` 以获得更好的缓存命中。(commit 66eec295b)
- 代理: 从工具注册/显示中删除冗余的 bash 工具别名。(#1571) 感谢 @Takhoffman。
- 文档: 添加 cron 与心跳决策指南（带 Lobster 工作流说明）。(#1533) 感谢 @JustYannicc。https://docs.openclaw.ai/automation/cron-vs-heartbeat
- 文档: 澄清 HEARTBEAT.md 空文件跳过心跳，缺失文件仍运行。(#1535) 感谢 @JustYannicc。https://docs.openclaw.ai/gateway/heartbeat

### 修复

- 会话: 接受非 UUID sessionId 用于 history/send/status，同时保留代理范围。(#1518)
- 心跳: 接受插件频道 ID 用于心跳目标验证 + UI 提示。
- 消息/会话: 将出站发送镜像到目标会话键（线程 + dmScope），在发送时创建会话条目，并规范化会话键大小写。(#1520、commit 4b6cdd1d3)
- 会话: 拒绝数组支持的会话存储以防止静默清除。(#1469)
- 网关: 将 Linux 进程启动时间与 PID 回收锁定循环进行比较；除非陈旧，否则保持锁定。(#1572) 感谢 @steipete。
- 网关: 在执行批准请求中接受 null 可选字段。(#1511) 感谢 @pvoo。
- 执行批准: 持久化白名单条目 ID 以保持 macOS 白名单行稳定。(#1521) 感谢 @ngutman。
- 执行: 遵守 tools.exec 询问/安全默认值以进行提升批准（避免不必要的提示）。(commit 5662a9cdf)
- 守护进程: 在构建最小服务路径时使用平台 PATH 分隔符。(commit a4e57d3ac)
- Linux: 在 systemd PATH 中包含环境配置的用户 bin 根并对齐 PATH 审计。(#1512) 感谢 @robbyczgw-cla。
- Tailscale: 仅为权限错误使用 sudo 重试 serve/funnel 并保持原始失败详细信息。(#1551) 感谢 @sweepies。
- Docker: 更新 docker-compose 和 Hetzner 指南中的网关命令。(#1514)
- 代理: 当最后一轮助手仅调用工具时显示工具错误回退（防止静默停止）。(commit 8ea8801d0)
- 代理: 在解析身份时忽略 IDENTITY.md 模板占位符。(#1556)
- 代理: 在模型切换时删除孤立的 OpenAI Responses 推理块。(#1562) 感谢 @roshanasingh4。
- 网关: 在网关 + 节点主机上为链接的 shell 命令添加每段白名单。(#1458) 感谢 @czekaj。
- 代理: 使 OpenAI 会话仅为图像清理；按提供商门控工具 ID/修复清理。
- Doctor: 遵守 CLAWDBOT_GATEWAY_TOKEN 进行认证检查和安全审计令牌重用。(#1448) 感谢 @azade-c。
- 代理: 使工具摘要更易读，仅在选择性参数设置时显示。
- 代理: 即使文件嵌套或路径限定也遵守 SOUL.md 指南。(#1434) 感谢 @neooriginal。
- Matrix (插件): 为解析的 DM 持久化 m.direct 并加强房间回退。(#1436、#1486) 感谢 @sibbl。
- CLI: 在输出中优先使用 `~` 表示 home 路径。
- Mattermost (插件): 强制执行配对/白名单门控，保留 @username 目标，并澄清仅插件文档。(#1428) 感谢 @damoahdominic。
- 代理: 在运行器中集中转录本清理；保留 <final> 标签和错误轮次。
- 认证: 在初始选择和轮换期间跳过冷却中的认证配置文件。(#1316) 感谢 @odrobnik。
- 代理/TUI: 在冷却期间遵守用户固定的认证配置文件并保留搜索选择器排名。(#1432) 感谢 @tobiasbischoff。
- 文档: 修复 gog 认证服务示例以包含文档范围。(#1454) 感谢 @zerone0x。
- Slack: 减少 WebClient 重试以避免重复发送。(#1481)
- Slack: 在提供 threadId 时读取线程回复以进行消息读取（仅回复）。(#1450) 感谢 @rodrigouroz。
- Discord: 在消息操作和 cron 交付中遵守 accountId。(#1492) 感谢 @svkozak。
- macOS: 在网关摘要中优先使用链接的频道以避免错误的"未链接"状态。
- macOS/测试: 在保护解包后修复网关摘要查找；防止测试期间浏览器打开。(ECID-1483)

## 2026.1.22

### 变更

- 亮点: 压缩保护现在使用自适应分块、渐进式回退和 UI 状态 + 重试。(#1466) 感谢 @dlauer。
- 提供商: 在状态输出中添加 Antigravity 使用跟踪。(#1490) 感谢 @patelhiren。
- Slack: 通过 `replyToModeByChatType` 添加聊天类型回复线程覆盖。(#1442) 感谢 @stefangalescu。
- BlueBubbles: 在 sendAttachment 中添加 MP3/CAF 语音备忘录的 `asVoice` 支持。(#1477、#1482) 感谢 @Nicell。
- 引导: 添加孵化选择（TUI/Web/稍后）、令牌解释器、macOS 上的后台仪表板种子和展示链接。

### 修复

- BlueBubbles: 在空闲/无回复时停止打字指示器。(#1439) 感谢 @Nicell。
- 消息工具: 为发送保持 path/filePath；仅为 sendAttachment 水合缓冲区。(#1444) 感谢 @hopyky。
- 自动回复: 仅在会话状态可用时报告模型切换。(#1465) 感谢 @robbyczgw-cla。
- Control UI: 在注入 + 身份 RPC 中解析 basePath 的本地头像 URL。(#1457) 感谢 @dlauer。
- 代理: 清理助手历史文本以去除工具调用标记。(#1456) 感谢 @zerone0x。
- Discord: 澄清消息内容意图引导提示。(#1487) 感谢 @kyleok。
- 网关: 在卸载前停止服务，如果它保持加载则失败。
- 代理: 显示具体的 API 错误详细信息而不是通用的 AI 服务错误。
- 执行: 当 PTY 生成失败时回退到非 PTY (EBADF)。(#1484)
- 执行批准: 允许网关 + 节点主机上链接的 shell 命令的每段白名单。(#1458) 感谢 @czekaj。
- 代理: 使 OpenAI 会话仅为图像清理；按提供商门控工具 ID/修复清理。
- Doctor: 遵守 CLAWDBOT_GATEWAY_TOKEN 进行认证检查和安全审计令牌重用。(#1448) 感谢 @azade-c。
- 代理: 使工具摘要更易读，仅在选择性参数设置时显示。
- 代理: 即使文件嵌套或路径限定也遵守 SOUL.md 指南。(#1434) 感谢 @neooriginal。
- Matrix (插件): 为解析的 DM 持久化 m.direct 并加强房间回退。(#1436、#1486) 感谢 @sibbl。
- CLI: 在输出中优先使用 `~` 表示 home 路径。
- Mattermost (插件): 强制执行配对/白名单门控，保留 @username 目标，并澄清仅插件文档。(#1428) 感谢 @damoahdominic。
- 代理: 在运行器中集中转录本清理；保留 <final> 标签和错误轮次。
- 认证: 在初始选择和轮换期间跳过冷却中的认证配置文件。(#1316) 感谢 @odrobnik。
- 代理/TUI: 在冷却期间遵守用户固定的认证配置文件并保留搜索选择器排名。(#1432) 感谢 @tobiasbischoff。
- 文档: 修复 gog 认证服务示例以包含文档范围。(#1454) 感谢 @zerone0x。
- Slack: 减少 WebClient 重试以避免重复发送。(#1481)
- Slack: 在提供 threadId 时读取线程回复以进行消息读取（仅回复）。(#1450) 感谢 @rodrigouroz。
- Discord: 在消息操作和 cron 交付中遵守 accountId。(#1492) 感谢 @svkozak。
- macOS: 在网关摘要中优先使用链接的频道以避免错误的"未链接"状态。
- macOS/测试: 在保护解包后修复网关摘要查找；防止测试期间浏览器打开。(ECID-1483)

## 2026.1.21-2

### 修复

- Control UI: 忽略头像值的引导身份占位符文本并回退到默认头像。https://docs.openclaw.ai/cli/agents https://docs.openclaw.ai/web/control-ui
- Slack: 从 `files.uploadV2` 中删除弃用的 `filetype` 字段以消除 API 警告。(#1447)

## 2026.1.21

### 变更

- 亮点: Lobster 可选插件工具，用于类型化工作流 + 批准门。https://docs.openclaw.ai/tools/lobster
- Lobster: 允许通过插件工具中的 `argsJson` 传递工作流文件参数。https://docs.openclaw.ai/tools/lobster
- 心跳: 允许在显式会话键中运行心跳。(#1256) 感谢 @zknicker。
- CLI: 默认将执行批准设置为本地主机，添加网关/节点目标标志，并在白名单输出中显示目标详细信息。
- CLI: 执行批准突变渲染表格而不是原始 JSON。
- 执行批准: 支持所有代理的通配符代理白名单（`*`）。
- 执行批准: 白名单仅匹配解析的二进制路径，添加仅安全 stdin 的 bins，并收紧白名单 shell 解析。
- 节点: 在 status/describe 中公开节点 PATH 并为节点主机执行引导 PATH。
- CLI: 将节点服务命令扁平化到 `openclaw node` 下并删除 `service node` 文档。
- CLI: 将网关服务命令移动到 `openclaw gateway` 下并添加 `gateway probe` 以进行可达性测试。
- 会话: 通过 `session.resetByChannel` 添加每频道重置覆盖。(#1353) 感谢 @cash-echo-bot。
- 代理: 添加身份头像配置支持和 Control UI 头像渲染。(#1329、#1424) 感谢 @dlauer。
- UI: 在 Control UI 中显示每会话助手身份。(#1420) 感谢 @robbyczgw-cla。
- CLI: 添加 `openclaw update wizard` 以进行交互式频道选择和重启提示。https://docs.openclaw.ai/cli/update
- Signal: 通过 signal-cli 添加打字指示器和 DM 已读回执。
- MSTeams: 添加文件上传、自适应卡片和附件处理改进。(#1410) 感谢 @Evizero。
- 引导: 删除运行设置令牌认证选项（粘贴设置令牌或重用 CLI 凭据）。
- 文档: 添加网关模式阻止网关启动的故障排除条目。https://docs.openclaw.ai/gateway/troubleshooting
- 文档: 添加 /model 白名单故障排除说明。(#1405)
- 文档: 为 gog 添加每消息 Gmail 搜索示例。(#1220) 感谢 @mbelinky。

### 破坏性变更

- **破坏性变更:** Control UI 现在默认拒绝没有设备身份的不安全 HTTP。使用 HTTPS（Tailscale Serve）或设置 `gateway.controlUi.allowInsecureAuth: true` 以允许仅令牌认证。https://docs.openclaw.ai/web/control-ui#insecure-http
- **破坏性变更:** 信封和系统事件时间戳现在默认为本地主机时间（之前是 UTC），因此代理不必不断转换。

### 修复

- 节点/macOS: 在节点执行批准的允许列表未命中时提示，持久化允许列表决策，并扁平化节点调用错误。(#1394) 感谢 @ngutman。
- 网关: 保持自动绑定环回优先并添加显式 tailnet 绑定以避免 Tailscale 接管本地 UI。(#1380)
- 记忆: 通过延迟向量探测、添加 sqlite-vec/嵌入超时并及早显示同步进度来防止 CLI 挂起。
- 代理: 为 Mistral 提供商强制执行 9 个字符的字母数字工具调用 ID。(#1372) 感谢 @zerone0x。
- 嵌入式运行器: 持久化注入的历史图像，以便附件不会每轮重新加载。(#1374) 感谢 @Nicell。
- 节点工具: 在工具失败日志中包含代理/节点/网关上下文以加快批准调试。
- macOS: 执行批准现在尊重通配符代理白名单（`*`）。
- macOS: 当未设置身份文件时允许 SSH 代理认证。(#1384) 感谢 @ameno-。
- 网关: 防止多个网关同时共享相同的配置/状态（单例锁）。
- UI: 删除聊天停止按钮并保持撰写器对齐到底部边缘。
- 打字: 在运行开始时启动即时打字指示器，以便 DM 和提及立即显示。
- 配置: 将模型白名单选择器限制为与 OAuth 兼容的 Anthropic 模型并预选 Opus 4。
- 配置: 在选择多个模型时从白名单选择中种子模型回退。
- 模型选择器: 当未配置模型白名单时列出完整目录。
- Discord: 通过共享匹配帮助程序遵守通配符频道配置。(#1334) 感谢 @pvoo。
- BlueBubbles: 安全解析短消息 ID 并在模板中公开完整 ID。(#1387) 感谢 @tyler6204。
- 基础设施: 在包装中止信号时保留获取帮助程序方法。(#1387)
- macOS: 默认分发打包为通用二进制文件。(#1396) 感谢 @JustYannicc。

## 2026.1.20

### 变更

- Control UI: 添加复制为 markdown 并显示错误反馈。(#1345) https://docs.openclaw.ai/web/control-ui
- Control UI: 删除旧版列表视图。(#1345) https://docs.openclaw.ai/web/control-ui
- TUI: 为代码块添加语法高亮。(#1200) https://docs.openclaw.ai/tui
- TUI: 会话选择器显示派生标题、模糊搜索、相对时间和最后消息预览。(#1271) https://docs.openclaw.ai/tui
- TUI: 添加可搜索的模型选择器以加快模型选择。(#1198) https://docs.openclaw.ai/tui
- TUI: 为已提交的消息添加上下输入历史。(#1348) https://docs.openclaw.ai/tui
- ACP: 添加 `openclaw acp` 用于 IDE 集成。https://docs.openclaw.ai/cli/acp
- ACP: 添加 `openclaw acp client` 交互式工具包以进行调试。https://docs.openclaw.ai/cli/acp
- 技能: 添加具有操作系统过滤选项的下载安装。https://docs.openclaw.ai/tools/skills
- 技能: 添加本地 sherpa-onnx-tts 技能。https://docs.openclaw.ai/tools/skills
- 记忆: 添加混合 BM25 + 向量搜索（FTS5）与加权合并和回退。https://docs.openclaw.ai/concepts/memory
- 记忆: 添加 SQLite 嵌入缓存以加快重新索引和频繁更新。https://docs.openclaw.ai/concepts/memory
- 记忆: 在配置时添加 OpenAI 批处理索引以进行嵌入。https://docs.openclaw.ai/concepts/memory
- 记忆: 默认启用 OpenAI 批处理索引以进行 OpenAI 嵌入。https://docs.openclaw.ai/concepts/memory
- 记忆: 允许并行 OpenAI 批处理索引作业（默认并发：2）。https://docs.openclaw.ai/concepts/memory
- 记忆: 立即渲染进度，在详细日志中着色批处理状态，并默认每 2 秒轮询 OpenAI 批处理状态。https://docs.openclaw.ai/concepts/memory
- 记忆: 为记忆状态 + 批处理索引详细信息添加 `--verbose` 日志记录。https://docs.openclaw.ai/concepts/memory
- 记忆: 为记忆搜索添加原生 Gemini 嵌入提供商。(#1151) https://docs.openclaw.ai/concepts/memory
- 浏览器: 允许在工具/CLI 中为高效快照配置默认值。(#1336) https://docs.openclaw.ai/tools/browser
- Nostr: 添加具有配置文件管理 + 引导默认值的 Nostr 频道插件。(#1323) https://docs.openclaw.ai/channels/nostr
- Matrix: 迁移到具有 E2EE 支持、位置处理和群组白名单升级的 matrix-bot-sdk。(#1298) https://docs.openclaw.ai/channels/matrix
- Slack: 通过 Bolt HTTP 接收器添加 HTTP webhook 模式。(#1143) https://docs.openclaw.ai/channels/slack
- Telegram: 使用规范化的来源详细信息 + 旧版回退丰富转发消息上下文。(#1090) https://docs.openclaw.ai/channels/telegram
- Discord: 当超出原生命令限制时回退到 `/skill`。(#1287)
- Discord: 全局公开 `/skill`。(#1287)
- Zalouser: 添加频道停靠元数据、配置模式、设置接线、探测和状态问题。(#1219) https://docs.openclaw.ai/plugins/zalouser
- 插件: 需要带有预检验证警告的 manifest 嵌入式配置模式。(#1272) https://docs.openclaw.ai/plugins/manifest
- 插件: 将频道目录元数据移动到插件 manifest 中。(#1290) https://docs.openclaw.ai/plugins/manifest
- 插件: 将 Nextcloud Talk 策略帮助程序与核心模式对齐。(#1290) https://docs.openclaw.ai/plugins/manifest
- 插件/UI: 让频道插件元数据驱动 UI 标签/图标和 cron 频道选项。(#1306) https://docs.openclaw.ai/web/control-ui
- 代理/UI: 在身份配置、IDENTITY.md 和 Control UI 中添加代理头像支持。(#1329) https://docs.openclaw.ai/gateway/configuration
- 插件: 添加具有专用记忆槽选择器的插件槽。https://docs.openclaw.ai/plugins/agent-tools
- 插件: 提供捆绑的 BlueBubbles 频道插件（默认禁用）。https://docs.openclaw.ai/channels/bluebubbles
- 插件: 将捆绑的消息扩展迁移到插件 SDK 并在加载器中解析 plugin-sdk 导入。
- 插件: 将 Zalo 插件迁移到共享插件 SDK 运行时。https://docs.openclaw.ai/channels/zalo
- 插件: 将 Zalo 个人插件迁移到共享插件 SDK 运行时。https://docs.openclaw.ai/plugins/zalouser
- 插件: 允许具有显式白名单的可选代理工具并添加插件工具创作指南。https://docs.openclaw.ai/plugins/agent-tools
- 插件: 当存在配置时自动启用捆绑的频道/提供商插件。
- 插件: 在频道切换时同步插件源并在 `openclaw update` 期间更新 npm 安装的插件。
- 插件: 在 `openclaw update` 和 `openclaw plugins update` 之间共享 npm 插件更新逻辑。
- 网关/API: 添加 `/v1/responses` (OpenResponses)，具有基于项目的输入 + 语义流式事件。(#1229)
- 网关/API: 扩展 `/v1/responses` 以支持文件/图像输入、tool_choice、使用和输出限制。(#1229)
- 使用: 添加 `/usage cost` 摘要和 macOS 菜单成本图表。https://docs.openclaw.ai/reference/api-usage-costs
- 安全: 在启用网络工具时警告 <=300B 模型在没有沙盒的情况下运行。https://docs.openclaw.ai/cli/security
- 执行: 为网关 + 节点执行添加主机/安全/询问路由。https://docs.openclaw.ai/tools/exec
- 执行: 为每会话执行默认值添加 `/exec` 指令（主机/安全/询问/节点）。https://docs.openclaw.ai/tools/exec
- 执行批准: 将批准迁移到 `~/.openclaw/exec-approvals.json`，具有每代理白名单 + 技能自动允许切换，并添加批准 UI + 节点执行生命周期事件。https://docs.openclaw.ai/tools/exec-approvals
- 节点: 为 `system.run`/`system.which` 添加无头节点主机 (`openclaw node start`)。https://docs.openclaw.ai/cli/node
- 节点: 添加节点守护进程服务安装/状态/启动/停止/重启。https://docs.openclaw.ai/cli/node
- 桥接: 添加 `skills.bins` RPC 以支持节点主机自动允许技能 bins。
- 会话: 添加每日重置策略，具有每类型覆盖和空闲窗口（默认凌晨 4 点本地），保留旧版仅空闲配置。(#1146) https://docs.openclaw.ai/concepts/session
- 会话: 允许 `sessions_spawn` 覆盖子代理运行的思考级别。https://docs.openclaw.ai/tools/subagents
- 频道: 统一跨核心提供商的线程/话题白名单匹配 + 命令/提及门控帮助程序。https://docs.openclaw.ai/concepts/groups
- 模型: 添加 Qwen 门户 OAuth 提供商支持。(#1120) https://docs.openclaw.ai/providers/qwen
- 引导: 添加白名单提示和跨核心和扩展频道的用户名到 ID 解析。https://docs.openclaw.ai/start/onboarding
- 文档: 澄清消息频道的白名单输入类型和引导行为。https://docs.openclaw.ai/start/onboarding
- 文档: 刷新网关 WS 服务类型的 Android 节点发现文档。https://docs.openclaw.ai/platforms/android
- 文档: 在提供商列表中显示 Amazon Bedrock 并澄清 Bedrock 认证环境变量。(#1289) https://docs.openclaw.ai/bedrock
- 文档: 澄清 WhatsApp 语音笔记。https://docs.openclaw.ai/channels/whatsapp
- 文档: 澄清 Windows WSL portproxy LAN 访问说明。https://docs.openclaw.ai/platforms/windows
- 文档: 刷新 bird 技能安装元数据和使用说明。(#1302) https://docs.openclaw.ai/tools/browser-login
- 代理: 添加本地文档路径解析并在系统提示中包含文档/镜像/源/社区指针。
- 代理: 在代理说明中澄清 node_modules 只读指南。
- 配置: 在写入时标记最后触摸元数据，并在配置比运行构建更新时警告。
- macOS: 在使用不可用时隐藏使用部分而不是显示提供商错误。
- Android: 将节点传输迁移到具有 TLS 固定支持 + 网关发现命名的网关 WebSocket 协议。
- Android: 在节点事件/调用中发送结构化 payload 并在网关连接中包含用户代理元数据。
- Android: 删除现在节点使用网关协议的旧版桥接传输代码。
- Android: 提升 okhttp + dnsjava 以满足 lint 依赖检查。
- 构建: 更新工作区 + 核心/插件依赖项。
- 构建: 默认使用 tsgo 进行开发/监视构建（使用 `OPENCLAW_TS_COMPILER=tsc` 退出）。
- 仓库: 删除 Peekaboo git 子模块，现在使用 SPM 发布。
- macOS: 将 PeekabooBridge 集成切换到标记的 Swift Package Manager 发布。
- macOS: 停止在 postinstall 中同步 Peekaboo。
- Swabble: 使用标记的 Commander Swift 包发布。

### 破坏性变更

- **破坏性变更:** 拒绝无效/未知的配置条目并拒绝启动网关以确保安全。运行 `openclaw doctor --fix` 进行修复，然后更新插件（`openclaw plugins update`）（如果您使用任何插件）。

### 修复

- 发现: 将 Bonjour DNS-SD 服务类型缩短为 `_moltbot-gw._tcp` 并更新发现客户端/文档。
- 诊断: 导出 OTLP 日志、正确的队列深度跟踪并记录消息流遥测。
- 诊断: 通过共享调度跨频道发出消息流诊断。(#1244)
- 诊断: 门控心跳/webhook 日志记录。(#1244)
- 网关: 从聊天历史消息中剥离入站信封标头以保持客户端清洁。
- 网关: 使用令牌/密码不匹配指导澄清未经授权的握手响应。
- 网关: 允许移动节点客户端 ID 用于 iOS + Android 握手验证。(#1354)
- 网关: 澄清网关参数的 connect/validation 错误。(#1347)
- 网关: 保留重启唤醒路由 + 跨重启的线程回复。(#1337)
- 网关: 在配置热重新加载时重新安排每代理心跳，无需重启运行器。
- 网关: 要求对 SIGUSR1（重启/应用/更新）进行授权重启，因此无法绕过配置门控。
- Cron: 自动将隔离的代理输出交付给没有工具调用的显式目标。(#1285)
- 代理: 保留子代理公告线程/话题路由 + 跨频道的排队回复。(#1241)
- 代理: 将 accountId 传播到嵌入式运行，以便子代理公告路由遵守原始账户。(#1058)
- 代理: 避免将带有"中止"消息的超时错误视为用户中止，因此模型回退仍会运行。(#1137)
- 代理: 在发送前清理超大图像 payload 并显示图像尺寸错误。
- 会话: 在列出显示名称时回退到会话标签。(#1124)
- 压缩: 在保护压缩中包含工具失败摘要以防止重试循环。(#1084)
- 配置: 每运行一次记录无效配置问题并使无效配置错误无堆栈。
- 配置: 在配置验证中允许 Perplexity 作为 web_search 提供商。(#1230)
- 配置: 允许 `skills.entries.<name>.config` 下的自定义字段用于技能凭据/配置。(#1226)
- Doctor: 在启动横幅中澄清插件自动启用提示文本。
- Doctor: 规范化会话存储中的旧版会话键以防止陈旧元数据。(#1169)
- 文档: 如果文档目录缺失，使 docs:list 快速失败并显示清晰的错误。
- 插件: 为插件配置验证添加 Nextcloud Talk manifest。(#1297)
- 插件: 在网关日志中使用插件/源上下文显示插件加载/注册/配置错误。
- CLI: 在编辑消息 payload 时保留 cron 交付设置。(#1322)
- CLI: 保持 `openclaw logs` 输出对损坏的管道具有弹性，同时保留进度输出。
- CLI: 在格式化命令时避免重复 --profile/--dev 标志。
- CLI: 集中 CLI 命令注册以保持快速路径路由和程序接线同步。(#1207)
- CLI: 在路由命令上保持横幅，在快速路径路由之外恢复配置保护，并收紧快速路径标志解析，同时跳过控制台捕获以获得额外速度。(#1195)
- CLI: 当 dist 是最新的时跳过运行器重建。(#1231)
- CLI: 在守护进程状态/doctor 输出中添加 WSL2/systemd 不可用提示。
- 状态: 将原生 `/status` 路由到活动代理，以便模型选择反映正确的配置文件。(#1301)
- 状态: 在使用数据可用时显示两个使用窗口并重置提示。(#1101)
- UI: 保持配置表单枚举类型化、保留空字符串、保护敏感默认值并深化配置搜索。(#1315)
- UI: 在聊天 markdown 中保留有序列表编号。(#1341)
- UI: 允许 Control UI 从 URL 参数读取 gatewayUrl 以进行远程 WebSocket 目标。(#1342)
- UI: 通过将聊天布局锁定到视口来防止 Control UI 聊天中的双重滚动。(#1283)
- UI: 为同步 Windows 生成启用 shell 模式以避免 `pnpm ui:build` EINVAL。(#1212)
- TUI: 在流式传输期间将思考块排序在内容之前并隔离每轮组装。(#1202)
- TUI: 将自定义编辑器初始化与最新的 pi-tui API 对齐。(#1298)
- TUI: 为可搜索选择器显示通用空状态文本。(#1201)
- TUI: 突出显示模型搜索匹配并稳定搜索排序。
- 配置: 从模型选择器中隐藏 OpenRouter 自动路由模型。(#1182)
- 记忆: 在 `openclaw memory status` 中显示总文件计数 + 扫描问题。
- 记忆: 在重复批处理失败后回退到非批处理嵌入。
- 记忆: 即使没有显式远程配置也应用 OpenAI 批处理默认值。
- 记忆: 原子索引，以便失败的重新索引保留以前的记忆数据库。(#1151)
- 记忆: 在重新索引重复块 ID 时避免 sqlite-vec 唯一约束失败。(#1151)
- 记忆: 在嵌入索引期间重试瞬态 5xx 错误（Cloudflare）。
- 记忆: 使用速率限制重试并行化嵌入索引。
- 记忆: 拆分过长的行以保持嵌入在令牌限制以下。
- 记忆: 跳过空块以避免无效的嵌入输入。
- 记忆: 拆分嵌入批处理以避免在索引期间超过 OpenAI 令牌限制。
- 记忆: 在 `openclaw memory status` 中探测 sqlite-vec 可用性。
- 执行批准: 在询问关闭时强制执行白名单。
- 执行批准: 为节点批准/事件首选原始命令。
- 工具: 在命令之前显示执行提升标志并在外部 markdown 中保持它。
- 工具: 当请求没有配对节点的节点执行时返回配套应用所需的消息。
- 工具: 当没有支持节点请求 `system.run` 时返回配套应用所需的消息。
- 执行: 当未设置时默认将网关/节点执行安全设置为白名单（沙盒保持拒绝）。
- 执行: 当 fish 是默认 shell 时首选 bash，如果 bash 缺失则回退到 sh。(#1297)
- 执行: 为网关执行合并登录 shell PATH，同时保持守护进程 PATH 最小。(#1304)
- 流式传输: 为 OpenAI 兼容的 SSE 块发出助手增量。(#1147)
- Discord: 使解析警告避免速率限制上的原始 JSON payload。
- Discord: 跨会话并行处理消息处理程序以避免事件队列阻塞。(#1295)
- Discord: 在中止后停止重新连接网关以防止重复侦听器。
- Discord: 仅在 30 秒后发出慢速侦听器警告。
- Discord: 继承线程斜杠命令和反应的旧频道白名单。(#1123)
- Telegram: 尊重原生命令的配对白名单。
- Telegram: 通过扩展入站文本中的实体来保留隐藏的 text_link URL。(#1118)
- Slack: 解析 Bolt 导入互操作以进行 Bun + Node。(#1191)
- 网络搜索: 从 API 密钥源（直接 vs OpenRouter）推断 Perplexity 基础 URL。
- 网络获取: 使用共享主机名检查和重定向限制加强 SSRF 保护。(#1346)
- 浏览器: 为 act 命令注册 AI 快照引用。(#1282)
- 语音通话: 在设置 publicUrl 时在 Twilio webhook 验证中包含请求查询。(#864)
- Anthropic: 默认 API 提示缓存为 1 小时，具有可配置的 TTL 覆盖。
- Anthropic: 忽略 OAuth 的 TTL。
- 认证配置文件: 在故障转移时保持自动固定首选项，同时允许轮换。(#1138)
- 认证配置文件: 用户保持锁定。(#1138)
- 模型目录: 避免缓存导入失败、记录瞬态发现错误并保持部分结果。(#1332)
- 测试: 通过跳过 sidecars、规范化 argv 和扩展超时来稳定 Windows 网关/CLI 测试。
- 测试: 稳定插件 SDK 解析和嵌入式代理超时。
- Windows: 将网关计划任务安装为当前用户。
- Windows: 在访问被拒绝时显示友好指南。
- macOS: 异步加载菜单会话预览，以便在菜单打开时填充项目。
- macOS: 使用标签颜色作为会话预览文本，以便在菜单子视图中渲染预览。
- macOS: 在菜单栏成本视图中抑制使用错误文本。
- macOS: 修复网关 + 节点的 LaunchAgent 引导问题时 Doctor 修复。(#1166)
- macOS: 避免在 SSH 上的 Remote 中接触 launchd，以便退出应用不再禁用远程网关。(#1105)
- macOS: 在打包的应用构建中捆绑 Textual 资源以避免代码块崩溃。(#1006)
- 守护进程: 在服务环境中包含 HOME 以避免缺失 HOME 错误。(#1214)

感谢 @AlexMikhalev、@CoreyH、@John-Rood、@KrauseFx、@MaudeBot、@Nachx639、@NicholaiVogel、@RyanLisse、@ThePickle31、@VACInc、@Whoaa512、@YuriNachos、@aaronveklabs、@abdaraxus、@alauppe、@ameno-、@artuskg、@austinm911、@bradleypriest、@cheeeee、@dougvk、@fogboots、@gnarco、@gumadeiras、@jdrhyne、@joelklabo、@longmaba、@mukhtharcm、@odysseus0、@oscargavin、@rhjoh、@sebslight、@sibbl、sleontenko、@steipete、@suminhthanh、@thewilloftheshadow、@tyler6204、@vignesh07、@visionik、ysqander、@zerone0x。

## 2026.1.16-2

### 变更

- CLI: 将构建提交戳入 dist 元数据，以便横幅在 npm 安装中显示提交。(#1127) — 感谢 @NicholasSpisak。
- CLI: 在记忆命令后关闭记忆管理器以避免挂起进程。(#1127) — 感谢 @NicholasSpisak。

## 2026.1.16-1

### 亮点

- 钩子: 添加具有捆绑钩子、CLI 工具和文档的钩子系统。(#1028) — 感谢 @ThomsenDrake。https://docs.openclaw.ai/hooks
- 媒体: 添加入站媒体理解（图像/音频/视频），具有提供商 + CLI 回退。https://docs.openclaw.ai/nodes/media-understanding
- 插件: 添加 Zalo 个人插件（`@openclaw/zalouser`）并统一插件的频道目录。(#1032) — 感谢 @suminhthanh。https://docs.openclaw.ai/plugins/zalouser
- 模型: 添加 Vercel AI Gateway 认证选择 + 引导更新。(#1016) — 感谢 @timolins。https://docs.openclaw.ai/providers/vercel-ai-gateway
- 会话: 添加 `session.identityLinks` 用于跨平台 DM 会话链接。(#1033) — 感谢 @thewilloftheshadow。https://docs.openclaw.ai/concepts/session
- 网络搜索: 添加 `country`/`language` 参数（模式 + Brave API）和文档。(#1046) — 感谢 @YuriNachos。https://docs.openclaw.ai/tools/web

### 破坏性变更

- **破坏性变更:** `openclaw message` 和消息工具现在需要 `target`（删除用于目的地的 `to`/`channelId`）。(#1034) — 感谢 @tobalsan。
- **破坏性变更:** 频道认证现在对 Discord/Telegram/Matrix 首选配置而不是环境（环境仅为回退）。(#1040) — 感谢 @thewilloftheshadow。
- **破坏性变更:** 删除旧版 `chatType: "room"` 支持；使用 `chatType: "channel"`。
- **破坏性变更:** 删除旧版提供商特定目标解析回退；目标解析使用插件提示 + 目录查找进行集中化。
- **破坏性变更:** `openclaw hooks` 现在是 `openclaw webhooks`；钩子位于 `openclaw hooks` 下。https://docs.openclaw.ai/cli/webhooks
- **破坏性变更:** `openclaw plugins install <path>` 现在复制到 `~/.openclaw/extensions`（使用 `--link` 保持基于路径的加载）。

### 变更

- 插件: 默认禁用捆绑插件并允许已安装版本覆盖。(#1066) — 感谢 @ItzR3NO。
- 插件: 添加捆绑的 Antigravity + Gemini CLI OAuth + Copilot Proxy 提供商插件。(#1066) — 感谢 @ItzR3NO。
- 工具: 使用 Readability（带回退）改进 `web_fetch` 提取。
- 工具: 在配置时为 `web_fetch` 添加 Firecrawl 回退。
- 工具: 默认发送类似 Chrome 的标头以进行 `web_fetch` 以改进对机器人敏感站点的提取。
- 工具: Firecrawl 回退现在默认使用机器人规避 + 缓存；在提取失败时删除基本 HTML 回退。
- 工具: 默认 `exec` 退出通知并自动将旧版 `tools.bash` 迁移到 `tools.exec`。
- 工具: 为交互式会话添加 `exec` PTY 支持。https://docs.openclaw.ai/tools/exec
- 工具: 为 PTY 会话添加 tmux 风格的 `process send-keys` 和括号粘贴帮助程序。
- 工具: 为 PTY 会话添加 `process submit` 帮助程序以发送 CR。
- 工具: 响应 PTY 光标位置查询以解锁交互式 TUI。
- 工具: 在详细模式下包含工具输出并扩展详细工具反馈。
- 技能: 更新 coding-agent 指南以首选启用 PTY 的 exec 运行并简化 tmux 使用。
- TUI: 在运行完成或失败后刷新会话令牌计数。(#1079) — 感谢 @d-ploutarchos。
- 状态: 将 `/status` 修剪为仅当前提供商的使用并删除 OAuth/令牌块。
- 目录: 跨频道和插件频道统一 `openclaw directory`。
- UI: 允许从 Control UI 删除会话。
- 记忆: 添加具有 CLI 状态详细信息的 sqlite-vec 向量加速。
- 记忆: 添加用于 memory_search 的实验性会话转录本索引（通过 memorySearch.experimental.sessionMemory + sources 选择加入）。
- 技能: 添加用户可调用的技能命令和扩展的技能命令注册。
- Telegram: 默认反应级别为最小并默认启用反应通知。
- Telegram: 允许回复链消息绕过群组中的提及门控。(#1038) — 感谢 @adityashaw2。
- iMessage: 为 VM/SSH 部署添加远程附件支持。
- 消息: 在解析目标时刷新实时目录缓存结果。
- 消息: 将交付的出站文本/媒体镜像到会话转录本。(#1031) — 感谢 @TSavo。
- 消息: 避免 iMessage + Signal 群聊的冗余发送者信封。(#1080) — 感谢 @tyler6204。
- 媒体: 规范化 Deepgram 音频上传字节以进行获取兼容性。
- Cron: 隔离的 cron 作业现在在每次运行时启动一个新的会话 ID 以防止上下文累积。
- 文档: 添加 `/help` 中心、Node/npm PATH 指南和扩展目录 CLI 文档。
- 配置: 在配置值中支持环境变量替换。(#1044) — 感谢 @sebslight。
- 健康: 添加每代理会话摘要和账户级健康详细信息，并允许选择性探测。(#1047) — 感谢 @gumadeiras。
- 钩子: 添加具有 `openclaw.hooks` manifest 和 `openclaw hooks install/update` 的钩子包安装（npm/path/zip/tar）。
- 插件: 添加 zip 安装和 `--link` 以避免复制本地路径。

### 修复

- macOS: 在等待之前排空子进程管道以避免死锁。(#1081) — 感谢 @thesash。
- 详细: 仅为支持 markdown 的频道将工具摘要/输出包装在 markdown 中。
- 工具: 在提升的执行拒绝错误中包含提供商/会话上下文。
- 工具: 规范化工具错误日志中的 exec 工具别名命名。
- 日志记录: 重用共享的 ANSI 剥离以保持控制台捕获 lint 清洁。
- 日志记录: 使用会话/运行/频道上下文为嵌套代理输出添加前缀。
- Telegram: 接受 tg/group/telegram 前缀 + 用于内联按钮验证的话题目标。(#1072) — 感谢 @danielz1z。
- Telegram: 将长标题拆分为跟进消息。
- 配置: 在启动时阻止无效配置，保留尽力而为的 doctor 配置，并保持滚动配置备份。(#1083) — 感谢 @mukhtharcm。
- 子代理: 通过 accountId 规范化公告交付来源 + 队列分桶以保持多账户路由稳定。(#1061、#1058) — 感谢 @adam91holt。
- 会话: 在 sessions.list 中包含 deliveryContext 并重用规范化的交付路由进行公告/重启回退。(#1058)
- 会话: 将 deliveryContext 传播到 last-route 更新以保持账户/频道路由稳定。(#1058)
- 会话: 在 `/new` 重置上保留覆盖。
- 记忆: 在监视/间隔同步失败时防止未处理的拒绝。(#1076) — 感谢 @roshanasingh4。
- 记忆: 当嵌入返回 429/insufficient_quota 时避免网关崩溃（禁用工具 + 显示错误）。(#1004)
- 网关: 遵守没有隐式 accountId 回退的显式交付目标；保留 lastAccountId 用于隐式路由。
- 网关: 在请求的频道不同时避免重用 last-to/accountId；将 deliveryContext 与 last route 字段同步。
- 构建: 允许 `@lydell/node-pty` 在支持的平台上构建。
- 仓库: 修复 oxlint 配置文件名并将忽略模式移入配置。(#1064) — 感谢 @connorshea。
- 消息: `/stop` 现在硬中止排队的跟进和子代理运行；抑制零计数停止说明。
- 消息: 在重复数据删除发送时遵守消息工具频道。
- 消息: 为跨频道的实时群组消息包含发送者标签，匹配排队/历史格式化。(#1059)
- 会话: 在 `/new` 和 `/reset` 上重置 `compactionCount` 并保留 `sessions.json` 文件模式（0600）。
- 会话: 在嵌入式提示之前修复孤立的用户轮次。
- 会话: 硬停止 `sessions.delete` 清理。
- 频道: 将回复给机器人视为跨支持频道的隐式提及。
- 频道: 在频道能力解析中规范化对象格式能力。
- 安全: 默认拒绝斜杠/控制命令，除非频道计算了 `CommandAuthorized`（修复意外的"开放"行为），并确保 WhatsApp + Zalo 插件频道正确门控内联 `/…` 令牌。https://docs.openclaw.ai/gateway/security
- 安全: 在网关 WS 日志中编辑敏感文本。
- 工具: 限制待处理的 `exec` 进程输出以避免无界缓冲区。
- CLI: 通过在规范化频道 ID 时避免繁重的插件导入来加速 `openclaw sandbox-explain`。
- 浏览器: 当扩展在切换选项卡后重用会话 ID 时，保持扩展中继选项卡可控制。(#1160)
- 浏览器: 当 Playwright 阻止 `newCDPSession` 时修复扩展中继快照/操作的 `tab not found`（使用单个可用页面）。
- 浏览器: 当远程 CDP 使用 `https` 时将 `ws` 升级到 `wss`（修复 Browserless 握手）。
- Telegram: 跳过 `message_thread_id=1` 以进行常规话题发送，同时保持打字指示器。(#848) — 感谢 @azade-c。
- 修复: 跨回复管道清理用户面对的错误文本 + 剥离 `<final>` 标签。(#975) — 感谢 @ThomsenDrake。
- 修复: 规范化配对 CLI 别名、允许扩展频道并加强 Zalo webhook payload 解析。(#991) — 感谢 @longmaba。
- 修复: 允许本地 Tailscale Serve 主机名而不将 tailnet 客户端视为直接。(#885) — 感谢 @oswalpalash。
- 修复: 在角色排序冲突后重置会话以从连续的用户轮次中恢复。(#998)

## 2026.1.15

### 亮点

- 插件: 提供商认证注册 + `openclaw models auth login` 用于插件驱动的 OAuth/API 密钥流。
- 浏览器: 改进远程 CDP/Browserless 支持（认证透传、`wss` 升级、超时、更清晰的错误）。
- 心跳: 每代理配置 + 24 小时重复抑制。(#980) — 感谢 @voidserf。
- 安全: 审计警告弱模型层；应用节点存储加密的认证令牌（Keychain/SecurePrefs）。

### 破坏性变更

- **破坏性变更:** iOS 最低版本现在是 18.0 以支持本机聊天中的 Textual markdown 渲染。(#702)
- **破坏性变更:** Microsoft Teams 现在是插件；通过 `openclaw plugins install @openclaw/msteams` 安装 `@openclaw/msteams`。
- **破坏性变更:** 频道认证现在对 Discord/Telegram/Matrix 首选配置而不是环境（环境仅为回退）。(#1040) — 感谢 @thewilloftheshadow。

### 变更

- UI/应用: 将频道/配置设置移动到模式驱动的表单并将连接重命名为频道。(#1040) — 感谢 @thewilloftheshadow。
- CLI: 将进程标题设置为 `openclaw-<command>` 以获得更清晰的进程列表。
- CLI/macOS: 将远程 SSH 目标/身份同步到配置并让 `gateway status` 自动推断 SSH 目标（ssh-config 感知）。
- Telegram: 使用白名单默认 + DM/群组中的回调门控来限定内联按钮范围。
- Telegram: 默认将自己反应通知设置为仅自己。
- 工具: 使用 Readability（带回退）改进 `web_fetch` 提取。
- 心跳: 收紧提示指南 + 抑制 24 小时的重复警报。(#980) — 感谢 @voidserf。
- 仓库: 忽略本地身份文件以避免意外提交。(#1001) — 感谢 @gerardward2007。
- 会话/安全: 为多用户 DM 隔离添加 `session.dmScope` 和审计警告。(#948) — 感谢 @Alphonse-arianee。
- 插件: 添加提供商认证注册 + `openclaw models auth login` 用于插件驱动的 OAuth/API 密钥流。
- 引导: 将频道设置切换到具有每频道操作和选择器中禁用提示的单选循环。
- TUI: 为活动会话和默认模型显示提供商/模型标签。
- 心跳: 添加每代理心跳配置和多代理文档示例。
- UI: 在未经授权的 Control UI 连接上显示网关认证指南 + 文档链接。
- UI: 在 Control UI 会话列表中添加会话删除操作。(#1017) — 感谢 @Szpadel。
- 安全: 在 `openclaw security audit` 中警告弱模型层（Haiku、低于 GPT-5、低于 Claude 4.5）。
- 应用: 存储加密的节点认证令牌（Keychain/SecurePrefs）。
- 守护进程: 跨服务帮助程序共享配置文件/状态目录解析并遵守 `CLAWDBOT_STATE_DIR` 以获取 Windows 任务脚本。
- 文档: 澄清多网关救援机器人指南。(#969) — 感谢 @bjesuiter。
- 代理: 添加带有可配置时间格式（自动/12/24）的当前日期和时间系统提示部分。
- 工具: 规范化 Slack/Discord 消息时间戳，保留 `timestampMs`/`timestampUtc` 同时保留原始提供商字段。
- macOS: 添加 `system.which` 用于无提示的远程技能发现（网关回退到 `system.run`）。
- 文档: 添加日期和时间指南并更新提示/时区配置文档。
- 消息: 使用每连接器覆盖跨频道对快速入站消息进行去抖动。(#971) — 感谢 @juanpablodlc。
- 消息: 允许仅媒体发送（CLI/工具）并显示 Telegram 语音笔记的语音录制状态。(#957) — 感谢 @rdev。
- 认证/状态: 保持认证配置文件每会话粘性（在压缩/新建时轮换）、在 `/status` 和 `openclaw models status` 中显示提供商使用标头并更新文档。
- CLI: 为 `openclaw daemon` 生命周期/安装命令添加 `--json` 输出。
- 记忆: 使 `node-llama-cpp` 成为可选依赖（避免 Node 25 安装失败）并改进本地嵌入回退/错误。
- 浏览器: 添加 `snapshot refs=aria`（Playwright aria-ref ID）以在 `snapshot` → `act` 中自解析引用。
- 浏览器: `profile="chrome"` 现在默认为主机控制，并在附加选项卡时返回更清晰的"错误"。
- 浏览器: 更喜欢稳定的 Chrome 进行自动检测，使用 Brave/Edge 回退并更新文档。(#983) — 感谢 @cpojer。
- 浏览器: 增加远程 CDP 可达性超时 + 添加 `remoteCdpTimeoutMs`/`remoteCdpHandshakeTimeoutMs`。
- 浏览器: 保留远程 CDP 端点的认证/查询令牌并为 CDP HTTP/WS 传递基本认证。(#895) — 感谢 @mukhtharcm。
- Telegram: 添加具有可配置通知和代理指南的双向反应支持。(#964) — 感谢 @bohdanpodvirnyi。
- Telegram: 在机器人菜单中允许自定义命令（与本机合并；忽略冲突）。(#860) — 感谢 @nachoiacovino。
- Discord: 允许没有频道列表的白名单公会接收消息当 `groupPolicy="allowlist"` 时。— 感谢 @thewilloftheshadow。
- Discord: 允许表情符号/贴纸上传 + 配置默认值中的频道操作。(#870) — 感谢 @JDIVE。

### 修复

- 消息: 使 `/stop` 清除排队的跟进和待处理的会话通道工作以进行硬中止。
- 消息: 使 `/stop` 中止从请求者会话生成的活动子代理运行并报告停止了多少。
- WhatsApp: 在频道状态中一致报告链接状态。(#1050) — 感谢 @YuriNachos。
- 会话: 在 `/new` 重置压缩计数器时保持每会话覆盖。(#1050) — 感谢 @YuriNachos。
- 技能: 允许 OpenAI 图像生成助手处理 URL 或 base64 响应。(#1050) — 感谢 @YuriNachos。
- WhatsApp: 默认仅对自聊天使用响应前缀，在设置时使用身份名称。
- Signal/iMessage: 将传输就绪等待限制为 30 秒并定期记录。(#1014) — 感谢 @Szpadel。
- iMessage: 将缺少 `imsg rpc` 支持视为致命以避免重启循环。
- 认证: 将主要认证配置文件合并到子代理的每代理存储中并记录继承。(#1013) — 感谢 @marcmarg。
- 代理: 通过在工具参数中重命名字段来避免 JSON Schema `format` 冲突。(#1013) — 感谢 @marcmarg。
- 修复: 使 `openclaw update` 在安装通过包管理器安装时自动更新全局安装。
- 修复: 将模型选择器条目列为显式选择的提供商/模型对。(#970) — 感谢 @mcinteerj。
- 修复: 将 OpenAI 图像生成默认值与 DALL-E 3 标准质量对齐并记录输出格式。(#880) — 感谢 @mkbehr。
- 修复: 即使在 `openclaw configure` 中选择本地运行模式时未选择其他部分，也保留持久化 `gateway.mode=local`。
- 守护进程: 修复配置文件感知的服务标签解析（环境驱动）并添加 launchd/systemd/schtasks 的覆盖。(#969) — 感谢 @bjesuiter。
- 代理: 在记录不受支持的 Google 工具模式关键字时避免误报。
- 代理: 跳过 google-antigravity 的 Gemini 历史降级以保留工具调用。(#894) — 感谢 @mukhtharcm。
- 状态: 当不存在 OAuth 配置文件时恢复当前提供商的使用摘要行。
- 修复: 防范未定义的提供商/模型值的模型回退。(#954) — 感谢 @roshanasingh4。
- 修复: 重构会话存储更新、添加 chat.inject 并加固子代理清理流程。(#944) — 感谢 @tyler6204。
- 修复: 清理跨后端的挂起 CLI 进程。(#978) — 感谢 @Nachx639。
- 修复: 支持具有 `model_remains`/`current_interval_*` payload 的 MiniMax 编码计划使用响应。
- 修复: 在重复数据删除发送后遵守消息工具频道（在消息工具发送后首选 `NO_REPLY`）。(#1053) — 感谢 @sashcatanzarite。
- 修复: 在初始链接时抑制 WhatsApp 配对回复以进行历史追赶 DM。(#904)
- 浏览器: 当扩展仅附加一个选项卡时，扩展模式恢复（陈旧 targetId 回退）。
- 浏览器: 修复当 Playwright 阻止 `newCDPSession` 时扩展中继快照/操作的 `tab not found`（使用单个可用页面）。
- 浏览器: 当远程 CDP 使用 `https` 时将 `ws` 升级到 `wss`（修复 Browserless 握手）。
- Telegram: 跳过 `message_thread_id=1` 以进行常规话题发送，同时保持打字指示器。(#848) — 感谢 @azade-c。
- 修复: 跨回复管道清理用户面对的错误文本 + 剥离 `<final>` 标签。(#975) — 感谢 @ThomsenDrake。
- 修复: 规范化配对 CLI 别名、允许扩展频道并加强 Zalo webhook payload 解析。(#991) — 感谢 @longmaba。
- 修复: 允许本地 Tailscale Serve 主机名而不将 tailnet 客户端视为直接。(#885) — 感谢 @oswalpalash。
- 修复: 在角色排序冲突后重置会话以从连续的用户轮次中恢复。(#998)

## 2026.1.14-1

### 亮点

- 网络搜索: `web_search`/`web_fetch` 工具（Brave API）+ 引导/配置中的首次设置。
- 浏览器控制: Chrome 扩展中继接管模式 + 远程浏览器控制支持。
- 插件: 频道插件（网关 HTTP 钩子）+ Zalo 插件 + 引导安装流程。(#854) — 感谢 @longmaba。
- 安全: 扩展的 `openclaw security audit`（+ `--fix`）、detect-secrets CI 扫描和 `SECURITY.md` 报告策略。

### 变更

- 文档: 澄清每代理认证存储、沙盒化技能二进制文件和提升语义。
- 文档: 为缺失的提供商认证和 Gemini 思考签名错误添加 FAQ 条目。
- 代理: 在 `agents add` 上添加可选的认证配置文件复制提示并改进认证错误消息。
- 安全: 扩展 `openclaw security audit` 检查（模型卫生、配置包含、插件白名单、暴露矩阵）并扩展 `--fix` 以收紧更敏感的状态路径。
- 安全: 添加 `SECURITY.md` 报告策略。
- 频道: 添加具有文档 + 引导钩子的 Matrix 插件（外部）。
- 插件: 添加具有网关 HTTP 钩子和引导安装提示的 Zalo 频道插件。(#854) — 感谢 @longmaba。
- 引导: 添加安全检查点提示（文档链接 + 沙盒提示）；对 `--non-interactive` 需要 `--accept-risk`。
- 文档: 扩展网关安全加固指南和事件响应清单。
- 文档: 记录频道 DM 的 DM 历史限制。(#883) — 感谢 @pkrmf。
- 安全: 添加 detect-secrets CI 扫描和基线指南。(#227) — 感谢 @Hyaxia。
- 工具: 添加 `web_search`/`web_fetch`（Brave API），为沙盒化会话自动启用 `web_fetch` 并删除 `brave-search` 技能。
- CLI/文档: 添加用于存储 Brave API 密钥的 Web 工具配置部分并更新引导提示。
- 浏览器: 添加 Chrome 扩展中继接管模式（工具栏按钮）、`openclaw browser extension install/path` 和远程浏览器控制（独立服务器 + 令牌认证）。

### 修复

- 会话: 重构会话存储更新以锁定 + 按条目变异、添加 chat.inject 并加固子代理清理流程。(#944) — 感谢 @tyler6204。
- 浏览器: 为快照标签/高效查询参数和标签图像响应添加测试。
- Google: 在发送前降级未签名的思考块以避免缺少签名错误。
- Doctor: 在仅设置旧版确认反应时避免重新添加 WhatsApp 配置。(#927、修复 #900) — 感谢 @grp06。
- 代理: 清理 Gemini 工具调用的元组 `items` 模式。(#926、修复 #746) — 感谢 @grp06。
- 代理: 加强 Antigravity Claude 历史/工具调用清理。(#968) — 感谢 @rdev。
- 代理: 从运行时结果稳定子代理公告状态并规范化结果/说明。(#835) — 感谢 @roshanasingh4。
- 嵌入式运行器: 从回复中抑制原始 API 错误 payload。(#924) — 感谢 @grp06。
- 认证: 将 Claude Code CLI 配置文件模式规范化为 oauth 并自动迁移配置。(#855) — 感谢 @sebslight。
- 守护进程: 在引导之前清除持久化的 launchd 禁用状态（修复卸载后的 `daemon install`）。(#849) — 感谢 @ndraiman。
- 日志记录: 容忍来自控制台写入的 `EIO` 以避免网关崩溃。(#925、修复 #878) — 感谢 @grp06。
- 沙盒: 恢复 `docker.binds` 配置验证以进行自定义绑定挂载。(#873) — 感谢 @akonyer。
- 沙盒: 保留 `docker exec` 的配置 PATH 以便自定义工具保持可用。(#873) — 感谢 @akonyer。
- Slack: 在解析频道提及门控时尊重 `channels.slack.requireMention` 默认值。(#850) — 感谢 @evalexpr。
- Telegram: 将拆分的入站消息聚合为一个提示（减少"每片段一个回复"）。
- 自动回复: 将尾随的 `NO_REPLY` 令牌视为静默回复。
- 配置: 防止部分配置写入破坏不相关的设置（基础哈希保护 + 合并补丁以进行连接保存）。

## 2026.1.14

### 变更

- 使用: 添加 MiniMax 编码计划使用跟踪。
- 认证: 标记 Claude Code CLI 认证选项。(#915) — 感谢 @SeanZoR。
- 文档: 跨文档和提示标准化 Claude Code CLI 命名。（跟进 #915）
- Telegram: 在消息工具中添加消息删除操作。(#903) — 感谢 @sleontenko。
- 配置: 添加 `channels.<provider>.configWrites` 门控以进行频道启动的配置写入；迁移 Slack 频道 ID。

### 修复

- Mac: 将认证令牌/密码传递给仪表板 URL 以进行认证访问。(#918) — 感谢 @rahthakor。
- UI: 使用应用程序定义的 WebSocket 关闭代码（浏览器兼容性）。(#918) — 感谢 @rahthakor。
- TUI: 通过叠加堆栈渲染选择器叠加层，以便显示 /models 和 /settings。(#921) — 感谢 @grizzdank。
- TUI: 在发送/流式传输/运行状态的状态行中添加明亮的旋转器 + 经过时间。
- TUI: 显示 LLM 错误消息（速率限制、认证等）而不是 `(no output)`。
- 网关/开发: 确保 `pnpm gateway:dev` 始终使用开发配置文件配置 + 状态（`~/.openclaw-dev`）。

#### 代理 / 认证 / 工具 / 沙盒

- 代理: 使系统提示中的用户时区和 24 小时时间显式。(#859) — 感谢 @CashWilliams。
- 代理: 剥离降级的工具调用文本而不吃掉相邻的回复并过滤思考标签泄漏。(#905) — 感谢 @erikpr1994。
- 代理: 为 OpenAI/OpenRouter 限制工具调用 ID 以避免请求拒绝。(#875) — 感谢 @j1philli。
- 代理: 清理 Gemini 工具调用的元组 `items` 模式。(#926、修复 #746) — 感谢 @grp06。
- 代理: 从运行时结果稳定子代理公告状态并规范化结果/说明。(#835) — 感谢 @roshanasingh4。
- 认证: 将 Claude Code CLI 配置文件模式规范化为 oauth 并自动迁移配置。(#855) — 感谢 @sebslight。
- 嵌入式运行器: 从回复中抑制原始 API 错误 payload。(#924) — 感谢 @grp06。
- 日志记录: 容忍来自控制台写入的 `EIO` 以避免网关崩溃。(#925、修复 #878) — 感谢 @grp06。
- 沙盒: 恢复 `docker.binds` 配置验证并保留 `docker exec` 的配置 PATH。(#873) — 感谢 @akonyer。
- Google: 在发送前降级未签名的思考块以避免缺少签名错误。

#### macOS / 应用

- macOS: 确保启动日志目录存在并具有仅测试覆盖。(#909) — 感谢 @roshanasingh4。
- macOS: 格式化 ConnectionsStore 配置以满足 SwiftFormat lint。(#852) — 感谢 @mneves75。
- macOS: 将认证令牌/密码传递给仪表板 URL 以进行认证访问。(#918) — 感谢 @rahthakor。
- macOS: 重用 launchd 网关认证并在网关配置已存在时跳过向导。(#917)
- macOS: 在远程模式下首选默认桥接隧道端口以进行节点桥接连接；记录 macOS 远程控制 + 桥接隧道。(#960、修复 #865) — 感谢 @kkarimi。
- 应用: 使用跨 macOS/iOS/Android 的网关默认值规范主会话键以避免创建裸 `main` 会话。
- macOS: 修复 cron 预览/测试 payload 以使用 `channel` 键。(#867) — 感谢 @wes-davis。
- Telegram: 遵守 `channels.telegram.timeoutSeconds` 以进行 grammY API 请求。(#863) — 感谢 @Snaver。
- Telegram: 将长标题拆分为媒体 + 跟进文本消息。(#907) - 感谢 @jalehman。
- Telegram: 在超级组更改聊天 ID 时迁移群组配置。(#906) — 感谢 @sleontenko。
- 消息: 统一 markdown 格式化 + Slack/Telegram/Signal 的格式优先分块。(#920) — 感谢 @TheSethRose。
- Slack: 删除 `api_app_id`/`team_id` 不匹配的 Socket Mode 事件。(#889) — 感谢 @roshanasingh4。
- Discord: 隔离 autoThread 线程上下文。(#856) — 感谢 @davidguttman。
- WhatsApp: 使用正确的 ID 修复上下文隔离（之前是机器人的号码，现在是会话 ID）。(#911) — 感谢 @tristanmanchester。
- WhatsApp: 规范化用户 JID 并在群组中使用设备后缀进行白名单检查。(#838) — 感谢 @peschee。

## 2026.1.13

### 修复

- Postinstall: 将已应用的 pnpm 补丁视为无操作以避免 npm/bun 安装失败。
- 打包: 将 `@mariozechner/pi-ai` 固定到 0.45.7 并刷新修补的依赖项以匹配 npm 解析。

## 2026.1.12-2

### 修复

- 打包: 在 npm tarball 中包含 `dist/memory/**`（修复 `ERR_MODULE_NOT_FOUND` 为 `dist/memory/index.js`）。
- 代理: 跨网关重启持久化子代理注册表并安全恢复公告流程。(#831) — 感谢 @roshanasingh4。
- 代理: 从 OpenRouter 历史中剥离无效的 Gemini 思想签名以避免 400。(#841、#845) — 感谢 @MatthieuBizien。

## 2026.1.12-1

### 修复

- 打包: 在 npm tarball 中包含 `dist/channels/**`（修复 `ERR_MODULE_NOT_FOUND` 为 `dist/channels/registry.js`）。

## 2026.1.12

### 亮点

- **破坏性变更:** 将聊天"提供商"（Slack/Telegram/WhatsApp/…）重命名为整个 CLI/RPC/配置的**频道**；旧版配置键在加载时自动迁移（并写回为 `channels.*`）。
- 记忆: 为代理记忆添加向量搜索（仅 Markdown），具有 SQLite 索引、分块、延迟同步 + 文件监视和每代理启用/回退。
- 插件: 恢复完整的语音通话插件功能（Telnyx/Twilio、流式传输、入站策略、工具/CLI）。
- 模型: 添加合成提供商以及 Moonshot Kimi K2 0905 + turbo/thinking 变体（带文档）。(#811) — 感谢 @siraht；(#818) — 感谢 @mickahouan。
- Cron: 一次性计划接受 ISO 时间戳（UTC）并具有可选的 run-after-delete；cron 作业可以定位特定代理（CLI + macOS/Control UI）。
- 代理: 添加压缩模式配置，具有可选的保护摘要和每代理模型回退。(#700) — 感谢 @thewilloftheshadow；(#583) — 感谢 @mitschabaude-bot。

### 新增与改进

- 记忆: 添加自定义 OpenAI 兼容嵌入端点；支持 OpenAI/本地 `node-llama-cpp` 嵌入，具有每代理覆盖和提供商元数据在工具/CLI中。(#819) — 感谢 @mukhtharcm。
- 记忆: 新的 `openclaw memory` CLI 以及 `memory_search`/`memory_get` 工具，具有片段 + 行范围；索引存储在 `~/.openclaw/memory/{agentId}.sqlite` 下，默认启用监视。
- 代理: 加强记忆回忆指南；使工作区引导截断可配置（默认 20k）并带有警告；添加默认子代理模型配置。
- 工具/沙盒: 添加工具配置文件 + 组速记；在 `tools.sandbox.tools` 中支持工具策略组；删除旧版 `memory` 速记；通过 `docker.binds` 允许 Docker 绑定挂载。(#790) — 感谢 @akonyer。
- 工具: 添加提供商/模型特定的工具策略覆盖（`tools.byProvider`）以按提供商修剪工具暴露。
- 工具: 添加浏览器 `scrollintoview` 操作；允许 Claude/Gemini 工具参数别名；为 GPT-5.2/Codex 允许思考 `xhigh` 并安全降级。(#793) — 感谢 @hsrvc；(#444) — 感谢 @grp06。
- 网关/CLI: 添加 Tailscale 二进制发现、自定义绑定模式和探测认证重试；添加 `openclaw dashboard` 自动打开流程；默认原生命令为 `"auto"` 并具有每提供商覆盖。(#740) — 感谢 @jeffersonwarrior。
- 认证/引导: 添加 Chutes OAuth（PKCE + 刷新 + 引导选择）；规范化 API 密钥输入；默认 TUI 引导为 `deliver: false`。(#726) — 感谢 @FrieSei；(#791) — 感谢 @roshanasingh4。
- 提供商: 添加 `discord.allowBots`；从默认目录中修剪旧版 MiniMax M2；将 MiniMax 视觉路由到编码计划 VLM 端点（也接受 `@/path/to/file.png` 输入）。(#802) — 感谢 @zknicker。
- 网关: 允许 Tailscale Serve 身份标头满足令牌认证；在协议模式较新时重建 Control UI 资源。(#823) — 感谢 @roshanasingh4；(#786) — 感谢 @meaningfool。
- 心跳: 默认 `ackMaxChars` 为 300，以便短 `HEARTBEAT_OK` 回复保持内部。

### 安装程序

- 安装: 在 git 安装/更新后运行 `openclaw doctor --non-interactive` 并在检测到守护进程重启时轻推守护进程重启。

### 修复

- Doctor: 警告 pnpm 工作区不匹配、缺少 Control UI 资源和缺少 tsx 二进制文件；提供 UI 重建。
- 工具: 即使设置了代理特定的工具策略也应用全局工具允许/拒绝。
- 模型/提供商: 将凭据验证失败视为认证错误以触发回退；规范化 `${ENV_VAR}` apiKey 值并自动填充缺失的提供商密钥；保留显式 GitHub Copilot 提供商配置 + 代理目录认证配置文件。(#822) — 感谢 @sebslight；(#705) — 感谢 @TAGOOZ。
- 认证: 从排序中删除无效的认证配置文件，以便仍可将环境密钥用于 MiniMax 等提供商。
- Gemini: 将 Gemini 3 ID 规范化为预览变体；剥离 Gemini CLI 工具调用/响应 ID；降级缺失的 `thought_signature`；剥离 Claude `msg_*` thought_signature 字段以避免 base64 解码错误。(#795) — 感谢 @thewilloftheshadow；(#783) — 感谢 @ananth-vardhan-cn；(#793) — 感谢 @hsrvc；(#805) — 感谢 @marcmarg。
- 代理: 通过重置会话并从嵌入式运行传播溢出详细信息以便调用者可以恢复，从压缩上下文溢出中自动恢复。
- MiniMax: 剥离格式错误的工具调用 XML；在隐式提供商中包含 `MiniMax-VL-01` 以进行图像配对。(#809) — 感谢 @latitudeki5223。
- 引导/认证: 在编写认证配置文件（MiniMax）时遵守 `CLAWDBOT_AGENT_DIR` / `PI_CODING_AGENT_DIR`。(#829) — 感谢 @roshanasingh4。
- Anthropic: 处理 `overloaded_error` 并显示友好消息和故障转移分类。(#832) — 感谢 @danielz1z。
- Anthropic: 在验证前合并连续的用户轮次（保留最新的元数据）以避免不正确的角色错误。(#804) — 感谢 @ThomsenDrake。
- 消息: 强制执行消息工具发送的上下文隔离；在工具执行期间保持打字指示器活动。(#793) — 感谢 @hsrvc；(#450、#447) — 感谢 @thewilloftheshadow。
- 自动回复: `/status` 白名单行为、回退上的推理标签强制执行和提升/推理切换的系统事件排队。(#810) — 感谢 @mcinteerj。
- 系统事件: 在事件注入提示时包含本地时间戳。(#245) — 感谢 @thewilloftheshadow。
- 自动回复: 解决歧义的 `/model` 匹配；修复流式块回复媒体处理；保留 >300 字符的心跳回复而不是删除。
- Discord/Slack: 集中回复线程计划；修复 autoThread 路由 + 添加每频道 autoThread；避免重复侦听器；保持推理斜体完整；允许通过消息工具清除频道父级。(#800、#807) — 感谢 @davidguttman；(#744) — 感谢 @thewilloftheshadow。
- Telegram: 保留论坛话题线程 ID、持久化轮询偏移、在 webhook 模式下尊重账户绑定并在常规话题中显示打字指示器。(#727、#739) — 感谢 @thewilloftheshadow；(#821) — 感谢 @gumadeiras；(#779) — 感谢 @azade-c。
- Slack: 接受带或不带前导 `/` 的斜杠命令以进行自定义命令配置。(#798) — 感谢 @thewilloftheshadow。
- Cron: 正确持久化禁用的作业；接受 update/run/remove 参数的 `jobId` 别名。(#205、#252) — 感谢 @thewilloftheshadow。
- 网关/CLI: 遵守 `CLAWDBOT_LAUNCHD_LABEL` / `CLAWDBOT_SYSTEMD_UNIT` 覆盖；`agents.list` 尊重显式配置；减少测试期间嘈杂的环回 WS 日志；在更新期间运行 `openclaw doctor --non-interactive`。(#781) — 感谢 @ronyrus。
- 引导/Control UI: 首先拒绝无效配置（运行 doctor）；引用 Windows 浏览器 URL 以进行 OAuth；除非用户接近底部，否则保持聊天滚动位置。(#764) — 感谢 @mukhtharcm；(#794) — 感谢 @roshanasingh4；(#217) — 感谢 @thewilloftheshadow。
- 工具/UI: 为严格的提供商强化工具输入模式；删除 null-only 联合变体以进行 Gemini 模式清理；将 `maxChars: 0` 视为无限制；保留 TUI 最后流式响应而不是 "(no output)"。(#782) — 感谢 @AbhisekBasu1；(#796) — 感谢 @gabriel-trigo；(#747) — 感谢 @thewilloftheshadow。
- 连接 UI: 润色多账户账户卡片。(#816) — 感谢 @steipete。

### 维护

- 依赖项: 将 Pi 包升级到 0.45.3 并刷新修补的 pi-ai。
- 测试: 将 Vitest + browser-playwright 更新到 4.0.17。
- 文档: 添加 Amazon Bedrock 提供商说明并从模型/FAQ 链接。

## 2026.1.11

### 亮点

- 插件现在是一流的：加载器 + CLI 管理，以及新的语音通话插件。
- 配置：模块化的 `$include` 支持以拆分配置文件。(#731) — 感谢 @pasogott。
- 代理/Pi：保留压缩余量，以便预压缩内存写入可以在自动压缩之前运行。
- 代理：自动预压缩内存刷新轮次，在压缩之前存储持久记忆。

### 变更

- CLI/引导：简化 MiniMax 认证选择为单个 M2.1 选项。
- CLI：配置部分选择现在循环直到继续。
- 文档：解释 MiniMax vs MiniMax Lightning（速度 vs 成本）并恢复 LM Studio 示例。
- 文档：添加 Cerebras GLM 4.6/4.7 配置示例（OpenAI 兼容端点）。
- 引导/CLI：按提供商对模型/认证选择进行分组并将 Z.AI 标记为 GLM 4.7。
- 引导/文档：添加 Moonshot AI（Kimi K2）认证选择 + 配置示例。
- CLI/引导：提示重用检测到的 API 密钥以进行 Moonshot/MiniMax/Z.AI/Gemini/Anthropic/OpenCode。
- 自动回复：添加紧凑的 `/model` 选择器（模型 + 可用提供商）并在 `/model status` 中显示提供商端点。
- Control UI：添加配置选项卡模型预设（MiniMax M2.1、GLM 4.7、Kimi）以进行一键设置。
- 插件：添加扩展加载器（工具/RPC/CLI/服务）、发现路径和配置模式 + Control UI 标签（uiHints）。
- 插件：添加 `openclaw plugins install`（路径/tgz/npm）以及 `list|info|enable|disable|doctor` UX。
- 插件：语音通话插件现在真实（Twilio/日志）、添加 start/status RPC/CLI/工具 + 测试。
- 文档：添加插件文档 + 从工具/技能/网关配置交叉链接。
- 文档：添加初学者友好的插件快速入门 + 扩展语音通话插件文档。
- 测试：添加 Docker 插件加载器 + tgz 安装烟雾测试。
- 测试：扩展 Docker 插件 E2E 以覆盖从本地文件夹（`plugins.load.paths`）和 `file:` npm 规范安装。
- 测试：添加预压缩内存刷新设置的覆盖。
- 测试：为当前版本现代化实时模型烟雾选择并强制执行工具/图像/思考高覆盖。(#769) — 感谢 @steipete。
- 代理/工具：添加 `apply_patch` 工具以进行多文件编辑（实验性；由 tools.exec.applyPatch 门控；仅 OpenAI）。
- 代理/工具：将 bash 工具重命名为 exec（维护配置别名）。(#748) — 感谢 @myfunc。
- 代理：添加预压缩内存刷新配置（`agents.defaults.compaction.*`），具有软阈值 + 系统提示。
- 配置：添加 `$include` 指令以进行模块化配置文件。(#731) — 感谢 @pasogott。
- 构建：将 pnpm 最小发布年龄设置为 2880 分钟（2 天）。(#718) — 感谢 @dan-dr。
- macOS：在本地模式下缺少全局 `openclaw` CLI 时提示安装；通过 `openclaw.ai/install-cli.sh` 安装（无引导）并使用外部 launchd/CLI 而不是嵌入式网关运行时。
- 文档：从 `gog calendar colors` 添加 gog 日历事件颜色 ID。(#715) — 感谢 @mjrussell。
- Cron/CLI：为 cron add/edit 命令添加 `--model` 标志。(#711) — 感谢 @mjrussell。
- Cron/CLI：在 cron 编辑时修剪模型覆盖并记录主会话指南。(#711) — 感谢 @mjrussell。
- 技能：捆绑 `skill-creator` 以指导创建和打包技能。
- 提供商：添加每 DM 历史限制覆盖（`dmHistoryLimit`），具有提供商级配置。(#728) — 感谢 @pkrmf。
- Discord：在消息工具中公开频道/类别管理操作。(#730) — 感谢 @NicholasSpisak。
- 文档：将 README "macOS 应用" 部分重命名为"应用"。(#733) — 感谢 @AbhisekBasu1。
- 网关：在 WebSocket 连接参数中需要 `client.id`；使用 `client.instanceId` 进行存在去重；更新文档/测试。
- macOS：删除仅附加的网关设置；本地模式现在始终管理 launchd，同时仍附加到现有的网关（如果存在）。

### 安装程序

- Postinstall：用内置 JS 补丁程序替换 `git apply`（适用于 npm/pnpm/bun；无 git 依赖）以及回归测试。
- Postinstall：当新补丁程序激活时跳过 pnpm 补丁回退。
- 安装程序测试：添加 root+非 root docker 烟雾、CI 工作流以获取 openclaw.ai 脚本并运行安装 sh/cli 并跳过引导。
- 安装程序 UX：支持 `CLAWDBOT_NO_ONBOARD=1` 以进行非交互式安装；修复 Linux 上的 npm 前缀并自动安装 git。
- 安装程序 UX：添加 `install.sh --help` 以及标志/环境和 git 安装提示。
- 安装程序 UX：添加 `--install-method git|npm` 并自动检测源签出（提示更新 git 签出 vs 迁移到 npm）。

### 修复

- 模型/引导：通过 Anthropic 兼容的 `/anthropic` 端点默认配置 MiniMax（minimax.io）（保留 `minimax-api` 作为旧版别名）。
- 模型：将 Gemini 3 Pro/Flash ID 规范化为预览名称以进行实时模型查找。(#769) — 感谢 @steipete。
- CLI：修复配置提示的 guardCancel 键入。(#769) — 感谢 @steipete。
- 网关/WebChat：在 WebSocket 关闭原因中包含握手验证详细信息以便更轻松地调试；保留关闭代码。
- 网关/认证：在关闭握手之前发送无效的连接响应；稳定无效的连接认证测试。
- 网关：收紧网关侦听器检测。
- Control UI：在配置时隐藏引导聊天并保护移动聊天侧边栏叠加层。
- 认证：读取钥匙串凭据并使查找平台感知。
- macOS/发布：避免在继电器构建中捆绑 dist 构件并仅从 zip-only 源生成 appcasts。
- Doctor：在报告中显示插件诊断。
- 插件：当包含 `package.json` + `openclaw.extensions` 时将 `plugins.load.paths` 目录条目视为包根；从配置目录加载插件包；不使用系统 tar 提取存档。
- 配置：在 `CLAWDBOT_CONFIG_PATH` 和常见路径状配置字段（包括 `plugins.load.paths`）中扩展 `~`；保护无效的 `$include` 路径。(#731) — 感谢 @pasogott。
- 代理：停止预创建会话转录本，以便第一条用户消息在 JSONL 历史中持久化。
- 代理：在会话工作区为只读时跳过预压缩内存刷新。
- 自动回复：除非消息仅为指令，否则忽略内联 `/status` 指令。
- 自动回复：将 `/think` 默认显示与模型推理默认值对齐。(#751) — 感谢 @gabriel-trigo。
- 自动回复：在工具边界上刷新块回复缓冲区。(#750) — 感谢 @sebslight。
- 自动回复：在 `SenderId` 为空时允许发送者回退以进行命令授权（WhatsApp 自聊天）。(#755) — 感谢 @juanpablodlc。
- 自动回复：将仅空白的发送者 ID 视为缺失以进行命令授权（WhatsApp 自聊天）。(#766) — 感谢 @steipete。
- 心跳：刷新提示文本以获取更新的默认值。
- 代理/工具：在 Windows 上使用 PowerShell 捕获系统实用程序输出。(#748) — 感谢 @myfunc。
- Docker：在严格模式下容忍未设置的可选环境变量。(#725) — 感谢 @petradonka。
- CLI/更新：在将覆盖传递给更新子进程时保留基础环境。(#713) — 感谢 @danielz1z。
- 代理：将消息工具错误视为失败，以便回退回复仍发送；要求 `to` + `message` 以进行 `action=send`。(#717) — 感谢 @theglove44。
- 代理：在仅工具轮次上保留推理项目。
- 代理/子代理：在完成之前等待，将等待超时与运行超时对齐，并使公告提示更有力。
- 代理：将子代理转录本路由到目标代理会话目录并添加回归覆盖。(#708) — 感谢 @xMikeMickelson。
- 代理/工具：在扁平化工具模式时保留操作枚举。(#708) — 感谢 @xMikeMickelson。
- 网关/代理：规范主会话别名以进行存储写入并添加回归覆盖。(#709) — 感谢 @xMikeMickelson。
- 代理：当自动压缩溢出时重置会话并重试，而不是使网关崩溃。
- 提供商/Telegram：规范化命令提及以进行一致的解析。(#729) — 感谢 @obviyus。
- 提供商：跳过非 DM 会话的 DM 历史限制处理。(#728) — 感谢 @pkrmf。
- 沙盒：修复非主模式错误地将主 DM 会话沙盒化并将 `/status` 运行时报告与有效的沙盒状态对齐。
- 沙盒/网关：当 `session.mainKey` 自定义时将 `agent:<id>:main` 视为向后兼容的主会话别名。
- 自动回复：快速路径白名单斜杠命令（内联 `/help`/`/commands`/`/status`/`/whoami` 在模型之前剥离）。

## 2026.1.10

### 亮点

- CLI: `openclaw status` 现在基于表格 + 显示 OS/更新/网关/守护进程/代理/会话；`status --all` 添加完整的只读调试报告（表格、日志尾部、Tailscale 摘要和通过 OSC-9 + 旋转器的扫描进度）。
- CLI 后端：添加具有恢复支持的 Codex CLI 回退（文本输出）和用于新运行的 JSONL 解析，以及实时 CLI 恢复探测。
- CLI：添加 `openclaw update`（安全的 git 签出更新）+ `--update` 简写。(#673) — 感谢 @fm1randa。
- 网关：添加 OpenAI 兼容的 `/v1/chat/completions` HTTP 端点（认证、SSE 流式传输、每代理路由）。(#680)。

### 变更

- 引导/模型：添加一级 Z.AI（GLM）认证选择（`zai-api-key`）+ `--zai-api-key` 标志。
- CLI/引导：在配置/引导中添加 OpenRouter API 密钥认证选项。(#703) — 感谢 @mteam88。
- 代理：添加人际延迟 pacing 模式（关闭/自然/自定义，每代理可配置）。(#446) — 感谢 @tony-freedomology。
- 代理/浏览器：添加 `browser.target`（沙盒/主机/自定义），具有沙盒主机控制门控通过 `agents.defaults.sandbox.browser.allowHostControl`、自定义控制 URL/主机/端口的白名单，并扩展浏览器工具文档（远程控制、配置文件、内部）。
- 引导/模型：将目录支持的默认模型选择器添加到引导 + 配置。(#611) — 感谢 @jonasjancarik。
- 代理/OpenCode Zen：更新回退模型 + 默认值，保留旧版别名映射。(#669) — 感谢 @magimetal。
- CLI：添加 `openclaw reset` 和 `openclaw uninstall` 流程（交互式 + 非交互式）以及 docker 清理烟雾测试。
- 提供商：将提供商接线移动到插件架构。(#661)。
- 提供商：统一跨提供商的群组历史上下文包装器，具有每提供商/每账户的 `historyLimit` 覆盖（回退到 `messages.groupChat.historyLimit`）。设置为 `0` 以禁用。(#672)。
- 网关/心跳：可选地交付心跳 `Reasoning:` 输出（`agents.defaults.heartbeat.includeReasoning`）。(#690)
- Docker：在 `docker-setup.sh` 中允许可选的 home 卷 + 额外绑定挂载。(#679) — 感谢 @gabriel-trigo。

### 修复

- 自动回复：抑制 `NO_REPLY`（静默系统操作）的草稿/打字流式传输，以免泄漏部分输出。
- CLI/状态：将表格扩展到完整终端宽度；澄清提供商设置 vs 运行时警告；更丰富的每提供商详细信息；`status` 中的令牌预览，同时保持 `status --all` 编辑；添加故障排除链接页脚；保持日志尾部可粘贴；在可访问时显示使用的网关认证；显示提供商运行时错误（Signal/iMessage/Slack）；加强 `tailscale status --json` 解析；使 `status --all` 扫描进度确定；并将页脚替换为 3 行"下一步"建议（共享/调试/探测）。
- CLI/网关：澄清 `openclaw gateway status` 报告 RPC 健康（连接 + RPC）并单独显示 RPC 失败与连接失败。
- CLI/更新：在标准输出 TTY 上门控进度旋转器并对齐清洁检查步骤标签。(#701) — 感谢 @bjesuiter。
- Telegram：添加 `/whoami` + `/id` 命令以揭示允许列表的发送者 ID；允许 `allowFrom` 提示中的 `@username` 和前缀 ID（具有稳定性警告）。
- 心跳：剥离标记包装的 `HEARTBEAT_OK`，以免确认泄漏到外部提供商（例如 Telegram）。
- Control UI：停止自动写入 `telegram.groups["*"]` 并在启用通配符组之前警告/确认。
- WhatsApp：仅为已处理的消息发送确认反应并忽略旧版 `messages.ackReaction`（doctor 复制到 `whatsapp.ackReaction`）。(#629) — 感谢 @pasogott。
- 沙盒/技能：将技能镜像到沙盒工作区以进行只读挂载，以便 SKILL.md 保持可访问。
- 终端/表格：ANSI 安全包装以防止表格裁剪/颜色丢失；添加回归覆盖。
- Docker：允许在镜像构建期间可选的 apt 包并记录构建参数。(#697) — 感谢 @gabriel-trigo。
- 网关/心跳：即使主心跳回复是 `HEARTBEAT_OK` 也交付推理。(#694) — 感谢 @antons。
- 代理/Pi：将配置 `temperature`/`maxTokens` 注入流式传输，而无需替换会话 streamFn；使用实时 maxTokens 探测覆盖。(#732) — 感谢 @peschee。
- macOS：在签名重启时清除未签名的 launchd 覆盖，并在设置仅附加/禁用标记时通过 doctor 警告。(#695) — 感谢 @jeffersonwarrior。
- 代理：强制执行单写入器会话锁并删除孤立的工具结果以防止工具调用 ID 失败（MiniMax/Anthropic 兼容 API）。
- 文档：将 `openclaw status` 作为第一个诊断步骤，澄清 `status --deep` 行为，并记录 `/whoami` + `/id`。
- 文档/测试：澄清实时工具+图像探测以及如何列出可测试的 `provider/model` ID。
- 测试/实时：使网关 bash+读取探测对提供商格式化具有弹性，同时仍验证真实工具调用。
- WhatsApp：使用 authDir 反向映射检测群组中的 @lid 提及 + 解析提及门控的自我 JID E.164。(#692) — 感谢 @peschee。
- 网关/认证：在引导期间默认为环回上的令牌认证，添加 doctor 令牌生成流程，并将音频转录配置收紧为仅 Whisper。
- 提供商：跨提供商对入站消息进行去重，以避免在重新交付/重新连接时出现重复的 LLM 运行。(#689) — 感谢 @adam91holt。
- 代理：从隐藏推理输出中剥离 `<thought>`/`<antthinking>` 标签并在测试中覆盖标签变体。(#688) — 感谢 @theglove44。
- macOS：将模型选择器选择保存为规范化的提供商/模型 ID 并保持手动条目对齐。(#683) — 感谢 @benithors。
- 代理：将"使用限制"错误识别为速率限制以进行故障转移。(#687) — 感谢 @evalexpr。
- CLI：在跳过守护进程重启时避免成功消息。(#685) — 感谢 @carlulsoe。
- 命令：默认禁用 `/config` + `/debug`；通过 `commands.config`/`commands.debug` 门控并从原生注册/帮助输出中隐藏。
- 代理/系统：澄清子代理保持沙盒化，无法使用提升的主机访问。
- 网关：默认禁用 OpenAI 兼容的 `/v1/chat/completions` 端点；通过 `gateway.http.endpoints.chatCompletions.enabled=true` 启用。
- macOS：稳定桥接隧道，在断开连接时保护调用发送者，并排空 stdout/stderr 以避免死锁。(#676) — 感谢 @ngutman。
- 代理/系统：在系统提示中澄清沙盒化运行时，并在沙盒化时显示提升的可用性。
- 自动回复：首选命令/指令解析的 `RawBody`（WhatsApp + Discord）并防止回退运行破坏并发的会话更新。(#643) — 感谢 @mcinteerj。
- WhatsApp：通过保留历史中的消息 ID 和发送者 JID 修复群组反应；规范化出站反应中的参与者电话号码为 JID。(#640) — 感谢 @mcinteerj。
- WhatsApp：向模型公开群组参与者 ID，以便反应可以定位正确的发送者。
- Cron：`wakeMode: "now"` 等待心跳完成（并在主通道繁忙时重试）。(#666) — 感谢 @roshanasingh4。
- 代理/OpenAI：修复 Responses 仅工具 → 后续轮次处理（避免触发 400 "必需后续项目"的独立 `reasoning` 项目）并在 Responses/Codex Responses 历史中重放仅工具调用轮次的推理项目。
- 沙盒：添加 `openclaw sandbox explain`（有效策略检查器 + 修复密钥）；使用可操作配置密钥路径改进"沙盒监狱"工具策略/提升错误；链接到文档。
- 钩子/Gmail：将 Tailscale serve 路径保持在 `/` 同时保留公共路径。(#668) — 感谢 @antons。
- 钩子/Gmail：允许 Tailscale 目标 URL 保留内部服务路径。
- 认证：在刷新同步期间原地更新 Claude Code 钥匙串凭据；共享 JSON 文件帮助程序；添加 CLI 回退覆盖。
- 认证：限制外部 CLI 凭据同步（Claude/Codex）、减少钥匙串读取并在缓存的凭据仍然新鲜时跳过同步。
- CLI：遵守 `CLAWDBOT_STATE_DIR` 以进行节点配对 + 语音唤醒设置存储。(#664) — 感谢 @azade-c。
- 引导/网关：在配置中持久化非交互式网关令牌认证；添加 WS 向导 + 网关工具调用回归覆盖。
- 网关/Control UI：使 `chat.send` 非阻塞，将 Stop 连接到 `chat.abort`，并将 `/stop` 视为带外中止。(#653)
- 网关/Control UI：允许没有 `runId` 的 `chat.abort`（中止活动运行），抑制中止后的聊天流式传输，并修剪卡住的聊天运行。(#653)
- 网关/Control UI：为 chat.send 嗅探图像附件，删除非图像并记录不匹配。(#670) — 感谢 @cristip73。
- macOS：强制 `restart-mac.sh --sign` 需要身份并保持捆绑的 Node 签名以进行继电器验证。(#580) — 感谢 @jeffersonwarrior。
- 网关/代理：接受 `agent` 上的图像附件（多模态消息）并添加实时网关图像探测（`CLAWDBOT_LIVE_GATEWAY_IMAGE_PROBE=1`）。
- CLI：`openclaw sessions` 现在在表格输出中包含 `elev:*` + `usage:*` 标志。
- CLI/配对：接受 `pairing list|approve` 的位置提供商（npm-run 兼容）；更新文档/机器人提示。
- 品牌：将旧版大小写/品牌规范化为"OpenClaw"（CLI、状态、文档）。
- 自动回复：修复原生 `/model` 不更新实际聊天会话（Telegram/Slack/Discord）。(#646)
- Doctor：在 git 安装时首先提供运行 `openclaw update`（保持 doctor 输出与最新版本对齐）。
- Doctor：当安装目录是 `~/openclaw` 时避免误报的旧版工作区警告。(#660)
- iMessage：修复跨 DM 的推理持久化；在启用推理时避免部分/重复回复。(#655) — 感谢 @antons。
- 模型/认证：允许没有 `models.providers.minimax.apiKey` 的 MiniMax API 配置（认证配置文件 / `MINIMAX_API_KEY`）。(#656) — 感谢 @mneves75。
- 代理：避免消息工具发送时的重复回复。(#659) — 感谢 @mickahouan。
- 代理：加强 Cloud Code Assist 工具 ID 清理（toolUse/toolCall/toolResult）并清理额外的 JSON Schema 约束。(#665) — 感谢 @sebslight。
- 代理/工具：在上下文构建时清理工具结果 + Cloud Code Assist 工具 ID（防止运行时中严格提供商请求拒绝）。
- 代理/工具：解析相对于工作区的读取/写入/编辑路径；对齐 bash 默认 cwd。(#642) — 感谢 @mukhtharcm。
- Discord：在代理会话上下文中包含转发的消息快照。(#667) — 感谢 @rubyrunsstuff。
- Telegram：添加 `telegram.draftChunk` 以调整 `streamMode: "block"` 的草稿流式分块。(#667) — 感谢 @rubyrunsstuff。
- 测试/代理：添加工作区工具路径解析和 bash cwd 默认值的回归覆盖。
- iOS/Android：启用更严格的并发/lint 检查；修复 Swift 6 严格并发问题 + Android lint 错误（ExifInterface、过时的 SDK 检查）。(#662) — 感谢 @KristijanJovanovski。
- 认证：在回退到 `~/.codex/auth.json` 之前在 macOS 上读取 Codex CLI 钥匙串令牌，防止陈旧的刷新令牌破坏网关实时测试。
- iOS/macOS：共享 `AsyncTimeout`，在连接时需要显式的 `bridgeStableID`，并强化工具显示默认值（避免缺失资源标签回退）。
- Telegram：序列化媒体组处理以避免在负载下丢失相册。
- Signal：处理 `dataMessage.reaction` 事件（signal-cli SSE）以避免损坏的附件错误。(#637) — 感谢 @neist。
- 文档：展示 ParentPay、R2 Upload、iOS TestFlight 和 Oura Health 的条目。(#650) — 感谢 @henrino3。
- 代理：通过删除整个历史中的重复工具结果来修复会话转录本（在重试后解锁 Anthropic 兼容 API）。
- 测试/实时：在模型运行之间重置网关会话，以避免跨提供商转录本不兼容（特别是 OpenAI Responses 推理重放规则）。

## 2026.1.9

### 亮点

- Microsoft Teams 提供商：轮询、附件、出站 CLI 发送、每频道策略。
- 模型/认证扩展：OpenCode Zen + MiniMax API 引导；令牌认证配置文件 + 认证顺序；doctor/status 中的 OAuth 健康。
- CLI/网关 UX：消息子命令、网关发现/状态/SSH、/config + /debug、沙盒 CLI。
- 提供商可靠性扫描：WhatsApp 联系人卡片/目标、Telegram 音频作为语音 + 流式传输、Signal 反应、Slack 线程、Discord 稳定性。
- 自动回复 + 状态：块流式控制、推理处理、使用/成本报告。
- Control UI/TUI：排队消息、会话链接、推理视图、移动润色、日志 UX。

### 破坏性变更

- CLI：`openclaw message` 现在是子命令（`message send|poll|...`），除非只配置了一个提供商，否则需要 `--provider`。
- 命令/工具：默认禁用 `/restart` 和网关重启工具；使用 `commands.restart=true` 启用。

### 新功能和变更

- 模型/认证：OpenCode Zen 引导 (#623) — 感谢 @magimetal；MiniMax Anthropic 兼容 API + 托管引导 (#590、#495) — 感谢 @mneves75、@tobiasbischoff。
- 模型/认证：setup-token + 令牌认证配置文件；`openclaw models auth order {get,set,clear}`；`/model status` 中的每代理认证候选；doctor/status 中的 OAuth 到期检查。
- 代理/系统：claude-cli 运行器；`session_status` 工具（和沙盒允许）；自适应上下文修剪默认值；系统提示消息指南 + 无自动自我更新；符合条件的技能列表注入；子代理上下文修剪。
- 命令：`/commands` 列表；`/models` 别名；`/usage` 别名；`/debug` 运行时覆盖 + 有效配置视图；`/config` 聊天更新 + `/config get`；`config --section`。
- CLI/网关：统一的消息工具 + 消息子命令；网关发现（本地 + 广域 DNS-SD）具有 JSON/超时；网关状态人类可读 + JSON + SSH 环回；广域记录包括 gatewayPort/sshPort/cliPath + tailnet DNS 回退。
- CLI UX：日志输出模式（漂亮/纯文本/JSONL）+ 彩色健康/守护进程输出；全局 `--no-color`；引导/配置中的龙虾调色板。
- 开发人体工程学：网关 `--dev/--reset` + 开发配置文件自动配置；C-3PO 开发模板；开发网关/TUI 帮助程序脚本。
- 沙盒/工作区：沙盒列表/重新创建命令；将技能同步到沙盒工作区；沙盒浏览器自动启动。
- 配置/引导：内联环境变量；OpenAI API 密钥流到共享的 `~/.openclaw/.env`；Anthropic 认证的 Opus 4.5 默认提示；QuickStart 自动安装网关（仅 Node）+ 提供商选择器调整 + 跳过 systemd 标志；TUI 引导提示（`tui --message`）；删除 Bun 运行时选择。
- 提供商：Microsoft Teams 提供商（轮询、附件、出站发送、requireMention、配置重新加载/DM 策略）。(#404) — 感谢 @onutc
- 提供商：WhatsApp 多代理回复的广播群组 (#547) — 感谢 @pasogott；可配置的入站媒体大小上限 (#505) — 感谢 @koala73；基于身份的消息前缀 (#578) — 感谢 @p6l-richard。
- 提供商：Telegram 内联键盘按钮 + 回调 payload 路由 (#491) — 感谢 @azade-c；cron 话题交付目标 (#474/#478) — 感谢 @mitschabaude-bot、@nachoiacovino；`[[audio_as_voice]]` 标签支持 (#490) — 感谢 @jarvis-medmatic。
- 提供商：具有白名单支持的 Signal 反应 + 通知。
- 状态/使用：`/status` 成本报告 + `/cost` 行；认证配置文件片段；提供商使用窗口。
- Control UI：移动响应式 (#558) — 感谢 @carlulsoe；排队消息 + Enter 发送 (#527) — 感谢 @YuriNachos；会话链接 (#471) — 感谢 @HazAT；推理视图；技能安装反馈 (#445) — 感谢 @pkrmf；聊天布局刷新 (#475) — 感谢 @rahthakor；文档链接 + 新会话按钮；删除显式的 `ui:install`。
- TUI：代理选择器 + 代理列表 RPC；改进的状态行。
- Doctor/守护进程：审计/修复流程、权限检查、主管配置审计；提供商状态探测 + Discord 意图和 Telegram 隐私警告；最后活动时间戳；网关重启指南。
- 文档：Hetzner Docker VPS 指南 + 交叉链接 (#556/#592) — 感谢 @Iamadig；Ansible 指南 (#545) — 感谢 @pasogott；提供商故障排除索引；钩子参数扩展 (#532) — 感谢 @mcinteerj；模型白名单说明；OAuth 深度挖掘；展示刷新。
- 应用/品牌：刷新的 iOS/Android/macOS 图标 (#521) — 感谢 @fishfisher。

### 修复

- 打包：在 npm tarball 中包含 MS Teams 发送模块。
- 沙盒/浏览器：为工具/CLI 中的高效快照自动启动 CDP 端点；从容器中代理 CDP 以进行 attachOnly；放宽 Bun 获取键入；将沙盒列表输出与配置镜像对齐。
- 代理/运行时：将心跳提示门控到默认会话；/stop 中止工具调用之间；需要显式的系统事件会话密钥；保护小上下文窗口；修复模型回退字符串化；sessions_spawn 继承提供商；计费/信用故障转移；尊重认证冷却排序；恢复 Anthropic OAuth 工具调度 + 工具名称绕过；避免 OpenAI 无效推理重放；加强 Gmail 钩子模型默认值。
- 代理历史/模式：剥离/跳过空的助手/错误块以防止会话损坏/Claude 400；清理不受支持的 JSON Schema 关键字 + 清理 Cloud Code Assist 的工具调用 ID；简化 Gemini 兼容的工具/会话模式；需要 config.apply 的原始值。
- 自动回复/流式传输：默认 audioAsVoice 为 false；保留 audio_as_voice 传播 + 缓冲音频块 + 保护语音笔记；块回复排序（超时）+ 强制块围栏安全；避免括号内部分块 + 围栏关闭中断 + 无效的 UTF-16 截断；保留内联指令间距 + 允许回复标签中的空白；过滤 NO_REPLY 前缀 + 规范化路由回复；使用单独的推理抑制 <think> 泄漏；块流式默认值（默认关闭、minChars/idle 调整）+ 合并块；去重跟进队列；恢复显式的 responsePrefix 默认值。
- 状态/命令：`/status` 模型显示中的提供商前缀；使用过滤 + 提供商映射；认证标签 + 使用快照（claude-cli 回退 + 可选的 claude.ai）；仅在启用时显示详细/提升；紧凑使用/成本行 + 恢复表情符号丰富的状态；仅指令中的 `/status` + 多指令处理；提及绕过提升处理；显示提供商使用错误；将 /usage 连接到 /status；恢复隐藏的网关守护进程别名；目录不可用时回退 /model 列表。
- WhatsApp：vCard/联系人卡片（首选 FN、包含号码、显示所有联系人、保留摘要计数、更好的空摘要）；保留群组 JID + 规范化目标；解析 @lid 映射/JID（Baileys/auth-dir）+ 入站映射；将排队回复路由到发送者；改进 web 侦听器错误 + 从错误中删除提供商名称；记录出站活动账户 ID；修复 web 媒体获取错误；广播群组历史一致性。
- Telegram：保持 streamMode 仅草稿；长轮询冲突重试 + 更新去重；grammY 获取不匹配修复 + 将原生获取限制为 Bun；抑制 getUpdates 堆栈跟踪；在配对中包含用户 ID；audio_as_voice 处理修复。
- Discord/Slack：线程上下文帮助程序 + 论坛线程启动器；避免类别父级覆盖；网关重新连接日志 + HELLO 超时 + 耗尽后停止提供商；数字 ID 的 DM 收件人解析；删除不正确的有限警告；回复线程 + mrkdwn 边缘情况；回复后删除确认反应；网关调试事件可见性。
- Signal：反应处理安全；自己的反应匹配（uuid+电话）；接受仅 UUID 的发送者；忽略仅反应的消息。
- MS Teams：可靠下载图像附件；修复顶级回复；关闭时停止 + 遵守块限制；规范化轮询提供商/依赖项；配对标签修复。
- iMessage：通过 chat_id 隔离类似群组的线程。
- 网关/守护进程/Doctor：原子配置写入；修复网关服务入口点 + 安装开关；非交互式旧版迁移；systemd 单元对齐 + KillMode=进程；节点桥接 keepalive/ping；登录时启动持久化；捆绑 MoltbotKit 资源 + Swift 6.2 兼容 dylib；继电器版本检查 + 删除烟雾测试；再生 Swift GatewayModels 并保持代理提供商字符串；cron jobId 别名 + 频道别名迁移 + 主会话密钥规范化；心跳 Telegram accountId 解析；避免 WhatsApp 内部运行的回退；网关侦听器错误措辞；serveBaseUrl 参数；遵守网关 --dev；修复广域发现更新；对齐 agents.defaults 模式；守护进程状态中的提供商账户元数据；刷新网关修复的 Carbon 补丁；恢复 doctor 提示器 initialValue 处理。
- Control UI/TUI：持久化每会话详细关闭 + 隐藏工具卡片；日志选项卡在底部打开；相对资源路径 + 落地页清理；会话标签查找/持久化；停止在最近的中固定主会话；从底部开始日志；TUI 状态栏刷新 + 超时处理 + 关闭时隐藏推理标签。
- 引导/配置：QuickStart 单选提供商选择器；避免 Codex CLI 错误过期警告；澄清 WhatsApp 所有者提示；修复 Minimax 托管引导（agents.defaults + msteams 心跳目标）；删除配置 Control UI 提示；遵守网关 --dev 标志。

### 维护

- 依赖项：将 pi-\* 堆栈升级到 0.42.2。
- 依赖项：Pi 0.40.0 升级 (#543) — 感谢 @mcinteerj。
- 构建：Docker 构建缓存层 (#605) — 感谢 @zknicker。

- 认证：为 Claude Code CLI 凭据（`anthropic:claude-cli`）启用 OAuth 令牌刷新，具有双向同步回 Claude Code 存储（Linux/Windows 上的文件、macOS 上的钥匙串）。这允许长时间运行的代理自主运行而无需手动重新认证 (#654 — 感谢 @radek-paclt)。

## 2026.1.8

### 亮点

- 安全：DM 默认锁定跨提供商；配对优先 + 白名单指南。
- 沙盒：每代理范围默认值 + 工作区访问控制；工具/会话隔离调整。
- 代理循环：压缩、修剪、流式传输和错误处理加固。
- 提供商：Telegram/WhatsApp/Discord/Slack 可靠性、线程、反应、媒体和重试改进。
- Control UI：日志选项卡、流式传输稳定性、专注模式和大型输出渲染修复。
- CLI/网关/Doctor：守护进程/日志/状态、认证迁移和诊断显著扩展。

### 破坏性变更

- **安全（尽快更新）：** 入站 DM 现在默认在 Telegram/WhatsApp/Signal/iMessage/Discord/Slack 上**锁定**。
  - 以前，如果您没有配置白名单，您的机器人可能对**任何人**开放（特别是可发现的 Telegram 机器人）。
  - 新默认值：DM 配对（`dmPolicy="pairing"` / `discord.dm.policy="pairing"` / `slack.dm.policy="pairing"`）。
  - 要保持旧的"对所有人开放"行为：设置 `dmPolicy="open"` 并在相关的 `allowFrom` 中包含 `"*"`（Discord/Slack：`discord.dm.allowFrom` / `slack.dm.allowFrom`）。
  - 通过 `openclaw pairing list <provider>` + `openclaw pairing approve <provider> <code>` 批准请求。
- 沙盒：默认 `agent.sandbox.scope` 为 `"agent"`（每个代理一个容器/工作区）。使用 `"session"` 以进行每会话隔离；`"shared"` 禁用跨会话隔离。
- 代理信封中的时间戳现在为 UTC（紧凑的 `YYYY-MM-DDTHH:mmZ`）；删除 `messages.timestampPrefix`。添加 `agent.userTimezone` 以告诉模型用户的本地时间（仅系统提示）。
- 模型配置模式更改（认证配置文件 + 模型列表）；doctor 自动迁移，网关在启动时重写旧版配置。
- 命令：将所有斜杠命令门控给授权发送者；添加 `/compact` 以手动压缩会话上下文。
- 群组：当设置时，`whatsapp.groups`、`telegram.groups` 和 `imessage.groups` 现在充当白名单。添加 `"*"` 以保持允许所有行为。
- 自动回复：从 Discord/Slack/Telegram 频道配置中删除 `autoReply`；改用 `requireMention`（Telegram 话题现在支持 `requireMention` 覆盖）。
- CLI：删除 `update`、`gateway-daemon`、`gateway {install|uninstall|start|stop|restart|daemon status|wake|send|agent}` 和 `telegram` 命令；将 `login/logout` 移动到 `providers login/logout`（隐藏顶级别名）；使用 `daemon` 进行服务控制，`send`/`agent`/`wake` 进行 RPC，`nodes canvas` 进行画布操作。

### 修复

- **CLI/网关/Doctor：** 守护进程运行时选择 + 改进的日志/状态/健康/错误；本地 CLI 的认证/密码处理；更丰富的关闭/超时详细信息；自动迁移旧版配置/会话/状态；完整性检查 + 修复提示；`--yes`/`--non-interactive`；`--deep` 网关扫描；更好的重启/服务提示。
- **代理循环 + 压缩：** 压缩/修剪调整、溢出处理、更安全的引导上下文和每提供商线程/确认；选择加入的工具结果修剪 + 紧凑跟踪。
- **沙盒 + 工具：** 每代理沙盒覆盖、workspaceAccess 控制、会话工具可见性、工具策略覆盖、进程隔离和工具模式/超时/反应统一。
- **提供商（Telegram/WhatsApp/Discord/Slack/Signal/iMessage）：** 重试/退避、线程、反应、媒体组/附件、提及门控、打字行为和错误/日志稳定性；Telegram 的长轮询 + 论坛话题隔离。
- **网关/CLI UX：** `openclaw logs`、cron 列表颜色/别名、文档搜索、代理列表/添加/删除流程、状态使用快照、运行时/认证源显示和 `/status`/命令认证统一。
- **Control UI/Web：** 日志选项卡、专注模式润色、配置表单弹性、流式传输稳定性、工具输出上限、窗口聊天历史和重新连接/密码 URL 认证。
- **macOS/Android/TUI/构建：** macOS 网关竞争、QR 捆绑、JSON5 配置安全、语音唤醒加固；Android EXIF 旋转 + APK 命名/版本控制；TUI 键处理；工具/捆绑修复。
- **打包/兼容性：** npm dist 文件夹覆盖、Node 25 qrcode-terminal 导入修复、Bun/Playwright/WebSocket 补丁和 Docker Bun 安装。
- **文档：** 新的 FAQ/ClawHub/配置示例/展示条目和澄清的认证、沙盒和 systemd 文档。

### 维护

- 技能添加（Himalaya 电子邮件、CodexBar、1Password）。
- 依赖项刷新（pi-\* 堆栈、Slack SDK、discord-api-types、file-type、zod、Biome、Vite）。
- 重构：集中化的群组白名单/提及策略；lint/导入清理；切换 tsx → bun 以进行 TS 执行。

## 2026.1.5

### 亮点

- 模型：添加特定于图像的模型配置（`agent.imageModel` + 回退）和扫描支持。
- 代理工具：新的 `image` 工具路由到图像模型（配置时）。
- 配置：默认模型简写（`opus`、`sonnet`、`gpt`、`gpt-mini`、`gemini`、`gemini-flash`）。
- 文档：记录内置模型简写 + 优先级（用户配置获胜）。
- Bun：可选的本地安装/构建工作流，无需维护 Bun 锁定文件（参见 `docs/bun.md`）。

### 修复

- Control UI：在工具结果卡片中渲染 Markdown。
- Control UI：防止窄布局中 Discord 公会规则的重叠操作按钮。
- Android：点击前台服务通知将应用带到前台。(#179) — 感谢 @Syhids
- Cron 工具使用 `id` 进行 update/remove/run/runs（与网关参数对齐）。(#180) — 感谢 @adamgall
- Control UI：聊天视图使用页面滚动与固定标题/侧边栏和固定作曲家（无内部滚动框架）。
- macOS：将位置权限视为仅始终以避免 iOS 专用枚举。(#165) — 感谢 @Nachx639
- macOS：使生成的网关协议模型为 `Sendable` 以进行 Swift 6 严格并发。(#195) — 感谢 @andranik-sahakyan
- macOS：捆绑 QR 码渲染器模块，以便 DMG 网关启动不会因缺少 qrcode-terminal 供应商文件而崩溃。
- macOS：安全解析 JSON5 配置，以避免在存在注释时擦除用户设置。
- WhatsApp：在心跳后台任务期间抑制打字指示器。(#190) — 感谢 @mcinteerj
- WhatsApp：将离线历史同步消息标记为已读而不自动回复。(#193) — 感谢 @mcinteerj
- Discord：避免在提供商发出延迟流式传输 `text_end` 事件时出现重复回复（OpenAI/GPT）。
- CLI：当绑定为 tailnet/自动时将 tailnet IP 用于本地网关调用（修复 #176）。
- 环境：加载全局 `$OPENCLAW_STATE_DIR/.env`（`~/.openclaw/.env`）作为 CWD `.env` 之后的回退。
- 环境：可选的登录 shell 环境回退（选择加入；导入预期的密钥而不覆盖现有的环境）。
- 代理工具：OpenAI 兼容的工具 JSON 模式（修复 `browser`、规范化联合模式）。
- 引导：从源运行时，自动构建缺失的 Control UI 资源（`bun run ui:build`）。
- Discord/Slack：将反应 + 系统通知路由到正确的会话（无主会话泄漏）。
- 代理工具：即使沙盒关闭也遵守 `agent.tools` 允许/拒绝策略。
- Discord：避免在 OpenAI 发出重复的 `message_end` 事件时出现重复回复。
- 命令：统一 /status（内联）和跨提供商的命令认证；授权控制命令的群组绕过；删除 Discord /clawd 斜杠处理程序。
- CLI：默认通过网关运行 `openclaw agent`；使用 `--local` 强制嵌入式模式。
