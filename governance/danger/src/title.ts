import { Finding, PRContext, fail, info, warn } from "./types.js";

const TITLE_RE =
  /^(feat|fix|docs|refactor|chore|perf|test|ci|build|revert)(\([^)]+\))?(!)?: .+/;

export const MAX_TITLE_LENGTH = 100;

/** Deterministic conventional-title check. Fails on drafts as a warn. */
export function checkTitle(ctx: PRContext): Finding[] {
  if (ctx.isBot) {
    return [
      info(
        "title-bot-skip",
        "Bot author: human title checklist skipped (safety checks still apply).",
      ),
    ];
  }
  const problems: string[] = [];
  if (!TITLE_RE.test(ctx.title.trim())) {
    problems.push(
      "use '<type>(<scope>): <subject>' with type feat|fix|docs|refactor|chore|perf|test|ci|build|revert",
    );
  }
  if (ctx.title.length > MAX_TITLE_LENGTH) {
    problems.push(
      `keep the title <= ${MAX_TITLE_LENGTH} chars (got ${ctx.title.length})`,
    );
  }
  if (problems.length === 0) return [];
  const detail = `Bad PR title "${ctx.title}": ${problems.join("; ")}.`;
  if (ctx.isDraft) return [warn("title-conventional", `${detail} (draft: warn only)`)];
  return [fail("title-conventional", detail)];
}

/** Merge commits make history non-linear; deterministic fail (warn on drafts). */
export function checkMergeCommits(ctx: PRContext): Finding[] {
  if (!ctx.hasMergeCommits) return [];
  const detail =
    "PR contains merge commits; rebase onto the target branch instead.";
  if (ctx.isDraft) return [warn("no-merge-commits", `${detail} (draft: warn only)`)];
  return [fail("no-merge-commits", detail)];
}
