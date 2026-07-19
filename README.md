# evgenirusev.com

Personal blog and writing on AI engineering by [Evgeni Rusev](https://www.linkedin.com/in/evgenirusev/).

Built with [Astro](https://astro.build) using the [AstroPaper](https://github.com/satnaing/astro-paper) template (MIT-licensed).

## Local development

```bash
pnpm install
pnpm dev          # localhost:4321
pnpm build        # production build → dist/
pnpm preview      # serve the production build locally
```

## Adding a new post

Create a markdown file under `src/data/blog/`:

```markdown
---
author: Evgeni Rusev
pubDatetime: 2026-05-10T12:00:00Z
title: "Your post title"
slug: your-post-slug   # optional — auto-generated from filename
featured: false
draft: false
tags: [ai-engineering, agents]
description: "One-line summary used in meta tags and post listings."
---

Your content here. Code blocks, images, MDX components — all supported.
```

> **Note on `pubDatetime`:** it is **UTC** (the trailing `Z`) and must **not be in the
> future** when you publish. A future date makes the post live at its own URL but **hidden
> from `/posts/`, the home page, tags, and RSS** until a build runs after that time — see
> [Deployment](#deployment).

### Post media

- **Hero image / `ogImage`:** put it in `src/assets/images/posts/` and reference it with a
  **relative path** (`../../assets/images/posts/<file>.png`). Astro optimizes these to WebP
  at build time.
- **Inline images, GIFs, and video:** put them in `public/images/…` and reference with an
  **absolute path** (`/images/…`). Do **not** route animated GIFs/video through Astro's image
  pipeline (a `![]()` on a `src/assets` file) — it can strip the animation.
- **Prefer MP4 over GIF** for demos — an autoplay-loop `<video>` (raw HTML is fine in
  Markdown) is far smaller and sharper than a GIF:
  ```html
  <video src="/images/…/demo.mp4" autoplay loop muted playsinline preload="metadata"
         style="width:100%;height:auto"></video>
  ```

## Customization quick reference

- `src/config.ts` — site-wide settings (title, author, description, timezone)
- `src/constants.ts` — social links (GitHub, LinkedIn, X, Mail)
- `src/pages/about.md` — About page content
- `src/styles/` — Tailwind + custom CSS
- `public/` — static assets (favicon, OG images)

## Deployment

Auto-deploys to **Cloudflare Pages** on push to `main`. The build trigger is configured in
the Cloudflare dashboard (Pages ↔ GitHub) — there is **no CI workflow in this repo**.
Cloudflare runs `pnpm build` (`astro check && astro build && pagefind …`) and serves `dist/`.

### Before you publish — checklist

- [ ] **`draft: false`** — a `draft: true` post is hidden everywhere (its page 404s in production).
- [ ] **`pubDatetime` is not in the future** (UTC) — the biggest gotcha, see below.
- [ ] `pnpm build` passes locally — that is exactly what Cloudflare runs. (`astro build` on its
      own skips `astro check`, which CF does run.)
- [ ] Media referenced correctly — see [Post media](#post-media).

### Gotcha: a future `pubDatetime` hides the post from listings

The site is **static**, and AstroPaper filters *listings* by publish time but generates the
*post page* regardless. So when `pubDatetime` is in the **future at build time**:

- the post's own URL (`/posts/<slug>/`) is live and returns `200`, **but**
- it is **missing from `/posts/`, the home page, tags, and RSS** until a build runs *after*
  that publish time.

`pubDatetime` is **UTC** and Cloudflare builds in UTC, so e.g. "today 12:00" set from a UTC+3
morning is still in the future. Telltale symptom: *"the post opens directly but isn't in the
list."*

**How to handle it:**

- **Publishing now:** use a **past or current** UTC time.
- **Scheduling on purpose:** set the future time deliberately — but know it will not appear in
  listings until *a rebuild runs after that time*. Pushing before the time and waiting does
  **not** work (nothing rebuilds the static listings). Trigger a rebuild after the time via a
  new push or a manual **Retry deployment** in the Cloudflare Pages dashboard.

> Note: this repo has no in-repo deploy config. If pushes stop deploying, the fix is in the
> Cloudflare Pages dashboard (Git connection / production branch = `main`), not in the code.

## Credits

Theme: [AstroPaper](https://github.com/satnaing/astro-paper) by Sat Naing — MIT License.
