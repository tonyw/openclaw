import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { emptyPluginConfigSchema } from "openclaw/plugin-sdk";
import { tencentIMPlugin } from "./src/channel.js";

// Export channel components for external use
export { tencentIMPlugin } from "./src/channel.js";
export { probeTencent } from "./src/probe-rest.js";
export { sendMessageTencentIM, sendMediaTencentIM } from "./src/send-rest.js";
export { normalizeTencentTarget, formatTencentTarget, looksLikeTencentId } from "./src/targets.js";
export type { TencentIMConfig, ResolvedTencentAccount, TIMMessage } from "./src/types.js";

const plugin = {
  id: "tencent-im",
  name: "Tencent IM",
  description: "Tencent Cloud IM channel plugin for OpenClaw (REST API)",
  configSchema: emptyPluginConfigSchema(),
  register(api: OpenClawPluginApi) {
    api.registerChannel({ plugin: tencentIMPlugin });
  },
};

export default plugin;
