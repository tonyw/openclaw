import crypto from "crypto";
import zlib from "zlib";

/**
 * Base64 URL 安全编码（+ -> *, / -> -, = -> _）
 * 与腾讯云 TLS 2.0 一致
 */
function base64urlEncode(data: Buffer): string {
  const b64 = data.toString("base64");
  return b64.replace(/\+/g, "*").replace(/\//g, "-").replace(/=/g, "_");
}

/**
 * 生成腾讯云 IM TLS 2.0 UserSig
 * 与 Python/Kotlin 实现一致
 */
export function generateUserSig(
  identifier: string,
  sdkAppId: string | number,
  secretKey: string,
  expire: number = 180 * 86400, // 180 days
): string {
  const currTime = Math.floor(Date.now() / 1000);
  const sdkAppIdNum = typeof sdkAppId === "string" ? parseInt(sdkAppId, 10) : sdkAppId;

  const sigDoc = {
    "TLS.ver": "2.0",
    "TLS.identifier": identifier,
    "TLS.sdkappid": sdkAppIdNum,
    "TLS.expire": expire,
    "TLS.time": currTime,
  };

  // HMAC-SHA256 签名
  const contentToBeSigned =
    `TLS.identifier:${identifier}\n` +
    `TLS.sdkappid:${sdkAppIdNum}\n` +
    `TLS.time:${currTime}\n` +
    `TLS.expire:${expire}\n`;

  const sigBytes = crypto.createHmac("sha256", secretKey).update(contentToBeSigned).digest();
  const sigB64 = sigBytes.toString("base64").trim();

  (sigDoc as Record<string, string | number>)["TLS.sig"] = sigB64;

  // JSON -> Deflate (zlib) -> Base64URL
  const jsonStr = JSON.stringify(sigDoc);
  const compressed = zlib.deflateSync(jsonStr, { level: 9 });

  return base64urlEncode(compressed);
}
