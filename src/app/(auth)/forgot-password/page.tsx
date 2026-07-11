"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { errorMessage } from "@/lib/errors";
import * as authApi from "@/lib/api/auth";
import GradientBackground from "@/components/effects/GradientBackground";
import CrystalLogo from "@/components/ui-custom/CrystalLogo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
    <div className="dark relative min-h-screen w-full overflow-hidden">
      <GradientBackground />

      <div className="relative z-10 min-h-screen flex">
        {/* Left side - Branding */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col items-center"
          >
            <CrystalLogo size={120} />
            <h1 className="mt-8 text-5xl font-medium tracking-tight text-white text-center max-w-md">
              The Future of{" "}
              <span className="text-gradient">Ad Intelligence</span>
            </h1>
            <p className="mt-6 text-lg text-white/50 text-center max-w-sm leading-relaxed">
              Upload. Refine. Deploy. Our AI handles the technical complexity
              so you can focus on the message.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-10 flex flex-wrap gap-3 justify-center"
          >
            {[
              "AI-Powered",
              "Real-time Processing",
              "Smart Matching",
              "Global Distribution",
            ].map((tag) => (
              <span
                key={tag}
                className="px-4 py-2 rounded-full text-sm font-medium bg-white/5 border border-white/10 text-white/70"
              >
                {tag}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Right side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.2,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="w-full max-w-md"
          >
            {/* Mobile logo */}
            <div className="lg:hidden flex flex-col items-center mb-8">
              <CrystalLogo size={80} />
              <h1 className="mt-4 text-3xl font-medium text-white">
                Better<span className="text-gradient">Ads</span>
              </h1>
            </div>

            <div className="glass rounded-3xl p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-medium text-white">
                  Reset Password
                </h2>
                <p className="mt-2 text-sm text-white/50">
                  Enter your email and we&apos;ll send a reset link
                </p>
              </div>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center text-center py-4"
                >
                  <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mb-4">
                    <CheckCircle className="w-7 h-7 text-success" />
                  </div>
                  <p className="text-white font-medium">Check your email</p>
                  <p className="mt-2 text-sm text-white/50">
                    If that email exists, a reset link has been sent.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        required
                        autoComplete="email"
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-electric-blue focus:shadow-glow-blue transition-all duration-200"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-sm text-red-400">{error}</p>
                  )}

                  {/* Submit button */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="w-full py-3.5 rounded-xl bg-gradient-brand text-white font-medium flex items-center justify-center gap-2 shadow-glow-blue hover:shadow-glow-purple transition-shadow duration-300 disabled:opacity-70"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Send Reset Link
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </form>
              )}

              {/* Links */}
              <div className="mt-6 flex items-center justify-center text-sm">
                <Link
                  href="/login"
                  className="text-white/50 hover:text-electric-blue transition-colors inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to sign in
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
