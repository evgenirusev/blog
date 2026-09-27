# Publishing a post — end to end

How a post goes from draft to the blog, Medium and LinkedIn. Distilled from shipping *The AI-First
SDLC* (Sep 2026). Editorial and voice lessons live in the Obsidian vault
(`wiki/content-creation/styles/blog-posts.md`); this file is the mechanics.

## 1. Write

- One file in `src/data/blog/<slug>.md`. The filename is the URL; don't change it after publishing.
- `pubDatetime` must be in the past (UTC) or the post is missing from listings. `draft: false` to publish.
- Headings: `##` for main sections, `###` for subsections. Keep the main sections few (8–10); they
  become the Medium Contents list.
- Tables are fine on the blog (card style, see `src/styles/typography.css`), but plan for Medium,
  which has none (step 5).

## 2. Images

Use the `blog-images` skill (`.claude/skills/blog-images/`). It holds everything:

- `style.md` — the Tecknoworks palette (deep purple, plum, magenta, coral), the **five hero styles**
  and when to use each, diagram rules (1200px canvas, ≥16px text, role tokens, curved connectors).
- `hero-composition.md` — hard rules for heroes, approved/rejected reference images, pre-flight checklist.
- `SKILL.md` — the workflow and commands.

The short version:

| Image | How | Command |
|---|---|---|
| Hero | AI (OpenAI `gpt-image-2.5-sunburst`, ~$0.20/candidate) | `pnpm img:hero <slug> --style scripts/images/styles/<style>.md` |
| Diagrams, light heroes that need exact arrows | HTML → PNG | `pnpm img:render <slug>` |

Hero styles, most-used first: **line art** (owner favourite: case studies, explainers, architecture),
**keynote glow** (flagship concept posts only; it's the "disco" style, use rarely), **soft 3D**
(business stories, products), **matte dark**, **light flat**. Never two glowing heroes in a row.

Things that went wrong and are now rules: brains/robots/hands in heroes; boxes-in-a-row slides;
literal metaphor props (a drawn funnel); 3D boxes that read as server racks; glow on dense grids;
empty bands at the top and bottom of a hero; shortening a label so it changes meaning ("Code" for
"Implementation").

## 3. Check and deploy

- `pnpm build` must pass (0 errors). It runs `astro check`, the build and Pagefind.
- Check at 360px, 390px, 768px and 1440px for horizontal overflow, in light and dark mode.
- After changing fonts, `astro.config.ts` or a Shiki transformer, restart `pnpm dev`. Rendered Markdown is
  cached in `node_modules/.astro/` and `.astro/`: if a change to highlighting doesn't show, or dev shows
  "Image not found" for a deleted image, delete both and restart. Cloudflare always builds from scratch.
- **A push to `main` is production** (Cloudflare Pages). Live in about 60–80 seconds.

## 4. Case studies

`src/pages/case-studies/<slug>.md`. The index page uses raw `<img>` tags, so after changing a hero,
regenerate its 960px WebP in `public/images/case-studies/` (see `SKILL.md`, "Case studies").

## 5. Medium

Medium stopped issuing API tokens in 2025, so it's the **Import a story** tool, fed by a clean copy:

1. `pnpm build`, then
   `python3 scripts/medium-export.py <slug> image-src/medium-<slug>/png <slug>-vN`
   It writes `public/medium/<slug>-vN/` (noindex): absolute PNG image URLs, tables and code blocks as
   images (render them from `image-src/medium-<slug>/*.html` with `pnpm img:render medium-<slug>`),
   bold-led bullets as paragraphs, and the opening italic line as a quote.
2. Deploy, then import `https://evgenirusev.com/medium/<slug>-vN/` at `medium.com/p/import`.
   **Use a new `-vN` path for every attempt.** Medium caches an import by URL.
   The export must **not** contain `rel=canonical`: the importer follows it and imports the real,
   image-less page instead.
3. In the editor, fix what the importer breaks:
   - Every heading arrives as a large heading. Select each subsection and press **⌘⌥2**.
   - Delete the empty headings and empty quotes it inserts (they show as big gaps).
   - Add a **Contents** list (small heading) under the opening line, main sections only, starting
     with "Introduction". Link each entry to the **full published story URL** plus `#<name>`, e.g.
     `https://medium.com/@evgeni.n.rusev/<story-slug>-<id>#0e74`. Links to `medium.com/p/<id>#…`
     redirect and lose the anchor, so they jump to the top. The `#<name>` values are the headings'
     `name` attributes (visible via devtools, or `id` on the published page).
4. Story settings → Advanced → **Customize canonical link** → the blog post URL.
5. Add up to 5 topics when publishing. Remove `public/medium/<slug>-v*` afterwards.

## 6. LinkedIn

- First line: the sharpest number or claim (it's all that shows before "see more"). For the SDLC post:
  intent is ~60% of the remaining work once AI speeds up coding, not "30% of a sprint".
- Lead with the idea, not with you. Put the conference or talk mention low, just above the link:
  "I presented this at @DevTalks Cluj…". Up top, it tells non-attendees the post isn't for them.
- Tag companies by typing `@` and picking the page. Plain text doesn't tag.
- Attach one strong image (a chart beats the hero). The link can go in the post or the first comment.
