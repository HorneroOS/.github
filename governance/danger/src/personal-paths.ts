import { Finding, PRContext, RepoPolicy, fail, warn } from "./types.js";
import { touches } from "./visual-evidence.js";

/**
 * Forbidden (personal/secret) paths always fail — including drafts and bots.
 * Risky areas (workflows, governance, release manifests) warn for visibility.
 */
export function checkPersonalPaths(
  ctx: PRContext,
  policy: RepoPolicy,
): Finding[] {
  const hit = touches(ctx.changedFiles, policy.forbiddenPaths);
  if (hit.length === 0) return [];
  return [
    fail(
      "forbidden-paths",
      `PR touches forbidden paths (${hit.join(", ")}); remove secrets, credentials or personal data from the diff.`,
    ),
  ];
}

export function checkRiskyAreas(
  ctx: PRContext,
  policy: RepoPolicy,
): Finding[] {
  const hit = touches(ctx.changedFiles, policy.riskyPaths);
  if (hit.length === 0) return [];
  return [
    warn(
      "risky-area",
      `PR touches sensitive areas (${hit.join(", ")}); needs a careful review.`,
    ),
  ];
}
