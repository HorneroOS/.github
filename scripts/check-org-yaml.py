#!/usr/bin/env python3
"""Validate organization YAML in HorneroOS/.github.

Parses every issue form, every workflow file, and the canonical label
taxonomy so malformed YAML fails fast in governance-ci instead of at
2am in a consumer repo. Requires PyYAML (pip install pyyaml).

Usage: python3 scripts/check-org-yaml.py [--root DIR]
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

try:
    import yaml
except ImportError:  # pragma: no cover
    sys.exit("ERROR: PyYAML is required (pip install pyyaml)")

SHA_RE = re.compile(r"^[0-9a-f]{40}$")


def load(path: Path):
    try:
        with path.open(encoding="utf-8") as fh:
            return yaml.safe_load(fh)
    except (OSError, ValueError) as exc:
        raise RuntimeError(f"{path}: unreadable ({exc})") from exc


def check_taxonomy(root: Path) -> list[str]:
    errors: list[str] = []
    try:
        doc = load(root / "governance" / "labels.yml")
    except RuntimeError as exc:
        return [str(exc)]
    if not isinstance(doc, dict) or doc.get("version") != 1:
        return ["governance/labels.yml: expected version: 1 mapping"]
    labels = doc.get("labels")
    if not isinstance(labels, list) or not labels:
        return ["governance/labels.yml: labels must be a non-empty list"]
    seen: set[str] = set()
    for i, entry in enumerate(labels):
        if not isinstance(entry, dict):
            errors.append(f"governance/labels.yml: labels[{i}] must be a mapping")
            continue
        name = entry.get("name")
        if not isinstance(name, str) or not name:
            errors.append(f"governance/labels.yml: labels[{i}] needs a name")
        elif name in seen:
            errors.append(f"governance/labels.yml: duplicate label '{name}'")
        else:
            seen.add(name)
        if not isinstance(entry.get("description"), str) or not entry.get("description"):
            errors.append(f"governance/labels.yml: '{name}' needs a description")
        if not isinstance(entry.get("color"), str) or not re.fullmatch(
            r"[0-9a-fA-F]{6}", entry["color"]
        ):
            errors.append(f"governance/labels.yml: '{name}' needs a 6-digit hex color")
    return errors


def check_forms(root: Path, taxonomy: set[str]) -> list[str]:
    errors: list[str] = []
    forms = sorted((root / ".github" / "ISSUE_TEMPLATE").glob("*.yml"))
    if not forms:
        return [".github/ISSUE_TEMPLATE: no forms found"]
    for path in forms:
        if path.name == "config.yml":
            continue
        try:
            doc = load(path)
        except RuntimeError as exc:
            errors.append(str(exc))
            continue
        if not isinstance(doc, dict):
            errors.append(f"{path}: root must be a mapping")
            continue
        for label in doc.get("labels", []) or []:
            if label not in taxonomy:
                errors.append(f"{path}: label '{label}' not in canonical taxonomy")
    return errors


def check_workflows(root: Path) -> list[str]:
    errors: list[str] = []
    workflows = sorted((root / ".github" / "workflows").glob("*.yml"))
    if not workflows:
        return [".github/workflows: no workflows found"]
    for path in workflows:
        try:
            doc = load(path)
        except RuntimeError as exc:
            errors.append(str(exc))
            continue
        if not isinstance(doc, dict) or "jobs" not in doc:
            errors.append(f"{path}: not a workflow document (missing jobs)")
    return errors


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Validate organization YAML.")
    parser.add_argument("--root", default=None, help="Repository root")
    args = parser.parse_args(argv)
    root = Path(args.root) if args.root else Path(__file__).resolve().parent.parent
    errors = check_taxonomy(root)
    taxonomy: set[str] = set()
    if not errors:
        doc = load(root / "governance" / "labels.yml")
        taxonomy = {e["name"] for e in doc["labels"] if isinstance(e, dict)}
    errors.extend(check_forms(root, taxonomy))
    errors.extend(check_workflows(root))
    if errors:
        for error in errors:
            print(f"YAML-FAIL: {error}")
        return 1
    print("YAML-PASS: issue forms, workflows, and label taxonomy parse")
    return 0


if __name__ == "__main__":
    sys.exit(main())
