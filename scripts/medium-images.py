#!/usr/bin/env python3
"""Write HTML sources for the images Medium needs instead of tables and code blocks.

    python3 scripts/medium-images.py <slug>

Medium has no tables and its importer mangles code blocks, so scripts/medium-export.py swaps
them for images, in document order: tables from image-src/medium-<slug>/png/[0-9]*.png and
code blocks from .../png/code-*.png. This script writes those pages from the post's Markdown:

    image-src/medium-<slug>/1-<heading>.html, 2-..., code-1-<heading>.html, ...

Each table image gets a title from the nearest heading above it: edit the <div class="title">
if a shorter or sharper one reads better. Then render and move the PNGs:

    node scripts/images/render.mjs medium-<slug>
    mkdir -p image-src/medium-<slug>/png
    mv src/assets/images/posts/medium-<slug>/*.png image-src/medium-<slug>/png/
    rmdir src/assets/images/posts/medium-<slug>
"""
import html, re, sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
slug = sys.argv[1]
md = (root / "src/data/blog" / f"{slug}.md").read_text()
out = root / "image-src" / f"medium-{slug}"
out.mkdir(parents=True, exist_ok=True)

TABLE_CSS = """<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="../../scripts/images/theme.css"><style>.tbl{margin-top:34px;border:1px solid var(--divider);border-radius:16px;overflow:hidden;background:#fff;box-shadow:var(--shadow)}
.r{display:grid;border-top:1px solid var(--divider)}
.r:first-child{border-top:0}
.r>div{padding:16px 22px;font-size:23px;line-height:1.4;color:var(--ink)}
.h>div{background:var(--info-tint);font-size:18px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--info-deep);padding:12px 18px}
.r:not(.h):nth-child(odd)>div{background:var(--canvas)}
b{color:var(--title);font-weight:800}
code{font:600 20px ui-monospace,Menlo,monospace;background:var(--canvas-alt);padding:2px 7px;border-radius:6px;color:var(--plum)}
</style></head>"""

CODE_CSS = """<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="../../scripts/images/theme.css"><style>
.frame{padding:40px 48px;height:auto}
.code{background:#1d1530;border-radius:18px;padding:34px 38px;box-shadow:0 10px 30px rgba(50,0,99,.18)}
.dots{display:flex;gap:9px;margin-bottom:22px}.dots i{width:13px;height:13px;border-radius:50%;display:block}
pre{margin:0;font:500 22px/1.55 ui-monospace,"SF Mono",Menlo,monospace;color:#efe9f7;white-space:pre-wrap;word-break:break-word}
</style></head>"""


def inline(t):
    t = html.escape(t, quote=False)
    t = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", t)
    t = re.sub(r"`(.+?)`", r"<code>\1</code>", t)
    return re.sub(r"\*(.+?)\*", r"<i>\1</i>", t)


def heading_before(pos):
    hs = re.findall(r"^#{2,3} (.+)$", md[:pos], re.M)
    return hs[-1].strip() if hs else "Table"


def kebab(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:40]


# Tables: consecutive lines starting with "|".
for i, m in enumerate(re.finditer(r"(?:^\|.*\|\n)+", md, re.M), 1):
    rows = [r.strip().strip("|").split("|") for r in m.group(0).strip().split("\n")]
    head, body = rows[0], rows[2:]
    cols = "300px 1fr" if len(head) == 2 else f"200px repeat({len(head) - 1}, 1fr)"
    row = lambda cells, h="": f'<div class="r{h}" style="grid-template-columns:{cols}">' + "".join(
        f"<div>{inline(c.strip())}</div>" for c in cells) + "</div>"
    title = heading_before(m.start())
    doc = (TABLE_CSS + '<body data-size="1200xauto"><div class="frame" style="height:auto">'
           f'<div class="title" style="font-size:48px">{html.escape(title)}</div><div class="tbl">'
           + row(head, " h") + "".join(row(r) for r in body) + "</div></div></body></html>")
    (out / f"{i}-{kebab(title)}.html").write_text(doc)
    print(f"table {i}: {title}")

# Code blocks: fenced ``` blocks.
for i, m in enumerate(re.finditer(r"^```[^\n]*\n(.*?)^```", md, re.M | re.S), 1):
    title = heading_before(m.start())
    doc = (CODE_CSS + '<body data-size="1200xauto"><div class="frame"><div class="code"><div class="dots">'
           '<i style="background:#f06a9e"></i><i style="background:#f4a393"></i><i style="background:#9a7fd4"></i></div>'
           f"<pre>{html.escape(m.group(1).rstrip(), quote=False)}</pre></div></div></body></html>")
    (out / f"code-{i}-{kebab(title)}.html").write_text(doc)
    print(f"code {i}: under '{title}'")
