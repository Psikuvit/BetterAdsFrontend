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
            className={`min-w-[240px] rounded-md border-l-4 bg-white px-4 py-2 text-sm text-neutral-900 shadow-sm dark:bg-neutral-900 dark:text-neutral-100 ${
              t.type === "error"
                ? "border-l-red-500"
                : t.type === "success"
                ? "border-l-green-500"
                : "border-l-neutral-400"
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
