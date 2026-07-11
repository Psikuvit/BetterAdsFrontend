"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import GradientBackground from "@/components/effects/GradientBackground";
import CrystalLogo from "@/components/ui-custom/CrystalLogo";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <GradientBackground />
      <div className="relative z-10 w-full max-w-sm text-center">
        <div className="mb-8 flex flex-col items-center animate-fade-up">
          <CrystalLogo size={72} />
        </div>
        <div className="glass rounded-3xl p-8 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-error/10 text-error">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-medium text-neutral-900 dark:text-white">Something went wrong</h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-white/50">
            An unexpected error occurred. You can try again or head back home.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Link href="/">
              <Button variant="secondary">Go home</Button>
            </Link>
            <Button onClick={reset}>Try again</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
