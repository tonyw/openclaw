/**
 * Tencent IM types
 */

import type { TencentIMConfig as BaseTencentIMConfig } from "openclaw/plugin-sdk/tencent-im";

export type TencentIMConfig = BaseTencentIMConfig & {
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
