import type { OpenClawConfig } from "../config/config.js";
import type { RuntimeEnv } from "../runtime.js";
import type { ResolvedTencentIMAccount } from "./accounts.js";
import type { TencentIMWebhookEvent, TencentIMParsedMessage } from "./types.js";
import { dispatchInboundMessage } from "../auto-reply/dispatch.js";
import { formatInboundEnvelope, resolveEnvelopeFormatOptions } from "../auto-reply/envelope.js";
import { finalizeInboundContext } from "../auto-reply/reply/inbound-context.js";
import { createReplyDispatcher } from "../auto-reply/reply/reply-dispatcher.js";
import { recordInboundSession } from "../channels/session.js";
import { resolveStorePath } from "../config/sessions.js";
import { resolveAgentRoute } from "../routing/resolve-route.js";
import { sendMessageTencentIM } from "./send.js";

export type MonitorTencentIMOpts = {
  cfg: OpenClawConfig;
  account: ResolvedTencentIMAccount;
  runtime?: RuntimeEnv;
  abortSignal?: AbortSignal;
  accountId: string;
};

/**
 * Parse Webhook event to internal message format
 */
function parseWebhookEvent(event: TencentIMWebhookEvent): TencentIMParsedMessage | null {
  if (!event.CallbackCommand) {
    return null;
  }

  const isC2C = event.CallbackCommand.includes("C2C");
  const isGroup = event.CallbackCommand.includes("Group");

  if (!isC2C && !isGroup) {
    return null;
  }

  const msgBody = event.MsgBody?.[0];
  if (!msgBody) {
    return null;
  }

  const fromUser = event.From_Account || "unknown";
  const toUser = event.To_Account;
  const groupId = event.GroupId || event.From_Group;

  let text = "";
  const content = msgBody.MsgContent;
  if (msgBody.MsgType === "TIMTextElem") {
    text = (content.Text as string) || (content.text as string) || "";
  } else if (msgBody.MsgType === "TIMCustomElem") {
    text = (content.description as string) || (content.data as string) || "";
  }

  // Extract @mentions from the message
  const atUserList: string[] = [];
  if (event.MsgBody) {
    for (const msg of event.MsgBody) {
      if (msg.MsgType === "TIMTextElem" && msg.MsgContent) {
        // Check for @mentions in text: @username
        const textContent =
          (msg.MsgContent.Text as string) || (msg.MsgContent.text as string) || "";
        const mentionMatches = textContent.match(/@(\w+)/g);
        if (mentionMatches) {
          mentionMatches.forEach((match) => {
            atUserList.push(match.substring(1)); // Remove @ prefix
          });
        }
      }
    }
  }

  return {
    type: msgBody.MsgType === "TIMTextElem" ? "text" : "other",
    text,
    from: fromUser,
    to: isGroup ? groupId || "unknown" : toUser || "unknown",
    isGroup: !!isGroup,
    groupId: groupId || undefined,
    flow: "in",
    timestamp: (event.MsgTime || Date.now() / 1000) * 1000,
    atUserList: atUserList.length > 0 ? atUserList : undefined,
    raw: event,
  };
}

/**
 * Policy check
 */
async function checkPolicy(params: {
  cfg: OpenClawConfig;
  account: ResolvedTencentIMAccount;
  message: TencentIMParsedMessage;
  runtime?: RuntimeEnv;
}): Promise<boolean> {
  const { account, message } = params;

  if (message.isGroup) {
    // Group policy
    if (account.groupPolicy === "disabled") {
      return false;
    }
    if (account.groupPolicy === "allowlist") {
      return account.groupAllowFrom.includes(message.from);
    }
    return true;
  } else {
    // C2C policy
    if (account.dmPolicy === "open") {
      return true;
    }
    if (account.dmPolicy === "pairing" || account.dmPolicy === "allowlist") {
      return account.allowFrom.includes(message.from);
    }
    return false;
  }
}

/**
 * Handle Webhook event (main entry)
 */
export async function handleTencentIMWebhook(
  opts: MonitorTencentIMOpts,
  event: TencentIMWebhookEvent,
): Promise<void> {
  const { cfg, account, runtime, accountId } = opts;

  runtime?.log?.(`[tencent-im] Received webhook: ${event.CallbackCommand}`);

  // 1. Parse message
  const message = parseWebhookEvent(event);
  if (!message) {
    runtime?.log?.("[tencent-im] Failed to parse webhook event");
    return;
  }

  runtime?.log?.(`[tencent-im] Parsed message from=${message.from}, type=${message.type}`);

  // 2. Basic filtering
  if (message.flow === "out") {
    runtime?.log?.("[tencent-im] Skipping outgoing message");
    return;
  }
  if (message.from === account.userId) {
    runtime?.log?.("[tencent-im] Skipping message from self");
    return;
  }

  // 3. Policy check
  const allowed = await checkPolicy({ cfg, account, message, runtime });
  if (!allowed) {
    runtime?.log?.(`[tencent-im] Message from ${message.from} blocked by policy`);
    return;
  }

  // 3.5 Check requireMention for group chats
  if (message.isGroup && account.requireMention) {
    const isMentioned = message.atUserList?.includes(account.userId) ?? false;
    if (!isMentioned) {
      runtime?.log?.(
        `[tencent-im] Skipping group message: bot not mentioned (requireMention=true)`,
      );
      return;
    }
    runtime?.log?.(`[tencent-im] Bot was mentioned in group message`);
  }

  // 4. Extract text
  const text = message.text;
  if (!text || !text.trim()) {
    runtime?.log?.("[tencent-im] Empty message text, skipping");
    return;
  }

  runtime?.log?.(`[tencent-im] Message text: ${text.slice(0, 100)}`);

  // 5. Build route
  const peerId = message.isGroup ? message.groupId || message.to : message.from;

  const route = resolveAgentRoute({
    cfg,
    channel: "tencent-im",
    accountId,
    peer: {
      kind: message.isGroup ? "group" : "direct",
      id: peerId,
    },
  });

  runtime?.log?.(
    `[tencent-im] Resolved route: agentId=${route.agentId}, sessionKey=${route.sessionKey}`,
  );

  // 6. Build label
  const fromLabel = message.isGroup ? `Group (${message.groupId || message.to})` : message.from;

  // 7. Build inbound context
  const envelopeOptions = resolveEnvelopeFormatOptions(cfg);
  const body = formatInboundEnvelope({
    channel: "Tencent IM",
    from: fromLabel,
    timestamp: message.timestamp,
    body: text,
    chatType: message.isGroup ? "group" : "direct",
    sender: { name: message.from, id: message.from },
    envelope: envelopeOptions,
  });

  const ctxPayload = finalizeInboundContext({
    Body: body,
    BodyForAgent: text,
    RawBody: text,
    CommandBody: text,
    From: `tencent-im:${message.from}`,
    To: `tencent-im:${message.isGroup ? message.to : account.userId}`,
    SessionKey: route.sessionKey,
    AccountId: route.accountId,
    ChatType: message.isGroup ? "group" : "direct",
    ConversationLabel: fromLabel,
    SenderName: message.from,
    SenderId: message.from,
    Provider: "tencent-im",
    Surface: "tencent-im",
    OriginatingChannel: "tencent-im",
    OriginatingTo: message.isGroup ? `group:${message.to}` : message.to,
    Timestamp: message.timestamp,
    MessageSid: `${message.timestamp}-${message.from}`,
  });

  runtime?.log?.(`[tencent-im] Context built, sessionKey=${route.sessionKey}`);

  // 8. Record session
  const storePath = resolveStorePath(cfg.session?.store, { agentId: route.agentId });
  await recordInboundSession({
    storePath,
    sessionKey: route.sessionKey,
    ctx: ctxPayload,
    groupResolution: message.isGroup
      ? { key: message.to, channel: "tencent-im", id: message.to, chatType: "group" }
      : null,
    createIfMissing: true,
    onRecordError: (err) => {
      runtime?.error?.(`[tencent-im] Failed to record session: ${String(err)}`);
    },
  });

  // 9. Create reply dispatcher
  const dispatcher = createReplyDispatcher({
    deliver: async (payload) => {
      // For groups: reply to the group
      // For direct messages: reply to the sender (message.from), not to ourselves (message.to)
      const target = message.isGroup ? `group:${message.to}` : message.from;
      const text = payload.text ?? "";
      runtime?.log?.(`[tencent-im] Sending reply to ${target}: ${text.slice(0, 100)}`);

      const result = await sendMessageTencentIM({
        cfg,
        to: target,
        text,
        accountId,
        fromUserId: account.userId,
      });

      if (!result.ok) {
        runtime?.error?.(`[tencent-im] Failed to send reply: ${result.error}`);
        throw new Error(result.error);
      }

      runtime?.log?.(`[tencent-im] Reply sent successfully, messageId=${result.messageId}`);
    },
  });

  // 10. Dispatch to AI
  runtime?.log?.(`[tencent-im] Dispatching to AI...`);
  try {
    await dispatchInboundMessage({
      ctx: ctxPayload,
      cfg,
      dispatcher,
    });
    runtime?.log?.(`[tencent-im] Message processed successfully`);
  } catch (err) {
    runtime?.error?.(`[tencent-im] Error dispatching message: ${String(err)}`);
    throw err;
  }
}
