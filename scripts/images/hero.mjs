#!/usr/bin/env node
// Generate hero-image candidates for a post with an AI image model.
//
//   node --env-file-if-exists=.env scripts/images/hero.mjs <slug> [--provider openai|gemini|both] [--n 3]
//        [--brief hero.md] [--style scripts/images/styles/keynote-glow.md] [--refs a.png,b.webp] [--tag name]
//
// Reads the brief from image-src/<slug>/<brief>, prefixes the style prompt, attaches the
// style references (default REFS), and writes candidates to
// image-src/<slug>/hero/<tag>-<provider>-<n>.png (git-ignored).
// Keys: OPENAI_API_KEY, GEMINI_API_KEY. Models are overridable via OPENAI_IMAGE_MODEL / GEMINI_IMAGE_MODEL.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, resolve, basename } from "node:path";
import { parseArgs } from "node:util";

// Approved heroes that define the house style. Pass --refs to override per run.
const REFS = ["image-src/_refs/house-hero-tkw-gradient.webp"];

const OPENAI_MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2.5-sunburst";
const GEMINI_MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-3-pro-image-preview";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    provider: { type: "string", default: "both" },
    n: { type: "string", default: "3" },
    brief: { type: "string", default: "hero.md" },
    style: { type: "string", default: "scripts/images/styles/keynote-glow.md" },
    refs: { type: "string" },
    tag: { type: "string" },
  },
});
const [slug] = positionals;
if (!slug) {
  console.error("usage: hero.mjs <slug> [--provider openai|gemini|both] [--n 3]");
  process.exit(1);
}

const root = resolve(import.meta.dirname, "../..");
const briefPath = join(root, "image-src", slug, values.brief);
if (!existsSync(briefPath)) {
  console.error(`missing brief: image-src/${slug}/${values.brief}`);
  process.exit(1);
}
const prompt = [
  readFileSync(resolve(root, values.style), "utf8"),
  "## This image",
  readFileSync(briefPath, "utf8"),
].join("\n\n");

const outDir = join(root, "image-src", slug, "hero");
mkdirSync(outDir, { recursive: true });
const MIME = { png: "image/png", webp: "image/webp", jpg: "image/jpeg", jpeg: "image/jpeg" };
// --refs none: text-only generation, no style references.
const refList = values.refs === "none" ? [] : values.refs ? values.refs.split(",") : REFS;
const refs = refList.map(p => ({
  name: basename(p),
  mime: MIME[p.split(".").pop().toLowerCase()],
  bytes: readFileSync(resolve(root, p.trim())),
}));
const prefix = values.tag ? `${values.tag}-` : "";
const n = Number(values.n);

async function openai(i) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY not set");
  const params = { model: OPENAI_MODEL, prompt, size: "2048x1152", quality: "high" }; // 16:9, sides divisible by 16
  let res;
  if (refs.length) {
    const form = new FormData();
    for (const [k, v] of Object.entries(params)) form.append(k, v);
    for (const r of refs) form.append("image[]", new Blob([r.bytes], { type: r.mime }), r.name);
    res = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: form,
    });
  } else {
    res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
  }
  const json = await res.json();
  if (!res.ok) throw new Error(`openai ${res.status}: ${json.error?.message}`);
  return Buffer.from(json.data[0].b64_json, "base64");
}

async function gemini(i) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not set");
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              ...refs.map(r => ({ inline_data: { mime_type: r.mime, data: r.bytes.toString("base64") } })),
            ],
          },
        ],
        generationConfig: {
          responseModalities: ["IMAGE"],
          imageConfig: { aspectRatio: "16:9", imageSize: "2K" },
        },
      }),
    }
  );
  const json = await res.json();
  if (!res.ok) throw new Error(`gemini ${res.status}: ${json.error?.message}`);
  const part = json.candidates?.[0]?.content?.parts?.find(p => p.inlineData || p.inline_data);
  if (!part) throw new Error(`gemini returned no image (${json.candidates?.[0]?.finishReason})`);
  return Buffer.from((part.inlineData || part.inline_data).data, "base64");
}

const providers = { openai, gemini };
const chosen = values.provider === "both" ? ["openai", "gemini"] : [values.provider];

const jobs = chosen.flatMap(p =>
  Array.from({ length: n }, (_, i) =>
    providers[p](i).then(
      buf => {
        const out = join(outDir, `${prefix}${p}-${i + 1}.png`);
        writeFileSync(out, buf);
        console.log(`✓ ${out.replace(root + "/", "")}`);
      },
      err => console.error(`✗ ${p}-${i + 1}: ${err.message}`)
    )
  )
);
await Promise.all(jobs);
