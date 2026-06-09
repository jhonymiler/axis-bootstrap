# Debate Agents

Use this folder to run short, parallel debates about architecture tensions.

## Why this exists

Parallel debate is useful when a decision has competing goals, for example:

- delivery speed vs long-term maintainability
- feature scope vs operational safety
- product flexibility vs implementation simplicity

Each debate should be temporary and tied to one decision.

## Lifecycle

1. Create a debate pack for a tension slug.
2. Run 3 role agents in parallel and collect positions.
3. Decide with a short ADR or note in STATE.
4. Remove the debate pack when the decision is closed.

## Commands

```bash
# Create files for a new tension
bash scripts/manage-debate-agents.sh create <slug>

# Show active tensions
bash scripts/manage-debate-agents.sh list

# Remove a finished tension
bash scripts/manage-debate-agents.sh remove <slug>
```

## Suggested runtime pattern

1. Start three subagents in parallel from the generated files:
   - risk-challenger
   - scope-guardian
   - simplicity-advocate
2. Ask each one to return:
   - strongest argument
   - strongest counterargument
   - decision guardrail
3. Moderator merges the output into one recommendation.
