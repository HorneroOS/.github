/**
 * Validates that every label referenced by the org-default issue forms
 * exists in the canonical taxonomy (governance/labels.yml).
 *
 * Usage: `npm run validate` from governance/label-sync.
 * Exits non-zero listing any unknown label.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import yaml from "js-yaml";
import { parseLabelsFile, labelNames } from "./schema";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function collectFormLabels(formPath: string): string[] {
  const raw: unknown = yaml.load(fs.readFileSync(formPath, "utf8"));
  if (!isRecord(raw)) {
    throw new Error(`${formPath}: root must be a mapping`);
  }
  const found: string[] = [];
  const topLabels = raw["labels"];
  if (Array.isArray(topLabels)) {
    for (const entry of topLabels) {
      if (typeof entry === "string") {
        found.push(entry);
      }
    }
  }
  // Dropdown options that look like taxonomy names (contain ":") are
  // treated as label references too.
  const body = raw["body"];
  if (Array.isArray(body)) {
    for (const item of body) {
      if (!isRecord(item)) {
        continue;
      }
      const attrs: unknown = item["attributes"];
      if (!isRecord(attrs)) {
        continue;
      }
      const options: unknown = attrs["options"];
      if (!Array.isArray(options)) {
        continue;
      }
      for (const opt of options) {
        if (typeof opt === "string" && opt.includes(":")) {
          found.push(opt);
        }
      }
    }
  }
  return found;
}

function main(): void {
  const root = path.resolve(__dirname, "..", "..", "..");
  const labelsFile = path.join(root, "governance", "labels.yml");
  const templateDir = path.join(root, ".github", "ISSUE_TEMPLATE");

  const taxonomy = parseLabelsFile(yaml.load(fs.readFileSync(labelsFile, "utf8")));
  const known = labelNames(taxonomy);

  const forms = ["bug-report.yml", "feature-request.yml", "documentation.yml"];
  let failures = 0;
  for (const form of forms) {
    const formPath = path.join(templateDir, form);
    const refs = collectFormLabels(formPath);
    if (refs.length === 0) {
      console.error(`FAIL ${form}: references no labels`);
      failures += 1;
      continue;
    }
    for (const ref of refs) {
      if (!known.has(ref)) {
        console.error(`FAIL ${form}: label ${JSON.stringify(ref)} not in governance/labels.yml`);
        failures += 1;
      }
    }
    console.log(`ok ${form}: ${refs.length} label reference(s) all in taxonomy`);
  }
  if (failures > 0) {
    throw new Error(`label validation failed with ${failures} problem(s)`);
  }
  console.log("all form-referenced labels exist in governance/labels.yml");
}

try {
  main();
} catch (err: unknown) {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
}
