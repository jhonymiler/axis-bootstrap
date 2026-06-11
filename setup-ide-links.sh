#!/usr/bin/env bash
# setup-ide-links.sh — Idempotent multi-IDE symlink installer for AXIS.
#
# Creates the symlink fan-out from .ai/ (single source of truth) into
# IDE-specific directories. Safe to re-run.
#
# Uses `ln -sfn` (not `ln -sf`) for directory targets. Without `-n`, if the
# link already exists as a symlink-to-directory pointing somewhere else,
# `ln -sf` dereferences the old link and creates a NESTED link inside the
# old target instead of replacing it. `-n` (no-dereference) ensures
# re-running this script actually re-points links to the new target.
#
# Run from project root:
#   bash setup-ide-links.sh

set -euo pipefail

cd "$(dirname "$0")"

if [ ! -d .ai ]; then
  echo "error: .ai/ not found — run from AXIS root" >&2
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
ln -sfn ../.ai/skills          .cursor/skills
# Cursor requires .mdc extension (not .md) for rules with specific frontmatter
# (description, globs, alwaysApply). Plain .md files are IGNORED by Cursor.
# Generate .mdc files from .ai/rules/*.md instead of symlinking.
if [ -d .ai/rules ]; then
  if [ -f scripts/sync-cursor-rules.sh ]; then
    bash scripts/sync-cursor-rules.sh .ai/rules .cursor/rules
  else
    # Fallback: inline conversion when sync script is not available
    mkdir -p .cursor/rules
    for md in .ai/rules/*.md; do
      [ -f "$md" ] || continue
      base="$(basename "$md" .md)"
      cp "$md" ".cursor/rules/${base}.mdc"
    done
    echo "  [cursor] copied $(ls .cursor/rules/*.mdc 2>/dev/null | wc -l) .mdc rules (basic copy)"
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
# Path-targeted Copilot Code Review instructions live in .ai/instructions/
# (single source of truth). Files there must end in .instructions.md and carry
# an `applyTo:` frontmatter glob — Copilot Code Review's required format.
# `-n` is critical here: older checkouts had .github/instructions → .ai/rules,
# and without `-n` we'd create .ai/rules/instructions instead of replacing.
[ -d .ai/instructions ] && ln -sfn ../.ai/instructions .github/instructions || true

echo
echo "✓ symlinks installed. Verify:"
echo "  ls -la AGENTS.md CLAUDE.md .claude .cursor .agents .github"
echo "  bash scripts/validate-ide-links.sh   # optional local gate"
