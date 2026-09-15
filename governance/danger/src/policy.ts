import { RepoPolicy } from "./types.js";

/**
 * Default policy used when a repo has no `.github/hornero-governance.yml`,
 * plus validation for repos that do. Field names accept both the YAML
 * snake_case (`visual_paths`) and the TS camelCase (`visualPaths`).
 */

export function defaultPolicy(): RepoPolicy {
  return {
    version: 1,
    kind: "app",
    visualPaths: ["assets/**", "**/*.qml", "**/*.png", "**/*.jpg"],
    generatedPairs: [],
    forbiddenPaths: [
      "**/.env",
      "**/.env.*",
      "**/*.pem",
      "**/*.key",
      "**/id_rsa*",
      "**/credentials*",
      "**/*secret*",
    ],
    riskyPaths: [
      ".github/workflows/**",
      "governance/**",
      "**/release*.yml",
      "**/release*.yaml",
    ],
    largeThreshold: 800,
  };
}

function asStrings(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

interface RawPolicy {
  version?: unknown;
  kind?: unknown;
  visual_paths?: unknown;
  visualPaths?: unknown;
  generated_paths?: unknown;
  generatedPairs?: unknown;
  forbidden_paths?: unknown;
  forbiddenPaths?: unknown;
  risky_paths?: unknown;
  riskyPaths?: unknown;
  policies?: unknown;
}

/** Validate raw YAML-parsed data into a typed policy; throws on misuse. */
export function parsePolicy(raw: unknown): RepoPolicy {
  const base = defaultPolicy();
  if (raw === null || raw === undefined) return base;
  if (typeof raw !== "object") throw new Error("policy must be a mapping");
  const r = raw as RawPolicy;
  if (r.version !== undefined && r.version !== 1) {
    throw new Error(`unsupported policy version: ${String(r.version)}`);
  }
  const nested =
    r.policies !== null && typeof r.policies === "object"
      ? (r.policies as Record<string, unknown>)
      : {};
  const num = (v: unknown, fallback: number): number =>
    typeof v === "number" && Number.isFinite(v) ? v : fallback;
  const pairsRaw =
    Array.isArray(r.generated_paths) && r.generated_paths.length > 0
      ? r.generated_paths
      : r.generatedPairs;
  const generatedPairs = Array.isArray(pairsRaw)
    ? pairsRaw.flatMap((p) => {
        if (p !== null && typeof p === "object") {
          const o = p as Record<string, unknown>;
          if (typeof o["source"] === "string" && typeof o["derivative"] === "string") {
            return [{ source: o["source"], derivative: o["derivative"] }];
          }
        }
        return [];
      })
    : [];
  return {
    version: 1,
    kind: typeof r.kind === "string" ? r.kind : base.kind,
    visualPaths: asStrings(r.visual_paths ?? r.visualPaths ?? base.visualPaths),
    generatedPairs,
    forbiddenPaths: asStrings(
      nested["forbidden_paths"] ?? nested["forbiddenPaths"] ?? r.forbidden_paths ?? r.forbiddenPaths ?? base.forbiddenPaths,
    ),
    riskyPaths: asStrings(
      nested["risky_paths"] ?? nested["riskyPaths"] ?? r.risky_paths ?? r.riskyPaths ?? base.riskyPaths,
    ),
    largeThreshold: num(
      nested["large_threshold"] ?? nested["largeThreshold"],
      base.largeThreshold,
    ),
  };
}
