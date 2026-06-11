# Templates

All copy-paste templates used by the bootstrap. Each has a linkable anchor (e.g., `#skillmd-index`) referenced from other phases.

---

## INSTRUCTIONS.md

```markdown
# <Project Name>

## Purpose

<1-2 sentences describing what the project does, for whom, and why.>

## Stack / Tools

- **Language:** <e.g., TypeScript 5.4>
- **Framework:** <e.g., NestJS 10>
- **Database:** <e.g., PostgreSQL 16 + TypeORM>
- **Infra:** <e.g., Docker, AWS ECS>
- **Test:** <e.g., Jest, Supertest>

## How to Run

```bash
<exact command to start local environment>
<exact command to run tests>
<exact command to build>
```

## Architecture

| Component  | Responsibility   | Technology    | Location       |
| ---------- | ---------------- | ------------- | -------------- |
| <e.g. API> | <e.g. HTTP REST> | <e.g. NestJS> | <e.g. src/api> |

Details: [docs/architecture.md](docs/architecture.md)

## Design Principles

- **<Principle 1>:** <short rationale>
- **<Principle 2>:** <short rationale>

## Conventions

Summary here; details in [.ai/rules/](rules/):

- Naming: <rule>
- Error handling: <rule>
- Tests: <rule>

## Workflow & Tools

Summary here; full standards in [.ai/rules/workflow.md](rules/workflow.md):

- **Task tracker:** <e.g., Jira board ENG, tickets ENG-XXX>
- **Commits:** <e.g., Conventional Commits with ticket trailer>
- **Branches:** <e.g., feature/<ticket>-<slug>, PR-only into main>
- **PRs:** <e.g., 1 approval + green CI, squash merge>
- **Versioning:** <e.g., SemVer, changelog auto-generated>

## Available Skills

| Skill                                  | When to use   |
| -------------------------------------- | ------------- |
| [<skill-1>](skills/<skill-1>/SKILL.md) | <when to use> |
| [<skill-2>](skills/<skill-2>/SKILL.md) | <when to use> |

## Links

- [Architecture](docs/architecture.md)
- [Database Schema](docs/database-schema.md)
- [State](docs/STATE.md)
- [Conventions](CONVENTIONS.md)
```

**Target size:** 100-180 lines after real content is filled in.

---

## SKILL.md (index)

```markdown
---
name: skill-name
description: <2-4 lines>. Use when implementing X, debugging Y,
  or understanding Z of the domain. Mention specific domain terms that act
  as triggers: term1, term2, term3.
---

# Skill Title

<Purpose in 1-2 sentences.>

## When to Use

- <Specific scenario 1>
- <Specific scenario 2>
- <Specific scenario 3>

## Quick Summary

| Item | Value | Notes |
| ---- | ----- | ----- |
| ...  | ...   | ...   |

## References

- [GUIDE.md](references/GUIDE.md) — step-by-step operational guide
- [REFERENCE.md](references/REFERENCE.md) — tables and reference data
- [PROMPT-TEMPLATE.md](references/PROMPT-TEMPLATE.md) — output contract (if generates artifacts)
- [TROUBLESHOOTING.md](references/TROUBLESHOOTING.md) — common errors (optional)

## Final Validation

Before finishing work using this skill:

- [ ] <domain-specific gate 1>
- [ ] <domain-specific gate 2>
```

**Target size:** 40-60 lines.

---

## Code Rule

Rules in `.ai/rules/*.md` include frontmatter compatible with both Claude Code and Cursor. The `sync-cursor-rules.sh` script generates `.mdc` files from these `.md` sources.

```markdown
---
applyTo: "**/*.{ext}"
trigger: always
description: "Brief agent-friendly description of when this rule applies"
alwaysApply: true
globs: "src/**"
---

# <Rule Name>

## <Section 1>

- <Concise guideline with context (why do it this way)>
- <Concise guideline with context>

## <Section 2>

- <Concise guideline>
```

**Frontmatter field reference:**

| Field | Used by | Purpose |
| ----- | ------- | ------- |
| `applyTo` | Claude Code, Copilot | Path glob for scoping |
| `trigger` | Claude Code (AXIS convention) | `always` / `on-edit` / `on-stop` |
| `description` | **Cursor** (required for intelligent activation) | Agent-friendly description |
| `alwaysApply` | **Cursor** | `true` = every conversation |
| `globs` | **Cursor** | File patterns for scoped activation (alternative to `applyTo`) |

---

## Copilot Code Review — path-targeted (`.instructions.md`)

Create only if the user declared **GitHub Copilot** in Phase 1. Lives in `.ai/instructions/` (single source of truth) and is exposed to Copilot via `.github/instructions/` symlink (handled by `setup-ide-links.sh`).

**Hard constraint:** Copilot Code Review reads only the first **4000 chars** of each file. Stay under it. Verify with `wc -c .ai/instructions/*.instructions.md`.

```markdown
---
applyTo: "src/**,lib/**"
---

# Code Review — <Project Name>

> Copilot Code Review reads this file when a PR touches a path matching `applyTo`. Keep it under 4000 chars.

## Project purpose

<1-2 sentences from .ai/INSTRUCTIONS.md describing what the project does and for whom.>

A PR is in scope when it serves this purpose. Reject changes that drift.

## Accept when

- It advances the project's stated purpose.
- It respects the conventions in `.ai/INSTRUCTIONS.md` and `.ai/rules/`.
- Tests cover new behavior (if `.ai/rules/testing.md` exists).
- Naming, error handling, and dependencies match the project's rules.

## Reject when

- Runtime features outside the project's domain.
- Commits secrets, tokens, or `.env*`.
- Removes tests without justification.
- Adds dependencies without explanation in the PR description.

## Security checks

- External inputs sanitized before queries / shell / paths.
- Auth checks before data access / mutation.
- No secrets in logs.
- Error messages don't expose internals.

## Output format

Group findings: **blocker** / **warning** / **suggestion**. Each: location · what · why · suggested fix.
```

**Recommended split for medium/large projects:**

| File | `applyTo:` | Focus |
| ---- | ---------- | ----- |
| `code-review.instructions.md` | `src/**,lib/**` (or equivalent) | Project purpose, code quality, security |
| `tests.instructions.md` | `**/*.test.*,**/*_test.*,tests/**` | Test coverage rules, fixture conventions |
| `infra.instructions.md` | `.github/**,infra/**,Dockerfile*` | Workflow permissions, secret handling, image hardening |

Stop at 2-3 files. More fragmentation reduces signal.

---

## workflow.md (rule)

Populated from Phase 1 Block 4. Keep only the sections that apply — empty sections add noise.

```markdown
---
applyTo: "**"
---

# Workflow & Governance

> Source of truth for branch, commit, PR, task, and release standards. The agent must follow this without being reminded.

## Task / Project Management

- **Tool:** <Jira | Linear | GitHub Projects | Trello | Asana | ClickUp | Notion | none>
- **Board / project:** <e.g., Jira board ENG, URL or MCP reference>
- **Ticket prefix:** <e.g., ENG-XXX, PROJ-XXX>
- **Workflow states:** <e.g., Backlog → Ready → In Progress → Review → Done>
- **Required fields when creating a task:** <description, AC, story points, epic, labels>
- **Definition of Ready / Done:** <link or inline checklist>

## Commit Messages

- **Convention:** <Conventional Commits | Gitmoji | free-form | other>
- **Format example:**
  ```
  feat(api): add idempotency key validation [ENG-1234]
  ```
- **Ticket ID:** <required in subject | required as trailer | optional>
- **Sign-off / GPG / Co-authored-by:** <DCO sign-off required | GPG required | Co-authored-by trailers for pairing>
- **Length:** subject ≤ 72 chars; body wrapped at 100; imperative mood.

## Branches

- **Main branch:** <main | master | trunk>
- **Naming pattern:** `<type>/<ticket>-<slug>` — examples:
  - `feature/ENG-1234-add-webhook`
  - `fix/ENG-1310-null-pointer-checkout`
  - `chore/upgrade-node-20`
- **Allowed prefixes:** <feature/, fix/, hotfix/, chore/, release/, docs/>
- **Strategy:** <trunk-based | GitHub Flow | Git Flow | release branches>
- **Branch protection:** <PR-only into main | required status checks | linear history | no force-push>

## Pull Requests

- **Title format:** <Conventional, ticket prefix in title, free>
- **Template / required sections:** Summary, Changes, Test Plan, Screenshots, Rollback, Linked Issues
- **Approvals required:** <N approvals, CODEOWNERS for paths X/Y>
- **Required CI checks:** <build, unit tests, integration tests, lint, type-check>
- **Merge strategy:** <squash | merge commit | rebase-and-merge>
- **Post-merge:** <auto-delete branch | auto-deploy to staging>

## Releases & Versioning

- **Scheme:** <SemVer (MAJOR.MINOR.PATCH) | CalVer | none>
- **Changelog:** <Keep a Changelog | auto-generated from Conventional Commits | none>
- **Cadence:** <continuous | weekly | sprint | scheduled>
- **Tagging:** <v1.2.3 | release/2026-05 | none>

## Agent Behavior Rules

- Never push directly to `<main>` — always open a PR.
- Always include the ticket ID in the commit subject/trailer when the change traces to a ticket.
- Branch name must match the pattern above before the first commit; fix it locally before pushing.
- PR description must reference the ticket and include a test plan; do not request review without these.
- Do not merge a PR without the required approvals and green CI — even if "obviously safe".
```

---

## STATE.md

```markdown
# Project State

## Active Decisions
<!-- [YYYY-MM-DD] Decision X made because Y -->

## In Progress
<!-- Feature Z: 70% complete, missing integration with API X -->

## Blockers
<!-- API X returning 429 in staging — awaiting vendor response -->

## Deferred Ideas
<!-- Migrate to gRPC — evaluate when volume exceeds 10k req/min -->

## Lessons Learned
<!-- Bulk insert with TypeORM: use createQueryBuilder instead of save() for >100 records -->

## Pending TODOs
- [ ]

---

## Handoff Protocol

At the end of any session with relevant changes, update this file with:
- What was done
- What remains
- Any context that would otherwise be lost

At the start of a session, read this file **before** anything else.
```

---

## CONVENTIONS.md

```markdown
# Conventions

## Single Source of Truth

All content lives in `.ai/`. IDE-specific folders contain symlinks only.

## Symlink Map

```text
CLAUDE.md     → .ai/INSTRUCTIONS.md
AGENTS.md     → .ai/INSTRUCTIONS.md
.claude/      → ../.ai/{rules,skills,INSTRUCTIONS.md}
.cursor/      → ../.ai/{rules,skills}
.agents/      → ../.ai/{rules,skills}
.github/      → ../.ai/{rules,skills,INSTRUCTIONS.md}
```

To add a new IDE: edit `setup-ide-links.sh` (3-4 lines) and run it.

## Templates

- **New skill:** copy `<skill>/SKILL.md` from any existing skill as a base
- **New rule:** copy the format from `code-style.md`

## Agent Rules

- Never duplicate content between IDEs
- Always create files inside `.ai/`
- Keep `SKILL.md` ≤ 60 lines
- Keep `INSTRUCTIONS.md` between 100-180 lines
- Update `STATE.md` at the end of sessions with changes

## Knowledge Verification Chain

Before asserting:
1. Codebase
2. Project docs
3. MCP/Context7 (official docs)
4. Web search
5. Mark as uncertain — never fabricate

## Maintenance

| Event                       | Action                         |
| --------------------------- | ------------------------------ |
| Code changes a skill's flow | Update the corresponding skill |
| Session paused              | Update STATE.md                |
| New integration             | Evaluate new skill             |
```

---

## settings.json

```json
{
  "permissions": {
    "allow": [
      "Read",
      "Bash(git *)",
      "Bash(<build-tool> *)",
      "Edit(/src/**)",
      "Edit(/test/**)",
      "Edit(/.ai/**)"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(git push --force*)"
    ],
    "ask": [
      "Bash(git push *)",
      "Edit(/.env*)"
    ]
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash scripts/format-file.sh \"$CLAUDE_TOOL_INPUT_FILE_PATH\""
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash scripts/validate-bash.sh"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash scripts/run-tests-if-changed.sh"
          }
        ]
      }
    ]
  }
}
```

Replace `<build-tool>` with:

| Stack       | Command                                           |
| ----------- | ------------------------------------------------- |
| Node.js     | `Bash(npm *)`, `Bash(npx *)`                      |
| Python      | `Bash(pip *)`, `Bash(pytest *)`, `Bash(poetry *)` |
| Go          | `Bash(go *)`                                      |
| Java/Maven  | `Bash(mvn *)`                                     |
| Java/Gradle | `Bash(gradle *)`, `Bash(./gradlew *)`             |
| Ruby        | `Bash(bundle *)`, `Bash(rake *)`                  |
| PHP         | `Bash(composer *)`                                |
| Rust        | `Bash(cargo *)`                                   |
| .NET        | `Bash(dotnet *)`                                  |

---

## format-file.sh

```bash
#!/bin/bash
# scripts/format-file.sh
# Formats the file passed as argument. Stack-aware via case.
# Never fails — missing formatter does not block the agent.

FILE="$1"
[ -z "$FILE" ] && exit 0

case "$FILE" in
  *.ts|*.js|*.json|*.css)  npx prettier --write "$FILE" 2>/dev/null ;;
  *.py)                     black "$FILE" 2>/dev/null ;;
  *.go)                     gofmt -w "$FILE" 2>/dev/null ;;
  *.java)                   google-java-format --replace "$FILE" 2>/dev/null ;;
  *.rb)                     rubocop --auto-correct "$FILE" 2>/dev/null ;;
  *.php)                    php-cs-fixer fix "$FILE" 2>/dev/null ;;
  *.rs)                     rustfmt "$FILE" 2>/dev/null ;;
esac
exit 0
```

---

## validate-bash.sh

```bash
#!/bin/bash
# scripts/validate-bash.sh
# Blocks destructive patterns. Universal — install in any project.

INPUT=$(cat)
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // ""' 2>/dev/null)

# Patterns never allowed without explicit confirmation
if echo "$CMD" | grep -qE '(rm -rf /|DROP TABLE|TRUNCATE |DELETE FROM [^W])'; then
  echo '{"action": "deny", "reason": "Potentially destructive command. Run manually if intentional."}'
  exit 0
fi

echo '{"action": "allow"}'
```

---

## run-tests-if-changed.sh

```bash
#!/bin/bash
# scripts/run-tests-if-changed.sh
# Detects changed code extensions and runs the corresponding tests.

CHANGED=$(git diff --name-only HEAD 2>/dev/null)
[ -z "$CHANGED" ] && exit 0

if echo "$CHANGED" | grep -qE '\.(ts|js)$';      then npm test -- --passWithNoTests 2>&1 | tail -10; fi
if echo "$CHANGED" | grep -qE '\.py$';            then pytest --tb=short -q 2>&1 | tail -10; fi
if echo "$CHANGED" | grep -qE '\.go$';            then go test ./... 2>&1 | tail -10; fi
if echo "$CHANGED" | grep -qE '\.java$';          then mvn test -q 2>&1 | tail -10; fi
if echo "$CHANGED" | grep -qE '\.rb$';            then bundle exec rspec --format progress 2>&1 | tail -10; fi
if echo "$CHANGED" | grep -qE '\.(cs|csproj)$';   then dotnet test --nologo 2>&1 | tail -10; fi
exit 0
```

---

## setup-ide-links.sh

Shipped at project root by Phase 3. **Do not duplicate inline** — copy from `cli/templates/setup-ide-links.sh` (AXIS) or run `axis init` / `axis link`.

Key behaviors:

- Root: `AGENTS.md` + `CLAUDE.md` → `.ai/INSTRUCTIONS.md`
- Claude: `.claude/{skills,rules,hooks,agents}` → `.ai/*`
- **Cursor:** `.cursor/skills` symlink + `scripts/sync-cursor-rules.sh` generates `.cursor/rules/*.mdc` (never symlink `.md` rules)
- `.agents` → `.ai/agents` (agent definitions only — no skills/rules pollution)
- Copilot: `.github/copilot-instructions.md` + optional `.github/instructions/`

Post-install local gate: `bash scripts/validate-ide-links.sh`

**Comment/remove** IDE sections not declared in Phase 1 to reduce noise in `git status`.

---

## docs/cursor.md

Copy to `.ai/docs/cursor.md` when the user declared **Cursor** in Phase 1. Template: `cli/templates/docs/cursor.md`. Documents SSOT → `.mdc` generation, subagent dispatch via Task tool, and maintenance commands.

---

## agents/README.md

Shipped at `.ai/agents/README.md` by `axis init` (from `cli/templates/agents/README.md`). Explains specialists, challengers, debates, and per-IDE invocation. Do not symlink skills or rules into `.ai/agents/`.

---

## architecture.md (stub)

```markdown
# System Architecture

## Overview

<ASCII or Mermaid diagram showing components and connections.>

## Components

| Component | Responsibility | Technology | Location |
| --------- | -------------- | ---------- | -------- |
| ...       | ...            | ...        | ...      |

## Key Architectural Decisions

- **Why <technology>:** <rationale>
- **Why <pattern>:** <rationale>

## Constraints and Trade-offs

- **<Constraint>:** <consequence and mitigation>
```

---

## database-schema.md (stub)

```markdown
# Database Schema

## Table: <name>

| Column | Type | Nullable | Description  |
| ------ | ---- | -------- | ------------ |
| id     | UUID | N        | Generated PK |
| ...    | ...  | ...      | ...          |

**Indexes:** `idx_xxx` (col1, col2) — used in <query>
**Constraints:** `uq_xxx` (col) — ensures <invariant>

**Business rules:**
- <rule 1>
- <rule 2>
```

---

## REASONS Canvas (feature-level spec)

Use when specifying a complex feature before generating code. Follows the SPDD structure: abstract parts (intent & design) → specific parts (execution) → governance parts.

```markdown
# REASONS Canvas — <Feature Name>

**ID:** <YYYY-MM-DD-feature-slug>
**Status:** draft | reviewed | locked

---

## R — Requirements
<!-- What problem are we solving? What is the Definition of Done? -->

**Problem:** <1-2 sentences>

**Acceptance Criteria (Given/When/Then):**
- Given <context>, When <action>, Then <expected result with concrete values>
- Given <context>, When <action>, Then <expected result with concrete values>

**Out of scope:**
- <explicit exclusion 1>
- <explicit exclusion 2>

---

## E — Entities
<!-- Domain entities, their attributes, and relationships relevant to this feature -->

| Entity | Key Attributes | Relationships              |
| ------ | -------------- | -------------------------- |
| <name> | <attr1, attr2> | <belongs to X, has many Y> |

---

## A — Approach
<!-- Strategic direction: which pattern/design solves the problem? Why? -->

**Selected approach:** <e.g., Strategy pattern for billing calculator>

**Rationale:** <why this approach over alternatives>

**Key architectural decisions:**
- <decision 1>
- <decision 2>

---

## S — Structure
<!-- Where does the change fit? Which components are affected? Dependencies? -->

**Components affected:**
| Component | File/Path | Type of change        |
| --------- | --------- | --------------------- |
| <name>    | <path>    | new / modify / delete |

**External dependencies:** <APIs, libs, services>

---

## O — Operations
<!-- Concrete, testable implementation steps (method-level precision) -->

1. **<Step name>**
   - Input: <params>
   - Logic: <what to do>
   - Output: <return/side effect>
   - Test: <how to verify>

2. **<Step name>**
   - Input: <params>
   - Logic: <what to do>
   - Output: <return/side effect>
   - Test: <how to verify>

---

## N — Norms
<!-- Cross-cutting engineering standards that apply to this feature -->

- Naming: <convention>
- Error handling: <pattern>
- Logging/observability: <what to log>
- Test coverage: <minimum requirement>

---

## S — Safeguards
<!-- Non-negotiable invariants, performance limits, security rules -->

- [ ] <invariant 1 — e.g., never persist without validating X>
- [ ] <invariant 2 — e.g., latency must stay under Xms for Y operation>
- [ ] <security rule — e.g., sanitize input before passing to query>
```

**When to use:** features with >3 steps, business logic with multiple paths, or any change that touches more than 2 components. Skip for trivial fixes (<3 files, 1 obvious step).

**Sync protocol (inviolable):**

| Change type                          | Direction   | Action                                                       |
| ------------------------------------ | ----------- | ------------------------------------------------------------ |
| Requirements changed                 | spec → code | Update Canvas first, then regenerate affected Operations     |
| Code refactored (no behavior change) | code → spec | Refactor code, then sync Operations/Structure back to Canvas |

> **Rule:** when reality diverges, fix the Canvas first — then update the code. The Canvas is the source of truth.

---

## Test Spec (derived from REASONS Canvas)

Generated from the Canvas Operations + Acceptance Criteria. Use alongside or after `/spdd-api-test` equivalent.

```markdown
# Test Spec — <Feature Name>

**Source Canvas:** <canvas file or ID>

## Scenarios

### Normal flow
| #   | Given     | When     | Then       | Priority |
| --- | --------- | -------- | ---------- | -------- |
| 1   | <context> | <action> | <expected> | high     |

### Boundary conditions
| #   | Given       | When     | Then       | Priority |
| --- | ----------- | -------- | ---------- | -------- |
| 1   | <edge case> | <action> | <expected> | medium   |

### Error scenarios
| #   | Given           | When     | Then                 | Priority |
| --- | --------------- | -------- | -------------------- | -------- |
| 1   | <invalid input> | <action> | <HTTP 4xx + message> | high     |

## Coverage Gate
- [ ] All Acceptance Criteria from Canvas covered
- [ ] At least 1 boundary test per numeric/date input
- [ ] All error paths in Safeguards covered
```

---

## PULL_REQUEST_TEMPLATE.md

Create only if the user requested a PR template in Phase 1 Block 4B Q23. Place at `.github/PULL_REQUEST_TEMPLATE.md`. Populate the checklist from Block 4B answers.

```markdown
## Summary
<!-- What does this PR do? Link to ticket: PROJ-XXX -->

## Changes
- 

## Test Plan
- [ ] Unit tests pass
- [ ] Integration tests pass (if applicable)

## Screenshots
<!-- If UI changes, attach before/after screenshots -->

## Rollback
<!-- How to revert if this causes issues -->

## Checklist
- [ ] Code follows project conventions (.ai/rules/)
- [ ] Tests cover new behavior
- [ ] Documentation updated (if applicable)
- [ ] No secrets or .env files committed
```

**Customization:** Add project-specific items from Block 4B Q23 answers to the Checklist section (e.g., "update API docs", "add migration", "update changelog").

---

## validate-commit-msg.sh

Create only if the user requested commit validation in Phase 1 Block 4B Q22. Wires as a reminder hook, not a blocker — the agent reads the output and adjusts.

```bash
#!/bin/bash
# scripts/validate-commit-msg.sh
# Validates commit message format. Informational — exit 0 always.

INPUT=$(cat 2>/dev/null || true)
MSG=$(echo "$INPUT" | jq -r '.tool_input.command // ""' 2>/dev/null)

# Only act on git commit commands
if ! echo "$MSG" | grep -qE '^git commit'; then
  exit 0
fi

# Extract message from -m flag
COMMIT_MSG=$(echo "$MSG" | grep -oP '(?<=-m ["'"'"'])[^"'"'"']+')
[ -z "$COMMIT_MSG" ] && exit 0

echo "─── Commit message check ───"

# Conventional Commits: type(scope): description
if ! echo "$COMMIT_MSG" | grep -qE '^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\(.+\))?!?: .+'; then
  echo "[warn] Message does not follow Conventional Commits format."
  echo "[hint] Expected: type(scope): description"
  echo "[hint] Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert"
fi

echo "─── end ───"
exit 0
```

**Adapt** the regex to the convention declared in Block 4 Q17 (Gitmoji, free-form, etc.). For free-form, skip this script entirely.

---

## IDE Capability Reference (from official documentation)

Quick reference for Phase 3 harness decisions. Sources: [Cursor docs](https://cursor.com/docs/rules), [Claude Code docs](https://code.claude.com/docs/en/settings), [GitHub Copilot docs](https://docs.github.com/en/copilot), [AGENTS.md spec](https://agentspec.sh).

### Entry points & rules

| Feature | Claude Code | Cursor | GitHub Copilot | Windsurf |
| ------- | ----------- | ------ | -------------- | -------- |
| **Entry point** | `CLAUDE.md` (always loaded) | `AGENTS.md` + `CLAUDE.md` (both auto-loaded) | `.github/copilot-instructions.md` | `AGENTS.md` |
| **Rules dir** | `.claude/rules/*.md` | `.cursor/rules/*.mdc` | `.github/instructions/*.instructions.md` | `.agents/rules/` |
| **Rules format** | `.md` — frontmatter optional | **`.mdc`** — YAML frontmatter required (`description`, `globs`, `alwaysApply`) | `.instructions.md` — `applyTo` + optional `excludeAgent` | `.md` |
| **Skills dir** | `.claude/skills/` | `.cursor/skills/` | `.github/skills/` | `.agents/skills/` |
| **Char limit** | None | None | 4000 per file | None |

**Critical:** Cursor **ignores** plain `.md` files in `.cursor/rules/`. The `.mdc` extension is mandatory. Use `scripts/sync-cursor-rules.sh` to generate `.mdc` from `.ai/rules/*.md`.

### Harness & hooks

| Feature | Claude Code | Cursor | GitHub Copilot | Windsurf |
| ------- | ----------- | ------ | -------------- | -------- |
| **Settings/permissions** | `.claude/settings.json` (allow/deny/ask) | No equivalent | No equivalent | No equivalent |
| **Hook events** | 25+ events (see below) | None | GitHub Actions (CI-level) | None |
| **Hook types** | `command`, `http`, `mcp_tool`, `prompt`, `agent` | None | None | None |
| **Sub-agents** | `.claude/agents/*.md` | None (run inline) | None | None |
| **Code review** | Manual | Manual | Copilot Code Review (automated) | Manual |
| **Settings hierarchy** | user → project → local → managed | User rules (IDE settings) | Repo settings on github.com | None |

### Claude Code hook events (official, from docs)

| Event | When | Key use |
| ----- | ---- | ------- |
| `SessionStart` | Session begins/resumes | Print STATE.md hot tier |
| `PreToolUse` | Before tool call | Block destructive commands, constitutional check |
| `PostToolUse` | After tool succeeds | Spec-edit detection, code-change drift check |
| `Stop` | Agent finishes responding | Remind STATE curation |
| `UserPromptSubmit` | User submits prompt | Prompt validation/expansion |
| `SubagentStart/Stop` | Subagent lifecycle | Logging, resource tracking |
| `FileChanged` | Watched file changes on disk | React to config/env changes |
| `ConfigChange` | Settings file changes | Live reload |
| `PostToolBatch` | After parallel tool batch | Aggregate validation |

The `if` field on hook handlers uses permission rule syntax for fine-grained filtering: `"Bash(git commit *)"` fires only on git commit commands, `"Edit(.ai/**)"` fires only for spec edits.

### Cursor rules activation modes (official, from docs)

| Mode | Frontmatter | When it activates |
| ---- | ----------- | ----------------- |
| **Always Apply** | `alwaysApply: true` | Every conversation — use for universal standards |
| **Apply Intelligently** | `description: "..."` (no globs, `alwaysApply: false`) | Agent reads description and decides relevance |
| **Apply to Specific Files** | `globs: "**/*.ts"` | When matching files are in context |
| **Manual** | No frontmatter or `alwaysApply: false` no globs | Only when user `@`-mentions the rule |

### GitHub Copilot instruction frontmatter (official, from docs)

```yaml
---
applyTo: "src/**,lib/**"
excludeAgent: "code-review"   # optional: "code-review" or "cloud-agent"
---
```

The `excludeAgent` field prevents a specific Copilot feature from reading the file. Use `"code-review"` to exclude from automated PR review or `"cloud-agent"` to exclude from the coding agent.

### AGENTS.md compatibility (2026 status)

AGENTS.md is an open standard (Linux Foundation / Agentic AI Foundation) read natively by 18+ tools:

| Tool | Reads AGENTS.md | Native format |
| ---- | --------------- | ------------- |
| Cursor | Yes | `.cursor/rules/*.mdc` |
| GitHub Copilot | Yes | `.github/copilot-instructions.md` |
| OpenAI Codex | Yes (primary) | — |
| Windsurf | Yes | `.windsurfrules` |
| Devin, Aider, Zed, Warp | Yes | — |
| **Claude Code** | **No** (uses `CLAUDE.md`) | `CLAUDE.md` + `@imports` |

**AXIS approach:** `AGENTS.md` → symlink → `.ai/INSTRUCTIONS.md` ← symlink ← `CLAUDE.md`. Both filenames point to the same content. All tools read it.
