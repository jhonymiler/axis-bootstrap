---
applyTo: "**"
trigger: always
description: "AXIS workflow: branch naming, commit conventions, PR flow, release process for the framework repo"
alwaysApply: true
---

# Workflow & Governance — AXIS Framework

> Source of truth for branch, commit, PR, and release standards in this repository. The agent must follow this without being reminded.

## Task Management

- **Tool:** GitHub Issues (no external tracker).
- **Labels:** `bug`, `enhancement`, `docs`, `spec`, `harness`, `memory`, `recursiveness`.
- **Issues that touch recursiveness** (i.e., the repo violating its own framework) get the `recursiveness` label and take priority — fixing them keeps the framework auditable.

## Commit Messages

- **Convention:** Conventional Commits — `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`.
- **Scope** is optional but helpful for cross-layer changes: `feat(harness): ...`, `docs(skill): ...`.
- **Subject ≤ 72 chars**, imperative mood ("add" not "added").
- **Body:** wrap at 100 chars. Explain *why*, not *what* (the diff shows what).
- **Co-authored-by trailer** when pairing or when an AI tool generated the change.

## Branches

- **Main branch:** `main`. Direct push is allowed for solo trivial fixes (typo, doc tweak); anything touching `.ai/`, `scripts/`, `cli/src/`, or `.github/` goes through a PR.
- **Naming:** `<type>/<slug>` — examples: `feat/workflow-rule`, `fix/symlink-windows`, `docs/quickstart-pt`.
- **Allowed prefixes:** `feat/`, `fix/`, `docs/`, `chore/`, `refactor/`.

## Pull Requests

- **Title:** Conventional Commit format, same as commits.
- **Description must include:** summary (1-3 bullets), why this change, and validation evidence (e.g., `bash scripts/validate-axis.sh` output for spec changes).
- **CI must be green** — the `Validate AXIS` workflow runs the 4 quality gates. Do not merge with red checks.
- **Merge strategy:** squash. Keep `main` history linear.
- **Auto-delete branch** after merge.

## Releases & Versioning

- **CLI versioning** (`cli/package.json`): SemVer.
  - PATCH: bug fixes in scripts or commands.
  - MINOR: new commands, new skill templates, additive changes to discovery questions.
  - MAJOR: breaking changes to template format, removed phases, renamed artifacts.
- **CLI publish flow** (release-driven):
  1. PR bumps `cli/package.json` version → merges to `main`.
  2. GitHub UI → Releases → "Draft a new release".
  3. Create tag `cli-v<version>` (must match `package.json`).
  4. Publish release → [`publish-cli.yml`](../../.github/workflows/publish-cli.yml) fires and publishes to npmjs.com with provenance.
- **Framework spec** (`.ai/skills/`, `FRAMEWORK.md`): not versioned numerically — tagged with the date of significant restructuring (e.g., `spec-2026-05`).
- **Changelog:** auto-generated via GitHub's "Generate release notes" button when drafting the release.

## Agent Behavior Rules

- After editing any file under `.ai/skills/axis-bootstrap/` or `.ai/skills/<name>/SKILL.md`, run `bash scripts/sync-cli-templates.sh` before committing — the validator will reject drift.
- After editing `.ai/INSTRUCTIONS.md` or any SKILL.md, run `bash scripts/validate-axis.sh` locally before committing.
- Never push directly to `main` for changes that touch the spec, harness, or CLI source.
- Always include a `feat:`/`fix:`/`docs:` prefix in commit subjects.
- PR description without validation evidence for spec changes = blocking review comment.
