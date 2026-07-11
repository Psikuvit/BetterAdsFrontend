"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SubmitEvent, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { errorMessage } from "@/lib/errors";
import GradientBackground from "@/components/effects/GradientBackground";
import CrystalLogo from "@/components/ui-custom/CrystalLogo";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(errorMessage(err, "Invalid email or password"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <GradientBackground />
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center animate-fade-up">
          <CrystalLogo size={72} />
          <h1 className="mt-4 text-3xl font-medium text-neutral-900 dark:text-white">
            Better<span className="text-gradient">Ads</span>
          </h1>
        </div>
        <div className="glass rounded-3xl p-8 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        <h2 className="mb-1 text-2xl font-medium text-neutral-900 dark:text-white">Welcome Back</h2>
        <p className="mb-6 text-sm text-neutral-500 dark:text-white/50">Sign in to access your dashboard.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          {error && <p className="text-sm text-error">{error}</p>}
          <Button type="submit" loading={loading} className="w-full py-2.5">
            Sign in
          </Button>
        </form>
        <div className="mt-5 flex justify-between text-sm text-neutral-500 dark:text-white/50">
          <Link href="/register" className="text-electric-blue transition-colors hover:text-neon-cyan">
            Create account
          </Link>
          <Link href="/forgot-password" className="transition-colors hover:text-neutral-700 dark:hover:text-white/80">
            Forgot password?
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
}
