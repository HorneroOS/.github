/**
 * Additive label synchronizer.
 *
 * Creates labels from governance/labels.yml that are missing in the target
 * repository and updates description/color of existing ones. It NEVER
 * deletes labels, so repo-specific labels are preserved.
 *
 * Usage (env):
 *   GITHUB_TOKEN   token with issues:write on the target repo (required)
 *   GITHUB_REPOSITORY "owner/repo" (required)
 *   LABELS_FILE    path to labels.yml (default: ../labels.yml)
 *   DRY_RUN        "1" to print planned actions without writing
 */
import * as fs from "node:fs";
import * as path from "node:path";
import yaml from "js-yaml";
import { parseLabelsFile, type LabelDefinition } from "./schema";

interface RemoteLabel {
  name: string;
  description: string | null;
  color: string;
}

function env(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === "") {
    throw new Error(`missing required env var ${name}`);
  }
  return value;
}

async function api<T>(token: string, route: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`https://api.github.com${route}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    throw new Error(`GitHub API ${route} failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as T;
}

async function listRemoteLabels(token: string, repo: string): Promise<Map<string, RemoteLabel>> {
  const out = new Map<string, RemoteLabel>();
  let page = 1;
  for (;;) {
    const batch = await api<RemoteLabel[]>(
      token,
      `/repos/${repo}/labels?per_page=100&page=${page}`,
    );
    for (const label of batch) {
      out.set(label.name, label);
    }
    if (batch.length < 100) {
      return out;
    }
    page += 1;
  }
}

async function main(): Promise<void> {
  const token = env("GITHUB_TOKEN");
  const repo = env("GITHUB_REPOSITORY");
  const labelsFile =
    process.env["LABELS_FILE"] ?? path.resolve(__dirname, "..", "..", "labels.yml");
  const dryRun = process.env["DRY_RUN"] === "1";

  const raw = yaml.load(fs.readFileSync(labelsFile, "utf8"));
  const wanted = parseLabelsFile(raw);
  const remote = await listRemoteLabels(token, repo);

  let created = 0;
  let updated = 0;
  for (const label of wanted.labels) {
    const existing: RemoteLabel | undefined = remote.get(label.name);
    if (existing === undefined) {
      const action: LabelDefinition = label;
      if (dryRun) {
        console.log(`would create ${action.name}`);
      } else {
        await api(token, `/repos/${repo}/labels`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(action),
        });
        console.log(`created ${action.name}`);
      }
      created += 1;
    } else if (
      (existing.description ?? "") !== label.description ||
      existing.color.toLowerCase() !== label.color
    ) {
      if (dryRun) {
        console.log(`would update ${label.name}`);
      } else {
        await api(token, `/repos/${repo}/labels/${encodeURIComponent(label.name)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            new_name: label.name,
            description: label.description,
            color: label.color,
          }),
        });
        console.log(`updated ${label.name}`);
      }
      updated += 1;
    }
  }
  // Deliberately no deletion step: repo-specific labels are preserved.
  console.log(`done: created=${created} updated=${updated} deleted=0 (never)`);
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
