import type { ResolvedTencentAccount } from "./types.js";
import { createTIMRestClient, type AccountCheckResponse } from "./client-rest.js";

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
    // Try to check admin account status as a health check
    const response = await client.makeRequest<AccountCheckResponse>(
      "im_open_login_svc",
      "account_check",
      {
        CheckItem: [{ UserID: account.adminUserId }],
      },
    );

    // Error 60010 means identifier is not admin - that's expected if using non-admin for API
    // But we need admin for the identifier, so this is actually a config issue
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

    if (response.ErrorCode !== 0 && response.ErrorCode !== 70169) {
      // 70169 = account not found, which might be OK for newly created accounts
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
