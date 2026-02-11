import type { ResolvedTencentAccount } from "./types.js";
import { createTIMClient, loginTIM, logoutTIM } from "./client.js";

export type TencentProbeResult =
  | {
      ok: true;
      sdkAppId: string;
      userId: string;
      botUserId: string;
      status: "connected";
    }
  | {
      ok: false;
      sdkAppId: string;
      userId: string;
      error: string;
      status: "error" | "login_failed";
    };

export async function probeTencent(account: ResolvedTencentAccount): Promise<TencentProbeResult> {
  if (!account.configured) {
    return {
      ok: false,
      sdkAppId: account.sdkAppId,
      userId: account.userId,
      error: "Account not configured (missing sdkAppId, userId, or userSig)",
      status: "error",
    };
  }

  const tim = await createTIMClient(account);
  if (!tim) {
    return {
      ok: false,
      sdkAppId: account.sdkAppId,
      userId: account.userId,
      error: "Failed to create TIM client",
      status: "error",
    };
  }

  try {
    const loginSuccess = await loginTIM(tim, account);
    if (!loginSuccess) {
      return {
        ok: false,
        sdkAppId: account.sdkAppId,
        userId: account.userId,
        error: "Login failed - check userSig and SDKAppID",
        status: "login_failed",
      };
    }

    // Successfully logged in
    await logoutTIM(tim);

    return {
      ok: true,
      sdkAppId: account.sdkAppId,
      userId: account.userId,
      botUserId: account.userId,
      status: "connected",
    };
  } catch (error) {
    return {
      ok: false,
      sdkAppId: account.sdkAppId,
      userId: account.userId,
      error: error instanceof Error ? error.message : String(error),
      status: "error",
    };
  }
}
