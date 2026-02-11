import type { ClawdbotConfig, RuntimeEnv } from "openclaw/plugin-sdk";
import type { ResolvedTencentAccount } from "./types.js";
import { resolveTencentAccount } from "./accounts.js";
import { createTIMClient, loginTIM } from "./client.js";

export type UploadImageOpts = {
  cfg: ClawdbotConfig;
  file: File | Buffer | { url: string };
  accountId?: string;
  runtime?: RuntimeEnv;
};

export type UploadFileOpts = {
  cfg: ClawdbotConfig;
  file: File | Buffer | { url: string; name: string };
  accountId?: string;
  runtime?: RuntimeEnv;
};

export async function uploadImageTencentIM(
  opts: UploadImageOpts,
): Promise<{ ok: boolean; url?: string; error?: string }> {
  // Tencent IM uses direct upload via SDK
  // The SDK handles uploading when sending the message
  // This function is a placeholder for compatibility
  return { ok: true, url: "direct-upload" };
}

export async function uploadFileTencentIM(
  opts: UploadFileOpts,
): Promise<{ ok: boolean; url?: string; error?: string }> {
  // Tencent IM uses direct upload via SDK
  return { ok: true, url: "direct-upload" };
}

export async function sendImageTencentIM(opts: {
  cfg: ClawdbotConfig;
  to: string;
  imageUrl: string;
  accountId?: string;
  runtime?: RuntimeEnv;
}): Promise<{ ok: boolean; error?: string }> {
  const { sendMediaTencentIM } = await import("./send.js");
  return sendMediaTencentIM({
    ...opts,
    mediaUrl: opts.imageUrl,
    mediaType: "image",
  });
}

export async function sendFileTencentIM(opts: {
  cfg: ClawdbotConfig;
  to: string;
  fileUrl: string;
  fileName: string;
  accountId?: string;
  runtime?: RuntimeEnv;
}): Promise<{ ok: boolean; error?: string }> {
  const { sendMediaTencentIM } = await import("./send.js");
  return sendMediaTencentIM({
    cfg: opts.cfg,
    to: opts.to,
    mediaUrl: opts.fileUrl,
    mediaType: "file",
    fileName: opts.fileName,
    accountId: opts.accountId,
    runtime: opts.runtime,
  });
}

export async function downloadMediaTencentIM(opts: {
  cfg: ClawdbotConfig;
  messageId: string;
  accountId?: string;
  runtime?: RuntimeEnv;
}): Promise<{ ok: boolean; data?: Buffer; error?: string }> {
  // Tencent IM media is accessed via URL in the message payload
  // Actual download would require fetching the URL
  return { ok: false, error: "Media download not implemented - use message payload URL" };
}
