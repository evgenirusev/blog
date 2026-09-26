---
name: blog-images
description: Generate the images for a blog post in this repo in the house style — an AI-generated hero (OpenAI GPT Image, steered by the approved house hero as a style reference, in the Tecknoworks purple/magenta/coral palette) plus in-article diagrams written as HTML and rendered to PNG. Use whenever a post needs a hero, cover, ogImage, infographic, diagram or figure, when asked to "make the images for this post", "add a diagram", "generate a hero", "redo the visuals", or when a draft has deck slides / screenshots that should be redrawn.
---

# Blog images

Two pipelines, one style. Read `style.md` (next to this file) before drawing anything.

| Image | How | Why |
|---|---|---|
| **Hero** (top of post and `ogImage`) | AI model via `scripts/images/hero.mjs` | It needs a polished keyvisual look. The house reference image keeps every hero consistent. |
| **In-article diagrams** | HTML → PNG via `scripts/images/render.mjs` | The text has to be exactly right, colors exact, and editable later. |

Everything lives in the repo:

```
scripts/images/theme.css       Tecknoworks palette as role tokens (--title/--accent/--info/--success/--plum), Nunito, classes
scripts/images/connect.js      connectors drawn after layout (LINKS = [...])
scripts/images/render.mjs      image-src/<slug>/*.html → src/assets/images/posts/<slug>/*.png @2x
scripts/images/hero.mjs        image-src/<slug>/hero.md → image-src/<slug>/hero/*.png candidates
scripts/images/styles/*.md     hero style prompts: tkw-gradient (default), matte-dark, light-flat
image-src/_refs/               approved reference images (house-hero-tkw-gradient.png)
image-src/<slug>/              diagram sources + hero brief (committed); hero/ candidates (ignored)
```

## 1. Plan the images

Read the post. List the hero plus the 3–6 places where a picture shows a mechanism the prose can't (flow, loop, fan-out, proportion, boundary). Skip anything that's already a table or list. For each one, write down its single idea in one line. If the post contains pasted slides or screenshots, plan to redraw the idea. Don't keep the paste.

## 2. Diagrams

For each diagram, create `image-src/<slug>/<name>.html`. Copy the skeleton from an existing diagram in `image-src/` (e.g. `image-src/ai-first-sdlc/day-to-day-loop.html`):

```html
<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="../../scripts/images/theme.css">
<script src="https://cdn.jsdelivr.net/npm/lucide@0.460.0/dist/umd/lucide.min.js"></script>
<script src="../../scripts/images/connect.js"></script>
<style>/* layout for this diagram only */</style>
</head><body data-size="1200x560"><div class="frame">
  <div class="title">Main claim, <span class="accent">key phrase.</span></div>
  <div class="subtitle">One line that says why it matters.</div>
  <!-- cards with ids, <i data-lucide="icon-name"></i> icons -->
</div>
<script>LINKS=[{from:"a",to:"b"},{from:"e",to:"a",path:"bb",dashed:true,label:"…"}]</script>
</body></html>
```

- The width is always 1200. Pick the height to fit the content with about 56px bottom margin, and trim empty space.
- Use the theme classes (`title`, `subtitle`, `label`, `note`, `card`, `tint-info|accent|success`, `icon info|accent|success`, `zone`). Never hard-code hex values: use the tokens. Put diagram-specific layout in the page's own `<style>`.
- Connectors: `down` (smooth vertical curve, bottom edge → top edge, with a start dot; spread origins with `fromAt`/`toAt`) for trees, fan-in and fan-out. This is the preferred one. Use `rl` for left-to-right flows, `bb` for a return loop under a row, and `cc` only for radial hub-and-spoke. Straight diagonal lines look cheap. Put `label` text on a line and it renders as a pill.

Then render and **look at every PNG** with the Read tool:

```bash
node scripts/images/render.mjs <slug>            # all
node scripts/images/render.mjs <slug> <name>     # one
```

The renderer warns about off-canvas elements, clipped text, unknown Lucide icons and the font failing to load. Fix every warning. Then check by eye: is text at least 16px, is the focal point clear, do lines cross, is there dead space, is the color meaning the same as in the other diagrams in the post? Iterate until it's clean.

Reference it in the post with a relative path and descriptive alt text that states what the diagram shows:

```markdown
![The day-to-day loop: requirement arrives, … — and repeat](../../assets/images/posts/<slug>/<name>.png)
```

## 3. Hero

**Read `hero-composition.md` first and follow it.** It holds the hard rules, the approved and rejected reference images (`image-src/_refs/approved/`, `image-src/_refs/rejected/`), and the pre-flight checklist. Every candidate must pass the checklist before the owner sees it.

**Concept first.** The hero shows the post's own model in its own words: for example, the three pillars as a cycle. Don't use a generic template for the topic, and don't use a metaphor that reads as a different topic (see `style.md`). Agree the concept with the user before spending on variants if it isn't obvious.

Write `image-src/<slug>/hero.md`. `image-src/ai-first-sdlc/hero-pillars.md` is the model: exact strings for the title, subtitle and every label, the composition with the focal element named, one meaningful icon per element, the "no brain / robot / AI chip" line, and "No other text anywhere."

Pick the style by density (see `style.md`):

```bash
# simple concept (2–4 elements): the default, tkw-gradient + house reference
node --env-file-if-exists=.env scripts/images/hero.mjs <slug> --provider openai --n 2

# dense (grid, 8+ elements): calm dark, or calm light
node --env-file-if-exists=.env scripts/images/hero.mjs <slug> --provider openai --n 2 \
  --style scripts/images/styles/matte-dark.md    # or light-flat.md
```

- **Flags:** `--brief <file>` picks another brief in `image-src/<slug>/`. `--refs a.png,b.png` overrides the references, and `--refs none` means text only. `--tag <name>` prefixes the candidate filenames.
- **Restyling an existing hero:** pass `--refs image-src/_refs/house-hero-tkw-gradient.webp,<old hero>`. In the brief, say which image gives the style and which gives the content, and that none of the old image's colors or style should remain.
- **Light heroes can be HTML instead of AI** (light style only, and only when the arrows or layout must be exact. Never build a dark gradient-plus-boxes hero in HTML). The light style is flat enough to build exactly like a diagram, and you should do that when the arrows or the layout must be exact. Image models draw arrows badly: they converge on the wrong box or tangle. Write `image-src/<slug>/hero.html` at `data-size="1200x675"`, render it with `render.mjs <slug> hero`, and move the output to `src/assets/images/posts/<slug>.png`. For a bus that drops into several targets, use the `elbow` connector. Example: `image-src/azure-devops-terraform-multi-environment/hero.html`.
- **Fill the canvas.** Reject heroes where the content sits in a thin middle band with a lot of empty space above and below. The title should be large, and the diagram should use the full width.
- **Variants of an approved hero:** use the approved image itself as the only reference. The layout and icons carry over almost exactly, and only what the style file changes (e.g. the palette) moves.
- **Keys:** `OPENAI_API_KEY` in `.env` (git-ignored). The default model is `gpt-image-2.5-sunburst` at 2048×1152, about 30s per image. Gemini (`gemini-3-pro-image-preview`) is wired up but untested.
- **Cost:** about $0.20 per candidate. Say so before generating more than 6.
- **Verify before spending.** When you edit a style or brief and generate in the same command, check the edit landed first (`grep -c <new phrase> <file> && node …`). A failed edit followed by a successful generation wastes money on the old prompt. Also, in zsh a command stored in a variable doesn't word-split, so write the commands out in full.
- **Review:** look at every candidate. Check every string, including text the model invents on small icons. Reject brains or robots, anything off-palette, and glow on dense layouts. Show the survivors to the user, open them (`open <files>`), and give a recommendation. Let the user pick. Don't pick silently.
- **Iterate:** tighten the brief rather than regenerating blindly. Add a sentence on what went wrong.
- **Publish the chosen one:**
  ```bash
  cp image-src/<slug>/hero/<pick>.png src/assets/images/posts/<slug>.png
  ```
  Then add `ogImage: "../../assets/images/posts/<slug>.png"` to the frontmatter and put `![<title> — <what it shows>](../../assets/images/posts/<slug>.png)` as the first line of the body.

## Case studies

Case-study pages live in `src/pages/case-studies/<slug>.md`, and their heroes go to `src/assets/images/posts/<slug>.png` like posts. **The case-studies index (`src/pages/case-studies/index.md`) is Markdown with raw `<img>` tags, so it doesn't go through Astro's optimizer.** After changing a case-study hero, regenerate its index copy as a 960px WebP in `public/images/case-studies/<slug>.webp` using sharp, e.g. `sharp(hero).resize({width: 960}).webp({quality: 86})`. Never point the index at a full-size PNG, because it comes out blurry and weighs about 2 MB. Every index card uses the same 16:9 `aspect-video object-cover` box, so heroes must be 16:9.

**Keep the original:** SQL → Fabric (`sql-to-fabric-ai-migration`) keeps its original pre-2026-09 hero on purpose, like Second Brain. Don't regenerate it.

Style rotation for case studies, in index order: AP/AR (soft 3D) · pain points (line art) · mining classification (glow) · PDF extraction (line art) · SQL→Fabric (original, kept) · Legal OS (line art) · 5G (glow).

## 4. Finish

Run `pnpm build` (or `./node_modules/.bin/astro check`), open the post in `pnpm dev`, and check the images at real column width. Commit the `image-src/<slug>/` sources together with the PNGs, so a diagram can be edited and re-rendered later.
