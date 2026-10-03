#!/usr/bin/env python3
"""Build a Medium-importable copy of a post.

    python3 scripts/medium-export.py <slug> [table-image-dir] [out-name]

Reads the built page (dist/posts/<slug>/index.html, so run `pnpm build` first) and writes
public/medium/<slug>/index.html: plain headings, paragraphs, lists, <pre> code and absolute
PNG image URLs, which is what Medium's "Import a story" tool understands. Markdown tables
become images, in order, from table-image-dir (see image-src/medium-<slug>/). The page is
noindex and deliberately has no rel=canonical: Medium's importer follows it and would
import the real (image-less) page instead. Set the canonical link to the real post in
Medium's story settings after importing.

After importing, in Medium's editor: the importer makes every heading a large heading and
adds an empty heading after each one. Select each subsection heading and press ⌘⌥2 (small
heading), delete the empty headings, and add a Contents list linking to
https://medium.com/p/<story-id>#<heading name attribute> for the main sections only.
"""
import re, shutil, sys
from pathlib import Path
from bs4 import BeautifulSoup

SITE = "https://evgenirusev.com"
root = Path(__file__).resolve().parent.parent
slug = sys.argv[1]
table_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else None
# Medium caches an import by URL, so a re-import needs a new path: pass a name like "<slug>-v3".
out_name = sys.argv[3] if len(sys.argv) > 3 else slug

html = (root / "dist/posts" / slug / "index.html").read_text()
page = BeautifulSoup(html, "html.parser")
title = page.find("h1").get_text(strip=True)
article = page.find("article", id="article")

out_dir = root / "public/medium" / out_name
if out_dir.exists():
    shutil.rmtree(out_dir)
out_dir.mkdir(parents=True)
public_base = f"{SITE}/medium/{out_name}"

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
    imgs = sorted(table_dir.glob("[0-9]*.png")) if table_dir else []
    if len(imgs) != len(tables):
        sys.exit(f"{len(tables)} tables but {len(imgs)} table images in {table_dir}")
    for t, p in zip(tables, imgs):
        shutil.copy(p, out_dir / p.name)
        fig = page.new_tag("figure")
        fig.append(page.new_tag("img", src=f"{public_base}/{p.name}", alt=p.stem.split("-", 1)[-1].replace("-", " ")))
        t.replace_with(fig)

# Code blocks -> pre-rendered images (code-*.png) when provided: Medium's importer drops
# or flattens many <pre> blocks. Otherwise fall back to plain <pre> text.
code_imgs = sorted(table_dir.glob("code-*.png")) if table_dir else []
if code_imgs:
    pres = article.find_all("pre")
    if len(code_imgs) != len(pres):
        sys.exit(f"{len(pres)} code blocks but {len(code_imgs)} code images")
    for pre, p in zip(pres, code_imgs):
        shutil.copy(p, out_dir / p.name)
        fig = page.new_tag("figure")
        fig.append(page.new_tag("img", src=f"{public_base}/{p.name}", alt=p.stem.split("-", 2)[-1].replace("-", " ")))
        (pre.find_parent("figure") or pre).replace_with(fig)

# Remaining code blocks -> plain <pre> text.
for pre in article.find_all("pre"):
    text = "\n".join(l.get_text() for l in pre.select(".line")) or pre.get_text()
    # Medium's importer collapses newlines inside <pre>; explicit <br> survives.
    new = page.new_tag("pre")
    for i, line in enumerate(text.rstrip().split("\n")):
        if i:
            new.append(page.new_tag("br"))
        new.append(line)
    pre.replace_with(new)
for btn in article.select("button"):
    btn.decompose()

# Bullet lists whose items lead with a bold phrase: Medium's importer silently drops some
# of them, so write each item as its own paragraph. Numbered lists import fine.
def bullets_to_paragraphs():
    for ul in article.find_all("ul"):
        items = ul.find_all("li", recursive=False)
        if items and all(li.find("strong") for li in items):
            for li in items:
                para = page.new_tag("p")
                for child in list(li.contents):
                    para.append(child)
                ul.insert_before(para)
            ul.decompose()

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

bullets_to_paragraphs()

# Callouts (<p class="callout">, the author's own key claim): Medium has no equivalent and a
# quote would read as someone else's words, so make the whole paragraph bold.
for p in article.select("p.callout"):
    strong = page.new_tag("strong")
    for child in list(p.contents):
        strong.append(child)
    p.clear()
    p.append(strong)

# A leading all-italic paragraph gets dropped by Medium's importer; make it a quote.
first = article.find("p")
if first and first.find("em") and first.get_text(strip=True) == first.find("em").get_text(strip=True):
    quote = page.new_tag("blockquote")
    quote.string = first.get_text(strip=True)
    first.replace_with(quote)

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
</head><body><article>
<h1>{title}</h1>
{body}
</article></body></html>
"""
(out_dir / "index.html").write_text(doc)
print(f"wrote public/medium/{out_name}/index.html with {len(list(out_dir.glob('*.png')))} images")
