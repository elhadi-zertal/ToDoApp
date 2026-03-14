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
    <div className="login-page">
      <div className="login-container">

        {/* ── Header ── */}
        <div className="login-header">
          <div className="login-icon">
            <svg
              style={{ width: "1.5rem", height: "1.5rem", color: "white" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="login-title">
            {isSignUp ? "Create an account" : "Welcome back"}
          </h1>
          <p className="login-subtitle">
            {isSignUp
              ? "Sign up to start organizing your life"
              : "Sign in to access your tasks"}
          </p>
        </div>

        {/* ── Card ── */}
        <div className="login-card">
          <form onSubmit={handleSubmit} className="login-form">

            {/* Email */}
            <div className="login-field">
              <label htmlFor="email" className="login-label">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="login-input"
              />
            </div>

            {/* Password */}
            <div className="login-field">
              <label htmlFor="password" className="login-label">
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
                className="login-input"
              />
            </div>

            {/* Error banner */}
            {error && (
              <div className="login-error">{error}</div>
            )}

            {/* Success banner */}
            {success && (
              <div className="login-success">{success}</div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="login-btn"
            >
              {submitting ? (
                <>
                  <span className="login-btn-spinner" />
                  Please wait…
                </>
              ) : isSignUp ? (
                "Create account"
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* ── Footer toggle ── */}
          <div className="login-footer">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setSuccess(null);
              }}
              className="login-toggle-btn"
            >
              {isSignUp ? (
                <>Already have an account?{" "}
                  <span className="login-toggle-accent">Sign in</span>
                </>
              ) : (
                <>Don&apos;t have an account?{" "}
                  <span className="login-toggle-accent">Sign up</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
