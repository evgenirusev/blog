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

Medium stopped issuing API tokens in 2025, so it's the **Import a story** tool, fed by a clean copy
of the post. Done twice so far (AI-First SDLC, Understanding Is the New Bottleneck); the steps
below are the ones that worked. An agent can do all of it through the Chrome extension, logged in
as the owner, with the owner's go-ahead to publish. The agent procedure, with the browser helpers
and the guarded link recipe, is the `medium-crosspost` skill (vault: `wiki/skills/distribution/`).

### Prepare the copy

1. **Images for tables and code.** Medium has no tables, and its importer drops or flattens code
   blocks, so both go in as images:
   ```bash
   python3 scripts/medium-images.py <slug>          # writes image-src/medium-<slug>/*.html
   # optional: sharpen each table's <div class="title">, it defaults to the heading above it
   node scripts/images/render.mjs medium-<slug>
   mkdir -p image-src/medium-<slug>/png
   mv src/assets/images/posts/medium-<slug>/*.png image-src/medium-<slug>/png/
   rmdir src/assets/images/posts/medium-<slug>
   ```
   Look at every PNG. ("Nunito did not load" on code images is harmless: they're monospace only.)
2. **Export.** `pnpm build`, then
   `python3 scripts/medium-export.py <slug> image-src/medium-<slug>/png <slug>-vN`
   It writes `public/medium/<slug>-vN/` (noindex): absolute PNG image URLs, tables and code as
   images, bold-led bullets as paragraphs, callouts as bold paragraphs, the opening italic line as
   a quote. Check the output: image count = hero + diagrams + tables + code blocks, no `<pre>`
   left, no `canonical`.
3. **Deploy** (commit and push) and wait until `https://evgenirusev.com/medium/<slug>-vN/` returns 200.
   **Use a new `-vN` path for every attempt.** Medium caches an import by URL. The export must
   **not** contain `rel=canonical`: the importer follows it and imports the real, image-less page.

### Import and clean up (in the Medium editor)

4. Import `https://evgenirusev.com/medium/<slug>-vN/` at `medium.com/p/import`, then "See your story".
5. **Delete the empty paragraphs and headings** the importer adds (one after every heading, one
   under the title). Each paragraph in the editor has a `name` attribute; to delete one, put the
   caret inside it and press Backspace.
6. **Subsection headings:** caret inside each former `###` heading, press **⌘⌥2** (small heading).
   Main sections stay large.
7. **Delete the "Originally published at …" footer** the importer appends. It links to the export
   page, not the post; the canonical link (step 9) does the attribution properly.
8. **In-article anchor links** (e.g. "more on that below") point at the export page. Unlink them
   for now (delete the word and retype it after plain text, or it stays linked) and relink after
   publishing (step 12).

### Settings and publish

9. **Canonical link:** ⋯ → More settings → Advanced Settings → Customize Canonical Link →
   Edit canonical link. It's pre-filled with the *export* URL: replace it with
   `https://evgenirusev.com/posts/<slug>/` and save.
10. **Publish dialog:** set the preview subtitle (it defaults to the first sentence; ≤140 chars),
    add 5 topics (type each, Return), then Publish.

### After publishing: Contents and anchor links

Anchor links need the story's final URL, so they go in after the first publish.

11. **Contents list:** above the opening paragraph, add a small heading "Contents" (⌘⌥2) and a
    bullet list (type `* ` to start it) of the main sections only, starting with "Introduction".
12. **Link each entry** to `https://medium.com/@evgeni.n.rusev/<story-slug>-<id>#<name>`, where
    `<name>` is the target heading's `name` attribute (the first paragraph's for "Introduction").
    `medium.com/p/<id>#…` links redirect and lose the anchor.
13. Save and publish, then check on the published page that each `#<name>` exists as an element `id`.
14. Remove `public/medium/<slug>-v*` (Medium re-hosts the images on its own CDN once imported).

### Linking in Medium's editor: what works

Medium's link input only opens for a **real mouse selection that stays inside one line**:

- **Works:** double-click the first word, extend with **shift+→** one character at a time to the
  end of the text, wait ~2s for the toolbar, click its link icon, **click into the input**, type
  the URL, Return.
- **Fails:** triple-click or shift-click to the line end (the selection includes the line break),
  keyboard-only or script-made selections, ⌘K, and clicking the toolbar button from a script. When
  the input doesn't open, the typed URL **replaces the selected text** and Medium auto-links it.
- **Guard every link:** before clicking, check that the toolbar is visible and the selection is
  exactly the intended text (`getSelection().toString()`); stop if not. A click with no toolbar
  lands in the text, and the URL plus Return splits the line.
- **Recover with ⌘Z.** One undo usually reverts the bad typing and the split together.
- Clicking a toolbar slot blindly is dangerous: the neighbouring buttons are bold, italic and the
  large-heading T.

## 6. LinkedIn

- First line: the sharpest number or claim (it's all that shows before "see more"). For the SDLC post:
  intent is ~60% of the remaining work once AI speeds up coding, not "30% of a sprint".
- Lead with the idea, not with you. Put the conference or talk mention low, just above the link:
  "I presented this at @DevTalks Cluj…". Up top, it tells non-attendees the post isn't for them.
- Tag companies by typing `@` and picking the page. Plain text doesn't tag.
- Attach one strong image (a chart beats the hero). The link can go in the post or the first comment.
