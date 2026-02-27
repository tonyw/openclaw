/**
 * Safe bin profiles for command execution.
 * This is a constant-only module to avoid circular dependency issues.
 */

export type SafeBinProfile = {
  minPositional?: number;
  maxPositional?: number;
  allowedValueFlags?: ReadonlySet<string>;
  deniedFlags?: ReadonlySet<string>;
  knownLongFlags?: readonly string[];
  knownLongFlagsSet?: ReadonlySet<string>;
  longFlagPrefixMap?: ReadonlyMap<string, string | null>;
};

export type SafeBinProfileFixture = {
  minPositional?: number;
  maxPositional?: number;
  allowedValueFlags?: readonly string[];
  deniedFlags?: readonly string[];
};

export type SafeBinProfileFixtures = Readonly<Record<string, SafeBinProfileFixture>>;

function toFlagSet(flags?: readonly string[]): ReadonlySet<string> {
  if (!flags || flags.length === 0) {
    return new Set();
  }
  return new Set(flags);
}

export function collectKnownLongFlags(
  allowedValueFlags: ReadonlySet<string>,
  deniedFlags: ReadonlySet<string>,
): string[] {
  const known = new Set<string>();
  for (const flag of allowedValueFlags) {
    if (flag.startsWith("--")) {
      known.add(flag);
    }
  }
  for (const flag of deniedFlags) {
    if (flag.startsWith("--")) {
      known.add(flag);
    }
  }
  return Array.from(known);
}

export function buildLongFlagPrefixMap(
  knownLongFlags: readonly string[],
): ReadonlyMap<string, string | null> {
  const prefixMap = new Map<string, string | null>();
  for (const flag of knownLongFlags) {
    for (let i = 2; i <= flag.length; i += 1) {
      const prefix = flag.slice(0, i);
      const existing = prefixMap.get(prefix);
      if (existing === undefined) {
        prefixMap.set(prefix, flag);
      } else if (existing !== flag) {
        prefixMap.set(prefix, null);
      }
    }
  }
  return prefixMap;
}

function compileSafeBinProfile(fixture: SafeBinProfileFixture): SafeBinProfile {
  const allowedValueFlags = toFlagSet(fixture.allowedValueFlags);
  const deniedFlags = toFlagSet(fixture.deniedFlags);
  const knownLongFlags = collectKnownLongFlags(allowedValueFlags, deniedFlags);
  return {
    minPositional: fixture.minPositional,
    maxPositional: fixture.maxPositional,
    allowedValueFlags,
    deniedFlags,
    knownLongFlags,
    knownLongFlagsSet: new Set(knownLongFlags),
    longFlagPrefixMap: buildLongFlagPrefixMap(knownLongFlags),
  };
}

function compileSafeBinProfiles(
  fixtures: Record<string, SafeBinProfileFixture>,
): Record<string, SafeBinProfile> {
  return Object.fromEntries(
    Object.entries(fixtures).map(([name, fixture]) => [name, compileSafeBinProfile(fixture)]),
  ) as Record<string, SafeBinProfile>;
}

function getDefaultSafeBinProfileFixtures(): Record<string, SafeBinProfileFixture> {
  return {
    jq: {
      maxPositional: 1,
      allowedValueFlags: ["--arg", "--argjson", "--argstr"],
      deniedFlags: [
        "--argfile",
        "--rawfile",
        "--slurpfile",
        "--from-file",
        "--library-path",
        "-L",
        "-f",
      ],
    },
    grep: {
      maxPositional: 0,
      allowedValueFlags: [
        "--regexp",
        "--max-count",
        "--after-context",
        "--before-context",
        "--context",
        "--devices",
        "--binary-files",
        "--exclude",
        "--include",
        "--label",
        "-e",
        "-m",
        "-A",
        "-B",
        "-C",
        "-D",
      ],
      deniedFlags: [
        "--file",
        "--exclude-dir",
        "--include-dir",
        "--recursive",
        "--dereference-recursive",
        "--directories",
        "-f",
        "-r",
        "-R",
        "-d",
      ],
    },
    cut: {
      maxPositional: 0,
      allowedValueFlags: [
        "--delimiter",
        "--fields",
        "--characters",
        "--bytes",
        "-d",
        "-f",
        "-c",
        "-b",
      ],
      deniedFlags: ["--output-delimiter"],
    },
    sort: {
      maxPositional: 0,
      allowedValueFlags: [
        "--field-separator",
        "--ignore-case",
        "--unique",
        "--reverse",
        "--check",
        "--version-sort",
        "--numeric-sort",
        "--general-numeric-sort",
        "--human-numeric-sort",
        "--month-sort",
        "--random-sort",
        "--buffer-size",
        "--batch-size",
        "--compress-program",
        "-t",
        "-f",
        "-u",
        "-r",
        "-c",
        "-V",
        "-n",
        "-g",
        "-h",
        "-M",
        "-R",
        "-S",
        "--parallel",
      ],
      deniedFlags: ["--output", "--key", "-o", "-k", "--files0-from"],
    },
    uniq: {
      maxPositional: 0,
      allowedValueFlags: [
        "--count",
        "--repeated",
        "--unique",
        "--ignore-case",
        "-c",
        "-d",
        "-u",
        "-i",
      ],
      deniedFlags: ["--all-repeated", "--group", "-D", "--output", "-o", "--files0-from"],
    },
    head: {
      maxPositional: 0,
      allowedValueFlags: ["--lines", "--bytes", "-n", "-c", "--quiet", "-q", "-v", "--verbose"],
      deniedFlags: ["--files0-from"],
    },
    tail: {
      maxPositional: 0,
      allowedValueFlags: [
        "--lines",
        "--bytes",
        "--follow",
        "--retry",
        "--max-unchanged-stats",
        "--pid",
        "-n",
        "-c",
        "-f",
        "-F",
        "--quiet",
        "-q",
        "-v",
        "--verbose",
      ],
      deniedFlags: ["--files0-from"],
    },
    tr: {
      minPositional: 1,
      maxPositional: 2,
    },
    wc: {
      maxPositional: 0,
      deniedFlags: ["--files0-from"],
    },
  };
}

export function getSafeBinProfiles(): Record<string, SafeBinProfile> {
  const fn = getSafeBinProfiles as typeof getSafeBinProfiles & {
    __cache?: Record<string, SafeBinProfile>;
  };
  if (!fn.__cache) {
    fn.__cache = compileSafeBinProfiles(getDefaultSafeBinProfileFixtures());
  }
  return fn.__cache;
}

export function normalizeSafeBinProfileFixtures(
  fixtures?: SafeBinProfileFixtures | null,
): Record<string, SafeBinProfileFixture> {
  const normalized: Record<string, SafeBinProfileFixture> = {};
  if (!fixtures) {
    return normalized;
  }
  for (const [rawName, fixture] of Object.entries(fixtures)) {
    const name = rawName.trim().toLowerCase();
    if (!name) {
      continue;
    }
    normalized[name] = {
      minPositional: fixture.minPositional,
      maxPositional: fixture.maxPositional,
      allowedValueFlags: fixture.allowedValueFlags,
      deniedFlags: fixture.deniedFlags,
    };
  }
  return normalized;
}

export function resolveSafeBinProfiles(
  fixtures?: SafeBinProfileFixtures | null,
): Record<string, SafeBinProfile> {
  const normalizedFixtures = normalizeSafeBinProfileFixtures(fixtures);
  if (Object.keys(normalizedFixtures).length === 0) {
    return getSafeBinProfiles();
  }
  return {
    ...getSafeBinProfiles(),
    ...compileSafeBinProfiles(normalizedFixtures),
  };
}
