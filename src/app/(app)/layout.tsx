"use client";

import { RequireAuth } from "@/components/RequireAuth";
import { Nav } from "@/components/Nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <Nav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 animate-slide-up">
        {children}
      </main>
    </RequireAuth>
  );
}
