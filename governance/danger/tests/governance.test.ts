import { describe, it } from "node:test";
import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
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
    assert.ok(!rules(findings, "message").includes("pr-commands"));
    assert.ok(!rules(findings, "warn").includes("body-sections"));
  });

  void it("missing-sections: warns naming missing required sections", () => {
    const { findings } = load("extension-missing-sections");
    assert.deepEqual(rules(findings, "fail"), []);
    const sectionWarn = findings.find((f) => f.rule === "body-sections");
    assert.ok(sectionWarn !== undefined, "expected a body-sections warning");
    assert.ok(
      sectionWarn.detail.includes("linked"),
      `warning should name missing section "linked": ${sectionWarn.detail}`,
    );
  });

  void it("vm-reminder: emitted only for OS/shell/installer/config/greeter repos", () => {
    const { ctx } = load("good-feature");
    const shellFindings = evaluatePR(ctx, { ...defaultPolicy(), kind: "shell" });
    assert.ok(rules(shellFindings, "message").includes("vm-reminder"));
    const docsFindings = evaluatePR(ctx, { ...defaultPolicy(), kind: "docs" });
    assert.ok(!rules(docsFindings, "message").includes("vm-reminder"));
  });

  void it("linked-issue: type:docs and area:docs labels exempt PR from linked-issue warn", () => {
    const { ctx } = load("good-feature");
    const baseCtx: PRContext = { ...ctx, body: "## Summary\nSmall update.\n\n## Verification\nChecked.\n\n## Risk / Breaking Changes\nNone.\n\n## Linked Issue\nNone.\n" };
    for (const label of ["type:docs", "area:docs"]) {
      const findings = evaluatePR({ ...baseCtx, labels: [label] }, defaultPolicy());
      assert.ok(
        !rules(findings, "warn").includes("linked-issue"),
        `label "${label}" should exempt from linked-issue warning`,
      );
    }
  });

  void it("gov-pin: engine release-pin style passes pin check", () => {
    const { findings } = load("gov-pin");
    assert.ok(!rules(findings, "fail").includes("action-pin"));
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

  void it("loadPolicy: HORNERO_POLICY_PATH override wins over repo-local policy (including nonexistent base)", () => {
    const dir = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), "gov-policy-"));
    try {
      const repoPolicyDir = path.join(dir, ".github");
      fs.mkdirSync(repoPolicyDir, { recursive: true });
      fs.writeFileSync(
        path.join(repoPolicyDir, "hornero-governance.yml"),
        "version: 1\nkind: docs\npolicies:\n  forbidden_paths: []\n  large_threshold: 99999\n",
        "utf8",
      );

      const baseFile = path.join(dir, "base-policy.yml");
      fs.writeFileSync(
        baseFile,
        "version: 1\nkind: shell\nvisual_paths:\n  - 'waybar/**'\npolicies:\n  large_threshold: 123\n",
        "utf8",
      );

      const policy = loadPolicy({ HORNERO_POLICY_PATH: baseFile }, dir);
      assert.equal(policy.kind, "shell");
      assert.equal(policy.largeThreshold, 123);
      assert.deepEqual(policy.visualPaths, ["waybar/**"]);

      const viaAlias = loadPolicy({ HORNERO_GOVERNANCE_POLICY: baseFile }, dir);
      assert.equal(viaAlias.kind, "shell");
      assert.equal(viaAlias.largeThreshold, 123);

      // When the base branch has no policy file, pointing HORNERO_POLICY_PATH to a
      // nonexistent temp file must still return defaultPolicy() and ignore PR-head files.
      const fallback = loadPolicy(
        { HORNERO_POLICY_PATH: path.join(dir, "absent-base-policy.yml") },
        dir,
      );
      assert.deepEqual(fallback, defaultPolicy());
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  void it("loadPolicy: missing file falls back to defaults", () => {
    const policy = loadPolicy(
      { HORNERO_POLICY_PATH: "/nonexistent/hornero-governance.yml" },
      os.tmpdir(),
    );
    assert.deepEqual(policy, defaultPolicy());
  });

  void it("loadPolicy: malformed or invalid existing file fails closed", () => {
    const dir = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), "gov-policy-"));
    try {
      const brokenOverride = path.join(dir, "broken.yml");
      fs.writeFileSync(brokenOverride, "version: [unclosed\n\tbad: : :\n", "utf8");
      assert.throws(
        () => loadPolicy({ HORNERO_POLICY_PATH: brokenOverride }, dir),
        /Failed to load governance policy/,
      );

      const repoPolicyDir = path.join(dir, ".github");
      fs.mkdirSync(repoPolicyDir, { recursive: true });
      fs.writeFileSync(
        path.join(repoPolicyDir, "hornero-governance.yml"),
        "version: [unclosed\n\tbad: : :\n",
        "utf8",
      );
      assert.throws(
        () => loadPolicy({}, dir),
        /Failed to load governance policy/,
      );

      const badVersion = path.join(dir, "bad-version.yml");
      fs.writeFileSync(badVersion, "version: 99\nkind: shell\n", "utf8");
      assert.throws(
        () => loadPolicy({ HORNERO_POLICY_PATH: badVersion }, dir),
        /Failed to load governance policy.*unsupported policy version: 99/,
      );
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  void it("dangerfile build: schedules run() and propagates policy load failures", async () => {
    const dir = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), "gov-dangerfile-"));
    const broken = path.join(dir, "broken.yml");
    fs.writeFileSync(broken, "version: [unclosed\n\tbad: : :\n", "utf8");

    const dangerfilePath = path.join(here, "..", "src", "dangerfile.js");
    const resolved = require.resolve(dangerfilePath);
    const prevEnv = process.env["HORNERO_POLICY_PATH"];
    const g = globalThis as Record<string, unknown>;
    const prevGlobals = {
      danger: g["danger"],
      fail: g["fail"],
      warn: g["warn"],
      message: g["message"],
      schedule: g["schedule"],
    };

    let scheduledPromise: Promise<unknown> | undefined;
    g["danger"] = {
      github: { pr: { title: "fix: test", body: "", user: { login: "alice" }, labels: [] }, issue: { labels: [] } },
      git: { commits: [], modified_files: [], created_files: [], deleted_files: [], additions: 1, deletions: 0 },
    };
    g["fail"] = () => {};
    g["warn"] = () => {};
    g["message"] = () => {};
    g["schedule"] = (fnOrPromise: Promise<unknown> | (() => Promise<unknown>)) => {
      scheduledPromise = typeof fnOrPromise === "function" ? fnOrPromise() : fnOrPromise;
    };
    process.env["HORNERO_POLICY_PATH"] = broken;
    delete require.cache[resolved];

    try {
      require(resolved);
      assert.ok(scheduledPromise instanceof Promise, "dangerfile must register promise via schedule()");
      await assert.rejects(scheduledPromise, /Failed to load governance policy/);
    } finally {
      delete require.cache[resolved];
      if (prevEnv === undefined) delete process.env["HORNERO_POLICY_PATH"];
      else process.env["HORNERO_POLICY_PATH"] = prevEnv;
      for (const [k, v] of Object.entries(prevGlobals)) {
        if (v === undefined) delete g[k];
        else g[k] = v;
      }
      fs.rmSync(dir, { recursive: true, force: true });
    }
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
