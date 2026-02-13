export type TencentTarget = { type: "user"; userId: string } | { type: "group"; groupId: string };

/**
 * 规范化 Tencent IM 目标字符串
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
    return trimmed;
  }

  // group:groupId
  if (lowered.startsWith("group:")) {
    return trimmed;
  }

  // C2Cxxx -> user:xxx
  if (trimmed.startsWith("C2C")) {
    return `user:${trimmed.slice(3)}`;
  }

  // GROUPxxx -> group:xxx
  if (trimmed.startsWith("GROUP")) {
    return `group:${trimmed.slice(5)}`;
  }

  // 默认: 假设为用户 ID
  return `user:${trimmed}`;
}

export function formatTencentTarget(target: TencentTarget): string {
  if (target.type === "user") {
    return `user:${target.userId}`;
  }
  return `group:${target.groupId}`;
}

export function looksLikeTencentId(id: string | undefined | null): boolean {
  if (!id) {
    return false;
  }
  if (id.startsWith("user:") || id.startsWith("group:")) {
    return true;
  }
  if (id.startsWith("C2C") || id.startsWith("GROUP")) {
    return true;
  }
  return /^[a-zA-Z0-9_-]+$/.test(id);
}

export function looksLikeGroupId(id: string | undefined | null): boolean {
  if (!id) {
    return false;
  }
  return id.startsWith("group:") || id.startsWith("GROUP");
}

export function extractUserId(id: string | undefined | null): string {
  if (!id) {
    return "";
  }
  if (id.startsWith("user:")) {
    return id.slice(5);
  }
  if (id.startsWith("C2C")) {
    return id.slice(3);
  }
  return id;
}

export function extractGroupId(id: string | undefined | null): string {
  if (!id) {
    return "";
  }
  if (id.startsWith("group:")) {
    return id.slice(6);
  }
  if (id.startsWith("GROUP")) {
    return id.slice(5);
  }
  return id;
}
