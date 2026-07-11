"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SubmitEvent, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { errorMessage } from "@/lib/errors";
import { Role } from "@/lib/types";
import GradientBackground from "@/components/effects/GradientBackground";
import CrystalLogo from "@/components/ui-custom/CrystalLogo";

const ROLES: Role[] = ["ADVERTISER", "PUBLISHER", "ADMIN"];

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("ADVERTISER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(email, password, role);
      router.push("/dashboard");
    } catch (err) {
      setError(errorMessage(err, "Could not create account"));
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
        <h2 className="mb-1 text-2xl font-medium text-neutral-900 dark:text-white">Create Account</h2>
        <p className="mb-6 text-sm text-neutral-500 dark:text-white/50">Start creating intelligent ads today.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="register-email"
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <Input
            id="register-password"
            label="Password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="register-role" className="text-sm font-medium text-neutral-600 dark:text-white/70">
              Role
            </label>
            <select
              id="register-role"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none focus:border-electric-blue focus:shadow-glow-blue transition-all duration-200 dark:border-white/10 dark:bg-white/5 dark:text-neutral-100"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0) + r.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="text-sm text-error">{error}</p>}
          <Button type="submit" loading={loading} className="w-full py-2.5">
            Create account
          </Button>
        </form>
        <div className="mt-5 text-center text-sm text-neutral-500 dark:text-white/50">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-electric-blue transition-colors hover:text-neon-cyan">
            Sign in
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
}
