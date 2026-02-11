import type { ClawdbotConfig, RuntimeEnv } from "openclaw/plugin-sdk";
import type { ResolvedTencentAccount } from "./types.js";
import { resolveTencentAccount } from "./accounts.js";
import { createTIMRestClient, type SendMsgRequest, type SendMsgResponse } from "./client-rest.js";
import { looksLikeGroupId, extractUserId, extractGroupId } from "./targets.js";
import { generateUserSig } from "./usersig.js";

export type SendMessageOpts = {
  cfg: ClawdbotConfig;
  to: string;
  text: string;
  accountId?: string;
  runtime?: RuntimeEnv;
  replyToMessageId?: string;
  // Optional: specify a different sender (defaults to account.userId)
  fromUserId?: string;
};

export type SendMediaOpts = {
  cfg: ClawdbotConfig;
  to: string;
  mediaUrl: string;
  mediaType: "image" | "file";
  fileName?: string;
  accountId?: string;
  runtime?: RuntimeEnv;
  // Optional: specify a different sender
  fromUserId?: string;
};

/**
 * Send message as a specific user
 * Uses secretKey to generate UserSig on-the-fly if available
 */
export async function sendMessageTencentIM(
  opts: SendMessageOpts,
): Promise<{ ok: boolean; error?: string; messageId?: string }> {
  const { cfg, to, text, accountId, runtime, fromUserId } = opts;

  const account = resolveTencentAccount({ cfg, accountId });
  if (!account.configured) {
    return { ok: false, error: "Account not configured" };
  }

  const client = await createTIMRestClient(account);
  if (!client) {
    return { ok: false, error: "Failed to create REST client" };
  }

  try {
    const isGroup = looksLikeGroupId(to);
    const msgRandom = Math.floor(Math.random() * 4294967295);

    // Use specified fromUserId or fall back to account's default userId
    const actualSender = fromUserId || account.userId;

    const msgBody = [
      {
        MsgType: "TIMTextElem",
        MsgContent: {
          Text: text,
        },
      },
    ];

    let request: SendMsgRequest;
    let service: string;
    let command: string;

    if (isGroup) {
      // Group message
      service = "group_open_http_svc";
      command = "send_group_msg";
      request = {
        From_Account: actualSender, // The actual sender (can be any user)
        GroupId: extractGroupId(to),
        MsgRandom: msgRandom,
        MsgBody: msgBody,
        SyncOtherMachine: 2, // Don't sync to avoid duplicates
      };
    } else {
      // C2C message
      service = "openim";
      command = "sendmsg";
      request = {
        From_Account: actualSender, // The actual sender (can be any user)
        To_Account: extractUserId(to),
        MsgRandom: msgRandom,
        MsgBody: msgBody,
        SyncOtherMachine: 2,
      };
    }

    const response = await client.makeRequest<SendMsgResponse>(service, command, request);

    if (response.ErrorCode !== 0) {
      return { ok: false, error: `API Error ${response.ErrorCode}: ${response.ErrorInfo}` };
    }

    return { ok: true, messageId: response.MsgKey };
  } catch (error) {
    runtime?.error?.(`Tencent IM send error: ${String(error)}`);
    return { ok: false, error: String(error) };
  }
}

/**
 * Send media message
 */
export async function sendMediaTencentIM(
  opts: SendMediaOpts,
): Promise<{ ok: boolean; error?: string; messageId?: string }> {
  const { cfg, to, mediaUrl, mediaType, fileName, accountId, runtime, fromUserId } = opts;

  const account = resolveTencentAccount({ cfg, accountId });
  if (!account.configured) {
    return { ok: false, error: "Account not configured" };
  }

  const client = await createTIMRestClient(account);
  if (!client) {
    return { ok: false, error: "Failed to create REST client" };
  }

  try {
    const isGroup = looksLikeGroupId(to);
    const msgRandom = Math.floor(Math.random() * 4294967295);

    // Use specified fromUserId or fall back to account's default userId
    const actualSender = fromUserId || account.userId;

    let msgBody: { MsgType: string; MsgContent: Record<string, unknown> }[];

    if (mediaType === "image") {
      msgBody = [
        {
          MsgType: "TIMImageElem",
          MsgContent: {
            UUID: mediaUrl,
            ImageFormat: 1,
            ImageInfoArray: [
              {
                Type: 1,
                Size: 0,
                Width: 0,
                Height: 0,
                URL: mediaUrl,
              },
            ],
          },
        },
      ];
    } else {
      msgBody = [
        {
          MsgType: "TIMFileElem",
          MsgContent: {
            FileName: fileName || "file",
            UUID: mediaUrl,
          },
        },
      ];
    }

    let request: SendMsgRequest;
    let service: string;
    let command: string;

    if (isGroup) {
      service = "group_open_http_svc";
      command = "send_group_msg";
      request = {
        From_Account: actualSender,
        GroupId: extractGroupId(to),
        MsgRandom: msgRandom,
        MsgBody: msgBody,
        SyncOtherMachine: 2,
      };
    } else {
      service = "openim";
      command = "sendmsg";
      request = {
        From_Account: actualSender,
        To_Account: extractUserId(to),
        MsgRandom: msgRandom,
        MsgBody: msgBody,
        SyncOtherMachine: 2,
      };
    }

    const response = await client.makeRequest<SendMsgResponse>(service, command, request);

    if (response.ErrorCode !== 0) {
      return { ok: false, error: `API Error ${response.ErrorCode}: ${response.ErrorInfo}` };
    }

    return { ok: true, messageId: response.MsgKey };
  } catch (error) {
    runtime?.error?.(`Tencent IM send media error: ${String(error)}`);
    return { ok: false, error: String(error) };
  }
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
