import { describe, it } from "node:test";
import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";
import { evaluatePR } from "../src/index.js";
import { defaultPolicy, loadPolicy } from "../src/policy.js";
import type { Finding, PRContext, RepoPolicy } from "../src/types.js";

const here = __dirname;

interface Fixture {
  context: PRContext;
  policyOverride?: Partial<RepoPolicy>;
}

function load(name: string): { findings: Finding[]; ctx: PRContext } {
  const raw = fs.readFileSync(path.join(here, "fixtures", `${name}.json`), "utf8");
  const fixture = JSON.parse(raw) as Fixture;
  const policy: RepoPolicy = { ...defaultPolicy(), ...(fixture.policyOverride ?? {}) };
  return { findings: evaluatePR(fixture.context, policy), ctx: fixture.context };
}

function rules(findings: Finding[], level: Finding["level"]): string[] {
  return findings.filter((f) => f.level === level).map((f) => f.rule);
}

void describe("HorneroOS PR-governance engine", () => {
  void it("good-feature: no fails, guidance messages present", () => {
    const { findings } = load("good-feature");
    assert.deepEqual(rules(findings, "fail"), []);
    assert.ok(rules(findings, "message").includes("docs-links"));
  });

  void it("bad-title: deterministic fail on non-conventional title", () => {
    const { findings } = load("bad-title");
    assert.ok(rules(findings, "fail").includes("title-conventional"));
  });

  void it("bot: human checklist skipped, safety checks kept", () => {
    const { findings } = load("bot");
    assert.deepEqual(rules(findings, "fail"), []);
    assert.ok(rules(findings, "message").includes("bot-author"));
    assert.ok(!rules(findings, "fail").includes("title-conventional"));
    assert.ok(!rules(findings, "warn").includes("body-sections"));
  });

  void it("draft: hygiene downgraded to warns, never fails", () => {
    const { findings } = load("draft");
    assert.deepEqual(rules(findings, "fail"), []);
    assert.ok(rules(findings, "warn").includes("title-conventional"));
    assert.ok(rules(findings, "warn").includes("no-merge-commits"));
    assert.ok(rules(findings, "message").includes("draft-pr"));
  });

  void it("large: warns on oversized diff", () => {
    const { findings } = load("large");
    assert.ok(rules(findings, "warn").includes("large-pr"));
  });

  void it("docs-only: changelog-exempt, no linked-issue warn", () => {
    const { findings } = load("docs-only");
    assert.ok(!rules(findings, "warn").includes("linked-issue"));
    assert.ok(rules(findings, "message").includes("changelog-exempt-trivial"));
  });

  void it("visual-no-evidence: warns when pixels change without proof", () => {
    const { findings } = load("visual-no-evidence");
    assert.ok(rules(findings, "warn").includes("visual-evidence"));
  });

  void it("visual-with-evidence: screenshot satisfies the visual rule", () => {
    const { findings } = load("visual-with-evidence");
    assert.ok(!rules(findings, "warn").includes("visual-evidence"));
  });

  void it("breaking: warns when migration notes are missing", () => {
    const { findings } = load("breaking");
    assert.ok(rules(findings, "warn").includes("breaking-change"));
  });

  void it("personal-path: fails on forbidden secret paths", () => {
    const { findings } = load("personal-path");
    assert.ok(rules(findings, "fail").includes("forbidden-paths"));
  });

  void it("generated-missing-derivative: fails without the derivative", () => {
    const { findings } = load("generated-missing-derivative");
    assert.ok(rules(findings, "fail").includes("generated-counterpart"));
  });

  void it("release-pin: fails on floating action tags", () => {
    const { findings } = load("release-pin");
    assert.ok(rules(findings, "fail").includes("action-pin"));
    assert.ok(rules(findings, "warn").includes("risky-area"));
  });

  void it("loadPolicy: HORNERO_POLICY_PATH override wins over defaults", () => {
    const dir = fs.mkdtempSync(path.join(fs.realpathSync("/tmp"), "gov-policy-"));
    const file = path.join(dir, "custom.yml");
    fs.writeFileSync(
      file,
      "version: 1\nkind: shell\nvisual_paths:\n  - 'waybar/**'\npolicies:\n  large_threshold: 123\n",
      "utf8",
    );
    const policy = loadPolicy({ HORNERO_POLICY_PATH: file }, dir);
    assert.equal(policy.kind, "shell");
    assert.equal(policy.largeThreshold, 123);
    assert.deepEqual(policy.visualPaths, ["waybar/**"]);
    fs.rmSync(dir, { recursive: true, force: true });
  });

  void it("loadPolicy: missing file falls back to defaults", () => {
    const policy = loadPolicy(
      { HORNERO_POLICY_PATH: "/nonexistent/hornero-governance.yml" },
      "/tmp",
    );
    assert.deepEqual(policy, defaultPolicy());
  });

  void it("loadPolicy: malformed file falls back to defaults", () => {
    const dir = fs.mkdtempSync(path.join(fs.realpathSync("/tmp"), "gov-policy-"));
    const file = path.join(dir, "broken.yml");
    fs.writeFileSync(file, "version: [unclosed\n\tbad: : :\n", "utf8");
    const policy = loadPolicy({ HORNERO_POLICY_PATH: file }, dir);
    assert.deepEqual(policy, defaultPolicy());
    fs.rmSync(dir, { recursive: true, force: true });
  });

  void it("dangerfile build: no tsc helpers (cleanDangerfile would strip them)", () => {
    // Danger loads dist/src/dangerfile.js via cleanDangerfile +
    // require-from-string; cleanDangerfile comments out everything from
    // the first `var` to require("danger"), so tsc-emitted __importStar
    // et al must never appear in this file (see src/dangerfile.ts NOTE).
    const compiled = fs.readFileSync(
      path.join(here, "..", "src", "dangerfile.js"),
      "utf8",
    );
    assert.ok(!/^var __\w+ =/m.test(compiled), "tsc helpers in dangerfile");
  });
});
