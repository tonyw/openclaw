import type { ClawdbotConfig } from "openclaw/plugin-sdk";

export type TencentIMConfig = {
  enabled?: boolean;
  sdkAppId?: string;
  // Secret key for generating UserSig dynamically (preferred)
  secretKey?: string;
  // Pre-generated UserSig (alternative to secretKey)
  userSig?: string;
  // Admin account for REST API calls (optional, defaults to userId)
  adminUserId?: string;
  // Default sender user (can be any user)
  userId?: string;
  connectionMode?: "websocket" | "webhook";
  webhookPort?: number;
  webhookPath?: string;
  dmPolicy?: "open" | "pairing" | "allowlist";
  allowFrom?: (string | number)[];
  groupPolicy?: "open" | "allowlist" | "disabled";
  groupAllowFrom?: (string | number)[];
  requireMention?: boolean;
  textChunkLimit?: number;
  mediaMaxMb?: number;
  accounts?: Record<string, Omit<TencentIMConfig, "accounts">>;
};

export type ResolvedTencentAccount = {
  accountId: string;
  enabled: boolean;
  configured: boolean;
  name?: string;
  sdkAppId: string;
  // Secret key for generating UserSig
  secretKey?: string;
  // Pre-generated UserSig (fallback)
  userSig: string;
  // Admin account for API calls (optional)
  adminUserId: string;
  // Default sender
  userId: string;
  connectionMode: "websocket" | "webhook";
  webhookPort?: number;
  webhookPath: string;
  dmPolicy: "open" | "pairing" | "allowlist";
  allowFrom: string[];
  groupPolicy: "open" | "allowlist" | "disabled";
  groupAllowFrom: string[];
  requireMention: boolean;
  textChunkLimit: number;
  mediaMaxMb: number;
  config?: TencentIMConfig;
};

export type TencentIMMessageEvent = {
  message: TIMMessage;
};

export type TIMMessage = {
  ID: string;
  conversationID: string;
  conversationType: string;
  from: string;
  to: string;
  flow: "in" | "out";
  time: number;
  sequence: number;
  type: string;
  payload: {
    text?: string;
    description?: string;
    data?: string;
    [key: string]: unknown;
  };
  nick?: string;
  avatar?: string;
  atUserList?: string[];
  isPeerRead?: boolean;
  cloudCustomData?: string;
};

export type TencentIMGroupInfo = {
  groupID: string;
  name: string;
  type: string;
  notification?: string;
  avatar?: string;
  memberCount?: number;
};

export type TencentIMUserInfo = {
  userID: string;
  nick?: string;
  avatar?: string;
  remark?: string;
};

export function getTencentIMConfig(cfg: ClawdbotConfig): TencentIMConfig | undefined {
  return (cfg.channels as Record<string, TencentIMConfig> | undefined)?.["tencent-im"];
}
