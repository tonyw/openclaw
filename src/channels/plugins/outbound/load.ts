import type { PluginRegistry } from "../../../plugins/registry.js";
import type { ChannelId, ChannelOutboundAdapter } from "../types.js";
import { getActivePluginRegistry } from "../../../plugins/runtime.js";
import { getChannelPlugin } from "../index.js";

// Channel docking: outbound sends should stay cheap to import.
//
// The full channel plugins (src/channels/plugins/*.ts) pull in status,
// onboarding, gateway monitors, etc. Outbound delivery only needs chunking +
// send primitives, so we keep a dedicated, lightweight loader here.
const cache = new Map<ChannelId, ChannelOutboundAdapter>();
let lastRegistry: PluginRegistry | null = null;

function ensureCacheForRegistry(registry: PluginRegistry | null) {
  if (registry === lastRegistry) {
    return;
  }
  cache.clear();
  lastRegistry = registry;
}

export async function loadChannelOutboundAdapter(
  id: ChannelId,
): Promise<ChannelOutboundAdapter | undefined> {
  const registry = getActivePluginRegistry();
  ensureCacheForRegistry(registry);
  const cached = cache.get(id);
  if (cached) {
    return cached;
  }

  // Use getChannelPlugin to get both built-in and plugin channels
  const plugin = getChannelPlugin(id);
  const outbound = plugin?.outbound;
  if (outbound) {
    cache.set(id, outbound);
    return outbound;
  }
  return undefined;
}
