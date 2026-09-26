// Connectors between elements, drawn after layout so they never go out of sync with the boxes.
//
// In a diagram:  <script src="../../scripts/images/connect.js"></script>
//                <script>LINKS = [{ from: "a", to: "b" }, ...]</script>
// render.mjs calls drawLinks() once fonts and icons have loaded.
//
// Link options:
//   path:   "rl"  right edge of `from` → left edge of `to` (default)
//           "down" bottom of `from` → top of `to`, a smooth vertical S-curve (trees, fan-in/fan-out).
//                  fromAt / toAt: 0–1 position along the bottom / top edge (default 0.5)
//           "elbow" right edge of `from` → along a horizontal line → rounded corner → down into the
//                  top of `to` (a bus that drops into several targets). `y` overrides the bus height.
//           "u"   bottom of `from` → down → across → up into the bottom of `to`, with
//                  rounded corners (a clear "go back" loop). `drop` sets the depth.
//           "bb"  bottom of `from` → down `drop` px → bottom of `to` (a return loop)
//           "cc"  centre to centre, clipped to both boxes (hub-and-spoke)
//   dashed: true for dependency / feedback / optional paths
//   color:  CSS color or "var(--token)" (default var(--info))
//   arrow:  false to drop the arrowhead
//   drop:   depth of a "bb" loop in px (default 70)
//   label:  text placed at the midpoint of the path
window.LINKS = window.LINKS || [];

window.drawLinks = function () {
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("width", innerWidth);
  svg.setAttribute("height", innerHeight);
  svg.style.cssText = "position:absolute;inset:0;pointer-events:none;overflow:visible;z-index:0";
  document.body.style.position = "relative";
  document.body.prepend(svg);

  const box = id => {
    const el = document.getElementById(id);
    if (!el) throw new Error(`connect.js: no element #${id}`);
    const r = el.getBoundingClientRect();
    return { l: r.left, r: r.right, t: r.top, b: r.bottom, cx: (r.left + r.right) / 2, cy: (r.top + r.bottom) / 2 };
  };

  // Where the ray from a box's centre towards (x, y) leaves the box.
  const exit = (bx, x, y, pad = 6) => {
    const dx = x - bx.cx, dy = y - bx.cy;
    const sx = (bx.r - bx.l) / 2 + pad, sy = (bx.b - bx.t) / 2 + pad;
    const k = Math.min(sx / Math.abs(dx || 1e-9), sy / Math.abs(dy || 1e-9));
    return [bx.cx + dx * k, bx.cy + dy * k];
  };

  // SVG attributes can't take var(), so resolve "var(--x)" to its value.
  const resolve = c => {
    const m = /^var\((--[\w-]+)\)$/.exec(c);
    return m ? getComputedStyle(document.documentElement).getPropertyValue(m[1]).trim() : c;
  };

  const markers = new Map();
  const marker = color => {
    if (markers.has(color)) return markers.get(color);
    const id = `m${markers.size}`;
    const m = document.createElementNS(NS, "marker");
    m.setAttribute("id", id);
    m.setAttribute("viewBox", "0 0 10 10");
    m.setAttribute("refX", "8");
    m.setAttribute("refY", "5");
    m.setAttribute("markerWidth", "7");
    m.setAttribute("markerHeight", "7");
    m.setAttribute("orient", "auto-start-reverse");
    m.innerHTML = `<path d="M1 1 L9 5 L1 9" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
    svg.append(m);
    markers.set(color, id);
    return id;
  };

  const dots = [];
  for (const link of window.LINKS) {
    const a = box(link.from), b = box(link.to);
    const color = resolve(link.color || "var(--info)");
    let d, mid;
    if (link.path === "down") {
      const x1 = a.l + (a.r - a.l) * (link.fromAt ?? 0.5), y1 = a.b;
      const x2 = b.l + (b.r - b.l) * (link.toAt ?? 0.5), y2 = b.t - 7;
      const k = (y2 - y1) * 0.55;
      d = `M${x1} ${y1} C${x1} ${y1 + k}, ${x2} ${y2 - k}, ${x2} ${y2}`;
      mid = [(x1 + x2) / 2, (y1 + y2) / 2];
      if (link.dot !== false) {
        const c = document.createElementNS(NS, "circle");
        c.setAttribute("cx", x1); c.setAttribute("cy", y1); c.setAttribute("r", "4.5");
        c.setAttribute("fill", color);
        dots.push(c);
      }
    } else if (link.path === "elbow") {
      const y1 = link.y ?? a.cy, x1 = a.r, x2 = b.l + (b.r - b.l) * (link.toAt ?? 0.5), y2 = b.t - 7, r = 18;
      d = `M${x1} ${y1} H${x2 - r} Q${x2} ${y1} ${x2} ${y1 + r} V${y2}`;
      mid = [(x1 + x2) / 2, y1];
    } else if (link.path === "u") {
      const drop = link.drop ?? 44, r = 14;
      const y = Math.max(a.b, b.b) + drop;
      const x1 = a.cx, x2 = b.cx, dir = x2 < x1 ? -1 : 1;
      d = `M${x1} ${a.b + 6} V${y - r} Q${x1} ${y} ${x1 + dir * r} ${y} H${x2 - dir * r} Q${x2} ${y} ${x2} ${y - r} V${b.b + 10}`;
      mid = [(x1 + x2) / 2, y];
    } else if (link.path === "bb") {
      const drop = link.drop ?? 70;
      const y = Math.max(a.b, b.b) + drop;
      d = `M${a.cx} ${a.b + 8} C${a.cx} ${y}, ${b.cx} ${y}, ${b.cx} ${b.b + 10}`;
      mid = [(a.cx + b.cx) / 2, y - drop * 0.25];
    } else if (link.path === "cc") {
      const [x1, y1] = exit(a, b.cx, b.cy);
      const [x2, y2] = exit(b, a.cx, a.cy, 10);
      d = `M${x1} ${y1} L${x2} ${y2}`;
      mid = [(x1 + x2) / 2, (y1 + y2) / 2];
    } else {
      const x1 = a.r + 8, x2 = b.l - 10, y1 = a.cy, y2 = b.cy, k = (x2 - x1) / 2;
      d = y1 === y2 ? `M${x1} ${y1} L${x2} ${y2}` : `M${x1} ${y1} C${x1 + k} ${y1}, ${x2 - k} ${y2}, ${x2} ${y2}`;
      mid = [(x1 + x2) / 2, (y1 + y2) / 2];
    }
    const p = document.createElementNS(NS, "path");
    p.setAttribute("d", d);
    p.setAttribute("fill", "none");
    p.setAttribute("stroke", color);
    p.setAttribute("stroke-width", link.width ?? "2.25");
    p.setAttribute("stroke-linecap", "round");
    if (link.dashed) p.setAttribute("stroke-dasharray", "7 6");
    if (link.arrow !== false) p.setAttribute("marker-end", `url(#${marker(color)})`);
    svg.append(p);

    if (link.label) {
      const t = document.createElement("div");
      t.textContent = link.label;
      t.style.cssText = `position:absolute;left:${mid[0]}px;top:${mid[1]}px;transform:translate(-50%,-50%);
        background:var(--surface);border:1px solid color-mix(in srgb, ${color} 35%, transparent);border-radius:999px;
        padding:3px 12px;font-size:16px;font-weight:700;color:${color};white-space:nowrap;z-index:2;
        box-shadow:0 2px 8px rgba(50,0,99,.06)`;
      document.body.append(t);
    }
  }
  for (const c of dots) svg.append(c);
};
