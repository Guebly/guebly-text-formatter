/**
 * Guebly Text Formatter
 * - LinkedIn/Instagram: no real markdown → use Unicode "pseudo bold/italic" + structure
 * - WhatsApp: supports *bold* and _italic_
 */

const mapNormal =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const mapBold =
  "𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭" +
  "𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇" +
  "𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟕𝟴𝟵";
const mapItalic =
  "𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡" +
  "𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻" +
  "0123456789";

function toMapped(input: string, to: string) {
  const out: string[] = [];
  for (const ch of input) {
    const idx = mapNormal.indexOf(ch);
    out.push(idx >= 0 ? to[idx] : ch);
  }
  return out.join("");
}

export function boldUnicode(s: string) {
  return toMapped(s, mapBold);
}

export function italicUnicode(s: string) {
  return toMapped(s, mapItalic);
}

function stripMarkdownDecorations(s: string) {
  // keep content, remove markers where needed
  return s.replace(/`{1,3}([^`]+?)`{1,3}/g, "$1");
}

function mdToWhatsApp(text: string) {
  // **bold** -> *bold*
  // *italic* -> _italic_ (avoid converting list bullets)
  let out = text;

  out = out.replace(/\*\*([^*]+?)\*\*/g, "*$1*");
  // single *italic* to _italic_ (but ignore bullets like "- * item")
  out = out.replace(/(^|[^*])\*([^*\n]+?)\*(?!\*)/g, "$1_$2_");

  // headings: # -> uppercase line
  out = out.replace(/^#{1,6}\s+(.*)$/gm, (_m, g1) => g1.toUpperCase());

  // blockquote: > -> prefix
  out = out.replace(/^>\s?/gm, "“").replace(/$/gm, "");
  return out;
}

function mdToUnicode(text: string) {
  let out = stripMarkdownDecorations(text);

  // headings: # -> bold unicode and spacing
  out = out.replace(/^#{1,6}\s+(.*)$/gm, (_m, g1) => boldUnicode(g1));

  // **bold**
  out = out.replace(/\*\*([^*]+?)\*\*/g, (_m, g1) => boldUnicode(g1));

  // *italic*
  out = out.replace(/(^|[^*])\*([^*\n]+?)\*(?!\*)/g, (_m, p1, g1) => `${p1}${italicUnicode(g1)}`);

  // tables -> "Campo: valor" (very simple)
  out = out.replace(/\n\|(.+?)\|\n\|([\s\S]+?)\|\n(?=\n|$)/g, (m) => m); // keep if complex

  // Convert markdown tables line-by-line (simple)
  const lines = out.split("\n");
  const res: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const isTableHeader = /^\|.*\|$/.test(line) && i + 1 < lines.length && /^\|\s*[-:]+/.test(lines[i + 1] || "");
    if (!isTableHeader) {
      res.push(line);
      i++;
      continue;
    }
    const headers = line.split("|").map(s => s.trim()).filter(Boolean);
    i += 2; // skip separator
    while (i < lines.length && /^\|.*\|$/.test(lines[i])) {
      const row = lines[i].split("|").map(s => s.trim()).filter(Boolean);
      // "Campo: valor" pairs
      for (let c = 0; c < Math.min(headers.length, row.length); c++) {
        res.push(`• ${boldUnicode(headers[c])}: ${row[c]}`);
      }
      res.push("");
      i++;
    }
  }

  return res.join("\n").replace(/\n{3,}/g, "\n\n");
}

export function formatForLinkedIn(text: string) {
  return mdToUnicode(text).trim();
}
export function formatForInstagram(text: string) {
  // Similar to LinkedIn
  return mdToUnicode(text).trim();
}
export function formatForWhatsApp(text: string) {
  return mdToWhatsApp(text).trim();
}

export function splitByMaxLen(text: string, maxLen: number) {
  if (!text) return [""];
  const chunks: string[] = [];
  let cur = "";
  const parts = text.split(/\n\n+/);
  for (const p of parts) {
    const block = (p + "\n\n");
    if ((cur + block).length <= maxLen) {
      cur += block;
      continue;
    }
    if (cur.trim()) chunks.push(cur.trimEnd());
    if (block.length <= maxLen) {
      cur = block;
    } else {
      // hard split
      let s = block;
      while (s.length > maxLen) {
        chunks.push(s.slice(0, maxLen));
        s = s.slice(maxLen);
      }
      cur = s;
    }
  }
  if (cur.trim()) chunks.push(cur.trimEnd());
  return chunks.length ? chunks : [text];
}
