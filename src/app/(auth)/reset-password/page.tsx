"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, SubmitEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { errorMessage } from "@/lib/errors";
import * as authApi from "@/lib/api/auth";
import GradientBackground from "@/components/effects/GradientBackground";
import CrystalLogo from "@/components/ui-custom/CrystalLogo";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.resetPassword(token, newPassword);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      setError(errorMessage(err, "This reset link is invalid or expired"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex flex-col items-center animate-fade-up">
        <CrystalLogo size={72} />
        <h1 className="mt-4 text-3xl font-medium text-white">
          Better<span className="text-gradient">Ads</span>
        </h1>
      </div>
      <div className="glass rounded-3xl p-8 animate-fade-up" style={{ animationDelay: "0.1s" }}>
      <h2 className="mb-1 text-2xl font-medium text-white">Set a New Password</h2>
      <p className="mb-6 text-sm text-white/50">
        {token ? "Choose a new password below." : "This link is missing a reset token."}
      </p>
      {success ? (
        <p className="text-sm text-white/70">
          Password updated. Redirecting to sign in...
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="New password"
            type="password"
            required
            minLength={8}
            disabled={!token}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />
          {error && <p className="text-sm text-error">{error}</p>}
          <Button type="submit" loading={loading} disabled={!token} className="w-full py-2.5">
            Update password
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
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <GradientBackground />
      <div className="relative z-10 flex w-full justify-center">
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
