import type { GroupToolPolicy } from "openclaw/plugin-sdk";
import type { ResolvedTencentAccount } from "./types.js";

export function resolveTencentGroupToolPolicy(
  account: ResolvedTencentAccount,
  _groupId: string,
): GroupToolPolicy {
  // Tencent IM groups require mention by default
  // This can be customized based on group settings
  return {
    requireMention: account.requireMention,
    allowFrom: account.groupAllowFrom,
  };
}
