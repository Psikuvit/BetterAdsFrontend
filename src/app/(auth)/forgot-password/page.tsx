"use client";

import Link from "next/link";
import { SubmitEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { errorMessage } from "@/lib/errors";
import * as authApi from "@/lib/api/auth";
import GradientBackground from "@/components/effects/GradientBackground";
import CrystalLogo from "@/components/ui-custom/CrystalLogo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(errorMessage(err));
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
          <h1 className="mt-4 text-3xl font-medium text-white">
            Better<span className="text-gradient">Ads</span>
          </h1>
        </div>
        <div className="glass rounded-3xl p-8 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        <h2 className="mb-1 text-2xl font-medium text-white">Reset Password</h2>
        <p className="mb-6 text-sm text-white/50">
          Enter your account email and we&apos;ll send a reset link if it exists.
        </p>
        {submitted ? (
          <p className="text-sm text-white/70">
            If that email exists, a reset link has been sent.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            {error && <p className="text-sm text-error">{error}</p>}
            <Button type="submit" loading={loading} className="w-full py-2.5">
              Send reset link
            </Button>
          </form>
        )}
        <div className="mt-5 text-center text-sm text-white/50">
          <Link href="/login" className="text-electric-blue transition-colors hover:text-neon-cyan">
            Back to sign in
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
}
