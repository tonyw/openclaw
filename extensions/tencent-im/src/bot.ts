import type { ClawdbotConfig, RuntimeEnv, HistoryEntry } from "openclaw/plugin-sdk";
import type { ResolvedTencentAccount, TIMMessage } from "./types.js";
import { resolveTencentAccount } from "./accounts.js";
import { CONV_C2C, CONV_GROUP, MSG_TEXT, MSG_IMAGE, MSG_FILE, MSG_CUSTOM } from "./client.js";
import { sendMessageTencentIM } from "./send-rest.js";
import { normalizeTencentTarget, formatTencentTarget } from "./targets.js";

export type TencentMessageEvent = {
  message: TIMMessage;
};

export type HandleMessageOpts = {
  cfg: ClawdbotConfig;
  event: TencentMessageEvent;
  botUserId: string | undefined;
  runtime?: RuntimeEnv;
  chatHistories: Map<string, HistoryEntry[]>;
  accountId: string;
};

export async function handleTencentMessage(opts: HandleMessageOpts): Promise<void> {
  const { cfg, event, botUserId, runtime, chatHistories, accountId } = opts;
  const message = event.message;

  runtime?.log?.(
    `[DEBUG] handleTencentMessage: received message from=${message.from}, type=${message.type}, flow=${message.flow}`,
  );

  // Skip messages sent by the bot itself
  if (message.from === botUserId) {
    runtime?.log?.(`[DEBUG] handleTencentMessage: skipped - message from bot itself`);
    return;
  }

  // Skip outgoing messages
  if (message.flow === "out") {
    runtime?.log?.(`[DEBUG] handleTencentMessage: skipped - outgoing message`);
    return;
  }

  const account = resolveTencentAccount({ cfg, accountId });
  runtime?.log?.(
    `[DEBUG] handleTencentMessage: account resolved, dmPolicy=${account.dmPolicy}, allowFrom=${JSON.stringify(account.allowFrom)}`,
  );

  // Check DM policy for direct messages
  if (message.conversationType === CONV_C2C) {
    const allowed = await checkDMAllowance({
      cfg,
      account,
      senderId: message.from,
      runtime,
    });
    runtime?.log?.(`[DEBUG] handleTencentMessage: DM policy check result=${allowed}`);
    if (!allowed) {
      runtime?.log?.(`Tencent IM: Message from ${message.from} blocked by DM policy`);
      return;
    }
  }

  // Check group policy for group messages
  if (message.conversationType === CONV_GROUP) {
    const allowed = await checkGroupAllowance({
      cfg,
      account,
      senderId: message.from,
      groupId: message.to,
      runtime,
    });
    if (!allowed) {
      runtime?.log?.(`Tencent IM: Message in group ${message.to} blocked by policy`);
      return;
    }
  }

  // Extract message text
  runtime?.log?.(
    `[DEBUG] handleTencentMessage: message.type=${message.type}, payload=${JSON.stringify(message.payload)}`,
  );
  const text = extractMessageText(message);
  runtime?.log?.(`[DEBUG] handleTencentMessage: extracted text="${text?.substring(0, 50)}"`);

  if (!text || text.trim().length === 0) {
    // Skip non-text messages or empty messages
    if (message.type !== MSG_TEXT) {
      runtime?.log?.(`Tencent IM: Skipping non-text message type: ${message.type}`);
    } else {
      runtime?.log?.(`[DEBUG] handleTencentMessage: skipped - empty text`);
    }
    return;
  }

  // Build normalized message for OpenClaw
  const normalizedMessage = {
    channel: "tencent-im" as const,
    accountId,
    chatType: message.conversationType === CONV_C2C ? ("direct" as const) : ("group" as const),
    senderId: message.from,
    senderName: message.nick || message.from,
    senderAvatar: message.avatar,
    text,
    timestamp: message.time,
    messageId: message.ID,
    conversationId: message.conversationID,
    raw: message,
  };

  runtime?.log?.(
    `[DEBUG] handleTencentMessage: dispatching message, channel=${normalizedMessage.channel}, sender=${normalizedMessage.senderId}`,
  );

  // Get or create chat history
  const historyKey = `${accountId}:${message.conversationID}`;
  let history = chatHistories.get(historyKey);
  if (!history) {
    history = [];
    chatHistories.set(historyKey, history);
  }

  // Add to history
  history.push({
    role: "user",
    content: text,
    timestamp: message.time,
  });

  // Limit history size
  if (history.length > 100) {
    chatHistories.set(historyKey, history.slice(-100));
  }

  // Dispatch to OpenClaw
  // Note: In Gateway mode, we need to send reply using outbound channel
  // For now, log the message and TODO: implement proper reply dispatch
  runtime?.log?.(`[DEBUG] handleTencentMessage: message ready for dispatch`);
  runtime?.log?.(
    `[Tencent IM] Received from ${normalizedMessage.senderId}: ${normalizedMessage.text}`,
  );

  // TODO: Implement reply dispatch using sendMessageTencentIM
  // This requires integrating with the Gateway's reply dispatcher
  // For now, just acknowledge receipt
  runtime?.log?.(
    `[Tencent IM] Message processed successfully (reply dispatch not yet implemented)`,
  );
}

export type TencentBotAddedEvent = {
  chat_id: string;
  chat_name?: string;
};

export type TencentBotRemovedEvent = {
  chat_id: string;
};

function extractMessageText(message: TIMMessage): string {
  switch (message.type) {
    case MSG_TEXT:
      // Webhook payload uses "Text" (capital T), TIM SDK uses "text" (lowercase)
      return (message.payload.Text as string) || (message.payload.text as string) || "";
    case MSG_CUSTOM:
      // Custom messages may contain text in description or data
      return (
        (message.payload.Description as string) ||
        (message.payload.description as string) ||
        (message.payload.Data as string) ||
        (message.payload.data as string) ||
        ""
      );
    case MSG_IMAGE:
      return "[图片]";
    case MSG_FILE:
      const fileName =
        (message.payload.FileName as string) ||
        (message.payload.fileName as string) ||
        (message.payload.name as string) ||
        "unnamed";
      return `[文件: ${fileName}]`;
    default:
      return "";
  }
}

async function checkDMAllowance(opts: {
  cfg: ClawdbotConfig;
  account: ResolvedTencentAccount;
  senderId: string;
  runtime?: RuntimeEnv;
}): Promise<boolean> {
  const { account, senderId } = opts;

  switch (account.dmPolicy) {
    case "open":
      return true;
    case "pairing":
      // Check if sender is in allowlist
      return account.allowFrom.includes(senderId);
    case "allowlist":
      return account.allowFrom.includes(senderId);
    default:
      return false;
  }
}

async function checkGroupAllowance(opts: {
  cfg: ClawdbotConfig;
  account: ResolvedTencentAccount;
  senderId: string;
  groupId: string;
  runtime?: RuntimeEnv;
}): Promise<boolean> {
  const { account, senderId, groupId } = opts;

  switch (account.groupPolicy) {
    case "open":
      return true;
    case "allowlist":
      // Check if group is in allowlist
      return account.groupAllowFrom.includes(groupId);
    case "disabled":
      return false;
    default:
      return false;
  }
}

export function isMentionMessage(message: TIMMessage, botUserId: string | undefined): boolean {
  if (!botUserId) return false;

  // Check @ mentions in the message
  if (message.atUserList?.includes(botUserId)) {
    return true;
  }

  // Check text for @botUserId
  const text = extractMessageText(message);
  if (text.includes(`@${botUserId}`)) {
    return true;
  }

  return false;
}
