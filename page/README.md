# AXIS — Landing Page

Static landing page deployed to GitHub Pages.

## Lifecycle

```
edit page/*.html|css        push to main
        │                       │
        ▼                       ▼
  cli/package.json ───► .github/workflows/deploy-page.yml
   (version source)            │
                               ▼
                    sed `{{VERSION}}` → `2.2.0`
                               │
                               ▼
                    actions/deploy-pages → live site
```

## What triggers a redeploy

`deploy-page.yml` runs on push to `main` when any of these change:

- `page/**` — any page asset (HTML, CSS, JS, images)
- `cli/package.json` — version bump propagates automatically
- `.github/workflows/deploy-page.yml` — workflow itself

It can also be triggered manually via `workflow_dispatch` in the Actions UI.

## Version injection

Three placeholders in `index.html` are replaced at build time:

- `{{VERSION}}` in `<button data-copy="npx @axis-bootstrap/cli@{{VERSION}} init">` — pinned install command
- `{{VERSION}}` in `<p class="version-tag">v{{VERSION}}</p>` — visible version tag below hero CTA
- `{{VERSION}}` in `<span class="version">CLI v{{VERSION}}</span>` — footer

If you add new placeholders, use the same `{{VERSION}}` token — the `sed` step in the workflow replaces all occurrences.

## Local preview

```bash
# from repo root
cd page
python3 -m http.server 8000
# or: npx serve
open http://localhost:8000
```

Note: locally `{{VERSION}}` will appear literally. To preview with version baked in:

```bash
VERSION=$(jq -r .version ../cli/package.json)
sed "s/{{VERSION}}/$VERSION/g" index.html > /tmp/index.html && open /tmp/index.html
```

## One-time setup (only needed once per repo)

GitHub Pages source must be set to "GitHub Actions" (not "Deploy from a branch"):

1. Repo → Settings → Pages
2. Source: **GitHub Actions**

After that, the workflow handles deploys end-to-end.

## Files

| File | Purpose |
| ---- | ------- |
| `index.html` | LP markup, semantic HTML5, `{{VERSION}}` placeholders |
| `style.css` | Dark mode, mobile-first, no framework |
| `README.md` | This file |

JavaScript (copy-to-clipboard, sticky bar on scroll) is inline at the bottom of `index.html` — zero external dependencies, zero bundler.

## Copy source

The structured copy spec (with all A/B variations, frameworks applied, and self-evaluation) lives in [`../copy-lp-queiroz/lp-axis-framework.md`](../copy-lp-queiroz/lp-axis-framework.md). The HTML here picks the recommended variation of each block. When iterating copy, edit the `.md` first, then sync to the HTML.

## Independence from npm publish

This deploy is fully separate from `publish-cli.yml`:

- `publish-cli.yml` fires only on release tags `cli-v*`
- `deploy-page.yml` fires on `main` pushes to `page/**` or `cli/package.json`

A version bump to `cli/package.json` triggers **both** (npm publish on the tagged release, Pages redeploy on the merge to main) — that's the intended sync.
