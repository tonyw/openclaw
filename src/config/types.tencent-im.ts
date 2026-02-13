import type {
  BlockStreamingChunkConfig,
  BlockStreamingCoalesceConfig,
  DmPolicy,
  GroupPolicy,
  MarkdownConfig,
  OutboundRetryConfig,
  ReplyToMode,
} from "./types.base.js";
import type { ChannelHeartbeatVisibilityConfig } from "./types.channels.js";
import type { DmConfig, ProviderCommandsConfig } from "./types.messages.js";
import type { GroupToolPolicyConfig, GroupToolPolicyBySenderConfig } from "./types.tools.js";

export type TencentIMAccountConfig = {
  /** Optional display name for this account (used in CLI/UI lists). */
  name?: string;
  /** Markdown formatting overrides (tables). */
  markdown?: MarkdownConfig;
  /** Override native command registration for Tencent IM (bool or "auto"). */
  commands?: ProviderCommandsConfig;
  /** Allow channel-initiated config writes (default: true). */
  configWrites?: boolean;
  /**
   * Controls how Tencent IM direct chats (C2C) are handled:
   * - "pairing" (default): unknown senders get a pairing code; owner must approve
   * - "allowlist": only allow senders in allowFrom (or paired allow store)
   * - "open": allow all inbound DMs (requires allowFrom to include "*")
   * - "disabled": ignore all inbound C2C messages
   */
  dmPolicy?: DmPolicy;
  /** If false, do not start this Tencent IM account. Default: true. */
  enabled?: boolean;
  /** Tencent Cloud SDKAppID */
  sdkAppId?: string;
  /** Tencent Cloud SecretKey */
  secretKey?: string;
  /** Admin User ID (default: "administrator") */
  adminUserId?: string;
  /**
   * User ID for the bot account (defaults to adminUserId).
   * This is the identifier used when sending messages.
   */
  userId?: string;
  /**
   * Pre-generated UserSig (if not provided, will be generated from secretKey).
   * Note: UserSig expires after 180 days by default.
   */
  userSig?: string;
  /**
   * Connection mode for receiving messages:
   * - "webhook" (default): HTTP callback mode, Tencent pushes messages to your server
   * - "websocket": WebSocket mode (not yet implemented)
   */
  connectionMode?: "webhook" | "websocket";
  /** Control reply threading when reply tags are present (off|first|all). */
  replyToMode?: ReplyToMode;
  /** Group configuration for Tencent IM */
  groups?: Record<string, TencentIMGroupConfig>;
  /** Allowlist for direct messages */
  allowFrom?: Array<string | number>;
  /** Optional allowlist for Tencent IM group senders (user IDs). */
  groupAllowFrom?: Array<string | number>;
  /**
   * Controls how group messages are handled:
   * - "open": groups bypass allowFrom, only mention-gating applies
   * - "disabled": block all group messages entirely
   * - "allowlist": only allow group messages from senders in groupAllowFrom/allowFrom
   */
  groupPolicy?: GroupPolicy;
  /**
   * Require @mention in group chats for the bot to respond.
   * When true, the bot will only reply when explicitly mentioned.
   * Default: false
   */
  requireMention?: boolean;
  /** Max group messages to keep as history context (0 disables). */
  historyLimit?: number;
  /** Max DM turns to keep as history context. */
  dmHistoryLimit?: number;
  /** Per-DM config overrides keyed by user ID. */
  dms?: Record<string, DmConfig>;
  /** Outbound text chunk size (chars). Default: 4000. */
  textChunkLimit?: number;
  /** Chunking mode: "length" (default) splits by size; "newline" splits on every newline. */
  chunkMode?: "length" | "newline";
  /** Disable block streaming for this account. */
  blockStreaming?: boolean;
  /** Chunking config for draft streaming in `streamMode: "block"`. */
  draftChunk?: BlockStreamingChunkConfig;
  /** Merge streamed block replies before sending. */
  blockStreamingCoalesce?: BlockStreamingCoalesceConfig;
  /** Draft streaming mode for Tencent IM (off|partial|block). Default: partial. */
  streamMode?: "off" | "partial" | "block";
  /** Max media size in MB. */
  mediaMaxMb?: number;
  /** Tencent IM API client timeout in seconds. */
  timeoutSeconds?: number;
  /** Retry policy for outbound Tencent IM API calls. */
  retry?: OutboundRetryConfig;
  /** Webhook port (default: 12000). */
  webhookPort?: number;
  /** Webhook path (default: "/webhook"). */
  webhookPath?: string;
  /** Webhook secret for signature verification. */
  webhookSecret?: string;
  /** Public webhook URL (for Tencent callback configuration). */
  webhookUrl?: string;
  /** Heartbeat visibility settings for this channel. */
  heartbeat?: ChannelHeartbeatVisibilityConfig;
  /**
   * Per-channel outbound response prefix override.
   *
   * When set, this takes precedence over the global `messages.responsePrefix`.
   * Use `""` to explicitly disable a global prefix for this channel.
   * Use `"auto"` to derive `[{identity.name}]` from the routed agent.
   */
  responsePrefix?: string;
};

export type TencentIMGroupConfig = {
  requireMention?: boolean;
  /** Per-group override for group message policy (open|disabled|allowlist). */
  groupPolicy?: GroupPolicy;
  /** Optional tool policy overrides for this group. */
  tools?: GroupToolPolicyConfig;
  toolsBySender?: GroupToolPolicyBySenderConfig;
  /** If specified, only load these skills for this group. Omit = all skills; empty = no skills. */
  skills?: string[];
  /** If false, disable the bot for this group. */
  enabled?: boolean;
  /** Optional allowlist for group senders (ids or usernames). */
  allowFrom?: Array<string | number>;
  /** Optional system prompt snippet for this group. */
  systemPrompt?: string;
};

export type TencentIMConfig = {
  /** Optional per-account Tencent IM configuration (multi-account). */
  accounts?: Record<string, TencentIMAccountConfig>;
} & TencentIMAccountConfig;
