import { Finding, PRContext, RepoPolicy, fail } from "./types.js";

/**
 * Deterministic generated counterparts: when a source file from
 * `policy.generatedPairs` changes, its derivative must change in the same PR.
 * Always a fail — a script can decide this with certainty.
 */
export function checkGeneratedCounterparts(
  ctx: PRContext,
  policy: RepoPolicy,
): Finding[] {
  const changed = new Set(ctx.changedFiles);
  const findings: Finding[] = [];
  for (const pair of policy.generatedPairs) {
    if (changed.has(pair.source) && !changed.has(pair.derivative)) {
      findings.push(
        fail(
          "generated-counterpart",
          `Source "${pair.source}" changed without its deterministic derivative "${pair.derivative}"; regenerate and commit it.`,
        ),
      );
    }
  }
  return findings;
}
