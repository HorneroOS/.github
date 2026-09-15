import { Finding, PRContext, RepoPolicy, info, warn } from "./types.js";

export function totalChanges(ctx: PRContext): number {
  return ctx.additions + ctx.deletions;
}

const DOC_RE = /^(docs\/|\.github\/.*\.md$|.*\.md$|.*\.mdx$)/i;

/** True when every touched file is documentation. */
export function isDocsOnly(ctx: PRContext): boolean {
  return ctx.changedFiles.length > 0 && ctx.changedFiles.every((f) => DOC_RE.test(f));
}

/** Trivial chores (e.g. `chore(trivial): ...`) are changelog-exempt. */
export function isTrivial(ctx: PRContext): boolean {
  return /^(chore|docs)(\(trivial\))?:/i.test(ctx.title.trim()) || totalChanges(ctx) <= 10;
}

/**
 * Size + changelog-exemption policy.
 * Large PRs warn; docs-only / trivial PRs get an informational exemption note.
 */
export function checkSize(ctx: PRContext, policy: RepoPolicy): Finding[] {
  if (ctx.isBot) {
    return [
      info("size-bot-skip", "Bot author: large-PR hygiene downgraded to info."),
    ];
  }
  const total = totalChanges(ctx);
  if (total > policy.largeThreshold) {
    return [
      warn(
        "large-pr",
        `Large PR: ${total} changed lines (>${policy.largeThreshold}); consider splitting it.`,
      ),
    ];
  }
  if (isDocsOnly(ctx) || isTrivial(ctx)) {
    return [
      info(
        "changelog-exempt-trivial",
        "Docs-only or trivial change: changelog entry not required.",
      ),
    ];
  }
  return [];
}
