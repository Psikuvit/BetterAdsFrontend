"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { RATE_LIMITED_EVENT } from "@/lib/http";

type ToastType = "info" | "error" | "success";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    function handleRateLimit() {
      showToast("You're making requests too quickly. Please slow down.", "error");
    }
    window.addEventListener(RATE_LIMITED_EVENT, handleRateLimit);
    return () => window.removeEventListener(RATE_LIMITED_EVENT, handleRateLimit);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`glass min-w-[240px] rounded-xl border-l-4 px-4 py-3 text-sm shadow-lg animate-slide-in-right ${
              t.type === "error"
                ? "border-l-error text-error dark:shadow-[0_0_20px_rgba(239,68,68,0.15)]"
                : t.type === "success"
                ? "border-l-success text-success dark:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                : "border-l-electric-blue text-electric-blue shadow-glow-blue"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
