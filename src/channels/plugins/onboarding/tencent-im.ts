import type { OpenClawConfig } from "../../../config/config.js";
import type { DmPolicy } from "../../../config/types.js";
import type { WizardPrompter } from "../../../wizard/prompts.js";
import type { ChannelOnboardingAdapter, ChannelOnboardingDmPolicy } from "../onboarding-types.js";
import { DEFAULT_ACCOUNT_ID, normalizeAccountId } from "../../../routing/session-key.js";
import {
  listTencentIMAccountIds,
  resolveDefaultTencentIMAccountId,
  resolveTencentIMAccount,
} from "../../../tencent-im/accounts.js";
import { formatDocsLink } from "../../../terminal/links.js";
import { addWildcardAllowFrom, promptAccountId } from "./helpers.js";

const channel = "tencent-im" as const;

function setTencentIMDmPolicy(cfg: OpenClawConfig, dmPolicy: DmPolicy) {
  const allowFrom =
    dmPolicy === "open" ? addWildcardAllowFrom(cfg.channels?.["tencent-im"]?.allowFrom) : undefined;
  return {
    ...cfg,
    channels: {
      ...cfg.channels,
      "tencent-im": {
        ...cfg.channels?.["tencent-im"],
        dmPolicy,
        ...(allowFrom ? { allowFrom } : {}),
      },
    },
  };
}

async function promptTencentIMAllowFrom(params: {
  cfg: OpenClawConfig;
  prompter: WizardPrompter;
  accountId: string;
}): Promise<OpenClawConfig> {
  const { cfg, prompter, accountId } = params;
  const resolved = resolveTencentIMAccount({ cfg, accountId });
  const existingAllowFrom = resolved.config?.allowFrom ?? [];

  await prompter.note(
    [
      "Allowlist Tencent IM DMs by user ID.",
      "Examples:",
      "- user_123 (single user ID)",
      "- user_123, user_456 (multiple users)",
      `Docs: ${formatDocsLink("/tencent-im", "tencent-im")}`,
    ].join("\n"),
    "Tencent IM allowlist",
  );

  const parseInput = (value: string) =>
    value
      .split(/[\n,;]+/g)
      .map((entry) => entry.trim())
      .filter(Boolean);

  const entry = await prompter.text({
    message: "Tencent IM allowFrom (user ID)",
    placeholder: "user_123, user_456",
    initialValue: existingAllowFrom[0] ? String(existingAllowFrom[0]) : undefined,
    validate: (value) => (String(value ?? "").trim() ? undefined : "Required"),
  });

  const parts = parseInput(String(entry));
  const merged = [
    ...existingAllowFrom.map((item) => String(item).trim()).filter(Boolean),
    ...parts,
  ];
  const unique = [...new Set(merged)];

  if (accountId === DEFAULT_ACCOUNT_ID) {
    return {
      ...cfg,
      channels: {
        ...cfg.channels,
        "tencent-im": {
          ...cfg.channels?.["tencent-im"],
          enabled: true,
          dmPolicy: "allowlist",
          allowFrom: unique,
        },
      },
    };
  }

  return {
    ...cfg,
    channels: {
      ...cfg.channels,
      "tencent-im": {
        ...cfg.channels?.["tencent-im"],
        enabled: true,
        accounts: {
          ...cfg.channels?.["tencent-im"]?.accounts,
          [accountId]: {
            ...cfg.channels?.["tencent-im"]?.accounts?.[accountId],
            enabled: cfg.channels?.["tencent-im"]?.accounts?.[accountId]?.enabled ?? true,
            dmPolicy: "allowlist",
            allowFrom: unique,
          },
        },
      },
    },
  };
}

async function promptTencentIMAllowFromForAccount(params: {
  cfg: OpenClawConfig;
  prompter: WizardPrompter;
  accountId?: string;
}): Promise<OpenClawConfig> {
  const accountId =
    params.accountId && normalizeAccountId(params.accountId)
      ? (normalizeAccountId(params.accountId) ?? DEFAULT_ACCOUNT_ID)
      : (resolveDefaultTencentIMAccountId(params.cfg) ?? DEFAULT_ACCOUNT_ID);
  return promptTencentIMAllowFrom({
    cfg: params.cfg,
    prompter: params.prompter,
    accountId: accountId || DEFAULT_ACCOUNT_ID,
  });
}

const dmPolicy: ChannelOnboardingDmPolicy = {
  label: "Tencent IM",
  channel,
  policyKey: "channels.tencent-im.dmPolicy",
  allowFromKey: "channels.tencent-im.allowFrom",
  getCurrent: (cfg) => cfg.channels?.["tencent-im"]?.dmPolicy ?? "pairing",
  setPolicy: (cfg, policy) => setTencentIMDmPolicy(cfg, policy),
  promptAllowFrom: promptTencentIMAllowFromForAccount,
};

export const tencentIMOnboardingAdapter: ChannelOnboardingAdapter = {
  channel,
  getStatus: async ({ cfg }) => {
    const accountIds = listTencentIMAccountIds(cfg);
    const configured = accountIds.some((accountId) => {
      const account = resolveTencentIMAccount({ cfg, accountId });
      return Boolean(account.sdkAppId && account.secretKey);
    });
    return {
      channel,
      configured,
      statusLines: [`Tencent IM: ${configured ? "configured" : "needs credentials"}`],
      selectionHint: configured ? "configured" : "needs credentials",
      quickstartScore: configured ? 1 : 20,
    };
  },
  configure: async ({
    cfg,
    prompter,
    accountOverrides,
    shouldPromptAccountIds,
    forceAllowFrom,
  }) => {
    const tencentIMOverride = accountOverrides["tencent-im"]?.trim();
    const defaultTencentIMAccountId = resolveDefaultTencentIMAccountId(cfg);
    let tencentIMAccountId: string =
      (tencentIMOverride ? normalizeAccountId(tencentIMOverride) : defaultTencentIMAccountId) ??
      DEFAULT_ACCOUNT_ID;

    if (shouldPromptAccountIds && !tencentIMOverride) {
      tencentIMAccountId =
        (await promptAccountId({
          cfg,
          prompter,
          label: "Tencent IM",
          currentId: tencentIMAccountId,
          listAccountIds: listTencentIMAccountIds,
          defaultAccountId: defaultTencentIMAccountId ?? DEFAULT_ACCOUNT_ID,
        })) ?? DEFAULT_ACCOUNT_ID;
    }

    await prompter.note(
      [
        "Tencent IM Setup:",
        "1) Create an application in Tencent Cloud IM Console: https://console.cloud.tencent.com/im",
        "2) Get your SDKAppID and SecretKey from the app details",
        "3) Configure the webhook callback URL to point to this server",
        `Docs: ${formatDocsLink("/tencent-im", "tencent-im")}`,
      ].join("\n"),
      "Tencent IM",
    );

    let next = cfg;
    const resolvedAccount = resolveTencentIMAccount({
      cfg: next,
      accountId: tencentIMAccountId,
    });

    // Prompt for SDKAppID
    const sdkAppId = await prompter.text({
      message: "Tencent IM SDKAppID",
      placeholder: "1400000000",
      initialValue: resolvedAccount.sdkAppId,
      validate: (value) => {
        const trimmed = String(value ?? "").trim();
        if (!trimmed) {
          return "SDKAppID is required";
        }
        if (!/^\d+$/.test(trimmed)) {
          return "SDKAppID must be numeric";
        }
        return undefined;
      },
    });

    // Prompt for SecretKey
    const secretKey = await prompter.text({
      message: "Tencent IM SecretKey",
      placeholder: "your-secret-key",
      initialValue: resolvedAccount.secretKey,
      validate: (value) => (String(value ?? "").trim() ? undefined : "SecretKey is required"),
    });

    // Prompt for Admin User ID (optional)
    const adminUserId = await prompter.text({
      message: "Tencent IM Admin User ID (optional)",
      placeholder: "administrator",
      initialValue: resolvedAccount.adminUserId ?? "administrator",
    });

    // Prompt for User ID (optional, defaults to adminUserId)
    const userId = await prompter.text({
      message: "Tencent IM User ID for sending messages (optional)",
      placeholder: adminUserId || "administrator",
      initialValue: resolvedAccount.config?.userId,
    });

    // Prompt for Connection Mode
    const connectionModeResult = await prompter.select({
      message: "Connection mode for receiving messages",
      options: [
        { value: "webhook", label: "Webhook (HTTP callback) - Recommended" },
        { value: "websocket", label: "WebSocket (not yet implemented)" },
      ],
    });
    const connectionMode = String(connectionModeResult ?? "webhook") as "webhook" | "websocket";

    // Prompt for requireMention in groups
    const requireMention = await prompter.confirm({
      message: "Require @mention in group chats for the bot to respond?",
      initialValue: resolvedAccount.config?.requireMention ?? false,
    });

    // Prompt for Webhook settings (optional)
    await prompter.note(
      [
        "Webhook Configuration (optional):",
        "These settings control how Tencent IM sends message events to this server.",
        "Defaults: port=12000, path=/webhook",
      ].join("\n"),
      "Tencent IM Webhook",
    );

    const webhookPort = await prompter.text({
      message: "Webhook port",
      placeholder: "12000",
      initialValue: String(resolvedAccount.webhookPort ?? 12000),
      validate: (value) => {
        const trimmed = String(value ?? "").trim();
        if (!trimmed) {
          return undefined;
        }
        const port = parseInt(trimmed, 10);
        if (isNaN(port) || port < 1 || port > 65535) {
          return "Invalid port number";
        }
        return undefined;
      },
    });

    const webhookPath = await prompter.text({
      message: "Webhook path",
      placeholder: "/webhook",
      initialValue: resolvedAccount.webhookPath ?? "/webhook",
    });

    const webhookSecret = await prompter.text({
      message: "Webhook secret (optional, for signature verification)",
      placeholder: "your-webhook-secret",
      initialValue: resolvedAccount.webhookSecret,
    });

    // Update config
    const port = parseInt(String(webhookPort ?? "12000").trim(), 10);
    const path = String(webhookPath ?? "/webhook").trim() || "/webhook";

    const baseConfigUpdate = {
      enabled: true,
      sdkAppId: String(sdkAppId ?? "").trim(),
      secretKey: String(secretKey ?? "").trim(),
      adminUserId: String(adminUserId ?? "administrator").trim() || "administrator",
      ...(userId?.trim() ? { userId: userId.trim() } : {}),
      connectionMode: connectionMode ?? "webhook",
      requireMention: requireMention ?? false,
      webhookPort: port,
      webhookPath: path,
      ...(webhookSecret?.trim() ? { webhookSecret: webhookSecret.trim() } : {}),
    };

    if (tencentIMAccountId === DEFAULT_ACCOUNT_ID) {
      next = {
        ...next,
        channels: {
          ...next.channels,
          "tencent-im": {
            ...next.channels?.["tencent-im"],
            ...baseConfigUpdate,
          },
        },
      };
    } else {
      next = {
        ...next,
        channels: {
          ...next.channels,
          "tencent-im": {
            ...next.channels?.["tencent-im"],
            enabled: true,
            accounts: {
              ...next.channels?.["tencent-im"]?.accounts,
              [tencentIMAccountId]: {
                ...next.channels?.["tencent-im"]?.accounts?.[tencentIMAccountId],
                ...baseConfigUpdate,
              },
            },
          },
        },
      };
    }

    // Handle allowlist if needed
    const dmPolicyValue = next.channels?.["tencent-im"]?.dmPolicy ?? "pairing";
    if (forceAllowFrom && dmPolicyValue !== "open") {
      next = await promptTencentIMAllowFrom({
        cfg: next,
        prompter,
        accountId: tencentIMAccountId,
      });
    }

    return { cfg: next, accountId: tencentIMAccountId };
  },
  dmPolicy,
  disable: (cfg) => ({
    ...cfg,
    channels: {
      ...cfg.channels,
      "tencent-im": {
        ...cfg.channels?.["tencent-im"],
        enabled: false,
      },
    },
  }),
};
