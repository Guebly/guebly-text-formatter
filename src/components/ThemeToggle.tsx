// src/components/ThemeToggle.tsx
import React from "react";
import { Moon, Sun } from "lucide-react";
import { createPortal } from "react-dom";

export function ThemeToggle({
  theme,
  setTheme,
}: {
  theme: "dark" | "light";
  setTheme: React.Dispatch<React.SetStateAction<"dark" | "light">>;
}) {
  return createPortal(
    <button
      onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      className="
        fixed z-[9999]
        bottom-6 right-6
        px-4 py-3
        rounded-2xl
        font-black text-xs tracking-widest
        border shadow-2xl
        flex items-center gap-2
        transition active:scale-95
        select-none
      "
      style={{
        background: "var(--panel)",
        borderColor: "var(--panelBorder)",
        color: "var(--text)",
        boxShadow:
          "0 18px 50px color-mix(in srgb, var(--shadow) 30%, transparent)",
        marginBottom: "env(safe-area-inset-bottom)",
        marginRight: "env(safe-area-inset-right)",
      }}
      title={theme === "dark" ? "Mudar para Light" : "Mudar para Dark"}
    >
      {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
      {theme === "dark" ? "DARK" : "LIGHT"}
    </button>,
    document.body
  );
}
