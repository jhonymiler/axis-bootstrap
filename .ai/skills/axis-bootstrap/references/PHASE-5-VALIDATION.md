# Phase 5 — Validation & Handoff

**Goal:** validate that the bootstrap delivered a complete, functional system and make a clear handoff to the user.

**Input:** Phases 1-4 complete.

**Output:** validation report + list of next steps.

---

## Audit Mode

This phase also runs in standalone mode when the user asks to **audit an existing project**. In that case:

- Skip Phases 1-4
- Apply all checklists below
- Report what is absent or out of standards
- Do not create/modify anything without explicit confirmation

---

## Quality Gates — Structure

```text
[ ] .ai/ folder exists at project root
[ ] .ai/INSTRUCTIONS.md exists and has 100-180 lines
[ ] At least 3 skills in .ai/skills/, each with a SKILL.md
[ ] Each SKILL.md has ≤ 60 lines
[ ] Each SKILL.md has frontmatter with `name` and `description`
[ ] Each `description` has 2-4 lines and mentions trigger terms
[ ] For software projects: at least 3 rules in .ai/rules/ with `applyTo`
[ ] If Phase 1 Block 4 was answered: .ai/rules/workflow.md exists with the populated sections (PM tool, commits, branches, PRs)
[ ] INSTRUCTIONS.md has a "Workflow & Tools" section pointing to rules/workflow.md (or block 4 was explicitly skipped)
[ ] If Block 4B Q23 answered "yes" to PR template: .github/PULL_REQUEST_TEMPLATE.md exists
[ ] If Block 4B Q22 answered "automated": scripts/validate-commit-msg.sh exists and is executable
[ ] If Block 4B Q23 answered "Copilot Code Review": .ai/instructions/*.instructions.md exists (< 4000 chars each)
[ ] At least 1 stub in .ai/docs/ (architecture.md, glossary.md, or equivalent)
[ ] .ai/CONVENTIONS.md exists and contains symlink map
[ ] .ai/docs/STATE.md exists with the 6 mandatory sections
```

---

## Quality Gates — Harness

```text
[ ] settings.json exists and is versioned (git ls-files lists it)
[ ] settings.json has allow/deny/ask filled coherently with the stack
[ ] PreToolUse destructive blocking hook configured (universal)
[ ] For software: PostToolUse hook with formatter configured
[ ] For software: Stop hook with tests configured
[ ] Scripts in scripts/ are executable (chmod +x)
[ ] Scripts end with exit 0 (do not block the agent on failure)
```

---

## Quality Gates — Symlinks

```text
[ ] CLAUDE.md → .ai/INSTRUCTIONS.md (resolves)
[ ] AGENTS.md → .ai/INSTRUCTIONS.md (resolves)
[ ] For each declared IDE: corresponding folder with correct symlinks
[ ] setup-ide-links.sh exists and is idempotent
[ ] Running setup-ide-links.sh twice generates no error
[ ] ls -la shows expected targets in all symlinks
[ ] If Cursor declared: .cursor/rules/*.mdc generated from .ai/rules/*.md (not hand-edited)
[ ] If Cursor declared: docs/cursor.md exists; agents/README.md exists
[ ] scripts/validate-ide-links.sh passes (local gate)
```

**Concrete smoke test:**

```bash
bash scripts/validate-ide-links.sh
```

---

## Quality Gates — Continuity

```text
[ ] STATE.md has all 6 sections (Active Decisions, In Progress, Blockers,
    Deferred Ideas, Lessons, TODOs)
[ ] STATE.md mentions the handoff protocol
[ ] CONVENTIONS.md describes where the AI can/cannot create files
[ ] CONVENTIONS.md includes Knowledge Verification Chain
```

---

## Quantitative Metrics

Calculate and report:

| Metric | Target | How to measure |
| ------ | ------ | -------------- |
| Lines in `INSTRUCTIONS.md` | 100-180 | `wc -l` |
| Average lines per `SKILL.md` | 40-60 | `wc -l skills/*/SKILL.md \| awk` |
| Total skills | 3-10 | `ls -d skills/*/ \| wc -l` |
| Total rules | 3-7 (if software) | `ls rules/*.md \| wc -l` |
| Active symlinks | equal to number of declared IDEs + 2 (root) | `find . -type l \| wc -l` |
| Hooks installed | 1-3 | count in settings.json |

**Problem signals:**

- `INSTRUCTIONS.md` >200 lines → move details to skills/docs
- Any `SKILL.md` >80 lines → move content to `references/`
- >12 skills → excessive fragmentation, consider consolidation
- No rules created in software project → probable gap

---

## Cross-Validation

```text
[ ] Skills mentioned in INSTRUCTIONS.md (table) exist in .ai/skills/
[ ] Rules mentioned in INSTRUCTIONS.md exist in .ai/rules/
[ ] Symlink map in CONVENTIONS.md matches the real symlinks
[ ] IDEs declared in Phase 1 have corresponding folders
```

**If any cross-check fails**, fix before handoff.

---

## Auto-Cleanup (Step 5.5)

After all quality gates pass, **remove the bootstrap meta-skill** so the project is self-sufficient:

```bash
rm -rf .ai/skills/axis-bootstrap
```

**Removes:** the `axis-bootstrap` bundle (PLANNER, phases, discoverers, challengers, specialists, references). **Keeps:** all generated project-specific skills, rules, docs, STATE, CONVENTIONS, settings.json, hooks, symlinks.

If the `axis` CLI is available, run `axis cleanup` instead (same result, with a confirmation prompt). Either way, the project no longer depends on the bootstrap skill.

**Verify cleanup:**

```bash
# Must NOT exist after cleanup
ls .ai/skills/axis-bootstrap 2>/dev/null && echo "CLEANUP FAILED" || echo "OK: bootstrap skill removed"
# Must still exist
ls .ai/INSTRUCTIONS.md .ai/CONVENTIONS.md .ai/docs/STATE.md
```

---

## Handoff to User

Final message follows template in [PROMPT-TEMPLATE.md](../PROMPT-TEMPLATE.md#handoff-to-user). Structure:

```markdown
## Bootstrap Complete

### What was created
- N files in .ai/
- N skills initialized: <list>
- N rules: <list>
- N stubs in docs/
- Continuity layer with STATE, CONVENTIONS
- N symlinks distributing to <IDEs>
- N hooks in settings.json

### Cleanup
- axis-bootstrap skill removed ✓ (project is self-sufficient)

### Metrics
- INSTRUCTIONS.md: N lines (target 100-180) ✓
- SKILL.md average: N lines (target 40-60) ✓
- Symlinks: all resolve ✓
- Smoke tests: pass ✓

### Suggested next steps (3-5)
1. Detail the first priority skill — populate references/GUIDE.md in <skill>
2. Validate settings.json with the team
3. Configure CI to verify symlink resolution
4. Test invocation by another IDE (multi-tool smoke test)

### How to resume
- Next session: agent reads STATE.md first
- Future audit: invoke this skill again in "audit" mode
- Add new IDE: edit setup-ide-links.sh + run
```

---

## Acceptable vs Blocking Gaps

**Acceptable** (report only, do not block):

- references/ still empty in skills (expected — filled with use)
- Domain-specific rules not yet written
- docs/ stubs without content
- Empty TODOs in STATE.md

**Blocking** (fix before handoff):

- INSTRUCTIONS.md absent or <50 lines
- Skills without `description` in frontmatter
- Broken symlinks
- `settings.json` not versioned

---

## Post-Adoption Audit (future use)

The user can re-invoke this skill weeks later to audit:

```text
"Use axis-bootstrap in audit mode on this project."
```

The agent:

1. Skips Phases 1-4
2. Applies all gates from this phase
3. Identifies drift (e.g., INSTRUCTIONS.md grew to 250 lines; some skill lost description)
4. Proposes corrections one by one
5. **Does not correct without confirmation**
