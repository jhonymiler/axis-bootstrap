---
applyTo: "**"
trigger: always
description: "Session start protocol: read STATE.md before any substantive action to avoid rework from ignored prior decisions"
alwaysApply: true
---

# Session Start Protocol

> Always-on ritual for the **first substantive action** of any session in a project. Pairs with `context-economy.md` (budget) and `knowledge-verification.md` (trust). The cost is one read; the payoff is avoiding rework caused by ignored prior decisions.

## When This Applies

- First user request in a fresh chat/session that requires reading or writing code, specs, or memory.
- After a long interruption (>30 min idle) where you may have lost local context.

**Does NOT apply to:**
- Trivial Q&A that does not touch the project (general syntax, math).
- Direct continuations within the same active turn loop.

## The Protocol (≤ 2 reads, ≤ 30 seconds)

1. **Read the hot tier of `STATE.md`** — sections `Active Decisions`, `In Progress`, `Blockers`. Equivalent shortcut: `axis state hot` (CLI) or rely on the `SessionStart` hook output.
2. **Skim `INSTRUCTIONS.md` Conventions + Available Skills** — only if you have not loaded it this session.

That is it. Do **not** read the **warm tier** (`Lessons Learned`, `Deferred Ideas`, `TODOs`) or the **cold tier** (`.ai/docs/archive/STATE-YYYY-MM.md`) proactively — load on demand when a related task surfaces. See the `Memory Tiers` table at the top of STATE.md.

## Explicit Acknowledgement

Before the first tool call that modifies anything, state in one line:

> *"State checked: <N> active decisions, <M> in-progress items, <K> blockers. Relevant to this request: <…> or none."*

This single line is the audit trail that the protocol ran. Skipping it = skipping the protocol.

## When STATE.md Does Not Exist

- New project / first session ever: skip the read, but **propose creating STATE.md** as part of the first deliverable (or trigger `axis-bootstrap` if no `.ai/` structure exists at all).
- File exists but is empty: same as not existing — propose seeding it with the current request's decision.

## Anti-patterns

- **Silent skip.** Acting without reading STATE because "I'll figure it out from the code". The cost of one read is < the cost of contradicting an Active Decision.
- **Full re-read every turn.** STATE is for *session start*, not every turn. Cite the start-of-session read in later turns.
- **Loading the whole memory tier.** Lessons/Patterns/Archive are warm/cold — load only when triggered by a related task.
- **Reading STATE then ignoring it.** If an Active Decision conflicts with the user's request, surface the conflict *before* executing.

## How It's Working

Working correctly when:
- Cross-session regressions disappear (decisions stay decided)
- "In Progress" items resume cleanly instead of starting over
- Conflicts between user request and Active Decisions are raised in the first response, not after a wrong commit
