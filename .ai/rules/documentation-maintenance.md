---
applyTo: "**"
trigger: always
description: "Documentation maintenance: keep docs in sync with code, curate STATE.md, detect doc drift"
alwaysApply: true
---

# Documentation Maintenance Protocol

> The agent acts as a *documentation guardian* in this repo. Documentation does not update automatically — but no relevant change passes without the agent surfacing the impact.

## Triggers — when to propose a doc update

| Event in this session                             | Doc to update                                                                 | How                                                                                            |
| ------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| New phase, gate, or principle in `axis-bootstrap` | The corresponding `references/*.md` AND `PLANNER.md` AND `PROMPT-TEMPLATE.md` | Edit all three; run `sync-cli-templates.sh`                                                    |
| New template format (rule, skill, settings)       | `references/TEMPLATES.md`                                                     | Add anchored section; link from the phase that uses it                                         |
| New satellite skill added or removed              | `.ai/INSTRUCTIONS.md` skill table + `FRAMEWORK.md` if conceptually relevant   | Edit table; check `cli/templates/skills/` parity                                               |
| Discovery question added/removed                  | `PHASE-1-DISCOVERY.md` + propagate to `PHASE-2-SPEC.md` output                | The question is only valid if its answer becomes an artifact                                   |
| Validation gate added/changed                     | `PHASE-5-VALIDATION.md` AND `scripts/validate-axis.sh` if automatable         | Prefer automated check over manual checklist                                                   |
| Decision made / lesson learned in session         | `.ai/docs/STATE.md`                                                           | Curate — move from "In Progress" or "Blockers"; add to "Active Decisions" or "Lessons Learned" |
| Recursiveness violation discovered                | Issue with `recursiveness` label + STATE TODO                                 | Do not patch silently — log the violation, then fix                                            |

## Curation Rules for STATE.md

- **Active Decisions** grows slowly. Each entry needs a date and a reason.
- **In Progress** must reflect the current session if work is incomplete. Empty if nothing is mid-stream.
- **Blockers** must be removed once resolved — do not leave stale ones for "history".
- **Lessons Learned** captures only *non-obvious* insights. "Use git" is not a lesson; "PATTERNS.md numbering drifted when we appended without checking the index" is.
- **Target size:** ≤ 80 lines. If exceeded, curate — resolved items go away, do not accumulate.

## Anti-patterns

- **Silent docs drift** — making a code/spec change and saying "I'll update docs later". Update in the same commit or open an immediate follow-up.
- **Append-only STATE** — turning the playbook into a diary. Diary lives in git log.
- **Documenting the obvious** — if the file name, signature, or 3 lines of code make it clear, no comment or rule is needed.
- **Documenting what the framework already documents** — point to the existing doc instead of duplicating.

## Self-applicability check

Before closing a session that modified spec, harness, or CLI:

1. Did `scripts/validate-axis.sh` pass? (sizes, sync, symlinks)
2. Did `STATE.md` get the relevant decision/lesson?
3. Is the change reflected in *all* three: the spec (`.ai/skills/...`), the distributable (`cli/templates/...`), and the user-facing doc (`README.md`, `FRAMEWORK.md`) if applicable?
