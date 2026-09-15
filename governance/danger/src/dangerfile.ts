/**
 * Danger entry point for HorneroOS PR governance.
 *
 * Async-safe: the async `run()` is invoked via `void`, so there are no
 * floating promises. Deterministic: no LLM, no secrets handling, no test
 * duplication — pure policy functions from `src/` decide everything.
 */
import { danger, fail, warn, message } from "danger";
import * as fs from "node:fs";
import * as path from "node:path";
import yaml from "js-yaml";
import { evaluatePR, defaultPolicy, parsePolicy } from "./index.js";
import { isBotAuthor } from "./bots.js";
import type { PRContext, RepoPolicy } from "./types.js";

function loadPolicy(): RepoPolicy {
  const candidates = [
    ".github/hornero-governance.yml",
    ".github/hornero-governance.yaml",
  ];
  for (const rel of candidates) {
    const abs = path.join(process.cwd(), rel);
    if (!fs.existsSync(abs)) continue;
    try {
      return parsePolicy(yaml.load(fs.readFileSync(abs, "utf8")));
    } catch {
      return defaultPolicy();
    }
  }
  return defaultPolicy();
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function strArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

function buildContext(): PRContext {
  // Danger's DSL types vary across versions; read defensively off unknown.
  const gh = danger.github as unknown as Record<string, unknown>;
  const git = danger.git as unknown as Record<string, unknown>;
  const pr = (gh["pr"] ?? {}) as Record<string, unknown>;
  const issue = (gh["issue"] ?? {}) as Record<string, unknown>;
  const user = (pr["user"] ?? {}) as Record<string, unknown>;
  const prLabels = Array.isArray(pr["labels"]) ? pr["labels"] : issue["labels"];
  const labels = Array.isArray(prLabels)
    ? prLabels.map((l) => str((l as Record<string, unknown>)["name"]))
    : [];
  const commits = Array.isArray(git["commits"])
    ? (git["commits"] as Array<Record<string, unknown>>)
    : [];
  const hasMergeCommits = commits.some((c) =>
    /^(merge\b|merge branch|merge pull request)/i.test(str(c["message"])),
  );
  const changedFiles = [
    ...new Set([
      ...strArray(git["modified_files"]),
      ...strArray(git["created_files"]),
      ...strArray(git["deleted_files"]),
    ]),
  ];
  const diffStats = (git["linesOfCode"] ?? git["lines_of_code"] ?? {}) as Record<
    string,
    unknown
  >;
  const additions =
    typeof git["additions"] === "number"
      ? git["additions"]
      : typeof diffStats["additions"] === "number"
        ? diffStats["additions"]
        : 0;
  const deletions =
    typeof git["deletions"] === "number"
      ? git["deletions"]
      : typeof diffStats["deletions"] === "number"
        ? diffStats["deletions"]
        : 0;
  const author = str(user["login"]);
  return {
    title: str(pr["title"]),
    body: str(pr["body"]),
    author,
    isBot: isBotAuthor(author),
    isDraft: pr["draft"] === true,
    hasMergeCommits,
    additions,
    deletions,
    changedFiles,
    // Workflow contents are loaded by callers that need pin checks; the
    // Danger DSL file snapshot stays out of the hot path on purpose.
    fileContents: {},
    labels,
  };
}

async function run(): Promise<void> {
  const findings = evaluatePR(buildContext(), loadPolicy());
  for (const f of findings) {
    if (f.level === "fail") fail(`[${f.rule}] ${f.detail}`);
    else if (f.level === "warn") warn(`[${f.rule}] ${f.detail}`);
    else message(`[${f.rule}] ${f.detail}`);
  }
}

// Async-safe invocation: no floating promise (strict tsc + review gate).
void run();
