---
applyTo: "src/**"
trigger: on-edit
description: "Skill emergence: detect when a new code module deserves its own .ai/skills/ entry"
alwaysApply: false
globs: "src/**"
---

# Skill Emergence

> Detects when new domain logic is added without a corresponding `.ai/skills/` entry. Fires when editing under `src/`.

## Trigger Condition

When a new directory under `src/` is created, OR when a new class/service with domain responsibility is added to an existing file, check:

- Does `.ai/skills/<new-domain>/SKILL.md` exist?
- Is the domain covered by an existing skill under a different name?

## If No Skill Exists

Propose creation. A domain warrants a new skill when **two or more** of the following are true:

1. It has distinct business rules (not just infrastructure)
2. It contains >1 public class or >3 public functions
3. It is likely to be touched in >50% of future features

If warranted, tell the user:

> *"The `<domain>` module has no corresponding skill in `.ai/skills/`. Should I create a skeleton SKILL.md for it now?"*

Use `abstraction-first` skill if the new domain has multiple interacting responsibilities before writing the SKILL.md.

## If Creating the Skill

Follow the template in `references/TEMPLATES.md` → "Skill skeleton". Keep the SKILL.md ≤ 60 lines at creation. It will grow as the domain matures.

## Anti-pattern

Do NOT create a skill for:
- Utility/helper modules with no domain logic (`utils/`, `helpers/`, `config/`)
- A module that is a thin wrapper over a library with no project-specific rules
- Infrastructure code (DB connection, HTTP client setup)
