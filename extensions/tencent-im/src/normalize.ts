/**
 * Tencent IM target normalization
 */

const TENCENTIM_PREFIX = /^tencent-im:/i;
const TENCENT_PREFIX = /^tencent:/i;
const TIM_PREFIX = /^tim:/i;

/**
 * Normalizes a target ID to canonical Tencent IM format.
 * Returns "user:<id>" or "group:<id>", consistent with targets.ts.
 */
export function normalizeTencentIMTarget(raw: string | null | undefined): string | undefined {
  if (!raw) {
    return undefined;
  }
  const trimmed = raw.trim();
  if (!trimmed) {
    return undefined;
  }

  // Strip channel-level prefixes (tencent-im:, tencent:, tim:)
  const withoutPrefix = trimmed
    .replace(TENCENTIM_PREFIX, "")
    .replace(TENCENT_PREFIX, "")
    .replace(TIM_PREFIX, "");

  if (!withoutPrefix) {
    return undefined;
  }

  const lower = withoutPrefix.toLowerCase();

  // Already canonical
  if (lower.startsWith("user:") || lower.startsWith("group:")) {
    return withoutPrefix;
  }

  // C2Cxxx -> user:xxx
  if (withoutPrefix.startsWith("C2C")) {
    return `user:${withoutPrefix.slice(3)}`;
  }

  // GROUPxxx -> group:xxx
  if (withoutPrefix.startsWith("GROUP")) {
    return `group:${withoutPrefix.slice(5)}`;
  }

  // Default: assume user ID
  return `user:${withoutPrefix}`;
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

  // Has Tencent IM channel prefix
  if (TENCENTIM_PREFIX.test(trimmed) || TENCENT_PREFIX.test(trimmed) || TIM_PREFIX.test(trimmed)) {
    return true;
  }

  // Canonical normalized form
  if (trimmed.startsWith("user:") || trimmed.startsWith("group:")) {
    return true;
  }

  // Tencent-native prefixes
  if (trimmed.startsWith("C2C") || trimmed.startsWith("GROUP")) {
    return true;
  }

  // Plain alphanumeric user ID
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
