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

## Customization quick reference

- `src/config.ts` — site-wide settings (title, author, description, timezone)
- `src/constants.ts` — social links (GitHub, LinkedIn, X, Mail)
- `src/pages/about.md` — About page content
- `src/styles/` — Tailwind + custom CSS
- `public/` — static assets (favicon, OG images)

## Deployment

Auto-deploys to Cloudflare Pages on push to `main`.

## Credits

Theme: [AstroPaper](https://github.com/satnaing/astro-paper) by Sat Naing — MIT License.
