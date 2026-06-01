---
applyTo: "src/**"
trigger: on-edit
description: "Documentation sync: keep .ai/ docs aligned when source code structure changes"
alwaysApply: false
globs: "src/**"
---

# Documentation Sync

> Always-on when editing code under `src/`. Ensures the `.ai/` documentation layer stays aligned with structural changes.

## On every file edit under `src/`

After making any change to a source file, check:

1. **New file added?** → Verify the module appears in the INSTRUCTIONS.md table. If missing, add the row.
2. **File deleted or moved?** → Remove or update the corresponding entry in INSTRUCTIONS.md. Check if any skill references the old path.
3. **New public function/class exported?** → If it belongs to a domain with a specialist agent, note that the specialist's `{{KNOWLEDGE_TABLE}}` may need a new row.

## Quick Check (inline, no tool call required)

Ask yourself before closing the session:

- Does INSTRUCTIONS.md still accurately describe what `src/` contains?
- Does any specialist agent reference a file you just deleted or renamed?

If yes to either: load `documentation-guardian` skill and run the repair protocol.

## Escalation

If >3 modules were touched in one session: run `bash scripts/check-doc-drift.sh` to get a full report instead of checking manually.
