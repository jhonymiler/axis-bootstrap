---
name: axis-remember
type: process
description: Crystallizes a recurring mistake into a permanent, always-on rule so the
  whole class of error stops happening — the Harness-Engineering habit (Hashimoto). Use
  right after fixing a mistake the agent already made before, or when the user says "remember
  this", "don't do that again", "add a rule". Appends to .ai/rules/learned.md, which IDEs
  auto-load. Trigger terms: remember, learn from this, add a rule, never again, postmortem.
---

# Axis Remember

Turn one mistake into a rule the harness enforces forever. Cheap, zero-runtime: it is a
disciplined edit to an always-on rule file, not a tool.

## When to Use

- An error the agent (or a teammate) has hit **before** just recurred.
- A code review / postmortem surfaced a preventable class of failure.
- `axis-evolve` identified a recurring failure class and asks to persist it.

## Procedure

1. **Name the class, not the instance.** One sentence: the general error, not this case.
2. **Pick the layer that actually prevents it** (do not default to a rule):
   - behavior the agent must follow → append to `.ai/rules/learned.md` (this skill's default);
   - a stack-specific gate → the project's constitutional rule file;
   - a dangerous command → a `permissions.deny` entry in `settings.json` (declarative block)
     + a pattern in `.ai/hooks/pre-bash-guard.sh` (telemetry);
   - a missing check → strengthen a hook or `validate-axis.sh`.
3. **Append the rule** to `.ai/rules/learned.md` (create with an `# Learned Rules` header if
   absent). Format: `- (YYYY-MM-DD) <imperative rule>. _Why:_ <the mistake it prevents>.`
4. **Keep it grep-verifiable when possible** — a rule a hook or validator can check beats prose.
5. **Log it:** `bash .ai/hooks/_lib.sh` is sourced by hooks; emit `rule:learned` via the
   session's telemetry by running the action through a hook, or note it in `STATE.md` Lessons.

## Final Validation

- [ ] The rule names a *class* of error, with a dated `_Why:_`.
- [ ] It lives in the layer that enforces it, not just the nearest file.
- [ ] `learned.md` stays append-only and curated — fold duplicates instead of stacking them.
