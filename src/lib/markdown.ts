// Ported exactly from ThePodium_v5.html's renderMd(): a small custom
// markdown subset (## / ### headings, > blockquotes, - bullets, blank-line
// paragraphs, **bold**, *italic*, `code`). Escapes HTML first, so the
// output is safe to render with dangerouslySetInnerHTML -- same approach
// the prototype itself uses.
export function renderMd(raw: string): string {
  if (!raw) return "";
  const h = raw.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const lines = h.split("\n");
  const out: string[] = [];
  let inUl = false;

  for (const line of lines) {
    if (/^## /.test(line)) {
      if (inUl) { out.push("</ul>"); inUl = false; }
      out.push(
        `<h2 style="font-family:'Fraunces',serif;font-size:19px;font-weight:600;color:var(--text);margin:20px 0 8px;line-height:1.3">${line.slice(3)}</h2>`,
      );
    } else if (/^### /.test(line)) {
      if (inUl) { out.push("</ul>"); inUl = false; }
      out.push(
        `<h3 style="font-size:16px;font-weight:600;color:var(--text);margin:14px 0 6px">${line.slice(4)}</h3>`,
      );
    } else if (/^&gt; /.test(line)) {
      if (inUl) { out.push("</ul>"); inUl = false; }
      out.push(
        `<blockquote style="border-left:3px solid var(--amber);padding:6px 0 6px 16px;margin:12px 0;color:var(--text-muted);font-style:italic;line-height:1.7">${line.slice(5)}</blockquote>`,
      );
    } else if (/^[-*] /.test(line)) {
      if (!inUl) { out.push(`<ul style="padding-left:18px;margin:8px 0">`); inUl = true; }
      out.push(
        `<li style="margin:5px 0;color:var(--text-muted);line-height:1.65">${line.slice(2)}</li>`,
      );
    } else {
      if (inUl) { out.push("</ul>"); inUl = false; }
      out.push(
        line === ""
          ? `<div style="height:8px"></div>`
          : `<p style="margin:0 0 12px;color:var(--text-muted);line-height:1.85">${line}</p>`,
      );
    }
  }
  if (inUl) out.push("</ul>");

  return out
    .join("")
    .replace(/\*\*([^*\n]+)\*\*/g, `<strong style="color:var(--text);font-weight:600">$1</strong>`)
    .replace(/\*([^*\n]+)\*/g, "<em>$1</em>")
    .replace(
      /`([^`\n]+)`/g,
      `<code style="background:var(--elevated);padding:1px 5px;border-radius:3px;font-size:13px;font-family:monospace">$1</code>`,
    );
}
