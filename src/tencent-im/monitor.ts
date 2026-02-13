import * as http from "http";
import type { ChannelGatewayContext } from "../channels/plugins/types.js";
import type { TencentIMWebhookEvent } from "./types.js";
import { resolveTencentIMAccount } from "./accounts.js";
import { handleTencentIMWebhook } from "./monitor-provider.js";

/**
 * 启动 Tencent IM 监控
 * 创建 HTTP 服务器接收 Webhook 回调
 */
export async function startTencentIMMonitor(
  ctx: ChannelGatewayContext,
): Promise<() => Promise<void>> {
  const { cfg, accountId, runtime, abortSignal } = ctx;

  const account = resolveTencentIMAccount({ cfg, accountId });
  if (!account.configured) {
    throw new Error(`Account ${accountId} is not configured`);
  }
  if (!account.enabled) {
    throw new Error(`Account ${accountId} is not enabled`);
  }

  const port = account.webhookPort ?? 18794;
  const path = account.webhookPath ?? "/webhook/tencent-im";

  runtime?.log?.(`[tencent-im] Starting monitor for account: ${accountId}`);
  runtime?.log?.(`[tencent-im] Webhook server will listen on 0.0.0.0:${port}${path}`);

  // 创建 HTTP 服务器
  const server = http.createServer((req, res) => {
    // Parse URL to separate pathname and query string
    // req.url may contain query parameters like: /webhook/tencent-im?CallbackCommand=...
    const requestPath = req.url?.split("?")[0] || "";
    const queryString = req.url?.includes("?") ? req.url.split("?")[1] : "";
    const queryParams = queryString ? new URLSearchParams(queryString) : new URLSearchParams();

    // Check if path matches and method is POST
    if (requestPath !== path || req.method !== "POST") {
      runtime?.log?.(
        `[tencent-im] [${accountId}]: Rejected request - path: ${requestPath}, expected: ${path}, method: ${req.method}`,
      );
      res.writeHead(404);
      res.end();
      return;
    }

    // Log query parameters for debugging (e.g., CallbackCommand from URL)
    if (queryParams.toString()) {
      const callbackCommand = queryParams.get("CallbackCommand");
      runtime?.log?.(
        `[tencent-im] [${accountId}]: Webhook query params - CallbackCommand: ${callbackCommand || "(not set)"}, All: ${queryParams.toString()}`,
      );
    }

    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", async () => {
      try {
        // Parse JSON body
        const event = JSON.parse(body) as TencentIMWebhookEvent;

        // Merge query parameters into event if not present in body
        // Tencent IM sometimes sends CallbackCommand in query params instead of body
        const callbackCommandFromQuery = queryParams.get("CallbackCommand");
        if (callbackCommandFromQuery && !event.CallbackCommand) {
          event.CallbackCommand = callbackCommandFromQuery;
        }

        runtime?.log?.(`[tencent-im] Received webhook: ${event.CallbackCommand || "unknown"}`);

        // 异步处理消息，不阻塞响应
        handleTencentIMWebhook(
          {
            cfg,
            account,
            runtime,
            accountId,
          },
          event,
        ).catch((err) => {
          runtime?.error?.(`[tencent-im] Error handling webhook: ${String(err)}`);
        });

        // 立即返回成功响应（腾讯云要求）
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ code: 0 }));
      } catch (err) {
        runtime?.error?.(`[tencent-im] Webhook parse error: ${String(err)}`);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ code: -1, error: "Invalid payload" }));
      }
    });
  });

  // 启动服务器
  await new Promise<void>((resolve, reject) => {
    server.listen(port, "0.0.0.0", () => {
      runtime?.log?.(`[tencent-im] Webhook server listening on 0.0.0.0:${port}`);
      runtime?.log?.(`[tencent-im] Webhook URL: http://<your-domain>:${port}${path}`);
      resolve();
    });

    server.on("error", (err) => {
      runtime?.error?.(`[tencent-im] Server error: ${String(err)}`);
      reject(err);
    });
  });

  // 处理终止信号
  const cleanup = () => {
    runtime?.log?.(`[tencent-im] Shutting down webhook server...`);
    server.close();
  };

  abortSignal?.addEventListener("abort", cleanup);

  // 返回清理函数
  return async () => {
    abortSignal?.removeEventListener("abort", cleanup);
    await new Promise<void>((resolve) => {
      server.close(() => {
        runtime?.log?.(`[tencent-im] Webhook server closed`);
        resolve();
      });
    });
  };
}
