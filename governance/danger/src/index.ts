import { Finding, PRContext, RepoPolicy, info } from "./types.js";
import { checkTitle, checkMergeCommits } from "./title.js";
import { checkSections } from "./sections.js";
import { checkSize } from "./size.js";
import { checkBot } from "./bots.js";
import { checkDraft } from "./drafts.js";
import { checkVisualEvidence } from "./visual-evidence.js";
import { checkPersonalPaths, checkRiskyAreas } from "./personal-paths.js";
import { checkGeneratedCounterparts } from "./generated-counterparts.js";
import { checkBreakingChange } from "./breaking-change.js";
import { checkLinkedIssue } from "./linked-issue.js";
import { checkPins } from "./pins.js";

const DOCS_URL = "https://github.com/HorneroOS/docs";
const CONTRIBUTING_URL = "https://github.com/HorneroOS/.github/blob/main/CONTRIBUTING.md";

/**
 * Run every rule and return the ordered findings.
 * Deterministic: no I/O, no network, no secrets, no test duplication.
 */
export function evaluatePR(ctx: PRContext, policy: RepoPolicy): Finding[] {
  const findings: Finding[] = [
    ...checkBot(ctx),
    ...checkDraft(ctx),
    // Deterministic blocks (fail).
    ...checkTitle(ctx),
    ...checkMergeCommits(ctx),
    ...checkPersonalPaths(ctx, policy),
    ...checkGeneratedCounterparts(ctx, policy),
    ...checkPins(ctx),
    // Human-judgement signals (warn).
    ...checkSections(ctx),
    ...checkSize(ctx, policy),
    ...checkVisualEvidence(ctx, policy),
    ...checkRiskyAreas(ctx, policy),
    ...checkBreakingChange(ctx),
    ...checkLinkedIssue(ctx),
    // Always-on guidance (message).
    info("pr-commands", "Governance commands: post `/checklist` for the human checklist."),
    info("vm-reminder", "If you changed runtime behavior, validate it in a VM before requesting review."),
    info("docs-links", `Docs: ${DOCS_URL} — Contributing: ${CONTRIBUTING_URL}`),
  ];
  return findings;
}

export { defaultPolicy, parsePolicy } from "./policy.js";
