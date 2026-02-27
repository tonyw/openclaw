import {
  buildLongFlagPrefixMap,
  collectKnownLongFlags,
  getSafeBinProfiles,
  normalizeSafeBinProfileFixtures,
  resolveSafeBinProfiles as resolveSafeBinProfilesFromConstants,
  type SafeBinProfile,
  type SafeBinProfileFixture,
  type SafeBinProfileFixtures,
} from "../constants/safe-bin-profiles.js";

export {
  buildLongFlagPrefixMap,
  collectKnownLongFlags,
  getSafeBinProfiles,
  normalizeSafeBinProfileFixtures,
  type SafeBinProfile,
  type SafeBinProfileFixture,
  type SafeBinProfileFixtures,
};

// Re-export for backward compatibility
export const SAFE_BIN_PROFILES: Record<string, SafeBinProfile> = {};
export const SAFE_BIN_PROFILE_FIXTURES: Record<string, SafeBinProfileFixture> = {};

// Re-export with the same name for backward compatibility
export { resolveSafeBinProfilesFromConstants as resolveSafeBinProfiles };

export function resolveSafeBinDeniedFlags(
  fixtures?: SafeBinProfileFixtures | null,
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  const fixturesToUse = fixtures ?? {};
  for (const [name, fixture] of Object.entries(fixturesToUse)) {
    const denied = Array.from(new Set(fixture.deniedFlags ?? [])).toSorted();
    if (denied.length > 0) {
      out[name] = denied;
    }
  }
  return out;
}

export function renderSafeBinDeniedFlagsDocBullets(
  fixtures?: SafeBinProfileFixtures | null,
): string {
  const denied = resolveSafeBinDeniedFlags(fixtures);
  const lines: string[] = [];
  for (const [name, flags] of Object.entries(denied)) {
    if (flags.length > 0) {
      lines.push(`- ${name}: ${flags.join(", ")}`);
    }
  }
  return lines.join("\n");
}
