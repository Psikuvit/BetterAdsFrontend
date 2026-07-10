"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, SubmitEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { errorMessage } from "@/lib/errors";
import * as authApi from "@/lib/api/auth";

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
    <Card className="w-full max-w-sm">
      <h1 className="mb-1 text-xl font-semibold">Set a new password</h1>
      <p className="mb-6 text-sm text-neutral-500">
        {token ? "Choose a new password below." : "This link is missing a reset token."}
      </p>
      {success ? (
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
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
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" loading={loading} disabled={!token} className="w-full">
            Update password
          </Button>
        </form>
      )}
      <div className="mt-4 text-sm text-neutral-500">
        <Link href="/login" className="hover:text-neutral-900 dark:hover:text-neutral-100">
          Back to sign in
        </Link>
      </div>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
