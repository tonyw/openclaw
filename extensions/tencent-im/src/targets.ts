export type TencentTarget = { type: "user"; userId: string } | { type: "group"; groupId: string };

/**
 * Normalize a Tencent IM target string.
 * Returns the normalized target string (e.g., "user:xxx" or "group:xxx").
 * Used by the messaging system for target normalization.
 */
export function normalizeTencentTarget(raw: string | undefined | null): string | null {
  if (!raw) {
    return null;
  }
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  const lowered = trimmed.toLowerCase();

  // user:userId
  if (lowered.startsWith("user:")) {
    return trimmed; // Keep the prefix for consistency
  }

  // group:groupId
  if (lowered.startsWith("group:")) {
    return trimmed; // Keep the prefix for consistency
  }

  // C2Cxxx -> user:xxx
  if (trimmed.startsWith("C2C")) {
    return `user:${trimmed.slice(3)}`;
  }

  // GROUPxxx -> group:xxx
  if (trimmed.startsWith("GROUP")) {
    return `group:${trimmed.slice(5)}`;
  }

  // Default: assume it's a user ID
  return `user:${trimmed}`;
}

export function formatTencentTarget(target: TencentTarget): string {
  if (target.type === "user") {
    return `user:${target.userId}`;
  }
  return `group:${target.groupId}`;
}

export function looksLikeTencentId(id: string): boolean {
  if (id.startsWith("user:") || id.startsWith("group:")) return true;
  if (id.startsWith("C2C") || id.startsWith("GROUP")) return true;
  // Tencent IM user IDs are typically numeric or alphanumeric
  return /^[a-zA-Z0-9_-]+$/.test(id);
}

export function looksLikeGroupId(id: string): boolean {
  return id.startsWith("group:") || id.startsWith("GROUP");
}

export function extractUserId(id: string): string {
  if (id.startsWith("user:")) return id.slice(5);
  if (id.startsWith("C2C")) return id.slice(3);
  return id;
}

export function extractGroupId(id: string): string {
  if (id.startsWith("group:")) return id.slice(6);
  if (id.startsWith("GROUP")) return id.slice(5);
  return id;
}
