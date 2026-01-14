// src/lib/toast.tsx
import React, { useCallback, useMemo, useState } from "react";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

export type ToastType = {
  id: number;
  type: "success" | "error" | "info";
  message: string;
};

export function useToast() {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const addToast = useCallback((type: ToastType["type"], message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, type, message }]);

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  }, []);

  return useMemo(() => ({ toasts, addToast }), [toasts, addToast]);
}

/**
 * IMPORTANT:
 * - Toasts ficam acima do botão de tema (ThemeToggle está em bottom-6 right-6).
 * - Aqui usamos bottom-24 right-6 pra não sobrepor.
 */
export function ToastContainer({ toasts }: { toasts: ToastType[] }) {
  return (
    <div className="fixed bottom-24 right-6 z-[9999] flex flex-col gap-2 pointer-events-none w-[92%] md:w-auto">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={[
            "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md",
            "animate-in slide-in-from-right duration-300",
            t.type === "success"
              ? "bg-green-500/10 border-green-500/50 text-green-400"
              : t.type === "error"
              ? "bg-red-500/10 border-red-500/50 text-red-400"
              : "bg-blue-500/10 border-blue-500/50 text-blue-400",
          ].join(" ")}
        >
          {t.type === "success" ? (
            <CheckCircle size={18} />
          ) : t.type === "error" ? (
            <XCircle size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <span className="text-sm font-bold">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
