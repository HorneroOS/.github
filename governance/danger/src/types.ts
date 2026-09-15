/**
 * Shared types for the HorneroOS deterministic PR-governance engine.
 *
 * Every policy function in `src/` is pure: it takes a {@link PRContext} and
 * (where relevant) a {@link RepoPolicy} and returns {@link Finding}s.
 * No I/O, no network, no LLM — results are fully deterministic.
 */

export type FindingLevel = "fail" | "warn" | "message";

export interface Finding {
  level: FindingLevel;
  /** Stable machine-readable rule id, e.g. "title-conventional". */
  rule: string;
  /** Human-readable one-line detail. */
  detail: string;
}

/** One deterministic source -> derivative file pair. */
export interface GeneratedPair {
  /** Exact repo-relative path of the hand-edited source file. */
  source: string;
  /** Exact repo-relative path of the deterministic derivative. */
  derivative: string;
}

/**
 * Repo policy, mirroring `.github/hornero-governance.yml`.
 *
 * ```yaml
 * version: 1
 * kind: app  # repo role, e.g. app, config, docs, shared-config
 * visual_paths: ["assets/all", "shell/qml"]
 * generated_paths: [{ source: "src/api.proto", derivative: "src/api.pb.ts" }]
 * policies:
 *   large_threshold: 800
 *   forbidden_paths: ["env-files"]
 *   risky_paths: ["workflows-dir"]
 * ```
 */
export interface RepoPolicy {
  version: 1;
  kind: string;
  visualPaths: string[];
  generatedPairs: GeneratedPair[];
  forbiddenPaths: string[];
  riskyPaths: string[];
  /** additions + deletions above this warns as a large PR. */
  largeThreshold: number;
}

/** Minimal PR snapshot every rule operates on. */
export interface PRContext {
  title: string;
  body: string;
  author: string;
  isBot: boolean;
  isDraft: boolean;
  /** True when the PR diff contains merge commits. */
  hasMergeCommits: boolean;
  additions: number;
  deletions: number;
  /** Repo-relative paths touched by the PR. */
  changedFiles: string[];
  /** Raw text of changed workflow/config files, keyed by repo-relative path. */
  fileContents: Record<string, string>;
  labels: string[];
}

export function fail(rule: string, detail: string): Finding {
  return { level: "fail", rule, detail };
}

export function warn(rule: string, detail: string): Finding {
  return { level: "warn", rule, detail };
}

export function info(rule: string, detail: string): Finding {
  return { level: "message", rule, detail };
}
