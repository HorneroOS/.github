import { Finding, PRContext, RepoPolicy, warn } from "./types.js";

/** Minimal glob matcher supporting `**`, `*` and `?`. */
export function globMatch(pattern: string, path: string): boolean {
  let rx = "";
  let i = 0;
  while (i < pattern.length) {
    const c = pattern[i];
    if (c === "*" && pattern[i + 1] === "*") {
      rx += ".*";
      i += pattern[i + 2] === "/" ? 3 : 2;
    } else if (c === "*") {
      rx += "[^/]*";
      i += 1;
    } else if (c === "?") {
      rx += "[^/]";
      i += 1;
    } else {
      rx += (c ?? "").replace(/[.+^${}()|[\]\\]/g, "\\$&");
      i += 1;
    }
  }
  return new RegExp(`^${rx}$`).test(path);
}

export function touches(paths: string[], patterns: string[]): string[] {
  return paths.filter((p) => patterns.some((pat) => globMatch(pat, p)));
}

const EVIDENCE_RE =
  /!\[[^\]]*\]\([^)]+\)|<img\b|\.(mp4|mov|webm)\b|youtu(be\.com|\.be)|loom\.com|screenshot|screencast/i;

/**
 * PRs touching visual paths must link visual evidence (screenshot, video).
 * Warns only — a human decides whether the pixels really changed.
 */
export function checkVisualEvidence(
  ctx: PRContext,
  policy: RepoPolicy,
): Finding[] {
  const hit = touches(ctx.changedFiles, policy.visualPaths);
  if (hit.length === 0) return [];
  if (EVIDENCE_RE.test(ctx.body)) return [];
  return [
    warn(
      "visual-evidence",
      `Touches visual paths (${hit.slice(0, 5).join(", ")}${hit.length > 5 ? ", …" : ""}) but the body shows no screenshot/video evidence; attach one.`,
    ),
  ];
}
