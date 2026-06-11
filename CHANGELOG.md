# Changelog

All notable changes to the AXIS CLI and the framework spec it ships.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) ·
versioning: [SemVer](https://semver.org/) for the CLI.

---

## [Unreleased]

---

## [2.4.1] — 2026-06-11

### Fixed

- **`validate-axis.sh`** — runs `setup-ide-links.sh` before `validate-ide-links.sh`
  so CI generates `.cursor/rules/*.mdc` (gitignored) before the sync gate.

---

## [2.4.0] — 2026-06-11

> **Theme:** Cursor bootstrap parity — generated `.mdc` rules, local validation gate,
> and integration docs shipped with every Cursor-enabled project.

### Added

- **`scripts/validate-ide-links.sh`** — local gate for IDE symlinks and Cursor
  rule sync (not wired into CI by default).
- **`sync-cursor-rules.sh --check`** — dry-run mode; exits non-zero when
  `.cursor/rules/*.mdc` is stale vs `.ai/rules/*.md`.
- **`cli/templates/docs/cursor.md`** — Cursor integration guide copied to
  bootstrapped projects when Cursor is declared in Phase 1.
- **`cli/templates/agents/README.md`** — subagent role index shipped with
  `axis init`.

### Changed

- Bootstrap Phase 3/5 docs updated: Cursor rules are generated `.mdc` artifacts,
  not symlinks; smoke test uses `validate-ide-links.sh`.
- `CONVENTIONS.md` + `INSTRUCTIONS.md` templates include IDE integration table.
- `setup-ide-links.sh` hints at `validate-ide-links.sh` after install.

---

## [2.3.0] — 2026-06-09

> **Theme:** sub-agents become a first-class, IDE-reflected artifact, and every
> bootstrapped project ships with its full permanent skill set.

### Added

- **Agent fan-out to Claude Code** — `.ai/agents/` is now the single source of
  truth for sub-agent definitions (challengers, specialists, debates), symlinked
  to `.claude/agents/` (Claude's native, recursively-scanned registry) and
  `.agents/`. Mirrors how `skills` and `rules` already fan out.
- **Permanent skills installed at `axis init`** — `alignment`, `abstraction-first`,
  `story-decompose`, `iterative-review`, `axis-remember`, `axis-evolve`,
  `axis-delta`, `axis-specify` are now copied into every bootstrapped project
  (previously only `axis-bootstrap` shipped, leaving PLANNER links broken).
- **Debate sub-agents carry valid frontmatter** — `manage-debate-agents.sh`
  emits slug-qualified `name:`/`description:`/`tools:` so each role registers as
  a unique Claude sub-agent.

### Changed

- **`.ai/agents/` holds only agent definitions** — the `AGENTS.md`/`skills`/`rules`
  symlinks were removed from it; Claude scans the dir recursively and would
  otherwise register every `SKILL.md` as a bogus sub-agent. The open-standard
  entry point remains the root `AGENTS.md → .ai/INSTRUCTIONS.md`.
- **`challengers/` + `specialists/` moved** out of the `axis-bootstrap` bundle
  into `.ai/agents/` (persistent). **Discoverers stay** in the bundle (transient;
  removed with it at cleanup).
- `sync-cli-templates.sh` mirrors `.ai/agents/`; `validate-axis.sh` checks the
  new drift paths plus the `.claude/agents` symlink.

---

## [2.2.0] — 2026-06-01

> **Theme:** official IDE format support — each IDE gets its native
> configuration format from a single `.ai/` source, plus automated
> bootstrap cleanup and repository validation interview.

### Added

- **Official IDE format generation** — `.ai/rules/*.md` is now the single
  source of truth that generates each IDE's native format:
  - **Cursor**: `.cursor/rules/*.mdc` (Cursor ignores plain `.md`)
  - **Claude Code**: `.claude/rules/*.md` + `settings.json` with 25+ hook events
  - **GitHub Copilot**: `.github/instructions/*.instructions.md` (4000 char limit)
  - **Windsurf / Codex**: `AGENTS.md` (open standard)
- **`scripts/sync-cursor-rules.sh`** — converts `.ai/rules/*.md` →
  `.cursor/rules/*.mdc` with frontmatter mapping (`trigger: always` →
  `alwaysApply: true`, `applyTo` → `globs`).
- **`scripts/validate-commit-msg.sh`** — Conventional Commits format
  validation hook, wired as PreToolUse in Claude Code settings.json.
- **`.github/PULL_REQUEST_TEMPLATE.md`** — scaffolded PR template with
  Summary, Changes, Test Plan, Screenshots, Rollback, and Checklist.
- **Phase 1 Block 4B — Validation & Enforcement** (Q22–Q25) — bootstrap
  interview now asks how the user wants to validate commits, PRs,
  formatting/linting, and custom project rules.
- **Phase 5 Step 5.5 — Auto-Cleanup** — bootstrap skill is automatically
  removed after validation passes. No manual `axis cleanup` needed.
- **Universal frontmatter** — all `.ai/rules/*.md` files now include
  `description` + `alwaysApply` fields for Cursor compatibility alongside
  existing `applyTo` + `trigger` for Claude Code.
- **`settings.json` template** — enhanced with `SessionStart`, `Stop` hooks,
  `if` field for granular control (e.g., `Bash(git commit *)`).
- **Landing page** — updated IDE section to show official formats per IDE,
  terminal simulation reflects new harness phase + auto-cleanup.

### Changed

- **`setup-ide-links.sh`** — Cursor section now generates `.mdc` files via
  `sync-cursor-rules.sh` instead of symlinking `.md` (which Cursor ignores).
- **`init.js`** — copies `validate-commit-msg.sh` + `PULL_REQUEST_TEMPLATE.md`
  during quick/preset bootstrap; auto-cleanup messaging replaces manual hint.
- **`i18n.js`** — added `aiCleanupAuto` string (EN + PT).
- **Phase 3 (PHASE-3-HARNESS.md)** — rewritten IDE-Specific Harness section
  with capabilities table and per-IDE configuration steps (4.1–4.6).
- **Phase 5 (PHASE-5-VALIDATION.md)** — added checklist items for PR template,
  commit validation script, and Copilot instructions files.
- **TEMPLATES.md** — added PR template, commit validation script, and updated
  IDE Capability Reference table with official documentation insights.

### Migration notes

- **No breaking changes.** Existing bootstrapped projects continue to work.
- Run `bash scripts/sync-cursor-rules.sh` in existing projects to generate
  `.mdc` rules for Cursor (previously ignored `.md` symlinks).
- The `.mdc` files are gitignored (generated artifacts).

---

## [2.1.0] — 2026-05-26

> **Theme:** close the comparative gaps identified vs GitHub Spec Kit,
> OpenSpec, and BMAD — all delivered as **skills** or agent-consumed
> configuration, keeping the "AXIS is one-shot, no runtime CLI dependency"
> architectural promise.

### Added

- **`axis-delta` skill (F9)** — brownfield change specification in the
  ADDED / MODIFIED / REMOVED format (inspired by OpenSpec). Includes
  `references/DELTA-TEMPLATE.md` + `references/ARCHIVE-PROCEDURE.md`.
  Always installed by `axis init`; activates on brownfield triggers.
- **`axis-specify` skill (F12)** — greenfield feature scaffolding that
  creates `.ai/specs/<slug>/{canvas.md,tasks.md}` plus an optional
  `feat/<slug>` branch. Delegates to `axis-delta` on brownfield detection.
  Always installed.
- **Constitutional rules per stack (F10)** — 4 new files under
  `cli/templates/rules/`: `constitutional-{node,python,go,generic}.md`,
  each with 5 grep-verifiable gates. `axis init --preset <name>` copies
  the matching file as `.ai/rules/constitutional.md`. Interactive path
  picks via a free-form stack-string heuristic.
- **PreToolUse constitutional hook (F10)** —
  `cli/templates/hooks/constitutional-check.sh` is wired into
  `.claude/settings.json` to print the active constitution's Article +
  Gate lines before every Write/Edit. Non-blocking; the agent decides
  whether to comply or ask the user for an explicit waiver.
- **Canvas REASONS → REASONSTC (F11)** — 9 dimensions instead of 7:
  - **C** = Contracts (typed interfaces per public component in S₁, with
    mandatory pre + post conditions)
  - **T** = Test Scenarios (G/W/T table, minimum 1 happy + 1 failure
    + 1 edge case per story, every `Then` observable)
  Updated `CANVAS-REASONS.md`, `cli/templates/CANVAS.md`, and
  `PHASE-6-EXAMPLE.md` (worked example now shows a populated C block and
  a 5-row T table).
- **Phase 1.8 Adversarial Challenge (F13)** — 3 read-only challenger
  sub-agents (`security-challenger`, `simplicity-challenger`,
  `scope-challenger`) dispatched in parallel after the Canvas is filled
  and before Spec Layer / code generation. Structured CRÍTICO / ALERTA /
  APROVEI critique, mandatory APROVEI entry, `[UNCERTAIN]` marker
  available. Recurring in the per-feature loop post-bootstrap.
- **`axis.config.json` (F14)** — workflow policy at project root, **read
  by the agent** (no `axis doctor` validation step). Controls phase
  activation, challenger toggles, Canvas dimension list, constitutional
  hook behaviour. Schema in
  `.ai/skills/axis-bootstrap/references/CONFIG-SCHEMA.md`.
- **Public documentation (F15)** — 5 new docs under `docs/`:
  `quickstart.md`, `migrate-from-claude.md`, `brownfield.md`,
  `comparison.md`, `README.md` (index). 531 lines total; ready for
  GitHub Pages with the `/docs` folder source.

### Changed

- **F4C — `axis-rebootstrap` skill marked complete.** The skill bundle
  (5 phase references) already shipped; the only remaining roadmap item
  ("add `axis rebootstrap` as a standalone CLI command") was **cancelled
  by architectural decision** to preserve the "one-shot" promise.
- **`init.js`** — both `quickBootstrap` and `presetBootstrap` now install
  `axis-delta` + `axis-specify` (always) and `axis.config.json` (always).
  Preset map gained a `constitutional` field; interactive path uses
  `constitutionalForStack()` to pick the right file from the stack string.
- **`PLANNER.md`** — Phase 1.5 exit gate references the 9-dimension
  REASONSTC layout (was 7-dimension REASONS — drift from F11);
  Initial State paragraph instructs the agent to read `axis.config.json`
  once per session; Phase 6 recurring cycle is now `1.5 → 1.8 → 6`.
- **`SKILL.md` summary table (axis-bootstrap)** — adds Phase 1.8 row,
  updates Phase 1.5 to REASONSTC, references `agents/challengers/`.
- **`STATE.md`** — Sprint 2 entry removed (was stale; all features
  merged); Active Decisions consolidated; new Lessons added on
  comparative-roadmap discipline and branch-of-branch squash conflicts.

### Internal

- **`scripts/sync-cli-templates.sh`** — stanzas #7 and #8 added for
  `delta-skill` and `specify-skill` bundles. Top-level `axis-bootstrap`
  rsync now also mirrors `agents/challengers/`.
- **`scripts/validate-axis.sh`** — drift checks added for axis-delta,
  axis-specify, the 3 challengers, and `CONFIG-SCHEMA.md`. The success
  message enumerates the new bundles.
- **`cli/templates/INSTRUCTIONS.md` stub** — pre-lists `axis-delta`,
  `axis-specify`, and `documentation-guardian` as always-installed.
- **`presetTargetFiles`** — enumerates the new bundles + `axis.config.json`
  so `--dry-run` / collision detection cover them.
- All 4 validation gates remain green
  (`INSTRUCTIONS.md` 143 lines · each `SKILL.md` ≤ 60 lines · live⇄CLI
  sync clean · root symlinks resolve).

### Cancelled / Not done

- `axis rebootstrap` as a standalone CLI command (F4C tail) — see
  "Changed" section for the architectural reasoning.
- `ROADMAP.md` removed from the repo at v2.1.0 release time — work it
  tracked is now closed; future work belongs in Issues + this CHANGELOG.

### Migration notes

- **No breaking changes.** Existing bootstrapped projects continue to work
  without modification. Run `axis init --rebootstrap` if you want the new
  skills (axis-delta, axis-specify, constitutional rules, challengers,
  axis.config.json) installed in a project bootstrapped on an earlier
  version.
- **`axis.config.json` is optional.** Removing it falls back to defaults
  that mirror current behaviour, so the file is a tuning surface, not a
  prerequisite.

### Acknowledgements

Comparative analysis read 4 frameworks' internal docs end-to-end before
the work started:

- GitHub Spec Kit · `spec-driven.md` (412 lines)
- OpenSpec · `docs/concepts.md` (765 lines)
- BMAD-METHOD · `docs/explanation/project-context.md` + `party-mode.md`

See `docs/comparison.md` for the honest audit.

---

## [2.0.0] — earlier

See `git log v2.0.0` for the v2.0.0 changes (rename Memory → Continuity,
defensive `--preset`, SPDD subcommand consolidation, self-maintenance kit,
5 Discoverer sub-agents + Phase 1 parallel orchestration).
