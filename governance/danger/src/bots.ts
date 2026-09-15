import { Finding, PRContext, info } from "./types.js";

const BOT_SUFFIX = "[bot]";
const KNOWN_BOTS = ["dependabot", "renovate", "github-actions", "codecov"];

/** Bot authors skip the human checklist but keep every safety check. */
export function isBotAuthor(author: string): boolean {
  const a = author.toLowerCase();
  return a.endsWith(BOT_SUFFIX) || KNOWN_BOTS.some((b) => a.includes(b));
}

export function checkBot(ctx: PRContext): Finding[] {
  if (!ctx.isBot && !isBotAuthor(ctx.author)) return [];
  return [
    info(
      "bot-author",
      `Author "${ctx.author}" looks automated: human checklist skipped, safety checks (paths, generated counterparts, pins) still apply.`,
    ),
  ];
}
