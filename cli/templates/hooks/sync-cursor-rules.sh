#!/usr/bin/env bash
# sync-cursor-rules.sh — Generates .cursor/rules/*.mdc from .ai/rules/*.md.
#
# Cursor requires .mdc extension with specific frontmatter (description, globs,
# alwaysApply). Plain .md files in .cursor/rules/ are IGNORED by Cursor's rules
# system. This script bridges the gap by reading .ai/rules/*.md (source of truth)
# and generating properly formatted .mdc files.
#
# Usage:
#   bash scripts/sync-cursor-rules.sh [source_dir] [target_dir]
#   bash scripts/sync-cursor-rules.sh --check
#   bash scripts/sync-cursor-rules.sh --check [source_dir] [target_dir]
#
# Defaults: source=.ai/rules  target=.cursor/rules
set -euo pipefail

CHECK_MODE=false
POSITIONAL=()
for arg in "$@"; do
  if [ "$arg" = "--check" ] || [ "$arg" = "check" ]; then
    CHECK_MODE=true
  else
    POSITIONAL+=("$arg")
  fi
done

SRC="${POSITIONAL[0]:-.ai/rules}"
ACTUAL_DST="${POSITIONAL[1]:-.cursor/rules}"
DST="$ACTUAL_DST"
TMP_DIR=""

if [ "$CHECK_MODE" = true ]; then
  TMP_DIR="$(mktemp -d)"
  DST="$TMP_DIR"
fi

if [ ! -d "$SRC" ]; then
  if [ "$CHECK_MODE" = true ]; then
    rm -rf "$TMP_DIR"
    echo "[sync-cursor-rules] No $SRC directory — skipping check." >&2
    exit 0
  fi
  echo "[sync-cursor-rules] No $SRC directory — skipping." >&2
  exit 0
fi

mkdir -p "$DST"

render_mdc() {
  local md_file="$1"
  local mdc_file="$2"
  local base="$3"

  local description="" always_apply="false" globs_val=""
  local in_frontmatter=0 frontmatter_done=0 body=""

  while IFS= read -r line || [ -n "$line" ]; do
    if [ "$frontmatter_done" -eq 1 ]; then
      body+="$line"$'\n'
      continue
    fi

    if [ "$line" = "---" ]; then
      if [ "$in_frontmatter" -eq 0 ]; then
        in_frontmatter=1
        continue
      else
        frontmatter_done=1
        continue
      fi
    fi

    if [ "$in_frontmatter" -eq 1 ]; then
      case "$line" in
        description:*)
          description="${line#description:}"
          description="${description## }"
          description="${description#\"}"
          description="${description%\"}"
          ;;
        alwaysApply:*)
          always_apply="${line#alwaysApply:}"
          always_apply="${always_apply## }"
          ;;
        trigger:*always*)
          always_apply="true"
          ;;
        globs:*)
          globs_val="${line#globs:}"
          globs_val="${globs_val## }"
          globs_val="${globs_val#\"}"
          globs_val="${globs_val%\"}"
          ;;
        applyTo:*)
          if [ -z "$globs_val" ]; then
            globs_val="${line#applyTo:}"
            globs_val="${globs_val## }"
            globs_val="${globs_val#\"}"
            globs_val="${globs_val%\"}"
            if [ "$globs_val" = "**" ]; then
              globs_val=""
            fi
          fi
          ;;
      esac
    fi
  done < "$md_file"

  if [ -z "$description" ]; then
    description="$(echo "$body" | grep -m1 '^# ' | sed 's/^# //' || echo "$base")"
  fi

  {
    echo "---"
    echo "description: \"$description\""
    if [ "$always_apply" = "true" ]; then
      echo "alwaysApply: true"
    else
      echo "alwaysApply: false"
    fi
    if [ -n "$globs_val" ]; then
      echo "globs: $globs_val"
    fi
    echo "---"
    echo ""
    echo "<!-- Generated from .ai/rules/${base}.md — edit the source, then run: bash scripts/sync-cursor-rules.sh -->"
    echo ""
    printf '%s' "$body"
  } > "$mdc_file"
}

if [ "$CHECK_MODE" = false ]; then
  echo "[sync-cursor-rules] Syncing $SRC → $ACTUAL_DST..."
fi

generated=()
for md_file in "$SRC"/*.md; do
  [ -f "$md_file" ] || continue
  base="$(basename "$md_file" .md)"
  render_mdc "$md_file" "$DST/${base}.mdc" "$base"
  generated+=("${base}.mdc")
  if [ "$CHECK_MODE" = false ]; then
    echo "  .ai/rules/${base}.md → .cursor/rules/${base}.mdc"
  fi
done

if [ "$CHECK_MODE" = true ]; then
  mismatch=false
  for gen in "${generated[@]}"; do
    if [ ! -f "$ACTUAL_DST/$gen" ]; then
      echo "MISSING: .cursor/rules/$gen (run bash scripts/sync-cursor-rules.sh)"
      mismatch=true
      continue
    fi
    if ! diff -q "$DST/$gen" "$ACTUAL_DST/$gen" >/dev/null 2>&1; then
      echo "STALE: .cursor/rules/$gen differs from .ai/rules/${gen%.mdc}.md"
      mismatch=true
    fi
  done
  for existing in "$ACTUAL_DST"/*.mdc; do
    [ -f "$existing" ] || continue
    name="$(basename "$existing")"
    found=false
    for gen in "${generated[@]}"; do
      if [ "$gen" = "$name" ]; then
        found=true
        break
      fi
    done
    if [ "$found" = false ]; then
      echo "EXTRA: .cursor/rules/$name has no .ai/rules source"
      mismatch=true
    fi
  done
  rm -rf "$TMP_DIR"
  if [ "$mismatch" = true ]; then
    exit 1
  fi
  echo "OK: .cursor/rules/*.mdc are in sync with .ai/rules/"
  exit 0
fi

for existing in "$ACTUAL_DST"/*.mdc; do
  [ -f "$existing" ] || continue
  name="$(basename "$existing")"
  found=false
  for gen in "${generated[@]}"; do
    if [ "$gen" = "$name" ]; then
      found=true
      break
    fi
  done
  if [ "$found" = false ]; then
    rm -f "$existing"
    echo "  removed stale $name"
  fi
done

echo "[sync-cursor-rules] Generated ${#generated[@]} .mdc files in $ACTUAL_DST"
