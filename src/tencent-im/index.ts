/**
 * Tencent IM 内置 Channel
 *
 * 提供腾讯云 IM 的消息收发功能
 */

export { startTencentIMMonitor } from "./monitor.js";
export { sendMessageTencentIM, sendMediaTencentIM } from "./send.js";
export { resolveTencentAccount, listTencentAccountIds } from "./accounts.js";
export { generateUserSig } from "./usersig.js";
export {
  normalizeTencentTarget,
  formatTencentTarget,
  looksLikeTencentId,
  extractUserId,
  extractGroupId,
} from "./targets.js";
export type {
  TencentIMConfig,
  ResolvedTencentAccount,
  TIMMessage,
  TencentIMWebhookEvent,
} from "./types.js";
