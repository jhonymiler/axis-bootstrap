# Conventions — How {{PROJECT_NAME}} Maintains Its AI Layer

## Single Source of Truth

All AI content lives in `.ai/`. IDE folders (`.claude/`, `.cursor/`, `.github/`) contain symlinks or generated artifacts from `setup-ide-links.sh`. `.agents` points to `.ai/agents`.

| Artifact | SSOT | Cursor delivery |
|----------|------|-----------------|
| Instructions | `.ai/INSTRUCTIONS.md` | `AGENTS.md` symlink |
| Skills | `.ai/skills/` | `.cursor/skills` symlink |
| Rules | `.ai/rules/*.md` | `.cursor/rules/*.mdc` **generated** — never edit `.mdc` directly |
| Sub-agents | `.ai/agents/` | Task tool (Cursor) · `.claude/agents` symlink (Claude) |

After editing `.ai/rules/`: `bash scripts/sync-cursor-rules.sh` · Local gate: `bash scripts/validate-ide-links.sh` · Details: [docs/cursor.md](docs/cursor.md)

## Progressive Disclosure

| Layer | Loads | Limit |
| ----- | ----- | ----- |
| Discovery | Always | INSTRUCTIONS ≤ 180 lines |
| Index | When relevant | SKILL.md ≤ 60 lines |
| On-demand | When needed | references/*.md |

## REASONS Canvas (SPDD pipeline)

Every non-trivial feature has a Canvas in `.ai/docs/canvases/<slug>.md`. Filled by:
1. `story-decompose` → R (Requirements)
2. `alignment` → O scope + N (Norms) + S₂ (Safeguards)
3. `abstraction-first` → E (Entities) + A (Approach) + S₁ (System structure)
4. (code generation)
5. `iterative-review` → keeps Canvas ⇄ code in sync

## Bidirectional Spec-Code Sync

| Change | Direction |
| ------ | --------- |
| New requirement / bug fix | spec → code (update Canvas first) |
| Refactor (no behavior change) | code → spec (sync Canvas after) |

## Knowledge Verification Chain

Before asserting anything: codebase → project docs → official docs → web → mark uncertain. Never fabricate.

## Adding a New IDE

Add 3-4 `ln -s` lines to `setup-ide-links.sh`. Re-run script (idempotent).

## Session Closing Protocol

1. Update `docs/STATE.md` (curate, don't append)
2. Identify skills/docs affected by behavioral changes
3. Update them in the same session
