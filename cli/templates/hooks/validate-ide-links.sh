#!/usr/bin/env bash
# validate-ide-links.sh — Verifies IDE symlinks and Cursor rule sync.
# Local/dev gate only — not wired into CI by default.
# Exit 0 when valid; exit 1 with a summary when not.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

errors=0

fail() {
  echo "FAIL: $1"
  errors=$((errors + 1))
}

check_symlink() {
  local link="$1" expected="$2"

  if [ ! -L "$link" ]; then
    fail "$link is missing or not a symlink (expected → $expected)"
    return
  fi

  local actual
  actual="$(readlink "$link")"
  if [ "$actual" != "$expected" ]; then
    fail "$link points to '$actual' (expected '$expected')"
  elif [ ! -e "$link" ]; then
    fail "$link is broken (target '$expected' does not resolve)"
  else
    echo "OK: $link → $expected"
  fi
}

echo "Validating IDE symlinks..."

[ -e AGENTS.md ] && check_symlink "AGENTS.md" ".ai/INSTRUCTIONS.md"
[ -e CLAUDE.md ] && check_symlink "CLAUDE.md" ".ai/INSTRUCTIONS.md"

if [ -d .claude ]; then
  [ -e .claude/skills ] && check_symlink ".claude/skills" "../.ai/skills"
  [ -e .claude/rules ] && check_symlink ".claude/rules" "../.ai/rules"
  [ -e .claude/agents ] && check_symlink ".claude/agents" "../.ai/agents"
fi

if [ -d .cursor ]; then
  [ -e .cursor/skills ] && check_symlink ".cursor/skills" "../.ai/skills"
fi

if [ -d .github ]; then
  [ -e .github/copilot-instructions.md ] && check_symlink ".github/copilot-instructions.md" "../.ai/INSTRUCTIONS.md"
fi

if [ -e .agents ]; then
  check_symlink ".agents" ".ai/agents"
fi

echo ""
if [ -d .ai/rules ] && [ -d .cursor/rules ]; then
  echo "Validating Cursor rules are in sync with .ai/rules/..."
  if ! bash scripts/sync-cursor-rules.sh --check; then
    fail "Cursor rules are out of sync — run: bash scripts/sync-cursor-rules.sh"
  fi
else
  echo "Skipping Cursor rule sync check (.ai/rules or .cursor/rules missing)"
fi

echo ""
if [ "$errors" -gt 0 ]; then
  echo "$errors validation error(s). Fix with: bash setup-ide-links.sh"
  exit 1
fi

echo "All IDE link and Cursor rule checks passed."
exit 0
