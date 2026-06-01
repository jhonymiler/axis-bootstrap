# AXIS — Documentation

> Long-form guides. The short version is in the project [README.md](../README.md);
> the conceptual model is in [FRAMEWORK.md](../FRAMEWORK.md).

## Start here

| Document                                       | For you if…                                              |
| ---------------------------------------------- | -------------------------------------------------------- |
| [Quickstart](quickstart.md)                    | You want a working bootstrap + first Canvas in 10 min    |
| [Migrating from CLAUDE.md](migrate-from-claude.md) | You already have a monolithic AI-instructions file        |
| [Brownfield workflow](brownfield.md)           | You need to change an existing system (delta specs)      |
| [Comparison](comparison.md)                    | You are evaluating AXIS against Spec Kit / OpenSpec / BMAD |

## Reference

The authoritative source for *how* AXIS works lives in the skills themselves:

- [`.ai/skills/axis-bootstrap/`](../.ai/skills/axis-bootstrap/) — PLANNER, phase
  references, agents (discoverers, specialists, challengers), Canvas template
- [`.ai/skills/axis-delta/`](../.ai/skills/axis-delta/) — brownfield change skill
- [`.ai/skills/axis-specify/`](../.ai/skills/axis-specify/) — greenfield feature scaffold
- [`.ai/skills/axis-rebootstrap/`](../.ai/skills/axis-rebootstrap/) — upgrade an existing AXIS install
- [`.ai/rules/`](../.ai/rules/) — always-on rules (session-start, context-economy,
  engineering-discipline, knowledge-verification, constitutional, …)
- [`cli/templates/`](../cli/templates/) — what `axis init` lands in a new project

## Release history

[`CHANGELOG.md`](../CHANGELOG.md) lists what shipped in each version.
The features the comparison page references (F9–F15, F4C) all landed in
CLI v2.2.0.

## Hosting these docs as a site

To enable GitHub Pages on the `docs/` folder:

1. Repo Settings → Pages
2. Source: `Deploy from a branch`
3. Branch: `main` / folder: `/docs`
4. Save

The pages render directly from the markdown above. No additional build step
is required for the current scope. When the docs grow, a static-site
generator (`vitepress`, `astro starlight`) can be added without changing
the source layout.
