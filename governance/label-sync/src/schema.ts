/** Typed schema for the canonical label taxonomy (governance/labels.yml). */

export interface LabelDefinition {
  readonly name: string;
  readonly description: string;
  readonly color: string;
}

export interface LabelsFile {
  readonly version: 1;
  readonly labels: readonly LabelDefinition[];
}

const COLOR_RE = /^[0-9a-fA-F]{6}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseLabelsFile(raw: unknown): LabelsFile {
  if (!isRecord(raw)) {
    throw new Error("labels.yml root must be a mapping");
  }
  if (raw["version"] !== 1) {
    throw new Error('labels.yml: expected `version: 1`');
  }
  const labels = raw["labels"];
  if (!Array.isArray(labels) || labels.length === 0) {
    throw new Error("labels.yml: `labels` must be a non-empty list");
  }
  const parsed: LabelDefinition[] = labels.map((entry, index) => {
    if (!isRecord(entry)) {
      throw new Error(`labels.yml: labels[${index}] must be a mapping`);
    }
    const { name, description, color } = entry;
    if (typeof name !== "string" || name.length === 0) {
      throw new Error(`labels.yml: labels[${index}].name must be a non-empty string`);
    }
    if (typeof description !== "string" || description.length === 0) {
      throw new Error(`labels.yml: labels[${index}].description must be a non-empty string`);
    }
    if (typeof color !== "string" || !COLOR_RE.test(color)) {
      throw new Error(
        `labels.yml: labels[${index}].color must be a 6-digit hex string (no leading #)`,
      );
    }
    return { name, description, color: color.toLowerCase() };
  });
  const seen = new Set<string>();
  for (const label of parsed) {
    if (seen.has(label.name)) {
      throw new Error(`labels.yml: duplicate label name ${JSON.stringify(label.name)}`);
    }
    seen.add(label.name);
  }
  return { version: 1, labels: parsed };
}

export function labelNames(file: LabelsFile): Set<string> {
  return new Set(file.labels.map((label) => label.name));
}
