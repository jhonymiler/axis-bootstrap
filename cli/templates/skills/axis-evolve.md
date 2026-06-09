---
name: axis-evolve
type: process
description: Retrospective harness optimization — improves the project's own rules/hooks by
  mining objective signal from past work (telemetry, repeated failures, git history), not the
  model's self-opinion. Use after a feature, on "retro", "improve the harness", "what keeps
  going wrong", or periodically. One-shot and zero-runtime: it reads logs and proposes edits
  the agent applies. Trigger terms: retro, evolve harness, self-improve, postmortem, RHO.
---

# Axis Evolve

The closed learning loop. Inspired by RHO (Retrospective Harness Optimization,
arXiv:2606.05922): an agent improves the system around it by analyzing its own past work —
**without an external answer key, and without trusting its own preference.** The guard is
*objective recurrence*, not self-judgment (a model grading its own proposal just confirms its
own bias).

## Signal Sources (read-only)

- `.ai/telemetry.jsonl` — `action:destructive`, `spec:edit`, `hook:fired`, `confidence:uncertain`.
- `.ai/docs/STATE.md` — Lessons Learned, Blockers (recurring ones).
- `git log`/`git diff` — files repeatedly re-edited; reverts; fixes of fixes.

## Procedure

1. **Coreset.** Pick a small, *diverse* set of the hardest/most recurring issues — not just
   the single most frequent (that overfits one failure mode).
2. **Diagnose the class** of each: false assumption, wrong tool, premature stop, stale memory.
3. **Objective improvement guard (the core rule).** Only propose to crystallize a fix when the
   failure class **recurred ≥2 times** in the signal above. One-off mistakes do not earn a
   permanent rule. If the signal is empty/sparse, say so and stop — do not invent rules.
4. **Propose, do not auto-apply.** Show 1–3 candidate harness edits (rule / hook / deny-list /
   validator). For each, name the exact file and the measurable failure it removes.
5. **Persist via `axis-remember`** for accepted candidates. Re-run `validate-axis.sh` (and
   `axis doctor` if available) to confirm nothing regressed.
6. **Record** the round as a dated Active Decision in `STATE.md`.

## Anti-patterns

- Crystallizing a rule from a single occurrence (no recurrence → no rule).
- Trusting the model's preference between two candidates over measured signal.
- Adding a rule when a hook/`permissions.deny` would enforce it deterministically instead.

## Final Validation

- [ ] Every proposed rule traces to ≥2 real signals (cite them).
- [ ] Accepted rules persisted via `axis-remember`; `validate-axis.sh` still green.
- [ ] STATE.md has a dated note of what changed and why.
