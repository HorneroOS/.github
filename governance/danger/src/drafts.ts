import { Finding, PRContext, info } from "./types.js";

/**
 * Draft PRs get reduced hygiene: hard hygiene fails are downgraded to warns
 * by the individual rules; this rule just records that reduction happened.
 */
export function checkDraft(ctx: PRContext): Finding[] {
  if (!ctx.isDraft) return [];
  return [
    info(
      "draft-pr",
      "Draft PR: hygiene failures are downgraded to warnings until marked ready.",
    ),
  ];
}
