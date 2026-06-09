# Phase 4.5 — Discoverer-to-Specialist Transformation

> Transforms the transient output from Phase 1 discoverer agents into persistent, project-bound specialist agents with embedded knowledge. After this phase, the project has "living documentation" agents that answer domain questions without re-scanning the codebase.

---

## Purpose

Discoverers are **transient** — they read the code and produce a report. Specialists are **persistent** — they hold a distilled knowledge table and are consulted for ongoing guidance.

The transformation is: discoverer report → interpolate into specialist template → write `.claude/agents/<project>-<role>.md`.

---

## Input

- Phase 1 discoverer outputs stored in `.ai/.discovery/` (created during bootstrap)
- The 4 specialist templates from `.ai/agents/specialists/`
- `{{PROJECT_NAME}}` from `INSTRUCTIONS.md` header

---

## Which Discoverers Become Specialists?

| Discoverer                 | Specialist                        | Rationale                                                       |
| -------------------------- | --------------------------------- | --------------------------------------------------------------- |
| `business-rules-extractor` | `<project>-business-rules-keeper` | Rules are stable; a specialist pays off immediately             |
| `flow-extractor`           | `<project>-flow-architect`        | Flows are consulted often (new endpoint, debugging)             |
| `architecture-mapper`      | `<project>-architecture-guardian` | Boundaries need active enforcement per PR                       |
| `conventions-detector`     | `<project>-conventions-keeper`    | **Opt-in** — skip if the project has no non-trivial conventions |
| `stack-profiler`           | *(no specialist)*                 | Stack is captured in INSTRUCTIONS.md; no ongoing role           |

---

## Transformation Steps

### Step 1 — Read discoverer reports

Open each report from `.ai/.discovery/`:

```
.ai/.discovery/business-rules-report.md
.ai/.discovery/flow-report.md
.ai/.discovery/architecture-report.md
.ai/.discovery/conventions-report.md   (if present)
```

If `.ai/.discovery/` is missing (older bootstrap or manual mode), re-run the relevant discoverers now.

### Step 2 — Interpolate placeholders

For each specialist being created:

| Placeholder           | Value                                                              |
| --------------------- | ------------------------------------------------------------------ |
| `{{PROJECT_NAME}}`    | Project name from INSTRUCTIONS.md first line                       |
| `{{KNOWLEDGE_TABLE}}` | The "Rules" / "Flows" / "Modules" table from the discoverer report |
| `{{EXTRACTED_AT}}`    | Today's date (`date +%Y-%m-%d`)                                    |

### Step 3 — Write specialist agents

```bash
mkdir -p .claude/agents
# one per specialist, naming: <project_name_kebab>-<role>-<suffix>
```

Example for project `taskflow-api`:
- `.claude/agents/taskflow-api-business-rules-keeper.md`
- `.claude/agents/taskflow-api-flow-architect.md`
- `.claude/agents/taskflow-api-architecture-guardian.md`
- `.claude/agents/taskflow-api-conventions-keeper.md` *(opt-in)*

### Step 4 — Update documentation-guardian skill

In `.ai/skills/documentation-guardian/SKILL.md`, add a note to the "When to Escalate to Discoverers" section listing the specialist agents installed (so the guardian knows which agents to delegate to before re-running a discoverer).

---

## Opt-in Decision for Conventions Keeper

Ask the user before creating `conventions-keeper`:

> *"The `conventions-detector` found [N] conventions. Should I create a persistent `<project>-conventions-keeper` agent? This is optional — skip if your conventions are simple or linter-enforced."*

Create it if: N > 5 OR conventions differ significantly from framework defaults.

---

## Exit Gate

Present:
- List of specialist agents created with ✓ next to each
- The `{{KNOWLEDGE_TABLE}}` summary for each (first 3 rows as preview)
- Whether `conventions-keeper` was created (and why/why not)
- Confirmation that `.claude/agents/` now contains the specialists

Ask: *"These specialists now hold the extracted knowledge for ongoing consultation. Do the tables look accurate? Any row that should be removed or corrected before we continue?"*

---

## References

- [business-rules-keeper.md](../../../agents/specialists/business-rules-keeper.md)
- [flow-architect.md](../../../agents/specialists/flow-architect.md)
- [architecture-guardian.md](../../../agents/specialists/architecture-guardian.md)
- [conventions-keeper.md](../../../agents/specialists/conventions-keeper.md) *(opt-in)*
