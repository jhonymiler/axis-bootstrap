#!/usr/bin/env bash
# sync-cli-templates.sh
# Mirrors the live skill tree (.ai/skills/) into the CLI distributable
# templates (cli/templates/). Top-level templates (INSTRUCTIONS.md,
# STATE.md, CONVENTIONS.md, settings.json, setup-ide-links.sh) are NOT
# synced — they are parametrized templates for new projects, intentionally
# distinct from the live spec.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# 1) axis-bootstrap skill (full tree, including references/)
rsync -a --delete \
  .ai/skills/axis-bootstrap/ \
  cli/templates/bootstrap-skill/

# 2) Satellite skills: flatten SKILL.md → <name>.md
for skill in abstraction-first alignment iterative-review story-decompose axis-remember axis-evolve; do
  cp .ai/skills/$skill/SKILL.md cli/templates/skills/$skill.md
done

# 3) Universal rules (always-on behavior shipped to every new project).
# AXIS-specific rules (workflow.md, documentation-maintenance.md) are NOT propagated.
mkdir -p cli/templates/rules
for rule in engineering-discipline context-economy knowledge-verification session-start; do
  cp .ai/rules/$rule.md cli/templates/rules/$rule.md
done

# 4) Harness hooks (Claude Code SessionStart / PostToolUse / Stop).
# Generic, Claude-specific (no other IDE consumes these yet).
# Hooks with a live counterpart are copied; template-only hooks
# (e.g. post-code-change, constitutional-check) have no live source and
# are kept as project-agnostic templates.
mkdir -p cli/templates/hooks
for hook in _lib session-start pre-bash-guard post-spec-edit post-code-change stop; do
  if [ -f ".ai/hooks/$hook.sh" ]; then
    cp ".ai/hooks/$hook.sh" "cli/templates/hooks/$hook.sh"
  fi
done

# 5) Persistent agents (challengers, specialist templates, debates) — single
# source in .ai/agents/, surfaced to projects via .claude/agents. Discoverers
# stay in the bootstrap bundle (transient — see block #1's rsync).
mkdir -p cli/templates/agents
rsync -a --delete --exclude='debates/*/' \
  .ai/agents/ \
  cli/templates/agents/

# 6) Re-bootstrap skill (sibling to axis-bootstrap — distributable to projects).
rsync -a --delete \
  .ai/skills/axis-rebootstrap/ \
  cli/templates/rebootstrap-skill/

# 7) Delta skill (F9 — brownfield change specification; skill-driven, no CLI).
rsync -a --delete \
  .ai/skills/axis-delta/ \
  cli/templates/delta-skill/

# 8) Specify skill (F12 — greenfield feature scaffolding; skill-driven, no CLI).
rsync -a --delete \
  .ai/skills/axis-specify/ \
  cli/templates/specify-skill/

# 9) Debate self-maintenance script (the debates/ scaffold itself ships via block #5).
mkdir -p cli/templates/scripts-self-maint
cp scripts/manage-debate-agents.sh cli/templates/scripts-self-maint/manage-debate-agents.sh

# 10) Cursor harness scripts (scripts/ is SSOT — copied into bootstrapped projects).
for f in sync-cursor-rules.sh validate-ide-links.sh; do
  cp "scripts/$f" "cli/templates/hooks/$f"
  chmod +x "cli/templates/hooks/$f"
done

# 11) Cursor integration doc (bootstrap template for target projects).
if [ -f .ai/docs/cursor.md ]; then
  mkdir -p cli/templates/docs
  cp .ai/docs/cursor.md cli/templates/docs/cursor.md
fi

echo "Synced .ai/skills/ + .ai/rules/ + .ai/hooks/ + .ai/agents/ + rebootstrap-skill + delta-skill + specify-skill → cli/templates/"
