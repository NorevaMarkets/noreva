"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

// Loading fallback for Suspense
function LoginFormLoading() {
  return (
    <div className="bg-[var(--background-card)] border border-[var(--border)] rounded-xl p-6 shadow-xl">
      <div className="space-y-4">
        <div>
          <div className="h-4 w-24 bg-[var(--background-tertiary)] rounded animate-pulse mb-2" />
          <div className="h-12 w-full bg-[var(--background-tertiary)] rounded-lg animate-pulse" />
        </div>
        <div className="h-12 w-full bg-[var(--background-tertiary)] rounded-lg animate-pulse" />
      </div>
    </div>
  );
}

// Inner component that uses useSearchParams
function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        router.push(redirectTo);
        router.refresh();
      } else {
        setError(data.error || "Invalid password");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[var(--background-card)] border border-[var(--border)] rounded-xl p-6 shadow-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label 
            htmlFor="password" 
            className="block text-sm font-medium text-[var(--foreground-muted)] mb-2"
          >
            Access Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full px-4 py-3 bg-[var(--background-tertiary)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--foreground-subtle)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            autoFocus
            required
          />
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-[var(--negative)]/10 border border-[var(--negative)]/30 rounded-lg"
          >
            <p className="text-sm text-[var(--negative)]">{error}</p>
          </motion.div>
        )}

        <button
          type="submit"
          disabled={isLoading || !password}
          className="w-full py-3 bg-[var(--accent)] text-[var(--background)] font-semibold rounded-lg hover:bg-[var(--accent-light)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Verifying...
            </>
          ) : (
            "Enter"
          )}
        </button>
      </form>

      {/* Beta Notice */}
      <div className="mt-4 p-3 bg-[var(--accent)]/10 border border-[var(--accent)]/30 rounded-lg">
        <p className="text-xs text-[var(--accent)] text-center">
          🚧 Noreva is currently in private beta. Contact us for access.
        </p>
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[var(--background)]">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/login" className="inline-block">
            <img 
              src="/logo.png" 
              alt="Noreva" 
              className="h-10 w-auto mx-auto mb-4"
            />
          </Link>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Welcome to Noreva
          </h1>
          <p className="text-sm text-[var(--foreground-muted)] mt-2">
            Enter the access password to continue
          </p>
        </div>

        {/* Login Form with Suspense */}
        <Suspense fallback={<LoginFormLoading />}>
          <LoginFormContent />
        </Suspense>

        {/* Footer Links */}
        <div className="mt-6 flex items-center justify-center gap-4 text-sm">
          <Link 
            href="/terms" 
            className="text-[var(--foreground-muted)] hover:text-[var(--accent)] transition-colors"
          >
            Terms of Service
          </Link>
          <span className="text-[var(--border)]">•</span>
          <Link 
            href="/privacy" 
            className="text-[var(--foreground-muted)] hover:text-[var(--accent)] transition-colors"
          >
            Privacy Policy
          </Link>
        </div>

        {/* Copyright */}
        <p className="mt-4 text-center text-xs text-[var(--foreground-subtle)]">
          © {new Date().getFullYear()} Noreva. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
