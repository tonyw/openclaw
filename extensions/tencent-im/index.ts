import type { OpenClawPluginApi } from "openclaw/plugin-sdk/tencent-im";
import { emptyPluginConfigSchema } from "openclaw/plugin-sdk/tencent-im";
import { tencentIMPlugin } from "./src/plugin.js";

const plugin = {
  id: "tencent-im",
  name: "Tencent IM",
  description: "Tencent Cloud IM channel plugin",
  configSchema: emptyPluginConfigSchema(),
  register(api: OpenClawPluginApi) {
    api.registerChannel({ plugin: tencentIMPlugin });
  },
};

export default plugin;
