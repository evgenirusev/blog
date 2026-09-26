#!/usr/bin/env node
// Render HTML diagrams in image-src/<slug>/ to PNGs next to the post's assets.
//
//   node scripts/images/render.mjs <slug>            # every *.html in image-src/<slug>/
//   node scripts/images/render.mjs <slug> <name>     # just image-src/<slug>/<name>.html
//
// Output: src/assets/images/posts/<slug>/<name>.png at 2x. Canvas size comes from
// <body data-size="WxH"> (default 1200x675). Uses the locally installed Google Chrome.
import { chromium } from "playwright-core";
import { readdirSync, mkdirSync, existsSync } from "node:fs";
import { join, resolve, basename } from "node:path";
import { pathToFileURL } from "node:url";

const [slug, only] = process.argv.slice(2);
if (!slug) {
  console.error("usage: render.mjs <slug> [name]");
  process.exit(1);
}

const root = resolve(import.meta.dirname, "../..");
const srcDir = join(root, "image-src", slug);
const outDir = join(root, "src/assets/images/posts", slug);
if (!existsSync(srcDir)) {
  console.error(`no such folder: image-src/${slug}`);
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });

const files = readdirSync(srcDir)
  .filter(f => f.endsWith(".html"))
  .filter(f => !only || basename(f, ".html") === only);

const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ deviceScaleFactor: 2 });

for (const file of files) {
  await page.goto(pathToFileURL(join(srcDir, file)).href, { waitUntil: "networkidle" });
  const [w, h] = await page.evaluate(() =>
    (document.body.dataset.size || "1200x675").split("x").map(Number)
  );
  await page.setViewportSize({ width: w, height: h });
  // Lucide: <i data-lucide="name"></i> → inline SVG, if the page loaded it.
  await page.evaluate(() => window.lucide?.createIcons());
  await page.evaluate(() => document.fonts.ready);
  // connect.js: draw connectors once boxes are at their final size.
  await page.evaluate(() => window.drawLinks?.());

  // Catch the usual layout failures before anyone looks at the PNG.
  const problems = await page.evaluate(() => {
    const out = [];
    const { innerWidth: W, innerHeight: H } = window;
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      if (r.right > W + 1 || r.bottom > H + 1 || r.left < -1 || r.top < -1) {
        out.push(`off-canvas: <${el.tagName.toLowerCase()} class="${el.className}">`);
      }
      if (el.children.length === 0 && el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflow !== "visible") {
        out.push(`clipped text: "${el.textContent.trim().slice(0, 40)}"`);
      }
    }
    for (const card of document.querySelectorAll(".card")) {
      const c = card.getBoundingClientRect();
      for (const k of card.querySelectorAll("*")) {
        const r = k.getBoundingClientRect();
        if (r.width && (r.right > c.right + 1 || r.bottom > c.bottom + 1)) {
          out.push(`overflows its card: "${k.textContent.trim().slice(0, 40)}"`);
          break;
        }
      }
    }
    if (![...document.fonts].some(f => f.family.includes("Nunito") && f.status === "loaded")) out.push("Nunito did not load — check network");
    for (const i of document.querySelectorAll("i[data-lucide]")) out.push(`unknown Lucide icon: ${i.dataset.lucide}`);
    return [...new Set(out)].slice(0, 10);
  });

  const out = join(outDir, basename(file, ".html") + ".png");
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width: w, height: h } });
  console.log(`${problems.length ? "!" : "✓"} ${out.replace(root + "/", "")} (${w}x${h}@2x)`);
  for (const p of problems) console.log(`    ${p}`);
}

await browser.close();
