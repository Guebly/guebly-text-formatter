// src/App.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Copy,
  Eraser,
  PlayCircle,
  Linkedin,
  Instagram,
  MessageCircle,
  Info,
} from "lucide-react";
import { ThemeToggle } from "./components/ThemeToggle";

import {
  formatForInstagram,
  formatForLinkedIn,
  formatForWhatsApp,
  splitByMaxLen,
} from "./lib/formatters";
import { ToastContainer, useToast } from "./lib/toast";

type PlatformKey = "linkedin" | "instagram" | "whatsapp";

const PLATFORM: Record<
  PlatformKey,
  { label: string; icon: React.ReactNode; helper: string; maxDefault: number }
> = {
  linkedin: {
    label: "LinkedIn",
    icon: <Linkedin size={18} />,
    helper: "LinkedIn não aplica markdown. Aqui o destaque é visual (Unicode).",
    maxDefault: 3500,
  },
  instagram: {
    label: "Instagram",
    icon: <Instagram size={18} />,
    helper: "Instagram não aplica markdown. O destaque é visual (Unicode).",
    maxDefault: 2200,
  },
  whatsapp: {
    label: "WhatsApp",
    icon: <MessageCircle size={18} />,
    helper: "WhatsApp suporta *negrito* e _itálico_. Aqui a conversão é real.",
    maxDefault: 3500,
  },
};

function format(platform: PlatformKey, text: string) {
  if (platform === "whatsapp") return formatForWhatsApp(text);
  if (platform === "instagram") return formatForInstagram(text);
  return formatForLinkedIn(text);
}

const demo = ``;

const LOGO_DARK = "https://www.guebly.com.br/logo-email.png"; // com nome
const LOGO_LIGHT = "https://www.guebly.com.br/guebly.png"; // só ícone

export default function App() {
  const { toasts, addToast } = useToast();

  // Theme
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("guebly_theme");
    if (saved === "light" || saved === "dark") return saved;
    return "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("guebly_theme", theme);
  }, [theme]);

  const logoSrc = theme === "dark" ? LOGO_DARK : LOGO_LIGHT;

  const [platform, setPlatform] = useState<PlatformKey>("linkedin");
  const [input, setInput] = useState(demo);

  const [executed, setExecuted] = useState("");
  const [splitEnabled, setSplitEnabled] = useState(true);
  const [maxLen, setMaxLen] = useState<number>(PLATFORM.linkedin.maxDefault);

  useEffect(() => {
    setMaxLen(PLATFORM[platform].maxDefault);
  }, [platform]);

  const preview = useMemo(() => format(platform, input), [platform, input]);
  const isStale = executed !== preview;

  const chunks = useMemo(() => {
    const out = executed || "";
    if (!splitEnabled) return [out];
    return splitByMaxLen(out, Math.max(200, maxLen || 3500));
  }, [executed, splitEnabled, maxLen]);

  const outText = useMemo(() => chunks.join("\n\n"), [chunks]);

  function onExecute() {
    setExecuted(preview);
    addToast("success", "Saída atualizada.");
  }

  function onClear() {
    setInput("");
    setExecuted("");
    addToast("info", "Campos limpos.");
  }

  async function copyText(text: string, okMsg: string) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      addToast("success", okMsg);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      addToast("success", okMsg);
    }
  }

  return (
    <div
      className="min-h-screen overflow-x-hidden selection:bg-purple-500/30"
      style={{ background: "var(--bg)", color: "var(--text)" }}
    >
      {/* Toasts ficam acima do ThemeToggle (ajustado em src/lib/toast.tsx) */}
      <ToastContainer toasts={toasts} />

      {/* ThemeToggle FIXO NO BOTTOM-RIGHT */}
      <ThemeToggle theme={theme} setTheme={setTheme} />

      {/* Background glows FIXED (não empurra layout / não “pula”) */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute top-[-180px] right-[-180px] w-[520px] h-[520px] md:w-[920px] md:h-[920px] rounded-full blur-[140px]"
          style={{ background: "var(--glowA)" }}
        />
        <div
          className="absolute bottom-[-220px] left-[-220px] w-[560px] h-[560px] md:w-[980px] md:h-[980px] rounded-full blur-[160px]"
          style={{ background: "var(--glowB)" }}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header
          className="sticky top-0 z-40 border-b shadow-2xl backdrop-blur-xl"
          style={{
            background: "color-mix(in srgb, var(--bg) 86%, transparent)",
            borderColor: "var(--panelBorder)",
          }}
        >
          <div className="px-6 md:px-10 py-5 max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <img
                src={logoSrc}
                alt="Guebly"
                className={`w-auto object-contain drop-shadow-2xl ${
                  theme === "dark" ? "h-14 md:h-16" : "h-12 md:h-14"
                }`}
                width={theme === "dark" ? 220 : 64}
                height={64}
                loading="eager"
              />

              <div className="leading-none">
                <h1 className="text-lg md:text-xl font-black tracking-tighter opacity-90">
                  TEXT<span className="text-blue-500">.FORMATTER</span>
                </h1>

                {/* BADGES (com estilo melhor) + REMOVIDO LOCAL • OFFLINE */}
                <div className="mt-2 flex flex-wrap gap-2 items-center">
                  <Badge>OPEN-SOURCE</Badge>
                  <Badge>SEM COLETA</Badge>
                  <Badge>SÓ FORMATAÇÃO</Badge>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {/* Platform select */}
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-2xl border"
                style={{
                  background: "var(--panel)",
                  borderColor: "var(--panelBorder)",
                }}
              >
                <span
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: "var(--muted)" }}
                >
                  PLATAFORMA
                </span>

                <div className="relative">
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as PlatformKey)}
                    className="appearance-none bg-transparent border rounded-xl px-4 py-2 pr-9 text-sm font-black outline-none transition"
                    style={{
                      borderColor: "var(--panelBorder)",
                      color: "var(--text)",
                      background:
                        "color-mix(in srgb, var(--panel) 70%, transparent)",
                    }}
                  >
                    <option value="linkedin">LinkedIn</option>
                    <option value="instagram">Instagram</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>

                  <div
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "var(--muted)" }}
                  >
                    {PLATFORM[platform].icon}
                  </div>
                </div>
              </div>

              {/* LIMPAR */}
              <button
                onClick={onClear}
                className="px-5 py-3 rounded-2xl font-black text-xs tracking-widest transition active:scale-95 flex items-center gap-2 border"
                style={{
                  background: "var(--panel)",
                  borderColor: "var(--panelBorder)",
                  color: "var(--muted)",
                }}
              >
                <Eraser size={16} /> LIMPAR
              </button>

              {/* EXECUTAR (MESMO TAMANHO DO LIMPAR) */}
              <button
                onClick={onExecute}
                className="
    relative
    px-5 py-3
    rounded-2xl
    font-black text-xs tracking-widest
    flex items-center gap-2
    border
    transition
    active:scale-95
    hover:-translate-y-[1px]
    select-none
    overflow-hidden
  "
                style={{
                  background:
                    theme === "dark"
                      ? "linear-gradient(180deg, rgba(15,23,42,0.85), rgba(2,6,23,0.95))"
                      : "linear-gradient(180deg, #ffffff, #f1f5f9)",
                  borderColor:
                    theme === "dark"
                      ? "rgba(255,255,255,0.14)"
                      : "rgba(15,23,42,0.14)",
                  color: theme === "dark" ? "#fff" : "#0f172a",
                  boxShadow:
                    theme === "dark"
                      ? `
          0 12px 28px rgba(0,0,0,0.45),
          inset 0 0 0 1px rgba(255,255,255,0.04)
        `
                      : `
          0 10px 24px rgba(15,23,42,0.12),
          inset 0 0 0 1px rgba(15,23,42,0.04)
        `,
                }}
              >
                {/* highlight sutil */}
                <span
                  className="absolute inset-0 opacity-0 hover:opacity-100 transition"
                  style={{
                    background:
                      theme === "dark"
                        ? "radial-gradient(500px circle at 20% 0%, rgba(59,130,246,0.18), transparent 40%)"
                        : "radial-gradient(500px circle at 20% 0%, rgba(59,130,246,0.14), transparent 40%)",
                  }}
                />

                <span className="relative flex items-center gap-2">
                  <PlayCircle size={16} />
                  EXECUTAR
                </span>
              </button>
            </div>
          </div>
        </header>

        <main className="p-6 md:p-12 max-w-[1920px] mx-auto space-y-8 animate-in fade-in duration-500">
          <section
            className="border rounded-[30px] p-6 md:p-8 shadow-2xl relative overflow-hidden"
            style={{
              background: "var(--panel)",
              borderColor: "var(--panelBorder)",
            }}
          >
            <div
              className="absolute top-0 left-0 w-full h-1 opacity-50"
              style={{
                background:
                  "linear-gradient(90deg, rgb(37,99,235), rgb(147,51,234), rgb(37,99,235))",
              }}
            />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-3">
              <div>
                <h2 className="text-xl md:text-2xl font-black flex items-center gap-3">
                  {PLATFORM[platform].icon} Central de Formatação
                </h2>
                <p
                  className="text-xs md:text-sm mt-1"
                  style={{ color: "var(--muted)" }}
                >
                  Cole o texto (Markdown/IA) e transforme para o que o app
                  realmente aceita. {PLATFORM[platform].helper}
                </p>
              </div>

              {/* DIVIDIR (explicação pronta no title) */}
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-2xl border"
                style={{
                  background:
                    "color-mix(in srgb, var(--panel) 65%, transparent)",
                  borderColor: "var(--panelBorder)",
                }}
                title="DIVIDIR: quebra a saída em blocos com no máximo X caracteres (ideal pra colar em partes no app)."
              >
                <label
                  className="flex items-center gap-2 text-xs font-black"
                  style={{ color: "var(--muted)" }}
                >
                  <input
                    type="checkbox"
                    checked={splitEnabled}
                    onChange={(e) => setSplitEnabled(e.target.checked)}
                    className="accent-purple-500"
                  />
                  DIVIDIR
                </label>

                <input
                  value={maxLen}
                  onChange={(e) => setMaxLen(Number(e.target.value || 0))}
                  type="number"
                  min={200}
                  max={10000}
                  className="w-28 rounded-xl px-3 py-2 text-sm font-black outline-none transition border"
                  style={{
                    background:
                      "color-mix(in srgb, var(--panel) 55%, transparent)",
                    borderColor: "var(--panelBorder)",
                    color: "var(--text)",
                  }}
                  disabled={!splitEnabled}
                />

                <span
                  className="text-[10px] font-bold"
                  style={{ color: "var(--muted)" }}
                >
                  quebra em partes
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Input */}
              <div
                className="border p-6 rounded-2xl shadow-lg"
                style={{
                  background:
                    "color-mix(in srgb, var(--panel) 65%, transparent)",
                  borderColor: "var(--panelBorder)",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm tracking-wide uppercase">
                    Entrada
                  </h3>
                  <span
                    className="text-[10px] font-mono"
                    style={{ color: "var(--muted)" }}
                  >
                    {input.length.toLocaleString()} chars
                  </span>
                </div>

                <textarea
                  className="w-full min-h-[420px] rounded-xl px-4 py-4 text-xs font-mono outline-none transition resize-y border"
                  style={{
                    background:
                      "color-mix(in srgb, var(--bg) 70%, transparent)",
                    borderColor: "var(--panelBorder)",
                    color: "var(--text)",
                  }}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Cole aqui..."
                />

                <div className="mt-4 flex flex-wrap gap-2">
                  <Tag># ## ###</Tag>
                  <Tag>**negrito**</Tag>
                  <Tag>*itálico*</Tag>
                  <Tag>&gt; blockquote</Tag>
                  <Tag>| tabela |</Tag>
                </div>
              </div>

              {/* Output */}
              <div
                className="border p-6 rounded-2xl shadow-lg"
                style={{
                  background:
                    "color-mix(in srgb, var(--panel) 65%, transparent)",
                  borderColor: "var(--panelBorder)",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm tracking-wide uppercase flex items-center gap-2">
                    Saída • {PLATFORM[platform].label}
                    <span
                      className="text-[10px] font-black px-2 py-1 rounded border"
                      style={{
                        borderColor: isStale
                          ? "rgba(148,163,184,0.30)"
                          : "rgba(34,197,94,0.30)",
                        background: isStale
                          ? "color-mix(in srgb, var(--bg) 75%, transparent)"
                          : "rgba(34,197,94,0.10)",
                        color: isStale ? "var(--muted)" : "rgb(34,197,94)",
                      }}
                    >
                      {isStale ? "PRECISA EXECUTAR" : "ATUALIZADA"}
                    </span>
                  </h3>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        copyText(chunks[0] || "", "Copiado (1º bloco).")
                      }
                      className="px-3 py-2 rounded-xl text-[11px] font-black transition flex items-center gap-2 border"
                      style={{
                        background:
                          "color-mix(in srgb, var(--bg) 75%, transparent)",
                        borderColor: "var(--panelBorder)",
                        color: "var(--text)",
                      }}
                      disabled={!executed}
                    >
                      <Copy size={14} /> 1º BLOCO
                    </button>

                    <button
                      onClick={() =>
                        copyText(executed, "Copiado (sem dividir).")
                      }
                      className="px-3 py-2 rounded-xl text-[11px] font-black transition flex items-center gap-2 border"
                      style={{
                        background:
                          "color-mix(in srgb, var(--bg) 75%, transparent)",
                        borderColor: "var(--panelBorder)",
                        color: "var(--text)",
                      }}
                      disabled={!executed}
                    >
                      <Copy size={14} /> INTEIRO
                    </button>
                  </div>
                </div>

                <textarea
                  className="w-full min-h-[420px] rounded-xl px-4 py-4 text-sm outline-none transition resize-y border font-unicode-safe"
                  style={{
                    background:
                      "color-mix(in srgb, var(--bg) 70%, transparent)",
                    borderColor: "var(--panelBorder)",
                    color: "var(--text)",
                  }}
                  value={outText}
                  readOnly
                  placeholder="Clique em EXECUTAR..."
                />

                <div
                  className="mt-4 flex items-start gap-3 text-[11px]"
                  style={{ color: "var(--muted)" }}
                >
                  <div className="mt-0.5">
                    <Info size={14} />
                  </div>
                  <p className="leading-relaxed">
                    Se você ver “�”, é falta de glyph Unicode na fonte do
                    sistema. A saída aqui é <b>sans</b> com stack mais “safe”.
                    Se quiser zerar isso 100%, só embutindo uma webfont (ou um
                    modo “compatível” que não use Unicode bold/italic).
                  </p>
                </div>
              </div>
            </div>
          </section>

          <footer
            className="text-center text-[10px] font-mono py-8"
            style={{ color: "var(--muted)" }}
          >
            © {new Date().getFullYear()} Guebly • Open-source tool • Sem coleta
            de dados
          </footer>
        </main>
      </div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-[10px] font-black px-3 py-1.5 rounded-full border tracking-widest transition"
      style={{
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--panel) 75%, transparent), color-mix(in srgb, var(--panel) 55%, transparent))",
        borderColor: "color-mix(in srgb, var(--panelBorder) 80%, transparent)",
        color: "var(--text)",
        boxShadow:
          "0 10px 30px color-mix(in srgb, var(--shadow) 24%, transparent)",
      }}
    >
      {children}
    </span>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="px-3 py-1.5 rounded-full text-[10px] font-bold border"
      style={{
        background: "color-mix(in srgb, var(--bg) 75%, transparent)",
        borderColor: "var(--panelBorder)",
        color: "var(--muted)",
      }}
    >
      {children}
    </span>
  );
}
