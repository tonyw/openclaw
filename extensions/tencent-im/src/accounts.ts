import type { ClawdbotConfig } from "openclaw/plugin-sdk";
import { DEFAULT_ACCOUNT_ID } from "openclaw/plugin-sdk";
import type { TencentIMConfig, ResolvedTencentAccount } from "./types.js";
import { getTencentIMConfig } from "./types.js";

export function listTencentAccountIds(cfg: ClawdbotConfig): string[] {
  const config = getTencentIMConfig(cfg);
  if (!config) return [];

  const ids: string[] = [];

  // Check default account
  if (hasAccountConfig(config)) {
    ids.push(DEFAULT_ACCOUNT_ID);
  }

  // Check named accounts
  if (config.accounts) {
    for (const [accountId] of Object.entries(config.accounts)) {
      if (hasAccountConfig(config.accounts[accountId])) {
        ids.push(accountId);
      }
    }
  }

  return ids;
}

export function resolveDefaultTencentAccountId(_cfg: ClawdbotConfig): string | undefined {
  return DEFAULT_ACCOUNT_ID;
}

export function resolveTencentAccount({
  cfg,
  accountId,
}: {
  cfg: ClawdbotConfig;
  accountId?: string;
}): ResolvedTencentAccount {
  const config = getTencentIMConfig(cfg);
  const effectiveAccountId = accountId ?? DEFAULT_ACCOUNT_ID;

  if (!config) {
    return createUnconfiguredAccount(effectiveAccountId);
  }

  // Get account-specific config or default
  const accountConfig =
    effectiveAccountId !== DEFAULT_ACCOUNT_ID ? config.accounts?.[effectiveAccountId] : config;

  if (!accountConfig && effectiveAccountId !== DEFAULT_ACCOUNT_ID) {
    return createUnconfiguredAccount(effectiveAccountId);
  }

  const baseConfig =
    effectiveAccountId === DEFAULT_ACCOUNT_ID ? config : { ...config, ...accountConfig };

  const sdkAppId = baseConfig.sdkAppId ?? "";
  const userId = baseConfig.userId ?? "";
  const secretKey = baseConfig.secretKey;
  const userSig = baseConfig.userSig ?? "";

  // Configured if we have sdkAppId + userId + (secretKey or userSig)
  const configured = Boolean(sdkAppId && userId && (secretKey || userSig));

  return {
    accountId: effectiveAccountId,
    enabled: baseConfig.enabled ?? true,
    configured,
    name: effectiveAccountId === DEFAULT_ACCOUNT_ID ? undefined : effectiveAccountId,
    sdkAppId,
    secretKey,
    userSig,
    adminUserId: baseConfig.adminUserId ?? userId,
    userId,
    connectionMode: baseConfig.connectionMode ?? "websocket",
    webhookPort: baseConfig.webhookPort,
    webhookPath: baseConfig.webhookPath ?? "/webhook/tencent-im",
    dmPolicy: baseConfig.dmPolicy ?? "pairing",
    allowFrom: (baseConfig.allowFrom ?? []).map(String),
    groupPolicy: baseConfig.groupPolicy ?? "allowlist",
    groupAllowFrom: (baseConfig.groupAllowFrom ?? []).map(String),
    requireMention: baseConfig.requireMention ?? false,
    textChunkLimit: baseConfig.textChunkLimit ?? 2000,
    mediaMaxMb: baseConfig.mediaMaxMb ?? 20,
    config: baseConfig,
  };
}

export function resolveTencentCredentials(account: ResolvedTencentAccount): {
  sdkAppId: string;
  secretKey?: string;
  userSig: string;
  userId: string;
} {
  return {
    sdkAppId: account.sdkAppId,
    secretKey: account.secretKey,
    userSig: account.userSig,
    userId: account.userId,
  };
}

function hasAccountConfig(config: TencentIMConfig | undefined): boolean {
  if (!config) return false;
  // Need sdkAppId + userId + (secretKey or userSig)
  return Boolean(config.sdkAppId && config.userId && (config.secretKey || config.userSig));
}

function createUnconfiguredAccount(accountId: string): ResolvedTencentAccount {
  return {
    accountId,
    enabled: false,
    configured: false,
    name: accountId === DEFAULT_ACCOUNT_ID ? undefined : accountId,
    sdkAppId: "",
    secretKey: undefined,
    userSig: "",
    adminUserId: "",
    userId: "",
    connectionMode: "websocket",
    webhookPath: "/webhook/tencent-im",
    dmPolicy: "pairing",
    allowFrom: [],
    groupPolicy: "allowlist",
    groupAllowFrom: [],
    requireMention: false,
    textChunkLimit: 2000,
    mediaMaxMb: 20,
    config: undefined,
  };
}

export function listEnabledTencentAccounts(cfg: ClawdbotConfig): ResolvedTencentAccount[] {
  const accountIds = listTencentAccountIds(cfg);
  return accountIds
    .map((id) => resolveTencentAccount({ cfg, accountId: id }))
    .filter((a) => a.enabled && a.configured);
}
