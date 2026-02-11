import type { ClawdbotConfig, RuntimeEnv } from "openclaw/plugin-sdk";
import type { ResolvedTencentAccount, TIMMessage } from "./types.js";
import { resolveTencentAccount } from "./accounts.js";
import {
  createTIMClient,
  loginTIM,
  CONV_C2C,
  CONV_GROUP,
  MSG_TEXT,
  MSG_IMAGE,
  MSG_FILE,
} from "./client.js";
import { looksLikeGroupId, extractUserId, extractGroupId } from "./targets.js";

export type SendMessageOpts = {
  cfg: ClawdbotConfig;
  to: string;
  text: string;
  accountId?: string;
  runtime?: RuntimeEnv;
  replyToMessageId?: string;
};

export type SendMediaOpts = {
  cfg: ClawdbotConfig;
  to: string;
  mediaUrl: string;
  mediaType: "image" | "file";
  fileName?: string;
  accountId?: string;
  runtime?: RuntimeEnv;
};

export async function sendMessageTencentIM(
  opts: SendMessageOpts,
): Promise<{ ok: boolean; error?: string }> {
  const { cfg, to, text, accountId, runtime } = opts;

  const account = resolveTencentAccount({ cfg, accountId });
  if (!account.configured) {
    return { ok: false, error: "Account not configured" };
  }

  const tim = await createTIMClient(account);
  if (!tim) {
    return { ok: false, error: "Failed to create TIM client" };
  }

  const loginSuccess = await loginTIM(tim, account);
  if (!loginSuccess) {
    return { ok: false, error: "Failed to login to TIM" };
  }

  try {
    const isGroup = looksLikeGroupId(to);
    const conversationType = isGroup ? CONV_GROUP : CONV_C2C;
    const targetId = isGroup ? extractGroupId(to) : extractUserId(to);

    // Handle long messages by chunking
    const chunks = chunkText(text, account.textChunkLimit);

    for (const chunk of chunks) {
      const message = tim.createTextMessage({
        to: targetId,
        conversationType,
        payload: { text: chunk },
      });

      const result = await tim.sendMessage(message);
      if (result.code !== 0) {
        return { ok: false, error: `Failed to send message: ${result.code}` };
      }
    }

    return { ok: true };
  } catch (error) {
    runtime?.error?.(`Tencent IM send error: ${String(error)}`);
    return { ok: false, error: String(error) };
  }
}

export async function sendMediaTencentIM(
  opts: SendMediaOpts,
): Promise<{ ok: boolean; error?: string; messageId?: string }> {
  const { cfg, to, mediaUrl, mediaType, fileName, accountId, runtime } = opts;

  const account = resolveTencentAccount({ cfg, accountId });
  if (!account.configured) {
    return { ok: false, error: "Account not configured" };
  }

  const tim = await createTIMClient(account);
  if (!tim) {
    return { ok: false, error: "Failed to create TIM client" };
  }

  const loginSuccess = await loginTIM(tim, account);
  if (!loginSuccess) {
    return { ok: false, error: "Failed to login to TIM" };
  }

  try {
    const isGroup = looksLikeGroupId(to);
    const conversationType = isGroup ? CONV_GROUP : CONV_C2C;
    const targetId = isGroup ? extractGroupId(to) : extractUserId(to);

    let message: unknown;

    if (mediaType === "image") {
      message = tim.createImageMessage({
        to: targetId,
        conversationType,
        payload: { file: { url: mediaUrl } },
      });
    } else {
      message = tim.createFileMessage({
        to: targetId,
        conversationType,
        payload: {
          file: {
            url: mediaUrl,
            name: fileName || "file",
          },
        },
      });
    }

    const result = await tim.sendMessage(message);
    if (result.code !== 0) {
      return { ok: false, error: `Failed to send media: ${result.code}` };
    }

    // Extract message ID from result if available
    const messageId = (result.data as { message?: { ID?: string } })?.message?.ID;

    return { ok: true, messageId };
  } catch (error) {
    runtime?.error?.(`Tencent IM send media error: ${String(error)}`);
    return { ok: false, error: String(error) };
  }
}

export async function editMessageTencentIM(opts: {
  cfg: ClawdbotConfig;
  messageId: string;
  newText: string;
  accountId?: string;
  runtime?: RuntimeEnv;
}): Promise<{ ok: boolean; error?: string }> {
  // Tencent IM does not support editing sent messages
  // Return error to indicate this limitation
  return { ok: false, error: "Tencent IM does not support message editing" };
}

function chunkText(text: string, limit: number): string[] {
  if (text.length <= limit) return [text];

  const chunks: string[] = [];
  let current = "";
  const sentences = text.split(/(?<=[.!?。！？\n])\s*/);

  for (const sentence of sentences) {
    if (current.length + sentence.length > limit) {
      if (current) chunks.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }

  if (current) chunks.push(current.trim());

  // If any chunk is still too long, hard split
  return chunks.flatMap((chunk) =>
    chunk.length > limit
      ? Array.from({ length: Math.ceil(chunk.length / limit) }, (_, i) =>
          chunk.slice(i * limit, (i + 1) * limit),
        )
      : [chunk],
  );
}
