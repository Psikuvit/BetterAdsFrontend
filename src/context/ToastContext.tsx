"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { RATE_LIMITED_EVENT } from "@/lib/http";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

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

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

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
            className={cn(
              "flex items-center gap-3 min-w-[280px] max-w-sm rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground shadow-lg backdrop-blur-lg",
              "animate-in slide-in-from-right-2 fade-in duration-300",
              t.type === "error" && "border-l-destructive border-l-2",
              t.type === "success" && "border-l-success border-l-2",
              t.type === "info" && "border-l-primary border-l-2"
            )}
          >
            <span className="flex-1">{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="size-4" />
            </button>
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
