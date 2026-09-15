import { Finding, PRContext, info, warn } from "./types.js";

/**
 * Robust heading-based section detection.
 *
 * Matches ATX headings (`## Summary`) and bold-label lines (`**Summary**`),
 * case-insensitively. It NEVER matches exact checkbox strings, so template
 * rewordings of checklist items cannot silently break detection.
 */
export const REQUIRED_SECTIONS = ["summary", "type", "validation", "risks"] as const;

export type SectionName = (typeof REQUIRED_SECTIONS)[number] | "checklist";

function headingAt(line: string): string | null {
  const atx = /^\s*#{1,6}\s+(.+?)\s*$/.exec(line);
  if (atx?.[1] !== undefined) return normalize(atx[1]);
  const bold = /^\s*\*\*(.+?)\*\*\s*:?\s*$/.exec(line);
  if (bold?.[1] !== undefined) return normalize(bold[1]);
  return null;
}

function normalize(heading: string): string {
  return heading.trim().toLowerCase().replace(/[^a-z]+/g, " ").trim();
}

export function detectSections(body: string): Record<string, string> {
  const sections: Record<string, string> = {};
  let current: string | null = null;
  for (const line of body.split("\n")) {
    const name = headingAt(line);
    if (name !== null) {
      current = name;
      sections[current] = "";
      continue;
    }
    if (current !== null) sections[current] += line + "\n";
  }
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(sections)) {
    const key = k.split(" ")[0] ?? k;
    if (key !== undefined && !(key in out)) out[key] = (v ?? "").trim();
  }
  return out;
}

// Template vocabulary is conventional-commit style ("One of: feat, fix,
// docs, refactor, chore"); "feature" stays as an accepted alias.
const PR_TYPES = ["feat", "feature", "fix", "docs", "refactor", "chore"];

/** Human-hygiene sections: skipped for bots, reduced on drafts. */
export function checkSections(ctx: PRContext): Finding[] {
  if (ctx.isBot) {
    return [
      info(
        "sections-bot-skip",
        "Bot author: human section checklist skipped (safety checks still apply).",
      ),
    ];
  }
  const sections = detectSections(ctx.body);
  const missing = REQUIRED_SECTIONS.filter(
    (s) => !(s in sections) || sections[s] === undefined || sections[s]?.trim() === "",
  );
  const findings: Finding[] = [];
  if (missing.length > 0) {
    const detail = `PR body is missing sections: ${missing.join(", ")} (detected by heading, e.g. "## Summary").`;
    findings.push(warn("body-sections", ctx.isDraft ? `${detail} (draft: reduced hygiene)` : detail));
  }
  const typeValue = sections["type"]?.toLowerCase() ?? "";
  if (typeValue !== "" && !PR_TYPES.some((t) => typeValue.includes(t))) {
    findings.push(
      warn(
        "body-type",
        `Type section should name one of ${PR_TYPES.join("/")}; got "${sections["type"]?.trim()}".`,
      ),
    );
  }
  return findings;
}
