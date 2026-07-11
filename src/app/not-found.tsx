"use client";

import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";
import GradientBackground from "@/components/effects/GradientBackground";
import CrystalLogo from "@/components/ui-custom/CrystalLogo";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <GradientBackground />
      <div className="relative z-10 w-full max-w-sm text-center">
        <div className="mb-8 flex flex-col items-center animate-fade-up">
          <CrystalLogo size={72} />
        </div>
        <div className="glass rounded-3xl p-8 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 dark:bg-white/5 dark:text-white/50">
            <Compass className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-medium text-neutral-900 dark:text-white">Page not found</h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-white/50">
            The page you&apos;re looking for doesn&apos;t exist or may have moved.
          </p>
          <Link href="/" className="mt-6 inline-block">
            <Button>Go home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
