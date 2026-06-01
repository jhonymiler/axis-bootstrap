---
applyTo: "**"
trigger: always
description: "Engineering discipline: think before coding, minimum viable change, surgical edits, verifiable completion"
alwaysApply: true
---

# Engineering Discipline

> Always-on behavior for any code-touching action. Complements the invokable skills (`alignment`, `abstraction-first`, `iterative-review`) — those define *workflows*; this defines the *baseline*. Bias is toward caution over speed; for trivial edits (typos, obvious one-liners), use judgment.

## 1. Think Before Coding

Don't assume. Don't hide confusion. Surface tradeoffs.

- **State assumptions explicitly.** If uncertain, ask — do not guess.
- **Present multiple interpretations** when ambiguity exists. Do not silently pick one.
- **Push back** when a simpler approach is visible. Naming the alternative is not insubordination — it is signal.
- **Stop when confused.** Name what is unclear and ask. A blocked turn is cheaper than a wrong commit.

The Knowledge Verification Chain ([knowledge-verification.md](knowledge-verification.md)) is the *how*; this principle is the *when*.

## 2. Minimum Viable Change

The smallest code that satisfies the explicit request. Nothing speculative.

- **No features beyond what was asked.** "Might be useful later" = no.
- **No abstractions for single-use code.** One call site → inline it.
- **No flexibility, configurability, or hooks** that were not requested.
- **No error handling for impossible scenarios.** Validate at system boundaries only.
- **No comments, docstrings, or type annotations on code you did not change.**
- If 200 lines could be 50, rewrite. Senior-engineer test: "would they call this overcomplicated?" — if yes, simplify.

## 3. Surgical Edits

Touch only what the request demands. Clean up only what your own change made dirty.

- Do not "improve" adjacent code, comments, or formatting.
- Do not refactor things that work. Match existing style even if you prefer a different one.
- Pre-existing dead code: **mention it, do not delete it** unless asked.
- Imports/variables/functions your change orphaned: remove them.
- **Diff test:** every changed line must trace directly to the user's request or to cleaning up your own orphan.

This is the *always-on baseline*. The `iterative-review` skill's Track A/B handles the *reactive* version when violations are discovered.

## 4. Verifiable Completion

Transform imperative tasks into declarative goals with verification.

- "Add validation" → "Write tests for invalid inputs; make them pass."
- "Fix the bug" → "Write a test that reproduces it; make it pass."
- "Refactor X" → "Ensure tests pass before and after."

For multi-step work, state a brief plan and a verification per step:

```
1. <Step> → verify: <observable check>
2. <Step> → verify: <observable check>
3. <Step> → verify: <observable check>
```

Strong success criteria let the agent loop independently. Weak criteria ("make it work") force constant clarification rounds.

## How It's Working

These rules are operating correctly when:
- Diffs contain only requested changes — no drive-by refactors
- Clarifying questions arrive *before* implementation, not after rework
- Simple solutions appear on the first attempt, not after rewrites
- Plans precede non-trivial work; verification follows it
