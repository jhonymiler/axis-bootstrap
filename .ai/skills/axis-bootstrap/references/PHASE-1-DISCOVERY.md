# Phase 1 — Discovery

**Goal:** understand the project deeply enough to generate a correct spec in Phase 2 without needing to go back.

**Typical duration:** 5-15 minutes of interview.

**Output of this phase:** a mental *Project Profile* (or text draft) covering type, tools, domains, constraints, quality target, and IDEs.

---

## Principle: Read Before Asking

Before the first question, the agent (a) gathers everything that's already visible in the codebase, and (b) only then asks the human for what only they can answer. Discovery has **two stages**: a deep automated extraction via specialized discoverer sub-agents, then a focused interview informed by the extraction.

---

## Step 0 — Install + Dispatch Discoverer Sub-agents

The five discoverers ship as `.md` files inside the skill bundle. **Install them once** at the start of Phase 1 so the IDE picks them up as sub-agent types, then dispatch all five **in parallel** in a single message.

### 0.1 — Install (Claude Code path)

```bash
mkdir -p .claude/agents
cp .ai/skills/axis-bootstrap/agents/discoverers/*.md .claude/agents/
```

(For Cursor and other IDEs without native sub-agent support, skip the install and run the discoverers' methodologies inline yourself, sequentially.)

### 0.2 — Dispatch (single message, five parallel Task calls)

| Sub-agent | Returns |
|-----------|---------|
| `business-rules-extractor` | Table of validation / invariant / policy rules with evidence |
| `flow-extractor` | Per-flow ASCII diagrams (HTTP endpoints, jobs, events, CLI) |
| `architecture-mapper` | Layer diagram + module responsibility table |
| `stack-profiler` | Language/framework/build/test/lint table — feeds `settings.json` |
| `conventions-detector` | Detected naming/error-handling/logging/test/commit conventions with ≥2 evidence each |

All five are **read-only** (Read/Grep/Glob + minimal Bash) and self-bounded by tool budget. Total wall time ≈ the slowest, not the sum.

### 0.3 — Consolidate

Aggregate the five reports into a single **Project Profile draft** containing:

- Stack table (from `stack-profiler`)
- Architecture diagram (from `architecture-mapper`)
- 3-7 candidate domains (clusters of business rules + flows that share modules)
- Detected conventions to seed `.ai/rules/`
- A consolidated **Ambiguities list** — every `[AMBÍGUO]` entry from the five reports, deduplicated

The Ambiguities list **drives the human interview**: don't ask blind questions when a discoverer already surfaced specific uncertainties.

---

## The Interview (informed by Step 0)

Use the discoverer reports as input. **Skip questions the discoverers already answered**: don't ask "what's the stack?" if `stack-profiler` returned a confident manifest-based answer. Use the time saved to dig into the Ambiguities list and the human-only questions below (intent, audience, constraints).

---

## Block 1 — Universal Questions (always ask)

```text
1. In one sentence: what does this project do and for whom?
2. Is it a software project, or another type (content, research, business, legal, educational)?
3. How many people will work on it and for how long?
4. Which agents/IDEs will be used? (Claude Code, Cursor, Windsurf, Copilot, others)
5. Are there critical constraints? (compliance, deadline, budget, security)
```

Confirm the answers in a summary before advancing to Block 2.

---

## Block 2 — Branching by Type

Use the answer to question 2 to choose the sub-block below. May apply more than one if the project is hybrid (e.g., research + content).

### If SOFTWARE

```text
6a. What is the main stack? (language, framework, runtime)
7a. How does the project run? (exact command — npm run dev, python main.py, go run, etc.)
8a. Is there a database, queue, cache, or external services?
9a. Is there an adopted architecture pattern? (DI, hexagonal, monolith, microservices, MVC, etc.)
10a. Are there tests? What framework? Coverage of what?
11a. Is there CI/CD? Where? (GitHub Actions, GitLab CI, etc.)
12a. Which 3-5 areas/modules of the code have specific rules that deserve to become a skill?
```

### If CONTENT (articles, marketing, technical docs)

```text
6b. What is the format and distribution channel? (blog, LinkedIn, newsletter, book, video script)
7b. Tone of voice and target audience?
8b. Is there an established SEO, branding, or style guideline?
9b. What is the workflow? (briefing → draft → review → publish)
10b. Which skills would help? (e.g., "tone of voice", "article structure", "SEO checklist", "fact-checking")
```

### If RESEARCH / ACADEMIC

```text
6c. What is the discipline and central research question?
7c. What methodology? (qualitative, quantitative, experimental, review)
8c. What artifacts will be produced? (paper, dataset, analysis code, slides)
9c. What conventions/norms? (APA, MLA, Chicago; citation format)
10c. Which skills? (e.g., "methodology", "data collection", "statistical analysis", "academic writing")
```

### If BUSINESS / MANAGEMENT

```text
6d. What is the goal? (strategic planning, OKRs, reports, market analysis)
7d. What are the expected artifacts? (deck, report, spreadsheet, BSC)
8d. Who are the stakeholders and what is their technical level?
9d. Are there adopted frameworks? (OKR, BSC, lean canvas, SWOT)
10d. Which skills? (e.g., "executive report structure", "SWOT analysis", "tone for board")
```

### If LEGAL / COMPLIANCE

```text
6e. What jurisdiction and area? (labor, tax, GDPR/LGPD, contractual)
7e. What artifacts? (contracts, legal opinions, DPIA, policies)
8e. Are there official templates to follow?
9e. What critical risks to avoid?
10e. Which skills? (e.g., "contract drafting", "clause analysis", "compliance checklist")
```

### If EDUCATIONAL

```text
6f. What is the target audience and level?
7f. What artifacts? (course, lesson plan, instructional material, assessment)
8f. Is there a pedagogical methodology? (PBL, Bloom, flipped classroom)
9f. Which skills? (e.g., "instructional design", "assessment design", "language for level X")
```

### If OTHER

Apply principles from [UNIVERSAL-MAP.md](UNIVERSAL-MAP.md) and adapt. Ultimately, every activity has:

- Knowledge domains (→ skills)
- Quality standards (→ rules)
- Final artifacts (→ templates)
- Continuity between sessions (→ memory)

---

## Block 3 — Quality Calibration

```text
13. Is this a proof-of-concept, MVP, or production?
14. What level of validation is acceptable? (vibe-check, human review, automated gates, all)
15. Is there a history of problems the framework should prevent? (e.g., "we lose context whenever the dev changes", "AI responses diverge between IDEs")
```

---

## Block 4 — Collaboration & Governance

Apply whenever the project uses version control or any task tracker (most projects). Skip individual questions that visibly don't apply (e.g., solo project with no PR flow).

```text
16. Task / project management tool? (Jira, Linear, GitHub Projects, Trello, Asana, ClickUp, Notion, none)
    - If applicable: board / project ID and ticket prefix (e.g., PROJ-123, ENG-456)
    - Workflow states used (To Do → In Progress → Review → Done) or custom?
    - Where to find the board (URL or MCP reference)?

17. Commit message standard?
    - Convention: Conventional Commits (feat:, fix:, chore:, ...), Gitmoji, free-form, other
    - Ticket ID required in subject or trailer? Format example?
    - Sign-off (DCO), GPG signing, or Co-authored-by trailers required?

18. Branch model & naming?
    - Main branch name (main / master / trunk)
    - Naming pattern (feature/, fix/, hotfix/, chore/, release/, <user>/<slug>)
    - Strategy: trunk-based, GitHub Flow, Git Flow, release branches
    - Direct push to main allowed, or PR-only? Branch protection rules?

19. Pull Request rules?
    - PR title format (Conventional, ticket prefix, free)
    - PR template / required sections (summary, test plan, screenshots, rollback)
    - Minimum approvals, CODEOWNERS, required CI checks
    - Merge strategy: squash, merge commit, rebase-and-merge
    - Auto-delete branch after merge? Linear history enforced?

20. Task / story creation standards?
    - Required fields (description, AC, story points, epic, labels, components)
    - Definition of Ready / Definition of Done templates?
    - Estimation system (story points, t-shirt sizes, hours, none)?

21. Release & versioning?
    - Versioning scheme (SemVer, CalVer, none)
    - Changelog (Keep a Changelog, auto-generated from commits, none)
    - Release cadence (continuous, sprint, scheduled)
```

### Sub-block 4B — Validation & Enforcement

After capturing the governance answers above, ask how the user wants to **enforce** them. This drives Phase 3 harness decisions.

```text
22. How should commit messages be validated?
    - Automated (commitlint, husky pre-commit hook, CI check) or manual review?
    - Should the AI agent enforce the format before committing? (yes / no / ask first)

23. How should PRs be validated before merge?
    - Code review tools: GitHub Copilot Code Review, manual review, both?
    - Required CI checks: build, tests, lint, type-check, security scan?
    - Should the AI agent create a PR template (.github/PULL_REQUEST_TEMPLATE.md)?
    - Custom PR checklist items? (e.g., "update docs", "add migration", "notify team")

24. What formatting / linting enforcement do you prefer?
    - Auto-format on save via hooks (PostToolUse)? Which formatter?
    - Lint check before commit (pre-commit hook)? Which linter?
    - CI-level enforcement only (no local hooks)?

25. Are there project-specific rules the AI should always follow?
    - Examples: "never modify database migrations", "always run seed after schema change",
      "never deploy without changelog entry", "always update API docs on endpoint change"
    - These become constitutional rules or custom rules in .ai/rules/
```

The answers to 22-25 determine:

| Answer | Phase 3 artifact |
| ------ | ---------------- |
| commitlint / husky | Hook: `PreToolUse` commit validation script |
| Copilot Code Review | `.ai/instructions/*.instructions.md` + symlink |
| PR template | `.github/PULL_REQUEST_TEMPLATE.md` scaffolded |
| Auto-format | Hook: `PostToolUse` format-file.sh |
| Custom rules | `.ai/rules/` entries with appropriate `applyTo` |

If the project does not use git or any tracker (rare — usually a solo content or research draft), skip this block entirely and note it in the Project Profile.
