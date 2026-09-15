import { Finding, PRContext, info, warn } from "./types.js";
import { isDocsOnly, isTrivial } from "./size.js";

const ISSUE_RE = /#\d+|(clos|fix|resolv)(e|es|ing)\s+#?\d+/i;
const DOC_LABELS = ["docs", "documentation"];

/**
 * Every non-trivial PR should reference an issue (or carry a docs label).
 * Docs-only / trivial PRs are exempt; bots are exempt from the human link ask.
 */
export function checkLinkedIssue(ctx: PRContext): Finding[] {
  if (ctx.isBot) {
    return [info("linked-issue-bot-skip", "Bot author: linked-issue ask skipped.")];
  }
  if (isDocsOnly(ctx) || isTrivial(ctx)) {
    return [
      info(
        "linked-issue-exempt",
        "Docs-only or trivial change: linked-issue check exempt.",
      ),
    ];
  }
  const labels = ctx.labels.map((l) => l.toLowerCase());
  if (ISSUE_RE.test(ctx.body) || DOC_LABELS.some((d) => labels.includes(d))) {
    return [];
  }
  return [
    warn(
      "linked-issue",
      "No linked issue found in the body (e.g. “Closes #123”); link the issue this PR resolves.",
    ),
  ];
}
