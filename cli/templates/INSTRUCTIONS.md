# {{PROJECT_NAME}} — AI Instructions

> Single source of truth for AI agents. All IDE-specific files (CLAUDE.md, AGENTS.md, etc.) symlink here.

## Purpose

{{PROJECT_PURPOSE}}

## Stack

- {{STACK}}

## How to Run

```bash
# fill in
```

## Architecture

| Component | Responsibility |
| --------- | -------------- |
| `src/`    | Application source |
| `tests/`  | Tests |

## Design Principles

1. Single Source of Truth — content lives in `.ai/`, never duplicated
2. Progressive Disclosure — load only what is needed
3. Spec-Driven — REASONS Canvas precedes code generation
4. Harness-first — `.claude/settings.json` and hooks define behavior, not the prompt

## Available Skills

| Skill | When to use |
| ----- | ----------- |
| `axis-delta` | Brownfield change in existing system: ≥2 modules touched or public contract changing (ADDED/MODIFIED/REMOVED). |
| `axis-specify` | Greenfield feature kick-off: scaffolds `.ai/specs/<slug>/canvas.md` + `tasks.md` + optional branch. |
| `documentation-guardian` | Spec-vs-code drift detected after a change; routine doc sweep before release. |
| (add SPDD skills that were installed via the preset, e.g. `story-decompose`, `alignment`, `abstraction-first`, `iterative-review`) | |

## Conventions

- Update `STATE.md` at end of every session with relevant changes
- Update spec before code when requirements change
- See [CONVENTIONS.md](CONVENTIONS.md) for the maintenance protocol

## IDE Integration

| IDE | Entry point | Rules | Skills | Sub-agents |
|-----|-------------|-------|--------|------------|
| **Cursor** | `AGENTS.md` | `.cursor/rules/*.mdc` ← `.ai/rules/` | `.cursor/skills` symlink | Task tool + `.ai/agents/` |
| **Claude Code** | `CLAUDE.md` | `.claude/rules` symlink | `.claude/skills` symlink | `.claude/agents` symlink |
| **GitHub Copilot** | `.github/copilot-instructions.md` | `.github/instructions/` | `.github/skills` symlink | — |

Setup: `bash setup-ide-links.sh` · Cursor rule sync: `bash scripts/sync-cursor-rules.sh` · Details: [docs/cursor.md](docs/cursor.md)

## Key Documents

- [CONVENTIONS.md](CONVENTIONS.md) — how to maintain this structure
- [docs/STATE.md](docs/STATE.md) — current playbook
- [docs/cursor.md](docs/cursor.md) — Cursor IDE integration (when declared in Phase 1)
- [agents/README.md](agents/README.md) — subagent role prompts
- [docs/canvases/](docs/canvases/) — REASONS Canvases (one per feature)
