#!/usr/bin/env bash
# setup-ide-links.sh — Idempotent multi-IDE symlink installer for AXIS.
#
# Creates the symlink fan-out from .ai/ (single source of truth) into
# IDE-specific directories. Safe to re-run any number of times.
#
# Uses `ln -sfn` (not `ln -sf`) for directory targets. Without `-n`, if the
# link already exists as a symlink-to-directory, `ln -sf` dereferences it and
# creates a NESTED link inside the old target. `-n` ensures re-running replaces.
#
# IDE capabilities reference:
#   Claude Code  → settings.json, hooks, rules, skills, sub-agents (full harness)
#   Cursor       → rules, skills (no hooks, no permissions, no sub-agents)
#   Copilot      → copilot-instructions.md, path-targeted .instructions.md files
#   Windsurf     → AGENTS.md, rules, skills (minimal)
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -d .ai ]; then
  echo "error: .ai/ not found — run from project root" >&2
  exit 1
fi

echo "→ root entry points"
ln -sf  .ai/INSTRUCTIONS.md AGENTS.md
ln -sf  .ai/INSTRUCTIONS.md CLAUDE.md

echo "→ Claude Code (.claude/)"
mkdir -p .claude
ln -sf  ../.ai/INSTRUCTIONS.md .claude/CLAUDE.md
ln -sfn ../.ai/skills          .claude/skills
[ -d .ai/rules ]  && ln -sfn ../.ai/rules  .claude/rules  || true
[ -d .ai/hooks ]  && ln -sfn ../.ai/hooks  .claude/hooks  || true
# Native sub-agent registry: Claude Code scans .claude/agents/ recursively.
[ -d .ai/agents ] && ln -sfn ../.ai/agents .claude/agents || true

echo "→ Cursor (.cursor/)"
mkdir -p .cursor
ln -sfn ../.ai/skills .cursor/skills
# Cursor requires .mdc extension (not .md) for rules with specific frontmatter
# (description, globs, alwaysApply). Plain .md files are IGNORED by Cursor.
# Generate .mdc files from .ai/rules/*.md instead of symlinking.
if [ -d .ai/rules ]; then
  if [ -f scripts/sync-cursor-rules.sh ]; then
    bash scripts/sync-cursor-rules.sh .ai/rules .cursor/rules
  else
    mkdir -p .cursor/rules
    for md in .ai/rules/*.md; do
      [ -f "$md" ] || continue
      base="$(basename "$md" .md)"
      cp "$md" ".cursor/rules/${base}.mdc"
    done
  fi
fi

echo "→ Generic agents compatibility link (.agents/ → .ai/agents)"
# .ai/agents/ holds ONLY agent definitions (challengers, specialists, debates).
# It is NOT polluted with skills/rules/AGENTS.md symlinks — Claude Code scans it
# recursively and would register every non-agent .md as a bogus subagent. The
# open-standard entry point is the root AGENTS.md → .ai/INSTRUCTIONS.md above.
mkdir -p .ai/agents
if [ -d .agents ] && [ ! -L .agents ]; then
  rm -rf .agents
fi
ln -sfn .ai/agents .agents

echo "→ GitHub Copilot (.github/)"
mkdir -p .github
ln -sf  ../.ai/INSTRUCTIONS.md .github/copilot-instructions.md
ln -sfn ../.ai/skills          .github/skills
[ -d .ai/instructions ] && ln -sfn ../.ai/instructions .github/instructions || true

echo
echo "✓ symlinks installed. Verify:"
echo "  ls -la AGENTS.md CLAUDE.md .claude .cursor .agents .github"
