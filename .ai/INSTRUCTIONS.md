# Spec-Harness Framework — Instructions

> You are inside a self-applicable framework for bootstrapping projects with complete AI infrastructure. This file is your entry point.

## Purpose

This repository contains an **executable spec** that bootstraps any project (technical or non-technical) with three validated layers:

- **Spec Layer** — INSTRUCTIONS, skills, rules, docs
- **Harness Layer** — settings.json, hooks, sub-agents, symlinks
- **Continuity Layer** — STATE.md, CONVENTIONS.md

Full conceptual model in [FRAMEWORK.md](FRAMEWORK.md).

## Code Review (Copilot)

GitHub Copilot Code Review is enforced on PRs to `main`. It reads this file as the repo-wide protocol (first ~4000 chars) and path-targeted rules from [`.ai/instructions/`](.ai/instructions/) (symlinked to `.github/instructions/`). Maintenance and operator flow live in the [`copilot-review`](.ai/skills/copilot-review/SKILL.md) skill — AXIS-specific, not propagated to bootstrapped projects.

**Accept** PRs that improve `.md` documentation generation, the harness (validators, sync, CI), or spec content within size gates (`INSTRUCTIONS.md` 100-180 lines, each `SKILL.md` ≤ 60). **Reject** PRs adding runtime features unrelated to AI-context docs, locking AXIS to one IDE, breaking the live ⇄ `cli/templates/` sync, or committing secrets.

## Stack / Tools

- **Language:** Bash (scripts/), Node.js ≥ 18 (cli/)
- **CLI deps:** `@clack/prompts`, `picocolors` (see [cli/package.json](cli/package.json))
- **CI:** GitHub Actions ([.github/workflows/validate.yml](.github/workflows/validate.yml))
- **Versioning:** SemVer for the CLI (`cli/package.json`); dated tags for spec revisions

## How to Run

```bash
# Local validation (runs the 4 quality gates)
bash scripts/validate-axis.sh

# Sync live skill → CLI distributable templates (after editing .ai/skills/)
bash scripts/sync-cli-templates.sh

# Recreate root and IDE symlinks
bash setup-ide-links.sh

# Develop / use the CLI
cd cli && npm install && node src/index.js --help
```

## How to Operate

### Scenario 1 — User asks to bootstrap a project

1. Load the skill [`axis-bootstrap`](.ai/skills/axis-bootstrap/SKILL.md)
2. Follow `PLANNER.md` in strict order
3. **Do not skip phases.** Each phase has an explicit gate that must be confirmed by the user before the next begins
4. Use templates from `references/TEMPLATES.md` when generating artifacts — do not invent formats

### Scenario 2 — User asks to audit an existing project

1. Load the `axis-bootstrap` skill
2. Skip Phase 1 (discovery) if a readable `INSTRUCTIONS.md` already exists
3. Apply only `PHASE-5-VALIDATION.md` to identify gaps
4. Report what is missing per layer (Spec / Harness / Continuity)

### Scenario 3 — User asks to understand the framework

1. Point to [FRAMEWORK.md](FRAMEWORK.md) (conceptual model)
2. Point to [README.md](README.md) (quick start)
3. Do not execute the bootstrap until the user explicitly asks

## Architecture

| Layer / Component | Responsibility | Location |
| ----------------- | -------------- | -------- |
| Spec — live skills | Source of truth for bootstrap orchestration, templates, patterns | [.ai/skills/](.ai/skills/) |
| Spec — instructions | Project entry point for AI agents | [.ai/INSTRUCTIONS.md](.ai/INSTRUCTIONS.md) |
| Spec — rules | Cross-cutting rules auto-loaded by IDEs (workflow, KVC, doc maintenance) | [.ai/rules/](.ai/rules/) |
| Continuity | Curated playbook (ACE), session-spanning context | [.ai/docs/STATE.md](.ai/docs/STATE.md) |
| Harness — permissions | Versioned tool allow/deny/ask lists | [.claude/settings.json](.claude/settings.json) |
| Harness — symlinks | Multi-IDE single-source-of-truth | [setup-ide-links.sh](setup-ide-links.sh) |
| Harness — validators | Quality gates (sizes, sync, symlinks) | [scripts/validate-axis.sh](scripts/validate-axis.sh) |
| CLI distributable | Scaffold artifacts in target projects (`axis init`, `audit`, `spdd`, ...) | [cli/](cli/) |
| CLI templates | Parametrized files copied into new projects + mirrored skill templates | [cli/templates/](cli/templates/) |

Details: [FRAMEWORK.md](FRAMEWORK.md).

## Inviolable Principles

1. **Single Source of Truth** — never duplicate content across IDEs. Use symlinks.
2. **Progressive Disclosure** — load only what is needed for the current phase.
3. **Gates between phases** — no artifact from a phase is generated before the gate of the previous phase has been approved.
4. **No fabrication** — if information is missing, ask. Inventing breaks the contract with the user.
5. **Recursiveness** — this repository itself follows the pattern it teaches. If you modify the framework, maintain the recursiveness.
6. **Fix spec first, then code** — when reality diverges from the spec, update the skill/Canvas/STATE before touching the code. Exception: refactoring (clean code first, sync spec after). See [PATTERNS.md → Bidirectional Spec-Code Sync](.ai/skills/axis-bootstrap/references/PATTERNS.md).

## Conventions

Summary (full standards in [.ai/rules/](.ai/rules/)):

- **Engineering discipline (always-on):** think before coding, minimum viable change, surgical edits, verifiable completion — see [rules/engineering-discipline.md](.ai/rules/engineering-discipline.md).
- **Context economy (always-on):** tool budget, confidence ladder, stop signals — see [rules/context-economy.md](.ai/rules/context-economy.md).
- **Session start (always-on):** read `STATE.md` Active Decisions + In Progress + Blockers before first substantive action — see [rules/session-start.md](.ai/rules/session-start.md).
- **Verification before claims:** follow the Knowledge Verification Chain — see [rules/knowledge-verification.md](.ai/rules/knowledge-verification.md).
- **Commits & PRs:** Conventional Commits, squash merge, CI green required — see [rules/workflow.md](.ai/rules/workflow.md).
- **Doc maintenance:** the agent is a documentation guardian — see [rules/documentation-maintenance.md](.ai/rules/documentation-maintenance.md).
- **Telemetry (optional):** emit `axis log <event> --meta name=<...>` for `skill:loaded`, `rule:cited`, `confidence:uncertain` to feed `axis log analyze`. Local-only (.gitignored). Hooks already log `hook:fired` and `spec:edit`.
- **File sizes:** `INSTRUCTIONS.md` 100-180 lines, `SKILL.md` ≤ 60 lines — enforced by `scripts/validate-axis.sh`.

## Workflow & Tools

Summary (full standards in [.ai/rules/workflow.md](.ai/rules/workflow.md)):

- **Branches:** `feat/|fix/|docs/|chore/|refactor/` + slug; direct push to `main` only for trivial doc fixes. **Commits:** Conventional Commits, subject ≤ 72 chars. **PRs:** squash into `main`, CI green, validation evidence for spec changes.
- **Agent must run** `scripts/sync-cli-templates.sh` after editing `.ai/skills/`, then `scripts/validate-axis.sh` before commit.

## Available Skills

Load **one** skill per request based on the trigger phrases below. If multiple match, pick the most specific. If none match, work without a skill — do not load by default.

| Skill | Load when user request mentions / implies | Do NOT load for |
| ----- | ----------------------------------------- | --------------- |
| [`axis-bootstrap`](.ai/skills/axis-bootstrap/SKILL.md) | "bootstrap", "init project", "set up AI", "migrate CLAUDE.md", "audit AI infrastructure", missing `.ai/` structure | Editing an existing skill, single doc tweak |
| [`axis-delta`](.ai/skills/axis-delta/SKILL.md) | "brownfield change", "ADDED/MODIFIED/REMOVED", "delta spec", change in an existing system touching ≥2 modules or a public contract | Greenfield feature, trivial single-file edit |
| [`axis-specify`](.ai/skills/axis-specify/SKILL.md) | "new feature", "specify", "kick off feature", "scaffold spec", "start a new story" — greenfield work with no prior Canvas | Brownfield change (use axis-delta), single-file bugfix |
| [`story-decompose`](.ai/skills/story-decompose/SKILL.md) | "break down requirement", "user stories", "INVEST", a blob of business text > 1 paragraph that needs slicing | Single well-defined feature, bugfix |
| [`abstraction-first`](.ai/skills/abstraction-first/SKILL.md) | "design", "architecture", "entities/responsibilities", feature touching > 2 components, before writing Canvas E + A + S₁ | Single-file change, pure refactor |
| [`alignment`](.ai/skills/alignment/SKILL.md) | "what's in/out of scope", "DoD", "acceptance", before writing Canvas O + N + S₂, ambiguous goal | Trivial request with obvious scope |
| [`iterative-review`](.ai/skills/iterative-review/SKILL.md) | "review", "regenerate", "fix this code", drift detected post-implementation, "track A/B" | Greenfield generation |
| [`axis-remember`](.ai/skills/axis-remember/SKILL.md) | "remember this", "add a rule", "never again", postmortem of a *recurring* mistake | One-off note, trivial preference |
| [`axis-evolve`](.ai/skills/axis-evolve/SKILL.md) | "retro", "improve the harness", "what keeps going wrong", periodic self-improvement | A single fresh bug (use `axis-remember`) |
| [`copilot-review`](.ai/skills/copilot-review/SKILL.md) | PRs against AXIS-Framework, Copilot Code Review config questions, `.github/instructions/` work | Generic code review in any other repo |

**Routing anti-patterns:** loading `axis-bootstrap` to edit one existing file; loading `story-decompose` for a single bug; loading multiple skills "in case". Each load costs tokens — pick one or none.

## Links

- [FRAMEWORK.md](FRAMEWORK.md) — conceptual model (Spec / Harness / Continuity layers)
- [README.md](README.md) — user-facing quick start (English)
- [README.pt.md](README.pt.md) — user-facing quick start (Portuguese)
- [.ai/CONVENTIONS.md](.ai/CONVENTIONS.md) — maintenance conventions and symlink map
- [.ai/docs/STATE.md](.ai/docs/STATE.md) — curated playbook (read at session start)
- [cli/README.md](cli/README.md) — CLI commands reference

## Stack-agnosticism

This repository's framework applies to any language, tool, or domain. Stack-specific branches (Node, Python, Go, etc., or non-technical domains) are handled within the `axis-bootstrap` skill in [references/UNIVERSAL-MAP.md](.ai/skills/axis-bootstrap/references/UNIVERSAL-MAP.md) and [references/TEMPLATES.md](.ai/skills/axis-bootstrap/references/TEMPLATES.md).
