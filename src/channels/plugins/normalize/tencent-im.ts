/**
 * Tencent IM target normalization
 */

const TENCENTIM_PREFIX = /^tencent-im:/i;
const TENCENT_PREFIX = /^tencent:/i;
const TIM_PREFIX = /^tim:/i;

/**
 * Normalizes a target ID to Tencent IM format (user_id or group_id)
 */
export function normalizeTencentIMTarget(raw: string | null | undefined): string | undefined {
  if (!raw) {
    return undefined;
  }
  const trimmed = raw.trim();
  if (!trimmed) {
    return undefined;
  }

  // Remove any prefix
  const withoutPrefix = trimmed
    .replace(TENCENTIM_PREFIX, "")
    .replace(TENCENT_PREFIX, "")
    .replace(TIM_PREFIX, "");

  if (!withoutPrefix) {
    return undefined;
  }

  return withoutPrefix;
}

/**
 * Checks if a string looks like a Tencent IM target ID
 */
export function looksLikeTencentIMTargetId(raw: string | null | undefined): boolean {
  if (!raw) {
    return false;
  }
  const trimmed = raw.trim();
  if (!trimmed) {
    return false;
  }

  // Has Tencent IM prefix
  if (TENCENTIM_PREFIX.test(trimmed) || TENCENT_PREFIX.test(trimmed) || TIM_PREFIX.test(trimmed)) {
    return true;
  }

  // Looks like a user ID (alphanumeric with underscore/hyphen)
  // Tencent IM user IDs typically are alphanumeric
  return /^[a-zA-Z0-9_-]+$/.test(trimmed);
}

/**
 * Formats a user ID as a full Tencent IM target URI
 */
export function formatTencentIMTarget(userId: string): string {
  const normalized = normalizeTencentIMTarget(userId);
  if (normalized === undefined) {
    throw new Error(`Invalid Tencent IM user ID: ${userId}`);
  }
  return `tencent-im:${normalized}`;
}
