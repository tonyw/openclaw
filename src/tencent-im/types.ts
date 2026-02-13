/**
 * Tencent IM types
 */

import type { OpenClawConfig } from "../config/config.js";

export type TencentIMConfig = {
  enabled?: boolean;
  sdkAppId?: string;
  secretKey?: string;
  userSig?: string;
  adminUserId?: string;
  webhookPort?: number;
  webhookPath?: string;
  webhookSecret?: string;
  webhookUrl?: string;
  dmPolicy?: "open" | "pairing" | "allowlist" | "disabled";
  allowFrom?: (string | number)[];
  groupPolicy?: "open" | "allowlist" | "disabled";
  groupAllowFrom?: (string | number)[];
  requireMention?: boolean;
  textChunkLimit?: number;
  mediaMaxMb?: number;
  accounts?: Record<string, Omit<TencentIMConfig, "accounts">>;
};

export type TencentIMWebhookEvent = {
  CallbackCommand?: string;
  From_Account?: string;
  To_Account?: string;
  GroupId?: string;
  From_Group?: string;
  MsgBody?: Array<{
    MsgType: string;
    MsgContent: Record<string, unknown>;
  }>;
  MsgRandom?: number;
  MsgSeq?: number;
  MsgTime?: number;
  MsgKey?: string;
  EventTime?: number;
  [key: string]: unknown;
};

export type TencentIMParsedMessage = {
  type: "text" | "other";
  text: string;
  from: string;
  to: string;
  isGroup: boolean;
  groupId?: string;
  flow: "in" | "out";
  timestamp: number;
  /** List of users that were @mentioned in the message */
  atUserList?: string[];
  raw: TencentIMWebhookEvent;
};

export function getTencentIMConfig(cfg: OpenClawConfig): TencentIMConfig | undefined {
  return cfg.channels?.["tencent-im"];
}
