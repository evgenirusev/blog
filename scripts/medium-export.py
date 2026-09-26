#!/usr/bin/env python3
"""Build a Medium-importable copy of a post.

    python3 scripts/medium-export.py <slug> [table-image-dir]

Reads the built page (dist/posts/<slug>/index.html, so run `pnpm build` first) and writes
public/medium/<slug>/index.html: plain headings, paragraphs, lists, <pre> code and absolute
PNG image URLs, which is what Medium's "Import a story" tool understands. Markdown tables
become images, in order, from table-image-dir (see image-src/medium-<slug>/). The page is
noindex and declares the real post as canonical; also set the canonical link in Medium's
story settings after importing.
"""
import re, shutil, sys
from pathlib import Path
from bs4 import BeautifulSoup

SITE = "https://evgenirusev.com"
root = Path(__file__).resolve().parent.parent
slug = sys.argv[1]
table_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else None

html = (root / "dist/posts" / slug / "index.html").read_text()
page = BeautifulSoup(html, "html.parser")
title = page.find("h1").get_text(strip=True)
article = page.find("article", id="article")

out_dir = root / "public/medium" / slug
if out_dir.exists():
    shutil.rmtree(out_dir)
out_dir.mkdir(parents=True)
public_base = f"{SITE}/medium/{slug}"

# Images: map each optimized /_astro/<name>.<hash>.webp back to its source PNG.
assets = root / "src/assets/images/posts"
for img in article.find_all("img"):
    name = Path(img["src"]).name.split(".")[0]
    src = next((p for p in [assets / slug / f"{name}.png", assets / f"{name}.png"] if p.exists()), None)
    if not src:
        sys.exit(f"no source image for {img['src']}")
    shutil.copy(src, out_dir / src.name)
    new = page.new_tag("img", src=f"{public_base}/{src.name}", alt=img.get("alt", ""))
    fig = page.new_tag("figure")
    fig.append(new)
    (img.find_parent("p") or img).replace_with(fig)

# Tables -> pre-rendered images, in document order.
tables = article.find_all("table")
if tables:
    imgs = sorted(table_dir.glob("*.png")) if table_dir else []
    if len(imgs) != len(tables):
        sys.exit(f"{len(tables)} tables but {len(imgs)} table images in {table_dir}")
    for t, p in zip(tables, imgs):
        shutil.copy(p, out_dir / p.name)
        fig = page.new_tag("figure")
        fig.append(page.new_tag("img", src=f"{public_base}/{p.name}", alt=p.stem.split("-", 1)[-1].replace("-", " ")))
        t.replace_with(fig)

# Code blocks -> plain <pre> text.
for pre in article.find_all("pre"):
    text = "\n".join(l.get_text() for l in pre.select(".line")) or pre.get_text()
    new = page.new_tag("pre")
    new.string = text.rstrip()
    pre.replace_with(new)
for btn in article.select("button"):
    btn.decompose()

# Drop the in-page table of contents and heading anchor links.
for h in article.find_all(["h2", "h3"]):
    for a in h.find_all("a"):
        if a.get_text(strip=True) in ("#", "") or "heading-link" in " ".join(a.get("class", [])):
            a.decompose()
toc = next((h for h in article.find_all("h2") if h.get_text(strip=True).lower().startswith("table of contents")), None)
if toc:
    toc.decompose()
for d in article.find_all("details"):
    if "table of contents" in d.get_text(" ", strip=True).lower()[:80]:
        d.decompose()

# Strip presentation attributes Medium ignores anyway.
for el in article.find_all(True):
    for attr in ("class", "style", "data-astro-cid", "loading", "decoding", "srcset", "sizes", "width", "height", "id"):
        el.attrs.pop(attr, None)
    for attr in [a for a in el.attrs if a.startswith("data-")]:
        el.attrs.pop(attr)

body = article.decode_contents()
doc = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>{title}</title>
<meta name="robots" content="noindex, nofollow">
<link rel="canonical" href="{SITE}/posts/{slug}/">
</head><body><article>
<h1>{title}</h1>
{body}
</article></body></html>
"""
(out_dir / "index.html").write_text(doc)
print(f"wrote public/medium/{slug}/index.html with {len(list(out_dir.glob('*.png')))} images")
