import { Finding, PRContext, warn } from "./types.js";
import { detectSections } from "./sections.js";

const BREAKING_RE = /breaking[ -]change/i;

/**
 * Breaking changes must ship migration notes (a Migration section).
 * Warns — only a human can judge whether the break is real.
 */
export function checkBreakingChange(ctx: PRContext): Finding[] {
  const labels = ctx.labels.map((l) => l.toLowerCase());
  const flagged =
    BREAKING_RE.test(ctx.title) ||
    BREAKING_RE.test(ctx.body) ||
    labels.includes("breaking") ||
    labels.includes("breaking-change");
  if (!flagged) return [];
  const sections = detectSections(ctx.body);
  const migration = sections["migration"] ?? sections["migrating"] ?? "";
  if (migration.trim() !== "") return [];
  return [
    warn(
      "breaking-change",
      "Breaking change detected but no Migration notes found; document upgrade/migration steps.",
    ),
  ];
}
