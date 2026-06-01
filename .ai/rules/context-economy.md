---
applyTo: "**"
trigger: always
description: "Context economy: token budget discipline, confidence ladder, parallelism rules for efficient tool usage"
alwaysApply: true
---

# Context Economy

> How the agent spends tokens, tool calls, and reads. Always-on. Pairs with `knowledge-verification.md` (what to trust) and `engineering-discipline.md` (what to do). This rule governs *how much context to gather* before acting.

## The Core Tradeoff

Re-reading is cheap once; re-reading every turn is expensive forever. Under-reading creates fabrication; over-reading wastes the context window and slows the loop. The discipline below resolves both failure modes.

## Tool Budget — by Default

| Action type                          |                                        Default budget | Escalate when                                                    |
| ------------------------------------ | ----------------------------------------------------: | ---------------------------------------------------------------- |
| Trivial answer (syntax, single fact) |                                               0 reads | Never escalate; if you need to read, the question wasn't trivial |
| Locate a symbol or pattern           |                                     1 grep + ≤2 reads | First grep returned nothing useful                               |
| Understand a module's behavior       |                    1 grep + 1 large read (whole file) | File is split across many small files                            |
| Refactor or add feature              | grep + read affected files + read 1 sibling for style | Ambiguity remains after that                                     |
| Cross-cutting change (>4 files)      |                    Delegate exploration to a subagent | Subagent unavailable → manual grep tree                          |

**Stop signals — do not exceed budget without one:**
- The next read will answer a question you cannot already answer.
- A previous read contradicted itself or the user's claim.
- The user explicitly asked for a deeper audit.

## Confidence Ladder

Every claim about the codebase carries one of three confidence levels. **State it explicitly when relevant** — especially before destructive or hard-to-reverse actions.

| Level         | Phrasing                                         | Source                           |
| ------------- | ------------------------------------------------ | -------------------------------- |
| **Verified**  | "I read X at line N" / "I ran Y and got Z"       | This turn's tool output          |
| **Probable**  | "Based on the convention in this repo, …"        | Pattern from ≥2 verified samples |
| **Uncertain** | "I'd need to check …" / "I'm not sure whether …" | Memory, inference, or assumption |

Never present *Uncertain* as *Verified*. This is the most common form of agent fabrication (see [knowledge-verification.md](knowledge-verification.md) → Anti-pattern).

## Parallelism Rules

- **Parallel reads** when the calls are independent (different files, different searches with no dependency on each other's output).
- **Sequential reads** when one tool's output determines the next call's parameters.
- **Subagent** for open-ended exploration ("find everywhere we use X across the repo"). The subagent absorbs its own search cost; the parent agent receives a summary.

## Anti-patterns

- **Over-search.** Three greps that return overlapping hits = enough context. Stop.
- **Re-read amnesia.** A file you read this turn does not need to be re-read this turn. Cite the previous read.
- **Speculative read.** Reading a file "in case it's relevant" without a hypothesis. State the hypothesis or skip the read.
- **Confidence inflation.** Saying "the function does X" when you actually mean "I'd expect it to do X based on the name."
- **Sub-agent abuse.** Delegating a one-grep question to a sub-agent because it feels thorough. Sub-agents are for breadth, not for trivial certainty.

## How It's Working

These rules are operating correctly when:
- Token usage per turn stays roughly flat as the project grows
- The agent says "I'd need to check" *before* it acts on a guess
- Sub-agent invocations come with a clear scope, not a vague "explore the repo"
- Re-runs of the same task touch the same files, not new ones each time
