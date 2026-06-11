#!/usr/bin/env bash
# validate-axis.sh
# Quality gates for the AXIS Framework repo. Enforces the contract the
# framework itself teaches: file sizes, recursiveness, symlink integrity,
# live-skill ⇄ CLI-template sync.
#
# Exit code: 0 if all checks pass, 1 if any fail.
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

fail=0
pass() { echo "  OK   $*"; }
fail() { echo "  FAIL $*"; fail=1; }

# Token budget (chars/4 proxy — the same metric as `axis doctor`). Line counts are
# a frail proxy: a dense table row costs ~10x a short comment. Budget by tokens.
tokens() { echo $(( $(wc -c < "$1") / 4 )); }

echo "[1/4] INSTRUCTIONS.md token budget (target ≤ 2600, chars/4)"
t=$(tokens .ai/INSTRUCTIONS.md)
if [ "$t" -gt 2600 ]; then
  fail ".ai/INSTRUCTIONS.md ≈ $t tokens (over budget — trim before adding)"
else
  pass ".ai/INSTRUCTIONS.md ≈ $t tokens"
fi

echo "[2/4] Each SKILL.md ≤ 1200 tokens (chars/4)"
for f in .ai/skills/*/SKILL.md; do
  t=$(tokens "$f")
  if [ "$t" -gt 1200 ]; then
    fail "$f ≈ $t tokens (max 1200 — move detail to references/)"
  else
    pass "$f ≈ $t tokens"
  fi
done

echo "[3/4] Live skill ⇄ CLI template sync"
sync_fail=0
for f in PHASE-1-DISCOVERY.md PHASE-2-SPEC.md PHASE-3-HARNESS.md PHASE-4-CONTINUITY.md \
         PHASE-5-VALIDATION.md TEMPLATES.md QUICKSTART.md PATTERNS.md \
         UNIVERSAL-MAP.md CANVAS-REASONS.md CONFIG-SCHEMA.md; do
  if ! diff -q .ai/skills/axis-bootstrap/references/$f \
                cli/templates/bootstrap-skill/references/$f > /dev/null 2>&1; then
    fail "references/$f drift"
    sync_fail=1
  fi
done
for f in PLANNER.md PROMPT-TEMPLATE.md SKILL.md; do
  if ! diff -q .ai/skills/axis-bootstrap/$f \
                cli/templates/bootstrap-skill/$f > /dev/null 2>&1; then
    fail "$f drift"
    sync_fail=1
  fi
done
for s in abstraction-first alignment iterative-review story-decompose axis-remember axis-evolve; do
  if ! diff -q .ai/skills/$s/SKILL.md cli/templates/skills/$s.md > /dev/null 2>&1; then
    fail "$s skill drift between .ai/skills and cli/templates"
    sync_fail=1
  fi
done
for r in engineering-discipline context-economy knowledge-verification session-start; do
  if ! diff -q .ai/rules/$r.md cli/templates/rules/$r.md > /dev/null 2>&1; then
    fail "$r rule drift between .ai/rules and cli/templates/rules"
    sync_fail=1
  fi
done
for h in _lib session-start pre-bash-guard post-spec-edit stop; do
  if ! diff -q .ai/hooks/$h.sh cli/templates/hooks/$h.sh > /dev/null 2>&1; then
    fail "$h hook drift between .ai/hooks and cli/templates/hooks"
    sync_fail=1
  fi
done
for d in business-rules-extractor flow-extractor architecture-mapper stack-profiler conventions-detector; do
  if ! diff -q .ai/skills/axis-bootstrap/agents/discoverers/$d.md \
                cli/templates/bootstrap-skill/agents/discoverers/$d.md > /dev/null 2>&1; then
    fail "agents/discoverers/$d.md drift between live and CLI templates"
    sync_fail=1
  fi
done
# Specialists + challengers now live in .ai/agents/ (single source), mirrored to
# cli/templates/agents/. Discoverers stay in the bootstrap bundle (transient).
for s in business-rules-keeper flow-architect architecture-guardian conventions-keeper; do
  if ! diff -q .ai/agents/specialists/$s.md \
                cli/templates/agents/specialists/$s.md > /dev/null 2>&1; then
    fail "agents/specialists/$s.md drift between live and CLI templates"
    sync_fail=1
  fi
done
# Challengers (F13 — adversarial reviewers dispatched in Phase 1.8)
for c in security-challenger simplicity-challenger scope-challenger; do
  if ! diff -q .ai/agents/challengers/$c.md \
                cli/templates/agents/challengers/$c.md > /dev/null 2>&1; then
    fail "agents/challengers/$c.md drift between live and CLI templates"
    sync_fail=1
  fi
done
for f in SKILL.md PLANNER.md; do
  if ! diff -q .ai/skills/axis-rebootstrap/$f \
                cli/templates/rebootstrap-skill/$f > /dev/null 2>&1; then
    fail "axis-rebootstrap/$f drift between live and CLI templates"
    sync_fail=1
  fi
done
# axis-delta (F9 — brownfield change spec; full skill bundle)
if ! diff -q .ai/skills/axis-delta/SKILL.md \
              cli/templates/delta-skill/SKILL.md > /dev/null 2>&1; then
  fail "axis-delta/SKILL.md drift between live and CLI templates"
  sync_fail=1
fi
for f in DELTA-TEMPLATE.md ARCHIVE-PROCEDURE.md; do
  if ! diff -q .ai/skills/axis-delta/references/$f \
                cli/templates/delta-skill/references/$f > /dev/null 2>&1; then
    fail "axis-delta/references/$f drift between live and CLI templates"
    sync_fail=1
  fi
done
# axis-specify (F12 — greenfield feature scaffolding; full skill bundle)
if ! diff -q .ai/skills/axis-specify/SKILL.md \
              cli/templates/specify-skill/SKILL.md > /dev/null 2>&1; then
  fail "axis-specify/SKILL.md drift between live and CLI templates"
  sync_fail=1
fi
for f in SPEC-FOLDER-LAYOUT.md; do
  if ! diff -q .ai/skills/axis-specify/references/$f \
                cli/templates/specify-skill/references/$f > /dev/null 2>&1; then
    fail "axis-specify/references/$f drift between live and CLI templates"
    sync_fail=1
  fi
done
# Debate-agent docs (generic agents namespace)
if ! diff -q .ai/agents/debates/README.md \
              cli/templates/agents/debates/README.md > /dev/null 2>&1; then
  fail "agents/debates/README.md drift between live and CLI templates"
  sync_fail=1
fi
for f in sync-cursor-rules.sh validate-ide-links.sh; do
  if ! diff -q "scripts/$f" "cli/templates/hooks/$f" > /dev/null 2>&1; then
    fail "$f drift between scripts/ and cli/templates/hooks/"
    sync_fail=1
  fi
done
[ $sync_fail -eq 0 ] && pass "all skill + rule + hook + discoverer + specialist + rebootstrap + delta + specify files in sync — run scripts/sync-cli-templates.sh to fix drift"

echo "[4/4] Root symlinks resolve"
for f in CLAUDE.md AGENTS.md; do
  if [ -L "$f" ] && [ ! -e "$f" ]; then
    fail "$f is a broken symlink"
  elif [ ! -e "$f" ]; then
    fail "$f is missing"
  else
    pass "$f → $(readlink "$f" 2>/dev/null || echo "(regular file)")"
  fi
done
if [ -d .ai/hooks ]; then
  if [ -L .claude/hooks ] && [ -e .claude/hooks ]; then
    pass ".claude/hooks → $(readlink .claude/hooks)"
  else
    fail ".claude/hooks should be a symlink to ../.ai/hooks (run setup-ide-links.sh)"
  fi
fi
if [ -d .ai/agents ]; then
  if [ -L .agents ] && [ -e .agents ]; then
    pass ".agents → $(readlink .agents)"
  else
    fail ".agents should be a symlink to .ai/agents (run setup-ide-links.sh)"
  fi
  if [ -L .claude/agents ] && [ -e .claude/agents ]; then
    pass ".claude/agents → $(readlink .claude/agents)"
  else
    fail ".claude/agents should be a symlink to ../.ai/agents (run setup-ide-links.sh)"
  fi
fi

echo "[5/5] IDE link + Cursor rule sync (local gate)"
if [ -x setup-ide-links.sh ]; then
  bash setup-ide-links.sh >/dev/null
fi
if [ -x scripts/validate-ide-links.sh ]; then
  if bash scripts/validate-ide-links.sh; then
    pass "validate-ide-links.sh"
  else
    fail "validate-ide-links.sh — run bash setup-ide-links.sh"
  fi
else
  fail "scripts/validate-ide-links.sh missing or not executable"
fi

echo
if [ $fail -eq 0 ]; then
  echo "All AXIS validation checks passed."
else
  echo "AXIS validation FAILED. Fix items above before commit/merge."
fi
exit $fail
