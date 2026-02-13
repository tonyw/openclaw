import type { ResolvedTencentAccount } from "./types.js";
import { generateUserSig } from "./usersig.js";

const REST_API_BASE = "https://console.tim.qq.com/v4";

export type TIMRestClient = {
  account: ResolvedTencentAccount;
  makeRequest: <T>(service: string, command: string, body: unknown) => Promise<T>;
};

export async function createTIMRestClient(
  account: ResolvedTencentAccount,
): Promise<TIMRestClient | null> {
  if (!account.configured) {
    return null;
  }

  // 使用 secretKey 动态生成 UserSig
  let userSig: string;

  if (account.secretKey) {
    const identifier = account.adminUserId || account.userId;
    userSig = generateUserSig(identifier, account.sdkAppId, account.secretKey);
  } else {
    userSig = account.userSig;
  }

  return {
    account,
    makeRequest: async <T>(service: string, command: string, body: unknown): Promise<T> => {
      const identifier = account.adminUserId || account.userId;
      const url = buildRequestUrl(account, service, command, identifier, userSig);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      return response.json() as Promise<T>;
    },
  };
}

function buildRequestUrl(
  account: ResolvedTencentAccount,
  service: string,
  command: string,
  identifier: string,
  userSig: string,
): string {
  const sdkAppId = account.sdkAppId;
  const random = Math.floor(Math.random() * 4294967295);

  return `${REST_API_BASE}/${service}/${command}?sdkappid=${sdkAppId}&identifier=${encodeURIComponent(identifier)}&usersig=${encodeURIComponent(userSig)}&random=${random}&contenttype=json`;
}

// REST API 类型
export type SendMsgRequest = {
  From_Account?: string;
  To_Account?: string;
  GroupId?: string;
  MsgRandom: number;
  MsgBody: MsgBody[];
  SyncOtherMachine?: number;
  MsgLifeTime?: number;
};

export type MsgBody = {
  MsgType: string;
  MsgContent: Record<string, unknown>;
};

export type SendMsgResponse = {
  ActionStatus: string;
  ErrorInfo: string;
  ErrorCode: number;
  MsgTime: number;
  MsgKey: string;
};

export type AccountCheckRequest = {
  CheckItem: { UserID: string }[];
};

export type AccountCheckResponse = {
  ActionStatus: string;
  ErrorInfo: string;
  ErrorCode: number;
  ResultItem: {
    UserID: string;
    AccountStatus: string;
  }[];
};
