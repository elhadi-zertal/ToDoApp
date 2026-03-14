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
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4 font-sans text-[var(--text-primary)]">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--color-brand-coral)] mb-6 shadow-[0_0_20px_rgba(218,119,86,0.25)]">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-[var(--text-muted)] mt-2.5 text-base">
            {isSignUp
              ? "Sign up to start organizing your life"
              : "Sign in to access your tasks"}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[var(--text-muted)] mb-2"
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
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-input)] px-4 py-3.5 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-coral)]/40 focus:border-[var(--color-brand-coral)] transition-all duration-200"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[var(--text-muted)] mb-2"
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
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-input)] px-4 py-3.5 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-coral)]/40 focus:border-[var(--color-brand-coral)] transition-all duration-200"
              />
            </div>

            {error && (
              <div className="rounded-2xl bg-red-500/10 border border-red-500/20 px-5 py-3.5 text-sm text-red-400">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-5 py-3.5 text-sm text-emerald-400">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-[var(--color-brand-coral)] px-4 py-3.5 text-[#FEFDFB] font-medium text-base hover:bg-[var(--color-brand-coral-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-coral)]/50 focus:ring-offset-2 focus:ring-offset-[var(--bg-card)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_rgba(218,119,86,0.3)] hover:shadow-[0_6px_20px_rgba(218,119,86,0.4)] cursor-pointer"
            >
              {submitting
                ? "Please wait…"
                : isSignUp
                ? "Create account"
                : "Sign in"}
            </button>
          </form>

          <div className="mt-8 text-center bg-[var(--bg-primary)] -mx-8 sm:-mx-10 -mb-8 sm:-mb-10 p-6 rounded-b-3xl border-t border-[var(--border)]">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setSuccess(null);
              }}
              className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-200 cursor-pointer"
            >
              {isSignUp ? (
                <>Already have an account? <span className="text-[var(--color-brand-coral)] font-medium">Sign in</span></>
              ) : (
                <>Don't have an account? <span className="text-[var(--color-brand-coral)] font-medium">Sign up</span></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
