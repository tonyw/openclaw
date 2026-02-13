import type { ResolvedTencentAccount } from "./types.js";
import { createTIMRestClient, type AccountCheckResponse } from "./client.js";

export type TencentProbeResult =
  | {
      ok: true;
      sdkAppId: string;
      userId: string;
      adminUserId: string;
      botUserId: string;
      status: "connected";
    }
  | {
      ok: false;
      sdkAppId: string;
      userId: string;
      adminUserId: string;
      error: string;
      status: "error" | "login_failed";
    };

export async function probeTencent(account: ResolvedTencentAccount): Promise<TencentProbeResult> {
  if (!account.configured) {
    return {
      ok: false,
      sdkAppId: account.sdkAppId,
      userId: account.userId,
      adminUserId: account.adminUserId,
      error: "Account not configured (missing sdkAppId, adminUserId/userId, or userSig)",
      status: "error",
    };
  }

  const client = await createTIMRestClient(account);
  if (!client) {
    return {
      ok: false,
      sdkAppId: account.sdkAppId,
      userId: account.userId,
      adminUserId: account.adminUserId,
      error: "Failed to create REST client",
      status: "error",
    };
  }

  try {
    // 尝试检查管理员账号状态作为健康检查
    const response = await client.makeRequest<AccountCheckResponse>(
      "im_open_login_svc",
      "account_check",
      {
        CheckItem: [{ UserID: account.adminUserId }],
      },
    );

    // 错误 60010 表示 identifier 不是 admin - 这在使用非管理员账号进行 API 调用时预期会发生
    if (response.ErrorCode === 60010) {
      return {
        ok: false,
        sdkAppId: account.sdkAppId,
        userId: account.userId,
        adminUserId: account.adminUserId,
        error:
          "The configured adminUserId does not have admin privileges. Please use an admin account for REST API calls.",
        status: "login_failed",
      };
    }

    // 70169 = 账号未找到，这对于新创建的账号可能是正常的
    if (response.ErrorCode !== 0 && response.ErrorCode !== 70169) {
      return {
        ok: false,
        sdkAppId: account.sdkAppId,
        userId: account.userId,
        adminUserId: account.adminUserId,
        error: `API Error ${response.ErrorCode}: ${response.ErrorInfo}`,
        status: "login_failed",
      };
    }

    return {
      ok: true,
      sdkAppId: account.sdkAppId,
      userId: account.userId,
      adminUserId: account.adminUserId,
      botUserId: account.userId,
      status: "connected",
    };
  } catch (error) {
    return {
      ok: false,
      sdkAppId: account.sdkAppId,
      userId: account.userId,
      adminUserId: account.adminUserId,
      error: error instanceof Error ? error.message : String(error),
      status: "error",
    };
  }
}
