import { Finding, PRContext, fail, warn } from "./types.js";

const WORKFLOW_RE = /(^|\/)\.github\/workflows\/[^/]+\.ya?ml$/;
/** `uses: owner/repo@<40-hex-sha> # vX.Y.Z` — SHA pin plus version comment. */
const PINNED_RE = /uses:\s*[^\s#]+@[0-9a-f]{40}\s+#\s*v?\d+\.\d+\.\d+/;
const USES_RE = /uses:\s*([^\s#]+)/g;

/**
 * Release-pinning: third-party GitHub Actions must be pinned to a full
 * commit SHA with a `# vX.Y.Z` version comment. Floating tags fail.
 * Files without supplied content warn (cannot verify deterministically).
 */
export function checkPins(ctx: PRContext): Finding[] {
  const findings: Finding[] = [];
  for (const file of ctx.changedFiles) {
    if (!WORKFLOW_RE.test(file)) continue;
    const content = ctx.fileContents[file];
    if (content === undefined) {
      findings.push(
        warn(
          "action-pin-unverifiable",
          `Workflow "${file}" changed but its content was not supplied; cannot verify SHA pins.`,
        ),
      );
      continue;
    }
    const lines = content.split("\n");
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("#") || !trimmed.includes("uses:")) return;
      USES_RE.lastIndex = 0;
      const m = USES_RE.exec(trimmed);
      const ref = m?.[1] ?? "";
      if (ref.startsWith("./") || ref.startsWith("docker://")) return;
      if (!PINNED_RE.test(trimmed)) {
        findings.push(
          fail(
            "action-pin",
            `${file}:${idx + 1}: unpinned action "${ref}"; pin to a full commit SHA with a version comment, e.g. "uses: actions/checkout@<SHA> # v4.2.2".`,
          ),
        );
      }
    });
  }
  return findings;
}
