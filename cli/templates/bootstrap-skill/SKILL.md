---
name: axis-bootstrap
version: 1.0.0
description: Bootstrap any project — software or non-technical — with a complete Spec + Harness + Continuity structure for AI-augmented work. Harness-first: permissions, hooks, and symlinks are configured before prompt optimization. Use when starting a new project from scratch, when adopting AI-augmented workflows in an existing project, when migrating from a monolithic CLAUDE.md to a structured framework, or when auditing a project for missing AI infrastructure. Also handles quick-start path (5 minutes). Trigger terms: bootstrap, initialize project, AI setup, .ai structure, CLAUDE.md, AGENTS.md, multi-IDE, skills, harness, spec-driven, progressive disclosure, axis, axis-bootstrap, failure attribution, ACE, continuity playbook, discoverer sub-agents.
---

# AXIS Bootstrap

Executable spec for bootstrapping projects with complete AI infrastructure. Orchestrates the creation of three layers (Spec, Harness, Continuity) in sequential phases with explicit gates. **Harness is the priority — not the prompt.**

## When to Use

- New project — wants solid AI-collaboration foundation
- Existing project without structured `.ai/`, or migration from monolithic `CLAUDE.md`
- Auditing gaps in Spec/Harness/Memory; standardizing multiple projects
- Quick start: 5-minute path (see `references/QUICKSTART.md`)

## Summary Flow

| Phase | Focus | Exit Gate |
| ----- | ----- | --------- |
| **1 — Discovery** | Interview + 5 parallel discoverers | Project profile confirmed by user |
| **1.5 — SPDD Pipeline** *(optional)* | `story-decompose` → `alignment` → `abstraction-first` produce REASONSTC Canvas | All 9 dimensions (R/E/A/S₁/C/O/T/N/S₂) filled and confirmed |
| **1.8 — Adversarial Challenge** | 3 parallel challengers (security, simplicity, scope) critique the Canvas | CRÍTICOs resolved or explicitly accepted; user confirms Canvas final |
| **2 — Spec Layer** | Generate INSTRUCTIONS, skills, rules, docs | `.ai/` structure populated and validated |
| **3 — Harness Layer** | Configure settings, hooks, failure attribution, symlinks | Permissions and automation in effect |
| **3.5 — Self-Maintenance Kit** | Install documentation-guardian + 3 rules + 2 hooks + 2 scripts | `bash scripts/audit-docs.sh` — 3 cold-start trials pass |
| **4 — Continuity Layer** | Create STATE (playbook), CONVENTIONS | Curated continuity playbook ready for first session |
| **4.5 — Specialist Transformation** | Discoverer reports → 3-4 persistent project-bound agents | Embedded knowledge tables confirmed by user |
| **5 — Validation** | Quality gates, k-trial smoke test, handoff | Bootstrap delivered |
| **6 — Iterative Review** *(per feature, post-bootstrap)* | `iterative-review` keeps Canvas ⇄ code in sync | Diff scoped, ACs green, STATE updated |

Detailed orchestration in [PLANNER.md](PLANNER.md). Final output contract in [PROMPT-TEMPLATE.md](PROMPT-TEMPLATE.md).

## Execution Principles

1. **Harness before prompts** — settings.json and hooks take precedence
2. **Do not skip phases** — each depends on validation of the previous one
3. **Do not fabricate** — if information is missing, ask (Knowledge Verification Chain)
4. **Confirm before generating** — show the phase plan, wait for approval
5. **Use templates** — do not invent formats; they live in `references/TEMPLATES.md`

## References

- [PLANNER.md](PLANNER.md) · [PROMPT-TEMPLATE.md](PROMPT-TEMPLATE.md) · [QUICKSTART.md](references/QUICKSTART.md)
- [PHASE-1-DISCOVERY.md](references/PHASE-1-DISCOVERY.md) · [agents/discoverers/](agents/discoverers/) · [challengers/](../../agents/challengers/)
- [PHASE-2-SPEC.md](references/PHASE-2-SPEC.md) · [PHASE-3-HARNESS.md](references/PHASE-3-HARNESS.md)
- [PHASE-3-5-SELF-MAINTENANCE.md](references/PHASE-3-5-SELF-MAINTENANCE.md) — self-maintenance kit
- [PHASE-4-CONTINUITY.md](references/PHASE-4-CONTINUITY.md) · [PHASE-4-5-SPECIALIST.md](references/PHASE-4-5-SPECIALIST.md) · [specialists/](../../agents/specialists/)
- [PHASE-5-VALIDATION.md](references/PHASE-5-VALIDATION.md) · [PHASE-6-EXAMPLE.md](references/PHASE-6-EXAMPLE.md)
- [TEMPLATES.md](references/TEMPLATES.md) · [PATTERNS.md](references/PATTERNS.md) · [CANVAS-REASONS.md](references/CANVAS-REASONS.md) · [UNIVERSAL-MAP.md](references/UNIVERSAL-MAP.md)

## Final Validation (summary)

`.ai/` populated · INSTRUCTIONS 100-180 lines · SKILL.md ≤ 60 · `settings.json` versioned · symlinks resolve · `STATE.md` curated · handoff delivered. Full checklist in [references/PHASE-5-VALIDATION.md](references/PHASE-5-VALIDATION.md).
