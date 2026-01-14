// src/lib/formatters.ts
/**
 * Formatter: ChatGPT Markdown → WhatsApp / LinkedIn / Instagram
 * Fix crítico: WhatsApp precisa PROTEGER o *bold* antes de converter *italic*.
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

function protectCode(text: string) {
  const chunks: ProtectedChunk[] = [];
  let out = text;

  out = out.replace(/```[\s\S]*?```/g, (m) => {
    const key = `⟦CODEBLOCK_${chunks.length}⟧`;
    chunks.push({ key, value: m });
    return key;
  });

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

function mdLinksToPlain(text: string) {
  return text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_m, t, u) => {
    return `${t} (${u})`;
  });
}

// separadores e blockquote “limpos” sem destruir semântica
function cleanupMarkdown(text: string) {
  let out = text;

  out = out.replace(/^\s*---+\s*$/gm, "────────────");
  out = out.replace(/^\s*>\s?/gm, ""); // remove '> '

  out = mdLinksToPlain(out);
  return out;
}

function normalizeBullets(text: string, bullet = "•") {
  return text.replace(
    /^(\s*)(?:[-+*]|\d+[.)])\s+/gm,
    (_m, indent) => `${indent}${bullet} `
  );
}

/**
 * PROTEGE *BOLD* do WhatsApp antes de converter *italic*.
 * Isso evita: **SENTRION** → *SENTRION* → _SENTRION_
 */
function protectWhatsAppBold(text: string) {
  const chunks: ProtectedChunk[] = [];
  let out = text;

  // já em WhatsApp: *bold*
  out = out.replace(/\*([^*\n]+?)\*/g, (m) => {
    // não proteger bullet "• " ou "* " no início da linha (mas aqui já não tem)
    const key = `⟦WBOLD_${chunks.length}⟧`;
    chunks.push({ key, value: m });
    return key;
  });

  return { out, chunks };
}

function toWhatsApp(text: string) {
  const code = protectCode(text);
  let out = code.out;

  // headings markdown → *BOLD*
  out = out.replace(/^#{1,6}\s+(.*)$/gm, (_m, t) => `*${t.trim()}*`);

  // **bold** (markdown) → *bold* (WhatsApp)
  out = out.replace(/\*\*([^*\n]+?)\*\*/g, (_m, g1) => `*${g1}*`);

  // PROTEGE os *bold* antes de mexer em itálico com asterisco
  const boldProt = protectWhatsAppBold(out);
  out = boldProt.out;

  // *italic* (markdown) → _italic_ (WhatsApp)
  // regra com bordas para NÃO pegar bullets/listas
  out = out
    .split("\n")
    .map((line) => {
      // se a linha é um bullet começando com "* " ou "- " etc, não mexe nisso aqui
      // (a normalização de bullets vem depois)
      return line.replace(
        /(^|[\s([{"'“‘])\*([^*\n]+?)\*(?=[\s)\]}.,!?;:'"”’]|$)/g,
        (_m, p1, g1) => `${p1}_${g1}_`
      );
    })
    .join("\n");

  // restaura *bold*
  out = restoreProtected(out, boldProt.chunks);

  // bullets legíveis (depois de tudo)
  out = normalizeBullets(out, "•");

  // limpa excesso
  out = out.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

  out = restoreProtected(out, code.chunks);
  return out;
}

function toUnicodeSocial(text: string) {
  const code = protectCode(text);
  let out = code.out;

  out = out.replace(/^#{1,6}\s+(.*)$/gm, (_m, t) => boldUnicode(t.trim()));
  out = out.replace(/\*\*([^*\n]+?)\*\*/g, (_m, g1) => boldUnicode(g1));

  // _italic_
  out = out.replace(
    /(^|[\s([{"'“‘>])_([^_\n]+?)_(?=[\s)\]}.,!?;:'"”’]|$)/g,
    (_m, p1, g1) => `${p1}${italicUnicode(g1)}`
  );

  // *italic*
  out = out
    .split("\n")
    .map((line) =>
      line.replace(
        /(^|[\s([{"'“‘])\*([^*\n]+?)\*(?=[\s)\]}.,!?;:'"”’]|$)/g,
        (_m, p1, g1) => `${p1}${italicUnicode(g1)}`
      )
    )
    .join("\n");

  out = normalizeBullets(out, "•");
  out = out.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

  out = restoreProtected(out, code.chunks);
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
      if (block.length <= maxLen) cur = block;
      else {
        let s = block;
        while (s.length > maxLen) {
          chunks.push(s.slice(0, maxLen));
          s = s.slice(maxLen);
        }
        cur = s;
      }
      continue;
    }

    if (cur.length + 2 + block.length <= maxLen) cur += `\n\n${block}`;
    else {
      pushCur();
      if (block.length <= maxLen) cur = block;
      else {
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
