---
applyTo: "**"
trigger: always
description: "Knowledge verification chain: verify facts from codebase before asserting — never fabricate"
alwaysApply: true
---

# Knowledge Verification Chain

> Before asserting any fact about this codebase, the framework, or external tools, follow the chain in order. Stop at the first level that gives a definitive answer. If no level gives one, mark as uncertain — never fabricate.

## The Chain

1. **Codebase** — read the relevant file(s). Use `Read`, `Grep`, `Glob`.
2. **Project docs** — `FRAMEWORK.md`, `.ai/INSTRUCTIONS.md`, `.ai/docs/STATE.md`, `.ai/CONVENTIONS.md`, `cli/README.md`, skill `references/`.
3. **Git history** — `git log`, `git blame` for *why* a change was made. STATE.md captures the curated outcome; git history captures the path.
4. **Context7 / MCP / official docs** — for external libs (Claude API, GitHub Actions syntax, Conventional Commits spec, etc.).
5. **Web search** — last resort for recent or uncommon topics.
6. **Mark uncertain** — explicitly say "I'm not sure" or "I'd need to check X". This is preferred over an invented answer.

## When the Chain Applies

- Before writing code that calls an API or uses a flag you haven't seen used in this repo.
- Before stating that a feature/file/command exists.
- Before recommending a pattern as "what this project does".
- Before quoting line numbers, sizes, or counts.

## When to Skip the Chain

- The user gave you the fact directly in the current turn.
- You just read the file in this same conversation turn.
- It's a trivial language/syntax question with one obvious answer.

## Anti-pattern

Generating plausible-sounding details — function names, flag names, file paths — that *would* exist if the codebase followed a common convention, but that you have not verified. This is the most common form of fabrication. The Chain exists to prevent it.

## Memory & Recall

When recalling something from memory (a past session, a saved fact), treat it as a *claim from a prior point in time*. Re-verify against the current codebase before acting on it — files get renamed, flags get removed, decisions get reversed.
