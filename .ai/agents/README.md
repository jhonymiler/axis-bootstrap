# Agent Role Prompts

> Reusable personas for subagent dispatch. **Not** IDE-native agents — invoke manually via the Task tool (Cursor) or the native registry (Claude Code via `.claude/agents`).

All prompts live here (SSOT). No skills or rules symlinks in this folder — Claude scans `.claude/agents/` recursively and would register non-agent files as bogus subagents.

---

## Layout

```
.ai/agents/
├── specialists/     # Persistent project experts (bootstrap fills embedded tables)
├── challengers/     # Read-only adversarial Canvas reviewers
└── debates/         # Ephemeral packs for architecture tension debates
```

---

## Specialists (`specialists/`)

| File | Purpose |
|------|---------|
| `architecture-guardian.md` | Layer boundaries, module dependency direction |
| `business-rules-keeper.md` | Domain invariants and validation policies |
| `conventions-keeper.md` | Naming, commits, tests, code style |
| `flow-architect.md` | HTTP flows, jobs, events, CLI commands |

Templates use `{{PROJECT_NAME}}`, `{{KNOWLEDGE_TABLE}}`, `{{EXTRACTED_AT}}` placeholders until bootstrap extraction runs.

---

## Challengers (`challengers/`)

| File | Reviews for |
|------|-------------|
| `scope-challenger.md` | Scope drift, weak DoD, MVP creep in Canvas |
| `security-challenger.md` | Auth, injection, secrets, abuse controls |
| `simplicity-challenger.md` | Over-engineering, unnecessary abstractions |

Read-only. Run in **parallel** during SPDD Phase 1.8, after the REASONSTC Canvas is filled and before code generation.

---

## Debates (`debates/`)

Short-lived packs for decisions with competing goals. See [debates/README.md](debates/README.md).

---

## IDE Notes

| IDE | How roles are invoked |
|-----|----------------------|
| **Cursor** | Task tool — pass the `.md` file path and role in the prompt |
| **Claude Code** | Native registry via `.claude/agents` symlink, or Task tool |
| **Codex / AGENTS.md** | Reference the file path in the user message |

Domain workflows use **skills** (`.ai/skills/`), not this folder.
