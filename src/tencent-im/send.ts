import type { OpenClawConfig } from "../config/config.js";
import type { ResolvedTencentIMAccount } from "./accounts.js";
import { resolveTencentIMAccount } from "./accounts.js";
import { looksLikeGroupId, extractUserId, extractGroupId } from "./targets.js";
import { generateUserSig } from "./usersig.js";

export type SendMessageOpts = {
  cfg: OpenClawConfig;
  to: string;
  text: string;
  accountId?: string;
  replyToMessageId?: string;
  fromUserId?: string;
};

interface TencentIMApiResponse {
  ActionStatus: string;
  ErrorCode: number;
  ErrorInfo: string;
  MsgKey?: string;
}

/**
 * Send text message via Tencent IM REST API
 */
export async function sendMessageTencentIM(
  opts: SendMessageOpts,
): Promise<{ ok: boolean; error?: string; messageId?: string }> {
  const { cfg, to, text, accountId, fromUserId } = opts;

  if (!to) {
    return { ok: false, error: "Target (to) is required" };
  }

  const account = resolveTencentIMAccount({ cfg, accountId });
  if (!account.configured) {
    return { ok: false, error: "Account not configured" };
  }

  try {
    const isGroup = looksLikeGroupId(to);
    const msgRandom = Math.floor(Math.random() * 4294967295);
    const actualSender = fromUserId || account.adminUserId;

    const msgBody = [
      {
        MsgType: "TIMTextElem",
        MsgContent: {
          Text: text,
        },
      },
    ];

    let service: string;
    let command: string;
    const request: Record<string, unknown> = {
      From_Account: actualSender,
      MsgRandom: msgRandom,
      MsgBody: msgBody,
      SyncOtherMachine: 2,
    };

    if (isGroup) {
      // Group message
      service = "group_open_http_svc";
      command = "send_group_msg";
      request.GroupId = extractGroupId(to);
    } else {
      // C2C message
      service = "openim";
      command = "sendmsg";
      request.To_Account = extractUserId(to);
    }

    const response = await makeTencentIMApiRequest<TencentIMApiResponse>({
      account,
      service,
      command,
      request,
    });

    if (response.ErrorCode !== 0) {
      return { ok: false, error: `API Error ${response.ErrorCode}: ${response.ErrorInfo}` };
    }

    return { ok: true, messageId: response.MsgKey };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
}

/**
 * Make Tencent IM API request
 */
async function makeTencentIMApiRequest<T>({
  account,
  service,
  command,
  request,
}: {
  account: ResolvedTencentIMAccount;
  service: string;
  command: string;
  request: Record<string, unknown>;
}): Promise<T> {
  const userSig = account.secretKey
    ? generateUserSig(account.adminUserId, account.sdkAppId, account.secretKey)
    : account.userSig;

  const baseUrl = "https://console.tim.qq.com/v4";
  const queryParams = new URLSearchParams({
    sdkappid: account.sdkAppId,
    identifier: account.adminUserId,
    usersig: userSig,
    random: String(Math.floor(Math.random() * 4294967295)),
    contenttype: "json",
  });

  const url = `${baseUrl}/${service}/${command}?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }

  return response.json() as Promise<T>;
}
