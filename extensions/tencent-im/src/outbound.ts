import type { ChannelOutbound, OutboundMessage } from "openclaw/plugin-sdk";
import { sendMessageTencentIM, sendMediaTencentIM } from "./send.js";
import { formatTencentTarget } from "./targets.js";

export const tencentIMOutbound: ChannelOutbound = {
  async sendText({ cfg, accountId, target, text, runtime, replyTo }) {
    const result = await sendMessageTencentIM({
      cfg,
      to: target,
      text,
      accountId,
      runtime,
      replyToMessageId: replyTo,
    });

    if (!result.ok) {
      return { ok: false, error: result.error };
    }

    return { ok: true, messageId: undefined };
  },

  async sendMedia({ cfg, accountId, target, mediaUrl, mediaType, runtime }) {
    const result = await sendMediaTencentIM({
      cfg,
      to: target,
      mediaUrl,
      mediaType: mediaType === "image" ? "image" : "file",
      accountId,
      runtime,
    });

    if (!result.ok) {
      return { ok: false, error: result.error };
    }

    return { ok: true, messageId: result.messageId };
  },

  async sendReaction() {
    // Tencent IM does not support reactions via simple API
    return { ok: false, error: "Reactions not supported" };
  },

  async removeReaction() {
    return { ok: false, error: "Reactions not supported" };
  },

  async editMessage() {
    // Tencent IM does not support editing messages
    return { ok: false, error: "Message editing not supported" };
  },

  async deleteMessage() {
    // Tencent IM does not support deleting messages via API
    return { ok: false, error: "Message deletion not supported" };
  },

  async sendTyping() {
    // Typing indicators not implemented
    return { ok: true };
  },
};
