import type { OpenClawConfig } from "../config/config.js";
import type { TencentIMConfig, TencentIMAccountConfig } from "../config/types.tencent-im.js";
import { DEFAULT_ACCOUNT_ID } from "../routing/session-key.js";

export type ResolvedTencentIMAccount = {
  accountId: string;
  enabled: boolean;
  configured: boolean;
  name?: string;
  sdkAppId: string;
  secretKey?: string;
  userSig: string;
  adminUserId: string;
  /** User ID used for sending messages (defaults to adminUserId) */
  userId: string;
  dmPolicy: "pairing" | "allowlist" | "open" | "disabled";
  allowFrom: string[];
  groupPolicy: "open" | "disabled" | "allowlist";
  groupAllowFrom: string[];
  /** Require @mention in group chats for the bot to respond */
  requireMention: boolean;
  /** Connection mode: webhook or websocket */
  connectionMode: "webhook" | "websocket";
  textChunkLimit: number;
  mediaMaxMb: number;
  webhookPort?: number;
  webhookPath: string;
  webhookSecret?: string;
  config: TencentIMAccountConfig | undefined;
};

export function listTencentIMAccountIds(cfg: OpenClawConfig): string[] {
  const config = cfg.channels?.["tencent-im"];
  if (!config) {
    return [];
  }

  const ids: string[] = [];

  // Check default account
  if (hasAccountConfig(config)) {
    ids.push(DEFAULT_ACCOUNT_ID);
  }

  // Check named accounts
  if (config.accounts) {
    for (const [accountId] of Object.entries(config.accounts)) {
      if (hasAccountConfig(config.accounts?.[accountId])) {
        ids.push(accountId);
      }
    }
  }

  return ids;
}

export function resolveDefaultTencentIMAccountId(_cfg: OpenClawConfig): string | undefined {
  return DEFAULT_ACCOUNT_ID;
}

export function resolveTencentIMAccount({
  cfg,
  accountId,
}: {
  cfg: OpenClawConfig;
  accountId?: string;
}): ResolvedTencentIMAccount {
  const config = cfg.channels?.["tencent-im"];
  const effectiveAccountId = accountId ?? DEFAULT_ACCOUNT_ID;

  if (!config) {
    return createUnconfiguredAccount(effectiveAccountId);
  }

  // Get account-specific config or default config
  const accountConfig =
    effectiveAccountId !== DEFAULT_ACCOUNT_ID ? config.accounts?.[effectiveAccountId] : config;

  if (!accountConfig && effectiveAccountId !== DEFAULT_ACCOUNT_ID) {
    return createUnconfiguredAccount(effectiveAccountId);
  }

  const baseConfig: TencentIMAccountConfig =
    effectiveAccountId === DEFAULT_ACCOUNT_ID ? config : { ...config, ...accountConfig };

  const sdkAppId = baseConfig.sdkAppId ?? "";
  const adminUserId = baseConfig.adminUserId ?? "administrator";
  const userId = baseConfig.userId ?? adminUserId;
  const secretKey = baseConfig.secretKey;
  const userSig = baseConfig.userSig ?? "";
  const connectionMode = baseConfig.connectionMode ?? "webhook";
  const requireMention = baseConfig.requireMention ?? false;

  // Configured condition: sdkAppId + (secretKey or userSig)
  const configured = Boolean(sdkAppId && (secretKey || userSig));

  return {
    accountId: effectiveAccountId,
    enabled: baseConfig.enabled ?? true,
    configured,
    name: effectiveAccountId === DEFAULT_ACCOUNT_ID ? undefined : effectiveAccountId,
    sdkAppId,
    secretKey,
    userSig,
    adminUserId,
    userId,
    dmPolicy: baseConfig.dmPolicy ?? "pairing",
    allowFrom: (baseConfig.allowFrom ?? []).map(String),
    groupPolicy: baseConfig.groupPolicy ?? "allowlist",
    groupAllowFrom: (baseConfig.groupAllowFrom ?? []).map(String),
    requireMention,
    connectionMode,
    textChunkLimit: baseConfig.textChunkLimit ?? 4000,
    mediaMaxMb: baseConfig.mediaMaxMb ?? 20,
    webhookPort: baseConfig.webhookPort,
    webhookPath: baseConfig.webhookPath ?? "/webhook",
    webhookSecret: baseConfig.webhookSecret,
    config: baseConfig,
  };
}

export function resolveTencentIMCredentials(account: ResolvedTencentIMAccount): {
  sdkAppId: string;
  secretKey?: string;
  userSig: string;
  adminUserId: string;
} {
  return {
    sdkAppId: account.sdkAppId,
    secretKey: account.secretKey,
    userSig: account.userSig,
    adminUserId: account.adminUserId,
  };
}

function hasAccountConfig(config: TencentIMConfig | TencentIMAccountConfig | undefined): boolean {
  if (!config) {
    return false;
  }
  const c = config as TencentIMAccountConfig;
  return Boolean(c.sdkAppId && c.adminUserId && (c.secretKey || c.userSig));
}

function createUnconfiguredAccount(accountId: string): ResolvedTencentIMAccount {
  return {
    accountId,
    enabled: false,
    configured: false,
    name: accountId === DEFAULT_ACCOUNT_ID ? undefined : accountId,
    sdkAppId: "",
    secretKey: undefined,
    userSig: "",
    adminUserId: "administrator",
    userId: "administrator",
    dmPolicy: "pairing",
    allowFrom: [],
    groupPolicy: "allowlist",
    groupAllowFrom: [],
    requireMention: false,
    connectionMode: "webhook",
    textChunkLimit: 4000,
    mediaMaxMb: 20,
    webhookPath: "/webhook",
    config: undefined,
  };
}

export function listEnabledTencentIMAccounts(cfg: OpenClawConfig): ResolvedTencentIMAccount[] {
  const accountIds = listTencentIMAccountIds(cfg);
  return accountIds
    .map((id) => resolveTencentIMAccount({ cfg, accountId: id }))
    .filter((a) => a.enabled && a.configured);
}
