import type { ClawdbotConfig } from "openclaw/plugin-sdk";
import type { ResolvedTencentAccount, TencentIMUserInfo, TencentIMGroupInfo } from "./types.js";
import { resolveTencentAccount } from "./accounts.js";
import { createTIMClient, loginTIM, CONV_C2C, CONV_GROUP } from "./client.js";

export type ListPeersOpts = {
  cfg: ClawdbotConfig;
  query?: string;
  limit?: number;
  accountId?: string;
};

export type ListGroupsOpts = {
  cfg: ClawdbotConfig;
  query?: string;
  limit?: number;
  accountId?: string;
};

export async function listTencentDirectoryPeers(opts: ListPeersOpts): Promise<TencentIMUserInfo[]> {
  // Tencent IM does not have a global user directory
  // Return empty list or cached contacts
  return [];
}

export async function listTencentDirectoryGroups(
  opts: ListGroupsOpts,
): Promise<TencentIMGroupInfo[]> {
  const { cfg, accountId } = opts;

  const account = resolveTencentAccount({ cfg, accountId });
  if (!account.configured) {
    return [];
  }

  const tim = await createTIMClient(account);
  if (!tim) {
    return [];
  }

  const loginSuccess = await loginTIM(tim, account);
  if (!loginSuccess) {
    return [];
  }

  try {
    const result = await tim.getGroupList();
    if (result.code !== 0 || !result.data) {
      return [];
    }

    const groups = (result.data as { groupList?: unknown[] }).groupList ?? [];
    return groups.map((g: unknown) => ({
      groupID: (g as { groupID: string }).groupID,
      name: (g as { name: string }).name,
      type: (g as { type: string }).type,
      avatar: (g as { avatar: string }).avatar,
      memberCount: (g as { memberCount: number }).memberCount,
    }));
  } catch {
    return [];
  }
}

export async function listTencentDirectoryPeersLive(
  opts: ListPeersOpts,
): Promise<TencentIMUserInfo[]> {
  // Live query from server - same limitation as cached
  return listTencentDirectoryPeers(opts);
}

export async function listTencentDirectoryGroupsLive(
  opts: ListGroupsOpts,
): Promise<TencentIMGroupInfo[]> {
  // Live query from server
  return listTencentDirectoryGroups(opts);
}

export async function getGroupMembers(opts: {
  cfg: ClawdbotConfig;
  groupId: string;
  limit?: number;
  accountId?: string;
}): Promise<TencentIMUserInfo[]> {
  const { cfg, groupId, limit = 100, accountId } = opts;

  const account = resolveTencentAccount({ cfg, accountId });
  if (!account.configured) {
    return [];
  }

  const tim = await createTIMClient(account);
  if (!tim) {
    return [];
  }

  const loginSuccess = await loginTIM(tim, account);
  if (!loginSuccess) {
    return [];
  }

  try {
    const result = await tim.getGroupMemberList({
      groupID: groupId,
      count: limit,
    });

    if (result.code !== 0 || !result.data) {
      return [];
    }

    const members = (result.data as { memberList?: unknown[] }).memberList ?? [];
    return members.map((m: unknown) => ({
      userID: (m as { userID: string }).userID,
      nick: (m as { nick?: string }).nick,
      avatar: (m as { avatar?: string }).avatar,
    }));
  } catch {
    return [];
  }
}
