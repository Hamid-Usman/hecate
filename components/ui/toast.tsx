"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Icon } from "./icons";

interface Toast {
  id: number;
  tone: "ok" | "error";
  message: string;
}
const Ctx = createContext<{ toast: (message: string, tone?: Toast["tone"]) => void }>({ toast: () => {} });

export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const toast = useCallback((message: string, tone: Toast["tone"] = "ok") => {
    const id = Date.now() + Math.random();
    setItems((list) => [...list.slice(-3), { id, tone, message }]);
    setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), tone === "error" ? 7000 : 4000);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed right-4 bottom-4 z-[100] flex w-[min(24rem,calc(100%-2rem))] flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            role={t.tone === "error" ? "alert" : "status"}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border bg-paper px-4 py-3 text-sm shadow-[0_12px_40px_rgba(28,27,28,0.12)] ${t.tone === "error" ? "border-bad/40" : "border-ink/12"}`}
          >
            <Icon name={t.tone === "error" ? "alert" : "check"} className={`mt-0.5 ${t.tone === "error" ? "text-bad" : "text-ok"}`} />
            <p className="flex-1">{t.message}</p>
            <button type="button" aria-label="Dismiss" onClick={() => setItems((l) => l.filter((x) => x.id !== t.id))} className="text-slate hover:text-ink">
              <Icon name="close" className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
