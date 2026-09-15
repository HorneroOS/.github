/**
 * Danger entry point for HorneroOS PR governance.
 *
 * Async-safe: the async `run()` is invoked via `void`, so there are no
 * floating promises. Deterministic: no LLM, no secrets handling, no test
 * duplication — pure policy functions from `src/` decide everything.
 */
import { danger, fail, warn, message } from "danger";
// NOTE: plain `require` (not `import *`) on purpose. Danger loads this file
// through cleanDangerfile + require-from-string, and cleanDangerfile's
// require("danger") pattern swallows every line from the first `var` down
// to the danger import — including tsc-emitted `__importStar` helpers.
// Helper-free output keeps the loaded module intact.
import fs = require("node:fs");
import path = require("node:path");
import { evaluatePR, loadPolicy } from "./index.js";
import { isBotAuthor } from "./bots.js";
import { isWorkflowFile } from "./pins.js";
import type { PRContext } from "./types.js";

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
  // Pin checks need the text of changed workflow files. Danger runs with
  // cwd at the repo under review, so read them from disk (read-only);
  // files unreadable from disk (e.g. deleted) stay absent and the pin
  // rule reports them as unverifiable instead of failing.
  const fileContents: Record<string, string> = {};
  for (const file of changedFiles) {
    if (!isWorkflowFile(file)) continue;
    try {
      fileContents[file] = fs.readFileSync(path.join(process.cwd(), file), "utf8");
    } catch {
      // Leave absent; checkPins warns on missing content.
    }
  }
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
    fileContents,
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
