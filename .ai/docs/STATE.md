# STATE — AXIS Framework Playbook

## Continuity Structure
- **Hot:** Active Decisions, In Progress, Blockers (auto-loaded at session start, ≤80 lines)
- **Warm:** Deferred Ideas, Lessons Learned, TODOs (loaded on demand)
- **Cold:** historical archives in `.ai/docs/archive/STATE-YYYY-MM.md` (never loaded by default)

## Active Decisions

- **2026-06-09 — Agents are a first-class fan-out artifact (CLI v2.3.0):** `.ai/agents/` is the single source for sub-agent *definitions* only (challengers, specialists, debates) — symlinked to `.claude/agents/` (Claude scans it **recursively**; any non-agent `.md` would register as a bogus sub-agent, so the old `AGENTS.md`/`skills`/`rules` symlinks were removed from it). Discoverers stay transient in the `axis-bootstrap` bundle. `axis init` now installs all 8 permanent skills (was: only `axis-bootstrap`). Debate packs get slug-qualified frontmatter. Cursor/Copilot have no native sub-agent registry → no agents dir (intentional).
- **2026-06-09 — Retrospective loop added (branch `feat/retro-loop`):** closed learning loop, all skill/hook (zero-runtime). (1) `pre-bash-guard.sh` PreToolUse hook — **non-blocking**, logs `action:destructive` to telemetry; real blocking stays declarative in `permissions.deny`. (2) Skill `axis-remember` — crystallizes a recurring mistake into `.ai/rules/learned.md`. (3) Skill `axis-evolve` — RHO (arXiv:2606.05922) with an **objective guard**: a rule is only proposed when a failure class recurs ≥2× in telemetry/STATE/git, never by model self-preference. Mesa debate verdict: mesa-as-parallel rejected (challengers already cover it); guard.py runtime rejected (violates one-shot).
- **2026-06-09 — Size gate is token-based:** `validate-axis.sh` now budgets by tokens (chars/4, ≤2600 INSTRUCTIONS / ≤1200 SKILL), matching `axis doctor`. Lines were a frail proxy. INSTRUCTIONS trimmed (redundant Workflow detail folded) to stay under budget while adding 2 skill rows.
- **2026-05-26 — Core architecture renamed:** the three pillars are **Spec + Harness + Continuity** (previously "Memory"). Avoids vector-store/embedding expectations; aligns name with reality. See `FRAMEWORK.md`.
- **2026-05-26 — AXIS is one-shot, skill-driven only:** the CLI scaffolds, the agent runs everything via Read/Write/Bash/git from installed skills. **No runtime `axis <command>` dependency** in bootstrapped projects. Applies to delta, specify, rebootstrap, config, challengers — all skills, no CLI surface. See `docs/comparison.md` "What we deliberately did not copy".
- **2026-05-26 — Two-tier sub-agents:** Phase 1 dispatches 5 Discoverers in parallel; Phase 4.5 transforms them into 3-4 project-bound Specialists. Implemented in F8A/B.
- **2026-05-26 — Phase 1.8 adversarial challenge (F13):** after Canvas (1.5) and before Spec Layer (2), 3 challengers (security / simplicity / scope) critique in parallel with CRÍTICO/ALERTA/APROVEI output. Recurring per feature post-bootstrap.
- **2026-05-26 — Canvas is REASONSTC (F11):** 9 dimensions — added **C** (Contracts: typed interfaces with pre/post) and **T** (Test Scenarios: G/W/T with ≥1 happy + ≥1 failure + ≥1 edge case per story).
- **2026-05-26 — Constitutional rules per stack (F10):** 4 files (node/python/go/generic) with 5 grep-verifiable gates each; PreToolUse hook surfaces them before every Write/Edit.
- **2026-05-26 — `axis.config.json` is agent-read (F14):** workflow policy file at project root, consumed by the agent at session start. No `axis doctor` validation; defaults apply if file missing.
- **Skill routing matrix:** `INSTRUCTIONS.md` defines when to load or avoid each skill. Always-on rules: engineering-discipline, context-economy, knowledge-verification, session-start.
- **Quality gates enforced by harness:** `validate-axis.sh` checks file sizes + live⇄CLI sync + symlink integrity + drift across all skill bundles (axis-bootstrap, axis-rebootstrap, axis-delta, axis-specify, challengers).
- **Release-driven CLI publishing:** npm publishing only via GitHub Releases (`cli-vX.Y.Z`).
- **Recursiveness is mandatory:** the repository itself must obey every framework rule.

## In Progress

_(nothing — ROADMAP closed 2026-05-26)_

## Blockers

_(none)_

## Deferred Ideas

- Advanced telemetry consumer (Sprint 4 / F5.3)
- Bilingual README synchronization check
- Monorepo/polyglot `.ai/packages/<name>/` (F7.1)
- Multi-IDE hooks abstraction (F7.2)

## Lessons Learned

- **Squash-merge sibling PRs in dependency order.** Rename-first reduces conflicts.
- **Working-tree leakage between branches is common.** `git checkout -- .` to discard before switching saves debugging time.
- **Templates intentionally diverge from live spec.** `sync-cli-templates.sh` mirrors only `.ai/skills/`, `.ai/rules/`, `.ai/hooks/` — top-level templates (`STATE.md`, `INSTRUCTIONS.md`) are parametrized stubs.
- **Comparative-analysis roadmaps must be checked against the "one-shot" rule before implementation.** The original F9/F12 examples used `axis spdd delta` / `axis specify` commands — would have introduced permanent runtime CLI dependency. Corrected in the ROADMAP before any code landed. See `docs/comparison.md` "What we deliberately did not copy".
- **Branch-of-branch creates squash-merge conflicts.** When merging two stacked branches into main via squash, do the second's squash _after_ the first is committed; expect conflicts on files both branches added/modified, resolve in favour of the descendant branch.

## TODOs

- Bump CLI version (MINOR — F10/F11/F13/F14 are additive, no breaking changes; F9/F12 add new skills); draft GitHub Release notes mentioning REASONSTC + constitutional rules + adversarial + axis.config.json + public docs
- Enable GitHub Pages from `/docs` (3-click UI step, documented in `docs/README.md`)
- Backfill `.github/copilot-instructions.md` skill table with `axis-delta` and `axis-specify` (mentioned in F9 acceptance criteria; deferred)
