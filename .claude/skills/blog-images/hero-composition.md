# Hero composition guide

Every rule here comes from a hero the owner rejected. Read this **before writing a hero brief**, and run the checklist at the bottom **before showing any hero to the owner**. If a candidate fails even one hard rule, reject it yourself. Don't present it and hope.

Reference images: `image-src/_refs/approved/` shows what good looks like, and `image-src/_refs/rejected/` shows what to never do again. Look at both before starting.

## The one-sentence test

**A hero is a picture of an idea, not a slide of labelled boxes.** If you can describe it as "N boxes in a row with labels" or "stat cards on a gradient", it's a slide. Rejected.

## Hard rules (a failure on any one means reject)

1. **One visual metaphor.** Pick a single image that *is* the story: a funnel (many → few), chaos → order, a rising path, a cycle, a product in use, a short path versus a long path. Write the metaphor in the brief's first line. If you can't name one, you don't have a hero yet.
2. **One focal element, clearly dominant.** It should be at least 2× the size of any other element, and the brightest or warmest thing in the frame. The eye must know where to land within a second.
3. **Sizes and shapes must vary.** Many small things, a few medium ones, one big one. Never a row of equal-size boxes of the same shape. Equal boxes mean "table", not "story".
4. **Depth, not flatness.** Layering, overlap, slight 3D angle, foreground and background. Elements float at different depths. A flat grid on a gradient is a slide.
5. **Fill the canvas.** No empty band above or below the illustration, and no dead half of the frame. The illustration uses the full width under or beside the title. Look at the bottom 30% of the image: if it's empty, reject.
6. **Show the thing itself, not a label for it.** "AI layer" written on a bar isn't AI. An assistant answering a real question from the post ("SAFE or ASA for this round?") is. Use a concrete object or example from the post over an abstract noun.
7. **Draw the post's own model, in the post's own words.** Don't use a generic template for the topic (the SDLC wheel, "AI in every phase"). Don't use a metaphor that reads as a different topic either: scattered cards flowing into a document stack reads as "document processing".
8. **Pick a style from the five in `style.md`,** and default away from keynote glow. **The glow budget:** Glow only works with a few elements (2–5 glowing things). A dense grid in full glow looks like a disco. Use the calm or light style for dense content.
9. **Never:** hands, arms or partial human figures (the owner rejected a hand holding the approval stamp on AP/AR; use a reviewer badge or an icon instead), brains, robots, humanoid figures, faces, "AI chips", holograms, circuit boards, gavels, scales of justice, logos.

## Text rules

- **Fewer words.** A title, a subtitle, and at most 4–6 short labels. Every extra label is another chance for a misspelling, and more slide-feel.
- **Numbers belong on the thing they describe,** as a callout attached to the focal element or its stage. Never use a row of stat tiles.
- **Every string listed exactly in the brief,** ending with "No other text anywhere." Then check every letter in the output, including stray accents (we caught "foundàtion").

## When to use HTML instead of AI

HTML heroes (`hero.html`) are **only for light-style, diagram-first heroes where exact arrows or layout matter** (e.g. Azure DevOps: one pipeline dropping into DEV/QA/PROD). Even then, rules 1–5 still apply: vary the sizes, make one element dominant, fill the canvas.

**Never build a dark "gradient + boxes" hero in HTML.** It always looks like a slide (see `rejected/stat-boxes-in-a-row.webp`). Dark heroes need depth and light, and those come from the image model.

## Patterns that worked (reuse them)

| Pattern | Example | Use when the post is about… |
|---|---|---|
| **Model as a cycle** | AI-First SDLC: three pillars in a loop | a methodology or operating model |
| **Chaos → order** | Mining classification: messy sheets → one classifier → sorted categories | classification, extraction, cleanup |
| **Convergence by layout** | 31 pain points: a scattered cloud → lines merge → a 4×4 grid → 3 panels → one magenta result (`approved/line-art-converge.webp`) | prioritisation, assessment, narrowing down. Let the layout narrow; don't draw a funnel object. |
| **Product in use** | Legal OS: floating app windows plus the AI assistant answering a real question | a platform or SaaS product |
| **Short path vs long path** | 5G: 200 ms edge path versus 800 ms internet path | performance, latency, speed-ups |
| **Convergence** | SQL → Fabric: three tiers merging into one platform | migration, consolidation |

## Anti-patterns (each one was rejected)

| Anti-pattern | Rejected example | Why it fails |
|---|---|---|
| Stat boxes in a row | `rejected/stat-boxes-in-a-row.webp` | A slide, not a picture. There's no metaphor, the numbers float without meaning, and there's a dead lower third. |
| Labelled boxes plus a bar | `rejected/labelled-boxes-template.webp` | Five identical boxes. "AI layer" is only a label. |
| Full glow on a dense grid | `rejected/disco-glow-dense-grid.webp` | 16 glowing tiles, so nothing stands out. |
| Literal metaphor object | `rejected/literal-funnel-object.webp` | A drawn funnel/cone looks odd. Show narrowing through the layout (converging lines, fewer items per stage) instead of a prop. |
| 3D boxes and columns | `rejected/server-rack-slices.webp` | Isometric slabs and columns read as server racks or filing cabinets. For architecture, draw it flat and 2D (layers as bands, slices as a cut through them). |
| Glow on a case study | `rejected/glow-funnel-too-flashy.webp` | A good metaphor (the funnel) ruined by keynote glow: "too flashy, too disco". The same brief in soft-3d or line-art works. |
| Thin middle band | `rejected/thin-middle-band.webp` | Small title, content squeezed into the middle, and about 40% of the canvas empty. |
| Wrong-topic metaphor | `rejected/documents-metaphor-wrong-topic.webp` | Cards flowing into documents reads as "document processing", not SDLC. |

## Pre-flight checklist (run it on every candidate)

- [ ] Can I name the single visual metaphor in three words?
- [ ] Is one element at least 2× bigger and brighter than the rest?
- [ ] Do sizes vary (many small → few medium → one large)? No row of equal boxes?
- [ ] Is there depth (overlap, layers, angle)?
- [ ] Is the canvas filled, with no empty bottom third and no dead half?
- [ ] Does it show a concrete thing from the post, not just a label?
- [ ] Is every string spelled exactly, with no extra text or stray accents?
- [ ] At 192px wide (the post-list thumbnail), can I still read the title and see the focal point?
- [ ] Does it differ from its neighbours in the listing (no more than two glowing heroes in a row)?

If any box is unchecked, fix the brief and regenerate. Don't show it to the owner.
