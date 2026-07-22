"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { errorMessage } from "@/lib/errors";
import GradientBackground from "@/components/effects/GradientBackground";
import CrystalLogo from "@/components/ui-custom/CrystalLogo";

export default function LoginPage() {
  const { login, user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(role === "ADMIN" ? "/admin" : "/dashboard");
    }
  }, [authLoading, user, role, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
                  Welcome Back
                </h2>
                <p className="mt-2 text-sm text-white/50">
                  Sign in to access your dashboard
                </p>
              </div>

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

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      autoComplete="current-password"
                      className="w-full pl-11 pr-12 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-electric-blue focus:shadow-glow-blue transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
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
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Links */}
              <div className="mt-6 flex items-center justify-between text-sm">
                <Link
                  href="/register"
                  className="text-white/50 hover:text-electric-blue transition-colors"
                >
                  Create account
                </Link>
                <Link
                  href="/forgot-password"
                  className="text-white/50 hover:text-electric-blue transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
