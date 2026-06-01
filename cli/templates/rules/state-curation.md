---
applyTo: "**"
trigger: on-stop
description: "State curation: update STATE.md when decisions, blockers, or progress change during a session"
alwaysApply: false
---

# State Curation

> Fires at session end (Stop hook) to keep `STATE.md` a lean, current playbook — not an append-only diary.

## When a Session Ends

Before closing, answer these three questions:

### 1. Were significant decisions made?

A decision is significant if it affects:
- Architecture or module boundaries
- A business rule or invariant
- A naming convention adopted for >1 future file
- A process the team will repeat

If yes: add an entry to `STATE.md` → **Active Decisions** with today's date and a one-line reason.

### 2. Is work still in progress?

- Update **In Progress** to reflect the actual current state.
- If a task was completed this session, remove its In Progress entry.
- If a new sub-task was started, add it.

### 3. Was a non-obvious lesson learned?

A lesson is non-obvious if someone new to the project would be surprised by it. If yes: add to **Lessons Learned**. Maximum one entry per session to avoid diary creep.

## Curation Gate (≥50 lines changed in session)

If the session involved changes to >50 lines of source code, apply this quick check before stopping:

```
[ ] Active Decisions updated if architectural choices were made
[ ] In Progress reflects what is actually unfinished
[ ] No resolved Blockers left in the Blockers section
[ ] STATE.md is still ≤80 lines (curate if over)
```

## Anti-patterns

- **Append without review:** adding to STATE without checking if older entries are still valid.
- **Diary creep:** logging every small decision. Only log what would matter to a new team member resuming work in 30 days.
- **Stale blockers:** leaving a Blocker entry after the issue was resolved.
