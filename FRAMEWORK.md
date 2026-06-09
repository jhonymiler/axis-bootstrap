# AXIS — Conceptual Model

> Harness-first framework for AI-augmented projects.

This document is the **mental map** of AXIS. For the execution roadmap, see [.ai/skills/axis-bootstrap/SKILL.md](.ai/skills/axis-bootstrap/SKILL.md). For the quick start, see [README.md](README.md).

---

## The Problem It Solves

Teams working with AI agents face three recurring failures:

1. **Divergent documentation** across IDEs — Cursor reads one version, Claude Code reads another, Copilot a third. Within weeks, content is out of sync.
2. **Inconsistent behavior** across sessions and devs — without versioned hooks and permissions, each machine acts differently.
3. **Context loss** between sessions — decisions, blockers, and lessons disappear when a session closes.

The solution combines three concepts normally treated separately: **Harness Engineering**, **Spec-Driven Development**, and **Context Engineering (ACE)**.

---

## Why Harness-First

The literature converged on spec-first (GitHub Spec Kit, Kiro, Tessl). But empirical evidence points to harness as the real bottleneck:

- LangChain moved an agent from outside the top 30 to top 5 on **Terminal Bench 2.0** by changing only the harness — same model ([source: Augment Code](https://www.augmentcode.com/guides/harness-engineering-ai-coding-agents))
- **ReliabilityBench (Jan 2026)** shows that pass@1 overestimates reliability by 20-40%; simpler architectures outperform complex ones under stress ([arxiv 2601.06112](https://arxiv.org/abs/2601.06112))
- Operators report that highly autonomous swarms are fragile, expensive, and impossible to debug in production — the dominant pattern is a single agent with deterministic tool access ([MindStudio](https://www.mindstudio.ai/blog/ai-agent-failure-pattern-recognition))

> **AXIS repositioning:** The Spec describes what the agent knows. The Harness defines how it acts — regardless of what it "decides" in the moment. The Continuity layer makes the system antifragile over time.

---

## The Model: Three Layers

```
┌─────────────────────────────────────────────────────────┐
│  SPEC LAYER ─ The knowledge (WHAT)                      │
│  • INSTRUCTIONS.md  — general context                   │
│  • skills/          — domain knowledge                  │
│  • rules/           — behavior/code rules               │
│  • docs/            — static references                 │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  HARNESS LAYER ─ The infrastructure (HOW the agent acts)│
│  • settings.json    — versioned permissions             │
│  • hooks            — automation (lint, tests, blocks)  │
│  • sub-agents       — delegation and parallelism        │
│  • symlinks         — multi-IDE distribution            │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  CONTINUITY LAYER ─ Session-spanning state (WHAT persists)│
│  • STATE.md         — state, blockers, lessons          │
│  • CONVENTIONS.md   — how to maintain the structure     │
└─────────────────────────────────────────────────────────┘
```

### Why three layers and not two

The **Spec / Harness** separation already exists in the literature (Anthropic, Red Hat, GitHub Spec Kit). The addition of the **Continuity Layer** comes from practical observation reinforced by the paper **ACE — Agentic Context Engineering** ([arxiv 2510.04618](https://arxiv.org/abs/2510.04618)): without it, long-running projects regress with each session. The continuity playbook is not a log — it is an **evolutionary playbook** that accumulates, refines, and curates strategies, preventing collapse with structured incremental updates. "Continuity" here means cross-session state preservation via curated markdown — not technical memory (vector stores, embeddings, ranking).

### How the layers interact

```
  Session start
       │
       ▼
  [Spec] ────► AI loads minimal context (~1,500 tokens)
       │
       ▼
  [Continuity] ► AI reads STATE.md to know where it left off
       │
       ▼
  Work ──► [Harness] applies hooks, permissions, sub-agents
       │
       ▼
  Change ──► Update Spec if pattern changed; update Memory always
       │
       ▼
  Session end ─► STATE.md curated; loop restarts more informed
```

---

## Spec Layer in Detail

### Single Source of Truth

All content lives in `.ai/`. IDE-specific folders (`.claude/`, `.cursor/`, `.github/`, `.agents/`) contain only symlinks. **Divergence is physically impossible.**

```
project/
├── .ai/                          ← SINGLE SOURCE
│   ├── INSTRUCTIONS.md
│   ├── skills/
│   ├── rules/
│   ├── agents/                   ← sub-agent definitions (challengers, specialists, debates)
│   └── docs/
├── CLAUDE.md     → .ai/INSTRUCTIONS.md
├── AGENTS.md     → .ai/INSTRUCTIONS.md
├── .claude/{rules,skills,agents} → ../.ai/{rules,skills,agents}
├── .cursor/{rules,skills}        → ../.ai/{rules,skills}
├── .agents                       → .ai/agents   (agent definitions)
└── .github/
    ├── copilot-instructions.md   → ../.ai/INSTRUCTIONS.md
    ├── instructions/             → ../.ai/rules/
    └── skills/                   → ../.ai/skills/
```

### Progressive Disclosure

Skills load at three distinct moments to minimize tokens:

| Layer | When it loads | Content | Size |
| ----- | ------------- | ------- | ---- |
| **1 — Discovery** | Always (startup) | `name` + `description` from frontmatter | ~3 lines/skill |
| **2 — Index** | When relevant | Full `SKILL.md` | ~40-60 lines |
| **3 — On-demand** | When needed | Specific `references/*.md` | on-demand |

### Static knowledge vs SPDD pipeline

The Spec Layer has two sub-modes that should not be confused:

- **Static knowledge** — `INSTRUCTIONS.md`, `rules/`, `docs/`, skill index. Long-lived, rarely changes per feature.
- **SPDD pipeline (dynamic)** — produces a per-feature **REASONS Canvas** before code is generated. This is where the four AXIS production skills live:

```text
┌────────────────┐   ┌──────────┐   ┌──────────────────┐   ┌──────────┐   ┌──────────────────┐
│ story-decompose│ → │alignment │ → │abstraction-first │ → │ generate │ → │iterative-review  │
│ R              │   │ O+N+S₂   │   │ E + A + S₁       │   │ code     │   │ Canvas ⇄ code    │
└────────────────┘   └──────────┘   └──────────────────┘   └──────────┘   └──────────────────┘
                                                                                  │
                                                                                  ▼
                                                                          STATE.md (memory)
```

The **REASONS Canvas** is a single-page artifact (aligned with [Fowler's SPDD](https://martinfowler.com/articles/structured-prompt-driven)):

- **Abstract:** **R**equirements · **E**ntities · **A**pproach (strategy) · **S₁** System structure
- **Specific:** **O**perations
- **Governance:** **N**orms · **S₂** Safeguards

If a feature doesn't fit one page, re-decompose. Full template in [.ai/skills/axis-bootstrap/references/CANVAS-REASONS.md](.ai/skills/axis-bootstrap/references/CANVAS-REASONS.md).

**Why a pipeline, not a single skill:** each step has a distinct exit gate. Skipping `alignment` produces fast code with wrong intent; skipping `abstraction-first` produces working code with structural drift; skipping `iterative-review` produces patches that diverge from the spec. The pipeline mirrors Anthropic's Planner → Generator → Evaluator separation (Pattern #10).

---

## Harness Layer in Detail

The spec defines what the agent knows. The harness defines how it behaves — regardless of what it "decides" in the moment. **Reliable production depends more on the harness than on the model.**

### Five harness subsystems

1. **Context Harness** — token budget, loading/unloading rules, Progressive Disclosure
2. **Permission Harness** — versioned `settings.json` with allow/deny/ask
3. **Execution Harness** — `PreToolUse`, `PostToolUse`, `Stop` hooks automate validation, formatting, and tests
4. **Orchestration Harness** — sub-agents (Planner, Generator, Evaluator, Explore) for delegation and parallelism
5. **Verification Harness** — quality gates + **failure attribution** (each failure is localized in planning / execution / response, not just recorded as pass/fail)

### Failure Attribution

Inspired by **AgentProp-Bench** ([arxiv 2604.16706](https://arxiv.org/html/2604.16706)) and **ReliabilityBench**, AXIS does not just measure whether the agent passed — it locates where it failed:

| Failure Category | Root Cause | Harness Signal |
| ---------------- | ---------- | -------------- |
| **Planning** | Vague spec, ambiguous goal | PreToolUse hook rejects tasks without acceptance criteria |
| **Execution** | Invalid tool call, denied permission | PostToolUse hook records attempt + context |
| **Response** | Correct output but wrong format | Validation gate in Phase 5 |

### Anthropic's Three-Agent Pattern

Anthropic published (2026) an architecture that separates three responsibilities into distinct sub-agents:

- **Planner** decomposes spec into tasks
- **Generator** implements tasks
- **Evaluator** validates output against spec

This pattern is embedded in AXIS: `PLANNER.md` orchestrates phases, each `PHASE-N.md` generates artifacts, `PHASE-5-VALIDATION.md` validates.

---

## Continuity Layer in Detail

### ACE Principle — Continuity as Playbook

The paper **ACE (Agentic Context Engineering)** ([arxiv 2510.04618](https://arxiv.org/abs/2510.04618)) demonstrated +10.6% on agent benchmarks and +8.6% in finance with an approach that treats context as **evolutionary playbooks** — not as history logs.

**Implication for AXIS:**

- `STATE.md` is not a diary; it is a curated playbook
- Each session **refines** the STATE — removes what became obsolete, elevates what proved useful
- Long specs generate noise; testable and short specs generate reliability

### Two types of continuity, two artifacts

| Type | Artifact | Update |
| ---- | -------- | ------ |
| **Live state (playbook)** | `STATE.md` | Each session — curated, not just appended |
| **Meta** | `CONVENTIONS.md` | When `.ai/` structure changes |

### Session Handoff Protocol

At the end of each session with relevant changes, the agent:
1. Updates `STATE.md` with what was done, what's left, and context that would be lost
2. **Removes** from STATE what is resolved (active curation)
3. At the start of the next session, reads `STATE.md` before anything else

---

## Competitive Positioning

| Framework | Stars (approx.) | Main Angle | Gap vs AXIS |
| --------- | --------------- | ---------- | ----------- |
| **Spec Kit (GitHub)** | ~3k | Spec-first for coding | No harness; no memory; context forgotten between sessions (issue #75: "creates illusion of work") |
| **BMAD-METHOD** | ~8k | Agile AI-driven development | Software-focused; doesn't solve multi-IDE divergence |
| **SuperClaude** | ~2k | Specialized personas for Claude | Claude-specific; no structured continuity layer |
| **LangGraph** | ~45k | Graph-based agent runtime | Runtime, not project infra; framework lock-in; high complexity |
| **CrewAI** | ~28k | Multi-agent role-based | No cross-IDE context management; SQLite3 limits scale |
| **DSPy** | ~22k | Programmatically (not prompting) LLMs | Focused on prompt optimization; not project infra |
| **AXIS** | — | **Harness + Spec + Continuity** | Multi-IDE, stack-agnostic, 3 integrated layers |

**AXIS's unique position:** it is the only structure that simultaneously solves (1) multi-IDE divergence via symlinks, (2) non-deterministic behavior via versioned harness, and (3) session regression via memory as playbook.

---

## Why It Works

### 1. Each layer is independently validatable

- Spec: Does `INSTRUCTIONS.md` have 100-180 lines? Do skills have strong descriptions?
- Harness: Do hooks execute? Do permissions make sense? Do symlinks resolve?
- Continuity: Does `STATE.md` have the required sections? Was it curated?

### 2. The framework is recursive

This repository folder follows **exactly** the pattern it teaches. You can audit it with the framework itself. If you find an inconsistency, it is a bug in the framework — not in the document.

### 3. Universal by design

The Spec layer is purely about knowledge. The Continuity layer is purely about session-spanning state. Only the Harness has optional parts (lint hooks don't make sense in a non-technical project). See [.ai/skills/axis-bootstrap/references/UNIVERSAL-MAP.md](.ai/skills/axis-bootstrap/references/UNIVERSAL-MAP.md).

### 4. Testable spec, not verbose

Spec Kit revealed ([issue #75](https://github.com/github/spec-kit/issues/75)) that long specs create an illusion of work. AXIS enforces explicit limits (INSTRUCTIONS.md ≤ 180 lines, SKILL.md ≤ 60 lines) and gates that verify testability — not length.

---

## Measurable Benefits

| Metric | Before (monolithic CLAUDE.md) | After (AXIS) |
| ------ | ----------------------------- | ------------ |
| Fixed tokens per session | ~8,000-12,000 | ~800-1,500 + on-demand |
| Cross-IDE divergence | common within weeks | impossible (symlinks) |
| Onboarding time | varies by dev | <10 min with `INSTRUCTIONS.md` |
| Behavior across machines | inconsistent | identical (`settings.json` in git) |
| Accidental destructive actions | real risk | blocked by hook |
| Session continuity | manual and fragile | automatic via curated `STATE.md` (Continuity Layer) |
| Failure localization | opaque pass/fail | attributed by layer (planning/exec/response) |

---

## Trade-offs

### Symlinks on Windows

Require administrator permission or Developer Mode. **Mitigation:** document in README; use `mklink /D` or `core.symlinks = true` in Git.

### Initial curve

More concepts than "paste everything into CLAUDE.md". **Mitigation:** the `axis-bootstrap` skill guides through the curve — the user doesn't need to understand everything before starting.

### Overhead on trivial projects

For a 1-2 day solo project, the full structure is over-engineering. **Recommendation — adopt when:**

- 3+ people involved, or
- More than one IDE/agent in use, or
- Project with complex domain (business rules, integrations, compliance), or
- Expected duration >2 weeks

### CI/CD with shallow clone

Pipelines may not resolve symlinks. **Mitigation:** full clone or `core.symlinks = true` in the pipeline.

---

## Where Each Detail Is Documented

| You want to... | Go to |
| -------------- | ----- |
| Understand the overview | this document |
| Quick start | [README.md](README.md) |
| Bootstrap in 5 minutes | [.ai/skills/axis-bootstrap/references/QUICKSTART.md](.ai/skills/axis-bootstrap/references/QUICKSTART.md) |
| Bootstrap a project | [.ai/skills/axis-bootstrap/SKILL.md](.ai/skills/axis-bootstrap/SKILL.md) |
| Learn patterns (PD, KVC, ACE, k-trial) | [.ai/skills/axis-bootstrap/references/PATTERNS.md](.ai/skills/axis-bootstrap/references/PATTERNS.md) |
| See copy-paste templates | [.ai/skills/axis-bootstrap/references/TEMPLATES.md](.ai/skills/axis-bootstrap/references/TEMPLATES.md) |
| Apply to a non-technical project | [.ai/skills/axis-bootstrap/references/UNIVERSAL-MAP.md](.ai/skills/axis-bootstrap/references/UNIVERSAL-MAP.md) |
| Maintain the framework | [.ai/CONVENTIONS.md](.ai/CONVENTIONS.md) |

---

## Conclusion

Documentation for AI is not a luxury — it is infrastructure. But traditional infrastructure (a monolithic file) regresses under scale. **Spec + Harness + Continuity** is the minimal decomposition that survives time, team size, and IDE variety.

The difference between knowing this and having implemented it is `axis-bootstrap` — an executable spec that delivers the complete system in one session, with harness as priority and continuity as playbook.
