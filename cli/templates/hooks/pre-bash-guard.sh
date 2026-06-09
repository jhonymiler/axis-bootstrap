#!/usr/bin/env bash
# AXIS pre-bash-guard hook — fires on PreToolUse(Bash).
# NON-BLOCKING by design (AXIS hooks inform, they do not block). Real blocking
# is declarative in settings.json `permissions.deny`. This hook's job is the
# missing telemetry: record destructive *attempts* to .ai/telemetry.jsonl so the
# retrospective loop (axis-evolve) has objective signal, and warn the agent.
# Receives the tool input on stdin as JSON (Claude Code hook contract).
set -euo pipefail

source "$(dirname "$0")/_lib.sh"

PAYLOAD="$(cat || true)"
CMD="$(printf '%s' "$PAYLOAD" | grep -oE '"command"[[:space:]]*:[[:space:]]*"([^"\\]|\\.)*"' | head -1 | sed -E 's/.*"command"[[:space:]]*:[[:space:]]*"(.*)"$/\1/')"
[ -z "$CMD" ] && exit 0

# Deny-list: pattern|label. Each line is a class of irreversible/dangerous action.
flag() {
  axis_log_event "action:destructive" "pattern=$1" "command=$(printf '%s' "$CMD" | cut -c1-160)"
  echo "[axis/guard] destructive pattern flagged: $1" >&2
  echo "[axis/guard] logged to telemetry; blocking is enforced by settings.json permissions.deny" >&2
}

printf '%s' "$CMD" | grep -Eq 'rm[[:space:]]+-[a-zA-Z]*[rf][a-zA-Z]*[rf]' && flag "rm-recursive-force"
printf '%s' "$CMD" | grep -Eq 'git[[:space:]]+push.*(--force|-f([[:space:]]|$))' && flag "git-push-force"
printf '%s' "$CMD" | grep -Eq 'git[[:space:]]+reset[[:space:]]+--hard'           && flag "git-reset-hard"
printf '%s' "$CMD" | grep -Eq 'git[[:space:]]+clean[[:space:]]+-[a-zA-Z]*f'       && flag "git-clean-force"
printf '%s' "$CMD" | grep -Eq 'chmod[[:space:]]+-?R?[[:space:]]*777'              && flag "chmod-777"
printf '%s' "$CMD" | grep -Eq '(curl|wget)[^|]*\|[[:space:]]*(sudo[[:space:]]+)?(ba)?sh' && flag "pipe-to-shell"
printf '%s' "$CMD" | grep -Eq 'dd[[:space:]]+.*of=/dev/'                          && flag "dd-to-device"
printf '%s' "$CMD" | grep -Eq 'mkfs'                                              && flag "mkfs"
printf '%s' "$CMD" | grep -Eq 'sudo[[:space:]]+rm'                                && flag "sudo-rm"

exit 0
