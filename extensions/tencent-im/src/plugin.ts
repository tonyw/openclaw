import type {
  ChannelOutboundContext,
  ChannelGatewayContext,
  ChannelPlugin,
  OpenClawConfig,
  OutboundDeliveryResult,
} from "openclaw/plugin-sdk/tencent-im";
import { resolveTencentIMAccount, listTencentIMAccountIds } from "./accounts.js";
import { startTencentIMMonitor } from "./monitor.js";
import { normalizeTencentIMTarget, looksLikeTencentIMTargetId } from "./normalize.js";
import { tencentIMOnboardingAdapter } from "./onboarding.js";
import { sendMessageTencentIM } from "./send.js";
import { looksLikeGroupId } from "./targets.js";

async function sendText(ctx: ChannelOutboundContext): Promise<OutboundDeliveryResult> {
  const { cfg, to, text, accountId } = ctx;

  if (!to) {
    throw new Error("Missing To address");
  }

  if (!text) {
    throw new Error("Missing text content");
  }

  // Extract target from tencent-im: prefix
  const target = normalizeTencentIMTarget(to);
  if (target === undefined) {
    throw new Error("Invalid Tencent IM target");
  }

  const result = await sendMessageTencentIM({
    cfg,
    to: target,
    text,
    accountId: accountId ?? undefined,
  });

  if (!result.ok) {
    throw new Error(result.error || "Failed to send message");
  }

  return {
    channel: "tencent-im",
    messageId: result.messageId || "unknown",
  };
}

async function sendMedia(ctx: ChannelOutboundContext): Promise<OutboundDeliveryResult> {
  // Tencent IM doesn't support media uploads yet, so we send the media URL as text
  const { text, mediaUrl } = ctx;
  const message = mediaUrl ? `${text || ""} ${mediaUrl}`.trim() : text || "";

  if (!message) {
    throw new Error("Missing text or mediaUrl");
  }

  return sendText({ ...ctx, text: message });
}

async function startGateway(ctx: ChannelGatewayContext): Promise<() => Promise<void>> {
  return startTencentIMMonitor(ctx);
}

export const tencentIMPlugin: ChannelPlugin = {
  id: "tencent-im",
  meta: {
    id: "tencent-im",
    label: "Tencent IM",
    selectionLabel: "Tencent IM (腾讯云IM)",
    docsPath: "/channels/tencent-im",
    blurb: "Tencent Cloud Instant Messaging",
    aliases: ["tim", "tencent"],
    order: 80,
  },
  // Onboarding adapter for interactive setup
  onboarding: tencentIMOnboardingAdapter,
  // Config schema for UI
  configSchema: {
    schema: {
      type: "object",
      properties: {
        enabled: { type: "boolean" },
        sdkAppId: { type: "string", description: "Tencent Cloud SDKAppID" },
        secretKey: { type: "string", description: "Tencent Cloud SecretKey" },
        adminUserId: { type: "string", description: "Admin User ID" },
        userId: { type: "string", description: "User ID for sending messages" },
        connectionMode: { type: "string", enum: ["webhook", "websocket"] },
        dmPolicy: { type: "string", enum: ["pairing", "allowlist", "open", "disabled"] },
        groupPolicy: { type: "string", enum: ["open", "allowlist", "disabled"] },
        requireMention: { type: "boolean", description: "Require @mention in groups" },
        webhookPort: { type: "number" },
        webhookPath: { type: "string" },
        webhookSecret: { type: "string" },
        textChunkLimit: { type: "number" },
        mediaMaxMb: { type: "number" },
      },
    },
  },
  // Config adapter
  config: {
    listAccountIds: (cfg: OpenClawConfig) => {
      return listTencentIMAccountIds(cfg);
    },
    resolveAccount: (cfg: OpenClawConfig, accountId?: string | null) => {
      return resolveTencentIMAccount({ cfg, accountId: accountId ?? undefined });
    },
  },
  // Outbound message sending
  outbound: {
    deliveryMode: "direct",
    textChunkLimit: 4000,
    sendText,
    sendMedia,
  },
  // Gateway adapter for webhook handling
  gateway: {
    startAccount: startGateway,
  },
  // Messaging adapter for target normalization
  messaging: {
    normalizeTarget: (raw: string) => {
      return normalizeTencentIMTarget(raw);
    },
    targetResolver: {
      looksLikeId: (raw: string) => looksLikeTencentIMTargetId(raw),
      hint: "Tencent IM user ID (e.g., user001 or user:user001) or group ID (e.g., GROUP001 or group:group001)",
    },
    formatTargetDisplay: (params: { target: string; display?: string }) => {
      const { target, display } = params;
      if (display) {
        return display;
      }
      const normalized = normalizeTencentIMTarget(target);
      if (!normalized) {
        return target;
      }
      return looksLikeGroupId(normalized) ? `Group: ${normalized}` : `User: ${normalized}`;
    },
  },
  // Capabilities
  capabilities: {
    chatTypes: ["direct", "group"],
    media: false, // Text only for now
    reactions: false,
    polls: false,
    threads: false,
  },
};
