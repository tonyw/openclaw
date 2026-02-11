import type { ChannelMeta, ChannelPlugin, ClawdbotConfig } from "openclaw/plugin-sdk";
import { DEFAULT_ACCOUNT_ID, PAIRING_APPROVED_MESSAGE } from "openclaw/plugin-sdk";
import type { ResolvedTencentAccount, TencentIMConfig } from "./types.js";
import {
  resolveTencentAccount,
  listTencentAccountIds,
  resolveDefaultTencentAccountId,
} from "./accounts.js";
import {
  listTencentDirectoryPeers,
  listTencentDirectoryGroups,
  listTencentDirectoryPeersLive,
  listTencentDirectoryGroupsLive,
} from "./directory.js";
import { monitorTencentProvider } from "./monitor.js";
import { tencentOnboardingAdapter } from "./onboarding.js";
import { tencentIMOutbound } from "./outbound-rest.js";
import { resolveTencentGroupToolPolicy } from "./policy.js";
import { probeTencent } from "./probe-rest.js";
import { sendMessageTencentIM } from "./send-rest.js";
import { normalizeTencentTarget, looksLikeTencentId, formatTencentTarget } from "./targets.js";

const meta: ChannelMeta = {
  id: "tencent-im",
  label: "Tencent IM",
  selectionLabel: "Tencent Cloud IM (腾讯云IM)",
  docsPath: "/channels/tencent-im",
  docsLabel: "tencent-im",
  blurb:
    "Tencent Cloud instant messaging service via REST API. Supports sending as any user using admin credentials.",
  aliases: ["tim", "tencent"],
  order: 80,
};

export const tencentIMPlugin: ChannelPlugin<ResolvedTencentAccount> = {
  id: "tencent-im",
  meta,

  pairing: {
    idLabel: "tencentUserId",
    normalizeAllowEntry: (entry) => entry.replace(/^user:/i, ""),
    notifyApproval: async ({ cfg, id }) => {
      await sendMessageTencentIM({
        cfg,
        to: id,
        text: PAIRING_APPROVED_MESSAGE,
      });
    },
  },

  capabilities: {
    chatTypes: ["direct", "group"],
    polls: false,
    threads: false,
    media: true,
    reactions: false,
    edit: false,
    reply: true,
  },

  agentPrompt: {
    messageToolHints: () => [
      "- Tencent IM targeting: omit `target` to reply to the current conversation. Explicit targets: `user:<userId>` or `group:<groupId>`.",
      "- Tencent IM supports text, images, and file messages via REST API.",
      "- Messages are sent using admin credentials but can appear from any user (impersonation).",
      "- Group messages may require @mention to activate the bot depending on configuration.",
    ],
  },

  groups: {
    resolveToolPolicy: resolveTencentGroupToolPolicy,
  },

  reload: { configPrefixes: ["channels.tencent-im"] },

  configSchema: {
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        enabled: { type: "boolean" },
        sdkAppId: { type: "string" },
        secretKey: { type: "string" },
        // Admin account for REST API calls (must have admin permission)
        adminUserId: { type: "string" },
        // Default sender user (can be any user, defaults to adminUserId if not set)
        userId: { type: "string" },
        userSig: { type: "string" },
        dmPolicy: { type: "string", enum: ["open", "pairing", "allowlist"], default: "pairing" },
        allowFrom: { type: "array", items: { oneOf: [{ type: "string" }, { type: "number" }] } },
        groupPolicy: {
          type: "string",
          enum: ["open", "allowlist", "disabled"],
          default: "allowlist",
        },
        groupAllowFrom: {
          type: "array",
          items: { oneOf: [{ type: "string" }, { type: "number" }] },
        },
        requireMention: { type: "boolean", default: false },
        textChunkLimit: { type: "integer", minimum: 1, default: 2000 },
        mediaMaxMb: { type: "number", minimum: 0, default: 20 },
        accounts: {
          type: "object",
          additionalProperties: {
            type: "object",
            properties: {
              enabled: { type: "boolean" },
              name: { type: "string" },
              sdkAppId: { type: "string" },
              secretKey: { type: "string" },
              adminUserId: { type: "string" },
              userId: { type: "string" },
              userSig: { type: "string" },
            },
          },
        },
      },
    },
  },

  config: {
    listAccountIds: (cfg) => listTencentAccountIds(cfg),
    resolveAccount: (cfg, accountId) => resolveTencentAccount({ cfg, accountId }),
    defaultAccountId: (cfg) => resolveDefaultTencentAccountId(cfg),
    setAccountEnabled: ({ cfg, accountId, enabled }) => {
      const isDefault = accountId === DEFAULT_ACCOUNT_ID;

      if (isDefault) {
        return {
          ...cfg,
          channels: {
            ...cfg.channels,
            "tencent-im": {
              ...(cfg.channels as Record<string, TencentIMConfig> | undefined)?.["tencent-im"],
              enabled,
            },
          },
        };
      }

      const tencentCfg = (cfg.channels as Record<string, TencentIMConfig> | undefined)?.[
        "tencent-im"
      ];
      return {
        ...cfg,
        channels: {
          ...cfg.channels,
          "tencent-im": {
            ...tencentCfg,
            accounts: {
              ...tencentCfg?.accounts,
              [accountId]: {
                ...tencentCfg?.accounts?.[accountId],
                enabled,
              },
            },
          },
        },
      };
    },
    deleteAccount: ({ cfg, accountId }) => {
      const isDefault = accountId === DEFAULT_ACCOUNT_ID;

      if (isDefault) {
        const next = { ...cfg } as ClawdbotConfig;
        const nextChannels = { ...cfg.channels };
        delete (nextChannels as Record<string, unknown>)["tencent-im"];
        if (Object.keys(nextChannels).length > 0) {
          next.channels = nextChannels;
        } else {
          delete next.channels;
        }
        return next;
      }

      const tencentCfg = (cfg.channels as Record<string, TencentIMConfig> | undefined)?.[
        "tencent-im"
      ];
      const accounts = { ...tencentCfg?.accounts };
      delete accounts[accountId];

      return {
        ...cfg,
        channels: {
          ...cfg.channels,
          "tencent-im": {
            ...tencentCfg,
            accounts: Object.keys(accounts).length > 0 ? accounts : undefined,
          },
        },
      };
    },
    isConfigured: (account) => account.configured,
    describeAccount: (account) => ({
      accountId: account.accountId,
      enabled: account.enabled,
      configured: account.configured,
      name: account.name,
      sdkAppId: account.sdkAppId,
      adminUserId: account.adminUserId,
      userId: account.userId,
    }),
    resolveAllowFrom: ({ cfg, accountId }) => {
      const account = resolveTencentAccount({ cfg, accountId });
      return account.allowFrom;
    },
    formatAllowFrom: ({ allowFrom }) =>
      allowFrom.map((entry) => String(entry).trim()).filter(Boolean),
  },

  security: {
    collectWarnings: ({ cfg, accountId }) => {
      const account = resolveTencentAccount({ cfg, accountId });
      const tencentCfg = account.config;
      const defaultGroupPolicy = (
        cfg.channels as Record<string, { groupPolicy?: string }> | undefined
      )?.defaults?.groupPolicy;
      const groupPolicy = tencentCfg?.groupPolicy ?? defaultGroupPolicy ?? "allowlist";

      if (groupPolicy !== "open") return [];

      return [
        `- Tencent IM[${account.accountId}] groups: groupPolicy="open" allows any member to trigger. Set channels.tencent-im.groupPolicy="allowlist" + channels.tencent-im.groupAllowFrom to restrict senders.`,
      ];
    },
  },

  setup: {
    resolveAccountId: () => DEFAULT_ACCOUNT_ID,
    applyAccountConfig: ({ cfg, accountId }) => {
      const isDefault = !accountId || accountId === DEFAULT_ACCOUNT_ID;

      if (isDefault) {
        return {
          ...cfg,
          channels: {
            ...cfg.channels,
            "tencent-im": {
              ...(cfg.channels as Record<string, TencentIMConfig> | undefined)?.["tencent-im"],
              enabled: true,
            },
          },
        };
      }

      const tencentCfg = (cfg.channels as Record<string, TencentIMConfig> | undefined)?.[
        "tencent-im"
      ];
      return {
        ...cfg,
        channels: {
          ...cfg.channels,
          "tencent-im": {
            ...tencentCfg,
            accounts: {
              ...tencentCfg?.accounts,
              [accountId]: {
                ...tencentCfg?.accounts?.[accountId],
                enabled: true,
              },
            },
          },
        },
      };
    },
  },

  onboarding: tencentOnboardingAdapter,

  messaging: {
    normalizeTarget: (raw) => normalizeTencentTarget(raw) ?? undefined,
    targetResolver: {
      looksLikeId: looksLikeTencentId,
      hint: "<userId|group:groupId|C2CuserId|GROUPgroupId>",
    },
  },

  directory: {
    self: async () => null,
    listPeers: async ({ cfg, query, limit, accountId }) =>
      listTencentDirectoryPeers({
        cfg,
        query: query ?? undefined,
        limit: limit ?? undefined,
        accountId: accountId ?? undefined,
      }),
    listGroups: async ({ cfg, query, limit, accountId }) =>
      listTencentDirectoryGroups({
        cfg,
        query: query ?? undefined,
        limit: limit ?? undefined,
        accountId: accountId ?? undefined,
      }),
    listPeersLive: async ({ cfg, query, limit, accountId }) =>
      listTencentDirectoryPeersLive({
        cfg,
        query: query ?? undefined,
        limit: limit ?? undefined,
        accountId: accountId ?? undefined,
      }),
    listGroupsLive: async ({ cfg, query, limit, accountId }) =>
      listTencentDirectoryGroupsLive({
        cfg,
        query: query ?? undefined,
        limit: limit ?? undefined,
        accountId: accountId ?? undefined,
      }),
  },

  outbound: tencentIMOutbound,

  status: {
    defaultRuntime: {
      accountId: DEFAULT_ACCOUNT_ID,
      running: false,
      lastStartAt: null,
      lastStopAt: null,
      lastError: null,
      port: null,
    },
    buildChannelSummary: ({ snapshot }) => ({
      configured: snapshot.configured ?? false,
      running: snapshot.running ?? false,
      lastStartAt: snapshot.lastStartAt ?? null,
      lastStopAt: snapshot.lastStopAt ?? null,
      lastError: snapshot.lastError ?? null,
      port: snapshot.port ?? null,
      probe: snapshot.probe,
      lastProbeAt: snapshot.lastProbeAt ?? null,
    }),
    probeAccount: async ({ account }) => {
      return await probeTencent(account);
    },
    buildAccountSnapshot: ({ account, runtime, probe }) => ({
      accountId: account.accountId,
      enabled: account.enabled,
      configured: account.configured,
      name: account.name,
      sdkAppId: account.sdkAppId,
      adminUserId: account.adminUserId,
      userId: account.userId,
      running: runtime?.running ?? false,
      lastStartAt: runtime?.lastStartAt ?? null,
      lastStopAt: runtime?.lastStopAt ?? null,
      lastError: runtime?.lastError ?? null,
      port: runtime?.port ?? null,
      probe,
    }),
  },

  gateway: {
    startAccount: async (ctx) => {
      const account = resolveTencentAccount({ cfg: ctx.cfg, accountId: ctx.accountId });

      // Set initial status
      const port = account.connectionMode === "webhook" ? (account.webhookPort ?? 18794) : null;
      ctx.setStatus({ accountId: ctx.accountId, port });
      ctx.log?.info(
        `Tencent IM [${ctx.accountId}] starting (mode: ${account.connectionMode}, admin: ${account.adminUserId}, sender: ${account.userId})`,
      );

      // Start monitoring (WebSocket or Webhook mode)
      return monitorTencentProvider({
        config: ctx.cfg,
        runtime: ctx.runtime,
        abortSignal: ctx.abortSignal,
        accountId: ctx.accountId,
      });
    },
  },
};
