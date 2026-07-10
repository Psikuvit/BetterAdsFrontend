"use client";

import Link from "next/link";
import { SubmitEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { errorMessage } from "@/lib/errors";
import * as authApi from "@/lib/api/auth";

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
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <h1 className="mb-1 text-xl font-semibold">Reset password</h1>
        <p className="mb-6 text-sm text-neutral-500">
          Enter your account email and we&apos;ll send a reset link if it exists.
        </p>
        {submitted ? (
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
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
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" loading={loading} className="w-full">
              Send reset link
            </Button>
          </form>
        )}
        <div className="mt-4 text-sm text-neutral-500">
          <Link href="/login" className="hover:text-neutral-900 dark:hover:text-neutral-100">
            Back to sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}
