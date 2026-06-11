# Conventions — How the Framework Maintains Itself

This document describes the internal structure of this repository and the protocol for evolving it without breaking recursiveness.

---

## Core Principle

**The framework follows the pattern it teaches.** Any change here must preserve:

- Single Source of Truth (no content duplication)
- Progressive Disclosure (SKILL.md ≤ 60 lines, references on-demand)
- Gates between phases (in the `axis-bootstrap` skill)
- Universal mapping (every technical concept has a non-technical equivalent)

If a proposed change breaks any of these, it is rejected or redesigned.

---

## Structure Map

```text
AXIS/                                            ← root (humans read README/FRAMEWORK)
├── README.md                                    ← humans: overview + quick start (English)
├── README.pt.md                                 ← humans: overview + quick start (Portuguese)
├── FRAMEWORK.md                                 ← humans: conceptual model
├── cli/                                         ← Node + Clack CLI (axis init/audit/doctor/spdd)
│   ├── package.json                             ← bin: axis
│   ├── src/index.js                             ← dispatcher + banner
│   ├── src/commands/                            ← init, doctor, audit, link, state, spdd
│   ├── src/lib/                                 ← paths, ui helpers
│   └── templates/                               ← INSTRUCTIONS, CONVENTIONS, STATE, CANVAS, settings.json
├── AGENTS.md                       → .ai/INSTRUCTIONS.md
├── CLAUDE.md                       → .ai/INSTRUCTIONS.md
├── setup-ide-links.sh                           ← idempotent symlink installer
├── .claude/                                     ← Claude Code harness
│   ├── settings.json                            ← versioned permissions + hooks
│   ├── CLAUDE.md                   → ../.ai/INSTRUCTIONS.md
│   ├── rules                       → ../.ai/rules
│   ├── skills                      → ../.ai/skills
│   └── agents                      → ../.ai/agents   ← native sub-agent registry
├── .cursor/, .github/                            ← IDE links to .ai/{rules,skills}
├── .agents                          → .ai/agents   ← agent definitions (not skills/rules)
└── .ai/                                         ← AI: everything here is single source
    ├── INSTRUCTIONS.md                          ← AI: entry point
    ├── CONVENTIONS.md                           ← this file
    ├── docs/
    │   └── STATE.md                             ← continuity layer (curated playbook)
    └── skills/
        ├── axis-bootstrap/                      ← the executable bootstrap spec
        │   ├── SKILL.md                         ← index ≤ 60 lines
        │   ├── PLANNER.md                       ← orchestration
        │   ├── PROMPT-TEMPLATE.md               ← output contract
        │   └── references/                      ← on-demand details
        │       ├── PHASE-1-DISCOVERY.md
        │       ├── PHASE-2-SPEC.md
        │       ├── PHASE-3-HARNESS.md
        │       ├── PHASE-4-CONTINUITY.md
        │       ├── PHASE-5-VALIDATION.md
        │       ├── TEMPLATES.md
        │       ├── PATTERNS.md
        │       ├── CANVAS-REASONS.md            ← REASONS Canvas template (SPDD artifact)
        │       └── UNIVERSAL-MAP.md
        ├── story-decompose/                     ← SPDD: requirement → INVEST stories
        ├── alignment/                           ← SPDD: lock intent + DoD
        ├── abstraction-first/                   ← SPDD: design objects + layers
        └── iterative-review/                    ← SPDD: 2-track review loop
```

---

## When to Modify Each File

| Change                               | Where                                                    | Not where              |
| ------------------------------------ | -------------------------------------------------------- | ---------------------- |
| New conceptual concept               | `FRAMEWORK.md`                                           | `SKILL.md`             |
| New phase in bootstrap               | new `PHASE-N.md` + update `PLANNER.md` + `SKILL.md`     | move to another skill  |
| New template (generated artifact)    | `references/TEMPLATES.md`                                | inline in PHASE-N.md   |
| New pattern (PD, KVC, etc.)          | `references/PATTERNS.md`                                 | scattered in PHASEs    |
| Support for new project type         | `references/UNIVERSAL-MAP.md` + `TEMPLATES.md`           | create parallel skill  |
| Quick start, installation            | `README.md` / `README.en.md`                             | `INSTRUCTIONS.md`      |
| How the AI operates in the framework | `INSTRUCTIONS.md`                                        | `README.md`            |
| Maintenance map                      | this file                                                | anywhere else          |

---

## Symlinks (when this repo is installed in a target project)

When the framework is **used in a target project**, it creates the following symlinks in the project:

```bash
# Target project root
ln -sf .ai/INSTRUCTIONS.md CLAUDE.md
ln -sf .ai/INSTRUCTIONS.md AGENTS.md

# Claude Code
mkdir -p .claude
ln -sf ../.ai/INSTRUCTIONS.md .claude/CLAUDE.md
ln -sf ../.ai/rules .claude/rules
ln -sf ../.ai/skills .claude/skills
ln -sfn ../.ai/agents .claude/agents   # native sub-agent registry (scanned recursively)

# Cursor
mkdir -p .cursor
ln -sfn ../.ai/skills .cursor/skills
# Rules: generate .mdc from .ai/rules/*.md (Cursor ignores plain .md)
bash scripts/sync-cursor-rules.sh

# Generic agents (.ai/agents holds ONLY agent definitions — no skills/rules/AGENTS.md
# symlinks, which Claude would parse as bogus subagents). Root AGENTS.md is the entry point.
mkdir -p .ai/agents
ln -sfn .ai/agents .agents

# GitHub Copilot
mkdir -p .github
ln -sf ../.ai/INSTRUCTIONS.md .github/copilot-instructions.md
ln -sf ../.ai/rules .github/instructions
ln -sf ../.ai/skills .github/skills
```

The idempotent script is in `references/TEMPLATES.md` under the name `setup-ide-links.sh`.

---

## Adding Support for a New IDE

1. Identify where the IDE looks for instructions and rules
2. Add 3-4 symlink lines to `setup-ide-links.sh` in `TEMPLATES.md`
3. Update the table in `FRAMEWORK.md` (or the equivalent in `PHASE-3-HARNESS.md`)
4. Document IDE quirks (accepted frontmatter format, maximum size, etc.)

Do not create a new skill per IDE. Multi-IDE support is a harness property, not a domain.

---

## Rules for the Agent

When operating within this repository:

- **Do not create files outside the structure mapped above** without first proposing to the user
- **Do not duplicate content** between `FRAMEWORK.md` and `SKILL.md` — reference instead
- **Keep SKILL.md ≤ 60 lines** — if exceeded, move details to `references/`
- **When adding a phase**, update: `PLANNER.md`, `SKILL.md`, and create the corresponding `PHASE-N.md`
- **When changing a template**, maintain consistency with examples in `PATTERNS.md`

---
