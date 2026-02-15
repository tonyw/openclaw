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
      const errorMsg = `API Error ${response.ErrorCode}: ${response.ErrorInfo || "Unknown error"}`;
      // Log detailed error for debugging
      console.error(`[tencent-im] Send failed:`, {
        service,
        command,
        target: to,
        errorCode: response.ErrorCode,
        errorInfo: response.ErrorInfo,
        request: {
          From_Account: request.From_Account,
          ...(isGroup ? { GroupId: request.GroupId } : { To_Account: request.To_Account }),
        },
      });
      return { ok: false, error: errorMsg };
    }

    return { ok: true, messageId: response.MsgKey };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[tencent-im] Send exception:`, {
      target: to,
      error: errorMsg,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { ok: false, error: errorMsg };
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
    const errorText = await response.text().catch(() => "");
    throw new Error(`HTTP error ${response.status}: ${errorText || response.statusText}`);
  }

  const responseData = await response.json();

  // Log API response for debugging (even if ErrorCode is 0)
  if (typeof responseData === "object" && responseData !== null) {
    const apiResponse = responseData as { ErrorCode?: number; ErrorInfo?: string };
    if (apiResponse.ErrorCode !== undefined && apiResponse.ErrorCode !== 0) {
      // This will be caught and handled by the caller
      return responseData as T;
    }
  }

  return responseData as T;
}
