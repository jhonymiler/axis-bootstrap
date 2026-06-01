#!/usr/bin/env bash
# sync-cursor-rules.sh — Generates .cursor/rules/*.mdc from .ai/rules/*.md.
#
# Cursor requires .mdc extension with specific frontmatter (description, globs,
# alwaysApply). Plain .md files in .cursor/rules/ are IGNORED by Cursor's rules
# system. This script bridges the gap by reading .ai/rules/*.md (source of truth)
# and generating properly formatted .mdc files.
#
# Frontmatter mapping:
#   .ai/rules/         →  .cursor/rules/
#   applyTo: "**"      →  (dropped — alwaysApply covers it)
#   trigger: always     →  alwaysApply: true
#   trigger: on-edit    →  alwaysApply: false + globs from applyTo
#   trigger: on-stop    →  alwaysApply: false (description drives activation)
#   description: "..."  →  description: "..." (passed through)
#   globs: "..."        →  globs: "..." (passed through if present)
#
# Usage: bash scripts/sync-cursor-rules.sh [source_dir] [target_dir]
#   Defaults: source=.ai/rules  target=.cursor/rules
set -euo pipefail

SRC="${1:-.ai/rules}"
DST="${2:-.cursor/rules}"

if [ ! -d "$SRC" ]; then
  echo "[sync-cursor-rules] No $SRC directory — skipping." >&2
  exit 0
fi

mkdir -p "$DST"

converted=0
for md_file in "$SRC"/*.md; do
  [ -f "$md_file" ] || continue

  base="$(basename "$md_file" .md)"
  mdc_file="$DST/${base}.mdc"

  description=""
  always_apply="false"
  globs_val=""
  in_frontmatter=0
  frontmatter_done=0
  body=""

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
            # "**" means global — use alwaysApply instead of globs
            if [ "$globs_val" = "**" ]; then
              globs_val=""
            fi
          fi
          ;;
      esac
    fi
  done < "$md_file"

  # If no description found, generate one from the first heading
  if [ -z "$description" ]; then
    description="$(echo "$body" | grep -m1 '^# ' | sed 's/^# //' || echo "$base")"
  fi

  # Write .mdc file
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
    printf '%s' "$body"
  } > "$mdc_file"

  converted=$((converted + 1))
done

echo "[sync-cursor-rules] Generated $converted .mdc files in $DST"
