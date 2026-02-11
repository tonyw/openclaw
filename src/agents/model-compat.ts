import type { Api, Model } from "@mariozechner/pi-ai";

function isOpenAiCompletionsModel(model: Model<Api>): model is Model<"openai-completions"> {
  return model.api === "openai-completions";
}

function isAnthropicMessagesModel(model: Model<Api>): model is Model<"anthropic-messages"> {
  return model.api === "anthropic-messages";
}

/**
 * pi-ai constructs the Anthropic API endpoint as `${baseUrl}/v1/messages`.
 * If a user configures `baseUrl` with a trailing `/v1` (e.g. the previously
 * recommended format "https://api.anthropic.com/v1"), the resulting URL
 * becomes "…/v1/v1/messages" which the Anthropic API rejects with a 404.
 *
 * Strip a single trailing `/v1` (with optional trailing slash) from the
 * baseUrl for anthropic-messages models so users with either format work.
 */
function normalizeAnthropicBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/v1\/?$/, "");
}

/**
 * Returns true when the provider/URL is a third-party OpenAI-compatible endpoint
 * that does NOT support the `developer` role (only `system`/`user`/`assistant`/`tool`).
 * The pi-ai SDK auto-detects `supportsDeveloperRole: true` for any URL not in its
 * built-in non-standard list, so we patch it here for known incompatible hosts.
 */
function isNoDeveloperRoleProvider(baseUrl: string, provider: string): boolean {
  const url = baseUrl.toLowerCase();
  const prov = provider.toLowerCase();
  return (
    prov === "zai" ||
    url.includes("api.z.ai") ||
    // Volcengine / Doubao (ByteDance)
    url.includes("volces.com") ||
    // Alibaba Cloud DashScope
    url.includes("dashscope.aliyuncs.com") ||
    // SiliconFlow
    url.includes("siliconflow.cn") ||
    // MoonShot / Kimi
    url.includes("moonshot.cn") ||
    url.includes("api.moonshot") ||
    // Baidu Qianfan
    url.includes("qianfan.baidubce.com") ||
    // Zhipu AI
    url.includes("bigmodel.cn") ||
    url.includes("zhipuai.cn") ||
    // Tencent Hunyuan
    url.includes("hunyuan.tencentcloudapi.com") ||
    // DeepSeek
    url.includes("deepseek.com") ||
    // Minimax
    url.includes("minimaxi.com") ||
    url.includes("minimax.io")
  );
}

export function normalizeModelCompat(model: Model<Api>): Model<Api> {
  const baseUrl = model.baseUrl ?? "";

  // Normalise anthropic-messages baseUrl: strip trailing /v1 that users may
  // have included in their config. pi-ai appends /v1/messages itself.
  if (isAnthropicMessagesModel(model) && baseUrl) {
    const normalised = normalizeAnthropicBaseUrl(baseUrl);
    if (normalised !== baseUrl) {
      return { ...model, baseUrl: normalised } as Model<"anthropic-messages">;
    }
  }

  if (!isNoDeveloperRoleProvider(baseUrl, model.provider) || !isOpenAiCompletionsModel(model)) {
    return model;
  }

  // The `developer` role and stream usage chunks are OpenAI-native behaviors.
  // Many OpenAI-compatible backends reject `developer` and/or emit usage-only
  // chunks that break strict parsers expecting choices[0]. For non-native
  // openai-completions endpoints, force both compat flags off — unless the
  // user has explicitly opted in via their model config.
  const compat = model.compat ?? undefined;
  // When baseUrl is empty the pi-ai library defaults to api.openai.com, so
  // leave compat unchanged and let default native behavior apply.
  const needsForce = baseUrl ? !isOpenAINativeEndpoint(baseUrl) : false;
  if (!needsForce) {
    return model;
  }

  // Respect explicit user overrides: if the user has set a compat flag to
  // true in their model definition, they know their endpoint supports it.
  const forcedDeveloperRole = compat?.supportsDeveloperRole === true;
  const forcedUsageStreaming = compat?.supportsUsageInStreaming === true;

  if (forcedDeveloperRole && forcedUsageStreaming) {
    return model;
  }

  // Return a new object — do not mutate the caller's model reference.
  return {
    ...model,
    compat: compat
      ? {
          ...compat,
          supportsDeveloperRole: forcedDeveloperRole || false,
          supportsUsageInStreaming: forcedUsageStreaming || false,
        }
      : { supportsDeveloperRole: false, supportsUsageInStreaming: false },
  } as typeof model;
}
