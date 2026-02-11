import type { ClawdbotConfig, RuntimeEnv, HistoryEntry } from "openclaw/plugin-sdk";
import * as http from "http";
import type { ResolvedTencentAccount } from "./types.js";
import { resolveTencentAccount } from "./accounts.js";
import { handleTencentMessage, type TencentMessageEvent } from "./bot.js";
import { createTIMClient, loginTIM, destroyTIMClient, CONV_C2C, CONV_GROUP } from "./client.js";

export type MonitorTencentOpts = {
  config?: ClawdbotConfig;
  runtime?: RuntimeEnv;
  abortSignal?: AbortSignal;
  accountId?: string;
};

// Per-account TIM clients and HTTP servers
const timClients = new Map<string, unknown>();
const httpServers = new Map<string, http.Server>();
const botUserIds = new Map<string, string>();
const chatHistories = new Map<string, HistoryEntry[]>();

export async function monitorTencentProvider(
  opts: MonitorTencentOpts,
): Promise<() => Promise<void>> {
  const { config, runtime, abortSignal, accountId } = opts;

  if (!config) {
    throw new Error("Config is required");
  }

  const effectiveAccountId = accountId ?? "default";
  const account = resolveTencentAccount({ cfg: config, accountId: effectiveAccountId });

  if (!account.enabled || !account.configured) {
    throw new Error(`Account ${effectiveAccountId} is not enabled or not configured`);
  }

  runtime?.log?.(`Starting Tencent IM monitor for account: ${effectiveAccountId}`);

  // Store bot user ID
  botUserIds.set(effectiveAccountId, account.userId);

  if (account.connectionMode === "webhook") {
    return startWebhookMode({
      config,
      account,
      runtime,
      abortSignal,
      accountId: effectiveAccountId,
    });
  } else {
    return startWebSocketMode({
      config,
      account,
      runtime,
      abortSignal,
      accountId: effectiveAccountId,
    });
  }
}

async function startWebSocketMode(opts: {
  config: ClawdbotConfig;
  account: ResolvedTencentAccount;
  runtime?: RuntimeEnv;
  abortSignal?: AbortSignal;
  accountId: string;
}): Promise<() => Promise<void>> {
  const { config, account, runtime, abortSignal, accountId } = opts;

  const tim = await createTIMClient(account);
  if (!tim) {
    throw new Error("Failed to create TIM client");
  }

  timClients.set(accountId, tim);

  // Login
  const loginSuccess = await loginTIM(tim, account);
  if (!loginSuccess) {
    throw new Error("Failed to login to TIM");
  }

  runtime?.log?.(`Tencent IM [${accountId}]: Logged in as ${account.userId}`);

  // Set up event handlers
  const handleMessageReceived = (event: unknown) => {
    const data = event as { data?: TIMMessage[] };
    if (!data.data) return;

    for (const message of data.data) {
      const messageEvent: TencentMessageEvent = { message };
      handleTencentMessage({
        cfg: config,
        event: messageEvent,
        botUserId: botUserIds.get(accountId),
        runtime,
        chatHistories,
        accountId,
      }).catch((err) => {
        runtime?.error?.(`Tencent IM [${accountId}]: Error handling message: ${String(err)}`);
      });
    }
  };

  const handleError = (event: unknown) => {
    runtime?.error?.(`Tencent IM [${accountId}]: Error event: ${JSON.stringify(event)}`);
  };

  const handleKickedOut = (event: unknown) => {
    runtime?.warn?.(`Tencent IM [${accountId}]: Kicked out: ${JSON.stringify(event)}`);
  };

  const handleNetworkStateChange = (event: unknown) => {
    const data = event as { data?: { state: string } };
    runtime?.log?.(`Tencent IM [${accountId}]: Network state changed to ${data.data?.state}`);
  };

  // Register handlers
  tim.on("onMessageReceived", handleMessageReceived);
  tim.on("onError", handleError);
  tim.on("onKickedOut", handleKickedOut);
  tim.on("onNetStateChange", handleNetworkStateChange);

  // Handle abort signal
  abortSignal?.addEventListener("abort", () => {
    cleanupWebSocketMode(accountId, runtime);
  });

  // Return cleanup function
  return async () => {
    await cleanupWebSocketMode(accountId, runtime);
  };
}

async function cleanupWebSocketMode(accountId: string, runtime?: RuntimeEnv): Promise<void> {
  runtime?.log?.(`Tencent IM [${accountId}]: Cleaning up WebSocket mode`);

  const tim = timClients.get(accountId) as
    | {
        off?: (event: string, handler: unknown) => void;
        logout?: () => Promise<void>;
        destroy?: () => void;
      }
    | undefined;
  if (tim) {
    try {
      tim.off?.("onMessageReceived", undefined);
      tim.off?.("onError", undefined);
      tim.off?.("onKickedOut", undefined);
      tim.off?.("onNetStateChange", undefined);
      await tim.logout?.();
      tim.destroy?.();
    } catch (err) {
      runtime?.error?.(`Tencent IM [${accountId}]: Error during cleanup: ${String(err)}`);
    }
    timClients.delete(accountId);
  }

  botUserIds.delete(accountId);
}

async function startWebhookMode(opts: {
  config: ClawdbotConfig;
  account: ResolvedTencentAccount;
  runtime?: RuntimeEnv;
  abortSignal?: AbortSignal;
  accountId: string;
}): Promise<() => Promise<void>> {
  const { config, account, runtime, abortSignal, accountId } = opts;

  const port = account.webhookPort ?? 18794;
  const path = account.webhookPath ?? "/webhook/tencent-im";

  const server = http.createServer((req, res) => {
    if (req.url !== path || req.method !== "POST") {
      res.writeHead(404);
      res.end();
      return;
    }

    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      try {
        const event = JSON.parse(body);
        handleWebhookEvent({
          config,
          event,
          runtime,
          accountId,
        });
        res.writeHead(200);
        res.end(JSON.stringify({ code: 0 }));
      } catch (err) {
        runtime?.error?.(`Tencent IM [${accountId}]: Error handling webhook: ${String(err)}`);
        res.writeHead(400);
        res.end(JSON.stringify({ code: -1, error: "Invalid payload" }));
      }
    });
  });

  await new Promise<void>((resolve, reject) => {
    server.listen(port, "0.0.0.0", () => {
      runtime?.log?.(`Tencent IM [${accountId}]: Webhook server listening on 0.0.0.0:${port}`);
      resolve();
    });
    server.on("error", reject);
  });

  httpServers.set(accountId, server);

  // Handle abort signal
  abortSignal?.addEventListener("abort", () => {
    cleanupWebhookMode(accountId, runtime);
  });

  // Return cleanup function
  return async () => {
    await cleanupWebhookMode(accountId, runtime);
  };
}

async function cleanupWebhookMode(accountId: string, runtime?: RuntimeEnv): Promise<void> {
  runtime?.log?.(`Tencent IM [${accountId}]: Cleaning up webhook mode`);

  const server = httpServers.get(accountId);
  if (server) {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
    httpServers.delete(accountId);
  }
}

function handleWebhookEvent(opts: {
  config: ClawdbotConfig;
  event: unknown;
  runtime?: RuntimeEnv;
  accountId: string;
}): void {
  const { config, event, runtime, accountId } = opts;

  runtime?.log?.(
    `Tencent IM [${accountId}]: Received webhook event: ${JSON.stringify(event).slice(0, 500)}`,
  );

  // Parse Tencent IM webhook event format
  // Tencent IM webhooks have different formats based on callback type
  const webhookEvent = event as {
    CallbackCommand?: string;
    From_Account?: string;
    To_Account?: string;
    MsgBody?: Array<{ MsgType: string; MsgContent: Record<string, unknown> }>;
    GroupId?: string;
    From_Group?: string;
    Type?: string;
    Text?: string;
    EventType?: string;
    data?: { message?: TIMMessage };
    // Common webhook fields
    ActionStatus?: string;
    ErrorCode?: number;
    ErrorInfo?: string;
  };

  // Handle C2C message callback (C2C.CallbackBeforeSendMsg)
  if (
    webhookEvent.CallbackCommand === "C2C.CallbackBeforeSendMsg" ||
    webhookEvent.CallbackCommand === "C2C.CallbackAfterSendMsg"
  ) {
    const fromUser = webhookEvent.From_Account;
    const toUser = webhookEvent.To_Account;
    const msgBody = webhookEvent.MsgBody?.[0];

    if (fromUser && toUser && msgBody) {
      const textContent =
        msgBody.MsgType === "TIMTextElem"
          ? (msgBody.MsgContent.Text as string)
          : "[Non-text message]";

      // Construct message in TIM format
      const message: TIMMessage = {
        ID: `webhook-${Date.now()}`,
        conversationID: `C2C${fromUser}`,
        conversationType: "C2C",
        from: fromUser,
        to: toUser,
        flow: "in",
        time: Date.now() / 1000,
        type: msgBody.MsgType,
        payload: msgBody.MsgContent,
      };

      const messageEvent: TencentMessageEvent = { message };
      handleTencentMessage({
        cfg: config,
        event: messageEvent,
        botUserId: botUserIds.get(accountId),
        runtime,
        chatHistories,
        accountId,
      }).catch((err) => {
        runtime?.error?.(`Tencent IM [${accountId}]: Error handling C2C webhook: ${String(err)}`);
      });
    }
    return;
  }

  // Handle group message callback (Group.CallbackBeforeSendMsg)
  if (
    webhookEvent.CallbackCommand === "Group.CallbackBeforeSendMsg" ||
    webhookEvent.CallbackCommand === "Group.CallbackAfterSendMsg"
  ) {
    const fromUser = webhookEvent.From_Account;
    const groupId = webhookEvent.GroupId || webhookEvent.From_Group;
    const msgBody = webhookEvent.MsgBody?.[0];

    if (fromUser && groupId && msgBody) {
      // Construct message in TIM format
      const message: TIMMessage = {
        ID: `webhook-${Date.now()}`,
        conversationID: `GROUP${groupId}`,
        conversationType: "GROUP",
        from: fromUser,
        to: groupId,
        flow: "in",
        time: Date.now() / 1000,
        type: msgBody.MsgType,
        payload: msgBody.MsgContent,
      };

      const messageEvent: TencentMessageEvent = { message };
      handleTencentMessage({
        cfg: config,
        event: messageEvent,
        botUserId: botUserIds.get(accountId),
        runtime,
        chatHistories,
        accountId,
      }).catch((err) => {
        runtime?.error?.(`Tencent IM [${accountId}]: Error handling group webhook: ${String(err)}`);
      });
    }
    return;
  }

  // Handle simple webhook format (custom or test format)
  if (webhookEvent.EventType === "message.received" && webhookEvent.data?.message) {
    const messageEvent: TencentMessageEvent = { message: webhookEvent.data.message };
    handleTencentMessage({
      cfg: config,
      event: messageEvent,
      botUserId: botUserIds.get(accountId),
      runtime,
      chatHistories,
      accountId,
    }).catch((err) => {
      runtime?.error?.(`Tencent IM [${accountId}]: Error handling webhook message: ${String(err)}`);
    });
    return;
  }

  // Unknown webhook format - log for debugging
  runtime?.log?.(
    `Tencent IM [${accountId}]: Unrecognized webhook format, CallbackCommand: ${webhookEvent.CallbackCommand || "unknown"}`,
  );
}

// Import TIMMessage type for webhook handler
type TIMMessage = {
  ID: string;
  conversationID: string;
  conversationType: string;
  from: string;
  to: string;
  flow: "in" | "out";
  time: number;
  type: string;
  payload: Record<string, unknown>;
  nick?: string;
  avatar?: string;
};
