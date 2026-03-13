"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    if (isSignUp) {
      const { error } = await signUp(email, password);
      if (error) {
        setError(error);
      } else {
        setSuccess("Check your email to confirm your account, then log in.");
        setIsSignUp(false);
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error);
      } else {
        router.push("/");
      }
    }

    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 mb-4 shadow-lg shadow-violet-500/25">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            {isSignUp ? "Create account" : "Welcome back"}
          </h1>
          <p className="text-[var(--text-secondary)] mt-2">
            {isSignUp
              ? "Sign up to start organizing your tasks"
              : "Sign in to access your tasks"}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 shadow-xl shadow-black/5">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-input)] px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-input)] px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 px-4 py-3 text-white font-semibold hover:from-violet-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 cursor-pointer"
            >
              {submitting
                ? "Please wait…"
                : isSignUp
                ? "Create account"
                : "Sign in"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setSuccess(null);
              }}
              className="text-sm text-violet-400 hover:text-violet-300 transition cursor-pointer"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
