import type { ResolvedTencentAccount } from "./types.js";

// TIM SDK client cache
const timClients = new Map<string, unknown>();

export type TIMClient = {
  login: (options: { userID: string; userSig: string }) => Promise<unknown>;
  logout: () => Promise<unknown>;
  destroy: () => void;
  on: (event: string, handler: (data: unknown) => void) => void;
  off: (event: string, handler: (data: unknown) => void) => void;
  sendMessage: (message: unknown) => Promise<{ code: number; data: unknown }>;
  createTextMessage: (options: {
    to: string;
    conversationType: string;
    payload: { text: string };
  }) => unknown;
  createImageMessage: (options: {
    to: string;
    conversationType: string;
    payload: { file: File | { url: string } };
  }) => unknown;
  createFileMessage: (options: {
    to: string;
    conversationType: string;
    payload: { file: File | { url: string; name: string } };
  }) => unknown;
  getConversationList: () => Promise<{ code: number; data: unknown }>;
  getGroupList: () => Promise<{ code: number; data: unknown }>;
  getGroupMemberList: (options: {
    groupID: string;
    count: number;
  }) => Promise<{ code: number; data: unknown }>;
  TIM_TYPES?: {
    CONV_C2C: string;
    CONV_GROUP: string;
    MSG_TEXT: string;
    MSG_IMAGE: string;
    MSG_FILE: string;
  };
};

export async function createTIMClient(account: ResolvedTencentAccount): Promise<TIMClient | null> {
  const cacheKey = `${account.accountId}:${account.userId}`;

  if (timClients.has(cacheKey)) {
    return timClients.get(cacheKey) as TIMClient;
  }

  try {
    // Dynamic import to avoid loading TIM in Node.js context if not needed
    const TIMModule = await import("tim-js-sdk");
    const TIM = TIMModule.default || TIMModule;

    const sdkAppID = parseInt(account.sdkAppId, 10);
    if (isNaN(sdkAppID)) {
      throw new Error(`Invalid SDKAppID: ${account.sdkAppId}`);
    }

    const tim = TIM.create({ SDKAppID: sdkAppID }) as TIMClient;

    // Register upload plugin if available
    try {
      const uploadPluginModule = await import("tim-upload-plugin");
      const TIMUploadPlugin = uploadPluginModule.default || uploadPluginModule;
      tim.registerPlugin?.({ "tim-upload-plugin": TIMUploadPlugin });
    } catch {
      // Upload plugin is optional
    }

    timClients.set(cacheKey, tim);
    return tim;
  } catch (error) {
    console.error("Failed to create TIM client:", error);
    return null;
  }
}

export async function loginTIM(tim: TIMClient, account: ResolvedTencentAccount): Promise<boolean> {
  try {
    const result = await tim.login({
      userID: account.userId,
      userSig: account.userSig,
    });
    return (result as { code: number }).code === 0;
  } catch (error) {
    console.error("TIM login failed:", error);
    return false;
  }
}

export async function logoutTIM(tim: TIMClient): Promise<void> {
  try {
    await tim.logout();
  } catch {
    // Ignore logout errors
  }
}

export function destroyTIMClient(account: ResolvedTencentAccount): void {
  const cacheKey = `${account.accountId}:${account.userId}`;
  const tim = timClients.get(cacheKey) as TIMClient | undefined;
  if (tim) {
    try {
      tim.destroy();
    } catch {
      // Ignore destroy errors
    }
    timClients.delete(cacheKey);
  }
}

// TIM Conversation Types
export const CONV_C2C = "C2C";
export const CONV_GROUP = "GROUP";

// TIM Message Types
export const MSG_TEXT = "TIMTextElem";
export const MSG_IMAGE = "TIMImageElem";
export const MSG_FILE = "TIMFileElem";
export const MSG_CUSTOM = "TIMCustomElem";
