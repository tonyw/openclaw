/**
 * Tencent IM plugin-sdk exports
 *
 * Provides core utilities for building Tencent IM channel plugins.
 * Channel-specific implementations live in extensions/tencent-im/.
 */

// Channel plugin types
export type {
  ChannelAccountSnapshot,
  ChannelGatewayContext,
  ChannelStatusIssue,
  BaseProbeResult,
  ChannelDirectoryEntry,
  ChannelGroupContext,
  ChannelMessageActionName,
  ChannelOutboundAdapter,
} from "../channels/plugins/types.js";
export type { ChannelPlugin } from "../channels/plugins/types.plugin.js";
export type {
  ChannelOnboardingAdapter,
  ChannelOnboardingDmPolicy,
} from "../channels/plugins/onboarding-types.js";

// Onboarding helpers
export {
  addWildcardAllowFrom,
  mergeAllowFromEntries,
  setTopLevelChannelAllowFrom,
  setTopLevelChannelDmPolicyWithAllowFrom,
  setTopLevelChannelGroupPolicy,
  splitOnboardingEntries,
} from "../channels/plugins/onboarding/helpers.js";
export { promptAccountId } from "./onboarding.js";
export type { PromptAccountIdParams } from "./onboarding.js";

// Channel config utilities
export {
  buildChannelKeyCandidates,
  normalizeChannelSlug,
  resolveChannelEntryMatchWithFallback,
  resolveNestedAllowlistDecision,
} from "../channels/plugins/channel-config.js";
export { buildChannelConfigSchema } from "../channels/plugins/config-schema.js";
export { resolveChannelMediaMaxBytes } from "../channels/plugins/media-limits.js";

// Config types
export type { OpenClawConfig } from "../config/config.js";
export type { DmPolicy, GroupPolicy, MarkdownTableMode } from "../config/types.js";
export type { TencentIMConfig, TencentIMAccountConfig } from "../config/types.tencent-im.js";

// Auto-reply dispatch and envelope
export { dispatchInboundMessage } from "../auto-reply/dispatch.js";
export { formatInboundEnvelope, resolveEnvelopeFormatOptions } from "../auto-reply/envelope.js";
export { finalizeInboundContext } from "../auto-reply/reply/inbound-context.js";
export { createReplyDispatcher } from "../auto-reply/reply/reply-dispatcher.js";
export type { ReplyPayload } from "../auto-reply/types.js";

// Session management
export { recordInboundSession } from "../channels/session.js";

// Config sessions
export { resolveStorePath } from "../config/sessions.js";

// Routing
export { DEFAULT_ACCOUNT_ID, normalizeAccountId } from "../routing/session-key.js";
export { resolveAgentRoute } from "../routing/resolve-route.js";

// Plugin types
export type { PluginRuntime } from "../plugins/runtime/types.js";
export type { OpenClawPluginApi } from "../plugins/types.js";
export { emptyPluginConfigSchema } from "../plugins/config-schema.js";

// Runtime
export type { RuntimeEnv } from "../runtime.js";

// Status helpers
export {
  buildBaseAccountStatusSnapshot,
  buildBaseChannelStatusSummary,
  collectStatusIssuesFromLastError,
  createDefaultChannelRuntimeState,
} from "./status-helpers.js";

// Terminal utilities
export { formatDocsLink } from "../terminal/links.js";

// Wizard types
export type { WizardPrompter } from "../wizard/prompts.js";

// Utils
export { sleep } from "../utils.js";

// Outbound delivery types
export type { OutboundDeliveryResult } from "../infra/outbound/deliver.js";
