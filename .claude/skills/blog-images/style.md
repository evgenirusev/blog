# House style: blog images

The blog uses the Tecknoworks palette: deep purple, magenta and coral. We chose it (2026-09) over the original navy/orange because it reads as AI innovation and excitement, not as another blue tech blog. The palette's single source of truth is `src/styles/brand.css`, which is shared with the site's own theme (links, table of contents, accents). `scripts/images/theme.css` maps it onto role tokens for diagrams, and the hero prompts in `scripts/images/styles/` repeat the hex values. When the palette changes, update `brand.css`, then this file, then the hero style prompts.

The palette is shared across all five hero styles (below). `image-src/_refs/house-hero-tkw-gradient.webp` is the reference for the keynote-glow style only.

## Palette

| Role | Hex | Use |
|---|---|---|
| Deep purple | `#320063` | Titles, icon strokes, the dark end of hero gradients |
| Plum | `#7D1C4B` | Subtitles, secondary emphasis |
| Magenta | `#EA2775` | The accent: key phrase, focal element, "the thing that matters" |
| Coral | `#EA8170` | Outcomes, "done", the warm end of gradients |
| Purple (info) | `#6A3FB0` | Information, structure, connectors |
| Dark gray | `#515455` / ink `#3D3645` | Body text |
| Gray | `#9A9DA0` | Context, feedback, optional paths |
| Light canvas | `#FCFAFD` + lilac `#F1EBF9` / blush `#FCEBF2` washes | Diagram backgrounds |
| Tints | magenta `#FCE4EE`, purple `#EEE7F8`, coral `#FCE8E4`, plum `#F5E4EC` | Soft fills |

- Color carries meaning. Magenta is the accent, purple is structure, coral is outcome. Keep the mapping consistent within a post.
- The typeface is Nunito, a rounded geometric sans, at weight 800–900 for titles.

## Hero styles: five categories

Every hero uses exactly one of these five styles. Each has its own prompt in `scripts/images/styles/` and is passed with `--style`. **Pass `--refs none` for every style except keynote-glow.** Reference images carry their style with them, so the glow house reference will pull any other style back toward disco.

| # | Style | Prompt file | Look | Use for |
|---|---|---|---|---|
| 1 | **Keynote glow** | `keynote-glow.md` | Purple → magenta → coral gradient, glowing glass nodes, particles | **Flagship concept pieces only**, with 2–4 elements. Rare on purpose (currently AI-First SDLC). |
| 2 | **Matte dark** | `matte-dark.md` | Deep purple gradient, matte frosted panels, flat white icons, no glow | Serious case studies and dense content that should feel premium but calm |
| 3 | **Soft 3D** | `soft-3d.md` | Light canvas, matte clay/resin 3D objects, soft studio shadows, one magenta/coral focal object | Business and transformation stories, products, outcomes |
| 4 | **Line art** ✅ *owner favourite* | `line-art.md` + ref `_refs/style-line-art.webp` | Off-white dot grid, thin deep-purple line drawing, flat lilac fills, one solid magenta focal element | Case studies, architecture, methodology and engineering explainers |
| 5 | **Light flat** | `light-flat.md` (or an HTML `hero.html`) | White with a lilac wash, matte white cards, purple type | Hands-on tutorials and diagram-first heroes where exact arrows matter |

Rules:
- **Style references:** keynote glow uses `_refs/house-hero-tkw-gradient.webp`, and line art uses `_refs/style-line-art.webp` (the approved pain-points hero). Pass the style's own reference and nothing else. The other styles run with `--refs none` until a hero in that style is approved and saved as `_refs/style-<name>.png`.
- **Keynote glow is the exception, not the default.** Use it for at most about one in five heroes. Everything else uses styles 2–5. The owner rejected full glow on case studies as "too flashy, too disco".
- **Keep the brief style-neutral.** Describe the metaphor, objects, sizes and text, never the rendering ("luminous", "glowing", "beam", "bright"). Those words belong in the style file. A brief with "glowing" in it makes every style glow. Check with `grep -ci "glow\|luminous\|beam" hero.md` → 0.
- **Rotate styles across the listing** so no two neighbours share a style where it can be avoided.

### Current style per hero

Check this before picking a style, so neighbours in the listing don't repeat.

- **Posts, newest first:** AI-First SDLC (keynote glow) · Use-Case Handbook (line art) · Spec-Driven Development (keynote glow) · Second Brain (original, keep) · Multi-Agent (line art) · Azure DevOps (light flat, HTML) · .NET DDD (line art, flat layers-and-slices)
- **Case studies, index order:** AP/AR (soft 3D) · Pain points (line art) · Mining classification (keynote glow) · PDF extraction (line art) · SQL→Fabric (original, keep) · Legal OS (line art) · 5G (keynote glow)

Update this list whenever a hero changes.

## What a hero should show

The full rules are in `hero-composition.md`, which takes precedence. In short:

- **The post's own model**, in its own words: for example, the three pillars as a cycle. Don't use a generic template for the topic (the classic SDLC wheel, "AI in each phase"). Don't use a metaphor that reads as a different topic either: scattered cards flowing into a document stack reads as "document processing".
- **Never a brain, robot or "AI" chip at the center.** The model adds them to anything about AI, so ban them in the brief up front.
- Keep text short and exact. List every string in the brief, and end with "No other text anywhere." Dense text (20+ strings) works, but check every label: the model occasionally invents text on small icons (e.g. an "invoice" icon).

## Diagrams (HTML → PNG)

- **Canvas is 1200px wide and text is at least 16px.** The post column is about 860px, so everything renders at about 0.72x. If a label doesn't fit, cut words. Don't shrink the text.
- **Colors and tokens:** use the light canvas with its lilac/blush wash, matte white cards with a soft purple shadow, deep purple titles, and a magenta→coral gradient on the title's key phrase. Use `tint-*` for the one or two focal elements. Use the role-named tokens (`--title`, `--accent`, `--info`, `--success`, `--plum`) and never hard-code hex values in a diagram.
- **Labels and icons:** keep labels to 2–4 words and notes to 2–5 words. Use Lucide icons at 28–36px, and only where they identify the thing.
- **Connectors** are drawn with `connect.js`. Dashed lines are for feedback loops, optional paths and "consulted" relations.

## What an image is for

- **One idea per image**, readable as a thumbnail. The image orients the reader and the prose carries the detail.
- **Draw a picture only for a mechanism the text can't show:** a flow, a loop, a fan-out, a proportion, a boundary. Tables and lists stay as text.
- **Redraw, don't paste.** Never drop slides or source-document figures into a post.
- A post usually needs **one hero and 3–6 diagrams**.

## Avoid

Brains, robots, holograms, circuit boards, neon glow on dense layouts, light streaks and particles on dense layouts, photorealism, stock photos, tiny text, heavy black borders, and anything that looks like a generic template for the topic.

Explored and rejected styles, kept for reference: `scripts/images/styles/_explored/`. They include flat ivory line-art, blue-violet luminous, navy/orange, clay and editorial.
