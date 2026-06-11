# Cursor IDE Integration

> How Cursor consumes the `.ai/` layer. Source of truth stays in `.ai/` — Cursor receives generated or symlinked artifacts only.

---

## What Cursor Loads Automatically

| Artifact | Source | Mechanism |
|----------|--------|-----------|
| Project instructions | `.ai/INSTRUCTIONS.md` | `AGENTS.md` + `CLAUDE.md` symlinks |
| Skills | `.ai/skills/<name>/SKILL.md` | `.cursor/skills` symlink |
| Rules | `.ai/rules/<topic>.md` | **Generated** → `.cursor/rules/<topic>.mdc` |

Recreate symlinks and rules:

```bash
bash setup-ide-links.sh              # symlinks + rule sync
bash scripts/sync-cursor-rules.sh      # rules only (after editing .ai/rules/)
bash scripts/validate-ide-links.sh     # local check (symlinks + rule sync)
```

---

## Rules: Source vs Generated

Cursor requires `.mdc` frontmatter; Claude Code reads `.md` rules directly.

| Edit here (SSOT) | Never edit here (generated) |
|------------------|----------------------------|
| `.ai/rules/<topic>.md` | `.cursor/rules/<topic>.mdc` |

After any change under `.ai/rules/`, run `bash scripts/sync-cursor-rules.sh`.

---

## Subagent Prompts (`.ai/agents/`)

Files under `.ai/agents/` are **not** auto-loaded by Cursor. They are role prompts for on-demand subagents (Cursor **Task** tool).

| Folder | Role |
|--------|------|
| `specialists/` | Project-bound experts (architecture, business rules, flows) |
| `challengers/` | Adversarial Canvas reviewers (scope, security, simplicity) |
| `debates/` | Temporary tension packs for architecture decisions |

Built-in Cursor subagents (`explore`, `bugbot`, `security-review`) are IDE-native and separate from `.ai/agents/`.

See [agents/README.md](../agents/README.md).

---

## Cursor vs Claude Code

| Concern | Cursor | Claude Code |
|---------|--------|-------------|
| Entry point | `AGENTS.md` | `CLAUDE.md` + `AGENTS.md` |
| Rules | Generated `.mdc` from `.ai/rules/` | Symlink `.claude/rules` → `.ai/rules/` |
| Skills | Symlink `.cursor/skills` | Symlink `.claude/skills` |
| Sub-agents | Task tool + `.ai/agents/*.md` | `.claude/agents` symlink |
| Hooks | Not supported | `.claude/settings.json` |
