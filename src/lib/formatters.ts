// src/lib/formatters.ts
/**
 * Guebly Text Formatter (robust rewrite)
 *
 * Goals:
 * - Keep "ChatGPT-style" Markdown semantics.
 * - Convert to platform dialects safely (no regex chaos that breaks bullets/emphasis).
 *
 * Platforms:
 * - LinkedIn / Instagram: no real Markdown → use Unicode pseudo-bold/italic + clean structure
 * - WhatsApp: supports *bold* and _italic_ (and we keep lists readable)
 */

type ProtectedChunk = { key: string; value: string };

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

function unicodeMapChar(ch: string, map: string) {
  const idx = mapNormal.indexOf(ch);
  return idx >= 0 ? map[idx] : ch;
}

function boldUnicode(s: string) {
  return Array.from(s).map((c) => unicodeMapChar(c, mapBold)).join("");
}
function italicUnicode(s: string) {
  return Array.from(s).map((c) => unicodeMapChar(c, mapItalic)).join("");
}

function normalize(text: string) {
  return (text ?? "").replace(/\r\n?/g, "\n");
}

/**
 * Protect code blocks and inline code to avoid breaking emphasis markers inside code.
 */
function protectCode(text: string) {
  const chunks: ProtectedChunk[] = [];
  let out = text;

  // fenced code blocks
  out = out.replace(/```[\s\S]*?```/g, (m) => {
    const key = `⟦CODEBLOCK_${chunks.length}⟧`;
    chunks.push({ key, value: m });
    return key;
  });

  // inline code
  out = out.replace(/`[^`\n]+`/g, (m) => {
    const key = `⟦CODE_${chunks.length}⟧`;
    chunks.push({ key, value: m });
    return key;
  });

  return { out, chunks };
}

function restoreProtected(text: string, chunks: ProtectedChunk[]) {
  let out = text;
  for (const c of chunks) out = out.replaceAll(c.key, c.value);
  return out;
}

/**
 * Convert Markdown links: [text](url) → text (url)
 * Keep raw URLs as-is.
 */
function mdLinksToPlain(text: string) {
  return text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_m, t, u) => {
    return `${t} (${u})`;
  });
}

/**
 * Convert markdown tables to readable text:
 * | Campo | Valor |
 * | --- | --- |
 * | X | Y |
 * →
 * Campo: X
 * Valor: Y
 */
function mdTablesToPlain(text: string) {
  const lines = text.split("\n");
  const out: string[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const isHeader = /^\|.*\|$/.test(line);
    const next = lines[i + 1] ?? "";
    const isSep = /^\|\s*[:\- ]+\|/.test(next);

    if (!isHeader || !isSep) {
      out.push(line);
      i += 1;
      continue;
    }

    const headers = line
      .trim()
      .slice(1, -1)
      .split("|")
      .map((s) => s.trim());

    i += 2; // skip header + sep

    const rows: string[][] = [];
    while (i < lines.length && /^\|.*\|$/.test(lines[i])) {
      const cells = lines[i]
        .trim()
        .slice(1, -1)
        .split("|")
        .map((s) => s.trim());
      rows.push(cells);
      i += 1;
    }

    if (!rows.length) {
      out.push("");
      continue;
    }

    for (let r = 0; r < rows.length; r++) {
      const cells = rows[r];
      for (let c = 0; c < headers.length; c++) {
        const h = headers[c] ?? `Coluna ${c + 1}`;
        const v = (cells[c] ?? "").trim();
        if (!h && !v) continue;
        out.push(`${h}: ${v}`);
      }
      if (r !== rows.length - 1) out.push("");
    }
  }

  return out.join("\n");
}

/**
 * Clean up some ChatGPT markdown noise without destroying meaning.
 */
function cleanupMarkdown(text: string) {
  let out = text;

  // separators
  out = out.replace(/^\s*---+\s*$/gm, "────────────");

  // blockquotes (remove leading > )
  out = out.replace(/^\s*>\s?/gm, "");

  // links + tables
  out = mdLinksToPlain(out);
  out = mdTablesToPlain(out);

  return out;
}

/**
 * Convert list markers at line starts to a consistent bullet.
 */
function normalizeBullets(text: string, bullet = "•") {
  return text.replace(
    /^(\s*)(?:[-+*]|\d+[.)])\s+/gm,
    (_m, indent) => `${indent}${bullet} `
  );
}

/**
 * WhatsApp:
 * - **bold** -> *bold*
 * - _italic_ stays
 * - *italic* -> _italic_ (but avoids breaking bullets)
 */
function toWhatsApp(text: string) {
  const protectedRes = protectCode(text);
  let out = protectedRes.out;

  // headings -> bold line
  out = out.replace(/^#{1,6}\s+(.*)$/gm, (_m, t) => `*${t.trim()}*`);

  // bold
  out = out.replace(/\*\*([^*\n]+?)\*\*/g, (_m, g1) => `*${g1}*`);

  // *italic* -> _italic_ (line-safe)
  out = out
    .split("\n")
    .map((line) =>
      line.replace(/(^|[^*])\*([^*\n]+?)\*(?!\*)/g, (_m, p1, g1) => {
        return `${p1}_${g1}_`;
      })
    )
    .join("\n");

  // bullets readable
  out = normalizeBullets(out, "•");

  // tidy
  out = out.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

  out = restoreProtected(out, protectedRes.chunks);
  return out;
}

/**
 * LinkedIn/Instagram: convert emphasis to Unicode pseudo styles.
 */
function toUnicodeSocial(text: string) {
  const protectedRes = protectCode(text);
  let out = protectedRes.out;

  out = out.replace(/^#{1,6}\s+(.*)$/gm, (_m, t) => boldUnicode(t.trim()));
  out = out.replace(/\*\*([^*\n]+?)\*\*/g, (_m, g1) => boldUnicode(g1));

  // underscore italic
  out = out.replace(
    /(^|[\s([{"'“‘>])_([^_\n]+?)_(?=[\s)\]}.,!?;:'"”’]|$)/g,
    (_m, p1, g1) => `${p1}${italicUnicode(g1)}`
  );

  // asterisk italic
  out = out
    .split("\n")
    .map((line) =>
      line.replace(
        /(^|[^*])\*([^*\n]+?)\*(?!\*)/g,
        (_m, p1, g1) => `${p1}${italicUnicode(g1)}`
      )
    )
    .join("\n");

  out = normalizeBullets(out, "•");
  out = out.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

  out = restoreProtected(out, protectedRes.chunks);
  return out;
}

export function formatForWhatsApp(input: string) {
  const text = cleanupMarkdown(normalize(input));
  return toWhatsApp(text);
}

export function formatForLinkedIn(input: string) {
  const text = cleanupMarkdown(normalize(input));
  return toUnicodeSocial(text);
}

export function formatForInstagram(input: string) {
  const text = cleanupMarkdown(normalize(input));
  return toUnicodeSocial(text);
}

/**
 * Split text into chunks by max length, preserving paragraph boundaries.
 */
export function splitByMaxLen(text: string, maxLen: number) {
  const t = normalize(text).trim();
  if (!t) return [""];
  if (maxLen <= 0) return [t];

  const blocks = t.split(/\n{2,}/g).map((b) => b.trim()).filter(Boolean);
  const chunks: string[] = [];
  let cur = "";

  const pushCur = () => {
    if (cur.trim()) chunks.push(cur.trimEnd());
    cur = "";
  };

  for (const block of blocks) {
    if (!cur) {
      if (block.length <= maxLen) {
        cur = block;
      } else {
        let s = block;
        while (s.length > maxLen) {
          chunks.push(s.slice(0, maxLen));
          s = s.slice(maxLen);
        }
        cur = s;
      }
      continue;
    }

    if (cur.length + 2 + block.length <= maxLen) {
      cur += `\n\n${block}`;
    } else {
      pushCur();
      if (block.length <= maxLen) {
        cur = block;
      } else {
        let s = block;
        while (s.length > maxLen) {
          chunks.push(s.slice(0, maxLen));
          s = s.slice(maxLen);
        }
        cur = s;
      }
    }
  }

  pushCur();
  return chunks.length ? chunks : [t];
}
