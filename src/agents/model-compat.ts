import type { Api, Model } from "@mariozechner/pi-ai";

function isOpenAiCompletionsModel(model: Model<Api>): model is Model<"openai-completions"> {
  return model.api === "openai-completions";
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
  if (!isNoDeveloperRoleProvider(baseUrl, model.provider) || !isOpenAiCompletionsModel(model)) {
    return model;
  }

  const openaiModel = model;
  const compat = openaiModel.compat ?? undefined;
  if (compat?.supportsDeveloperRole === false) {
    return model;
  }

  openaiModel.compat = compat
    ? { ...compat, supportsDeveloperRole: false }
    : { supportsDeveloperRole: false };
  return openaiModel;
}
