#!/usr/bin/env bash
# validate-commit-msg.sh — Checks commit message format against declared convention.
# Wired as PreToolUse (matcher: Bash) in .claude/settings.json.
# Informational only — always exits 0. The agent reads the output and adjusts.
#
# Adapt the regex below to match your project's convention (see .ai/rules/workflow.md).

set -euo pipefail

INPUT=$(cat 2>/dev/null || true)
CMD=$(printf '%s' "$INPUT" | grep -oP '"command"\s*:\s*"[^"]*"' | head -1 | sed -E 's/.*"command"\s*:\s*"([^"]*)".*/\1/')

if ! echo "$CMD" | grep -qE '^git commit'; then
  exit 0
fi

COMMIT_MSG=$(echo "$CMD" | grep -oP "(?<=-m [\"'])[^\"']+")
[ -z "$COMMIT_MSG" ] && exit 0

echo "─── Commit message check ───"

if ! echo "$COMMIT_MSG" | grep -qE '^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?!?: .+'; then
  echo "[warn] Message does not follow Conventional Commits format."
  echo "[hint] Expected: type(scope): description"
  echo "[hint] Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert"
else
  echo "[ok] Commit message format valid."
fi

echo "─── end ───"
exit 0
