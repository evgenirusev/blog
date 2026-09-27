// Plain-text and markdown code blocks get light highlighting so terminal walkthroughs and
// spec examples read like the Medium images: /slash-commands, [status] markers and # headings.
const PLAIN_LANGS = new Set(["text", "txt", "plaintext", "markdown", "md"]);
export const transformerPlainHighlight = () => ({
  name: "plain-highlight",
  line(node) {
    if (!PLAIN_LANGS.has(this.options.lang)) return;
    const rules = [
      [/(?<![\w/])\/[a-z][\w-]*(?:<[\w-]+>)?/g, "tok-cmd"],
      [/\[(?:built|partial|planned|from code[^\]]*|withdrawn[^\]]*)\]/g, "tok-status"],
    ];
    const text = node.children.map(c => (c.children || []).map(t => t.value || "").join("")).join("");
    if (/^\s*#{1,6}\s/.test(text) && this.options.lang.startsWith("m")) {
      node.properties.class = `${node.properties.class || ""} tok-heading`.trim();
      return;
    }
    // Flatten the line (the markdown grammar splits "[built]" into several tokens), then
    // re-split it on the highlight rules. These blocks are near-monochrome anyway.
    const base = node.children[0] || { type: "element", tagName: "span", properties: {}, children: [] };
    const plain = value => ({ type: "element", tagName: "span", properties: { style: base.properties?.style }, children: [{ type: "text", value }] });
    const hits = [];
    for (const [re, cls] of rules) for (const m of text.matchAll(re)) hits.push([m.index, m[0], cls]);
    if (!hits.length) return;
    hits.sort((x, y) => x[0] - y[0]);
    const out = [];
    let last = 0;
    for (const [i, v, cls] of hits) {
      if (i < last) continue;
      if (i > last) out.push(plain(text.slice(last, i)));
      out.push({ type: "element", tagName: "span", properties: { class: cls }, children: [{ type: "text", value: v }] });
      last = i + v.length;
    }
    if (last < text.length) out.push(plain(text.slice(last)));
    node.children = out;
  },
});
