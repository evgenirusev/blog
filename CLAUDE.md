# CLAUDE.md — evgenirusev.com blog

Guidance for AI agents working in this repo. Read alongside `README.md`.

## What this is

A **static** personal blog: **Astro 5 + AstroPaper** theme, Tailwind v4, search via Pagefind.
Package manager is **pnpm**. Posts are plain **Markdown** in `src/data/blog/` — one file per
post, and the **filename is the URL slug**. Raw HTML is allowed in Markdown (e.g. `<video>`).

## Deploy model

- **Cloudflare Pages auto-deploys on push to `main`.** The trigger lives in the Cloudflare
  dashboard (Pages ↔ GitHub) — there is **no CI workflow in this repo**. CF runs `pnpm build`
  and serves `dist/`. A push to `main` goes to production, so **only push when asked.**
- Validate before pushing with **`pnpm build`** — it runs `astro check && astro build &&
  pagefind …`, exactly what Cloudflare runs. Running `astro build` alone skips `astro check`.

## Publishing gotchas (don't relearn the hard way)

- **`pubDatetime` must not be in the future when publishing.** The site is static; AstroPaper
  generates the post *page* regardless of publish time but filters the *listings* by it. A
  future-dated post is live at `/posts/<slug>/` (returns `200`) but **absent from `/posts/`,
  the home page, tags, and RSS** until a build runs *after* that time. `pubDatetime` is **UTC**
  and CF builds in UTC. Symptom: *"the post opens at its URL but isn't in the list."* Fix: set
  a **past/current UTC** time and push (to trigger a rebuild). Real scheduling works only if a
  rebuild happens after the time — pushing early and waiting does nothing. (Full write-up in
  `README.md` → Deployment.)
- **`draft: true` hides a post everywhere** (its page 404s in production). Set `draft: false`
  to publish. AstroPaper also hides drafts in `pnpm dev`, so to preview a draft locally you
  must temporarily flip it to `draft: false`.
- **`tags` is a YAML list** (`string[]`), not a comma-separated string.

## Media conventions

- **Hero image / `ogImage`:** in `src/assets/images/posts/`, referenced by **relative path**
  (`../../assets/images/posts/x.png`) — Astro optimizes to WebP.
- **Inline images, GIFs, video:** in `public/images/…`, referenced by **absolute path**
  (`/images/…`). Do **not** route animated media through Astro's image pipeline — it can strip
  the animation.
- **Prefer MP4 `<video autoplay loop muted playsinline>` over GIF** for demos — much smaller
  and sharper.

## Conventions

- Match the existing AstroPaper + Tailwind v4 style. Verify with `pnpm build` before pushing.
- Git: conventional commit prefixes (`feat:` / `fix:` / `docs:` / `chore:`).
