#!/usr/bin/env bash
# manage-debate-agents.sh
# Create/list/remove temporary debate agent packs under .ai/agents/debates.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BASE="$ROOT/.ai/agents/debates"

usage() {
  echo "Usage: bash scripts/manage-debate-agents.sh <create|list|remove> [slug]"
}

require_slug() {
  local slug="${1:-}"
  if [ -z "$slug" ]; then
    echo "error: slug is required" >&2
    usage
    exit 1
  fi
  if ! printf '%s' "$slug" | grep -Eq '^[a-z0-9][a-z0-9-]*$'; then
    echo "error: invalid slug '$slug' (use lowercase letters, numbers, dash)" >&2
    exit 1
  fi
}

create_pack() {
  local slug="$1"
  local dir="$BASE/$slug"
  if [ -e "$dir" ]; then
    echo "error: debate '$slug' already exists: $dir" >&2
    exit 1
  fi

  mkdir -p "$dir"

  cat > "$dir/moderator.md" <<EOF
---
name: moderator-$slug
description: Debate moderator for the '$slug' pack. Synthesizes the parallel risk/scope/simplicity critiques into one recommendation with guardrails and a rollback trigger.
tools: Read, Grep, Glob
---

# Moderator — $slug

Goal: synthesize the parallel debate and produce one recommendation.

Output format:
- decision: choose one direction
- rationale: 3 bullets
- guardrails: 3 non-negotiables
- rollback trigger: 1 condition
EOF

  cat > "$dir/risk-challenger.md" <<EOF
---
name: risk-challenger-$slug
description: Risk challenger for the '$slug' debate. Surfaces hidden risks, security, reliability, and long-term costs others ignore. Read-only.
tools: Read, Grep, Glob
---

# Risk Challenger — $slug

Position: challenge hidden risks, security, reliability, and long-term costs.

Output format:
- top 3 risks
- risk that is usually ignored
- minimal mitigation set
EOF

  cat > "$dir/scope-guardian.md" <<EOF
---
name: scope-guardian-$slug
description: Scope guardian for the '$slug' debate. Minimizes scope, protects delivery focus, and produces cut/keep/defer lists. Read-only.
tools: Read, Grep, Glob
---

# Scope Guardian — $slug

Position: minimize scope and protect delivery focus.

Output format:
- what to cut now
- what to keep now
- defer list for next cycle
EOF

  cat > "$dir/simplicity-advocate.md" <<EOF
---
name: simplicity-advocate-$slug
description: Simplicity advocate for the '$slug' debate. Argues for the smallest architecture that satisfies current goals and names complexity to avoid. Read-only.
tools: Read, Grep, Glob
---

# Simplicity Advocate — $slug

Position: prefer the smallest architecture that satisfies current goals.

Output format:
- simplest viable approach
- complexity to avoid now
- one measurable simplicity metric
EOF

  echo "created: $dir"
}

list_packs() {
  mkdir -p "$BASE"
  local count
  count="$(find "$BASE" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ')"
  echo "active debates: $count"
  find "$BASE" -mindepth 1 -maxdepth 1 -type d -printf '%f\n' | sort
}

remove_pack() {
  local slug="$1"
  local dir="$BASE/$slug"
  if [ ! -d "$dir" ]; then
    echo "error: debate '$slug' not found" >&2
    exit 1
  fi
  rm -rf "$dir"
  echo "removed: $dir"
}

main() {
  local action="${1:-}"
  case "$action" in
    create)
      require_slug "${2:-}"
      create_pack "$2"
      ;;
    list)
      list_packs
      ;;
    remove)
      require_slug "${2:-}"
      remove_pack "$2"
      ;;
    *)
      usage
      exit 1
      ;;
  esac
}

main "$@"
