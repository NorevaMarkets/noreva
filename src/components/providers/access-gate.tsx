"use client";

import { useState, useEffect, type ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Cookies from "js-cookie";

// ============================================
// ACCESS GATE CONFIGURATION
// ============================================
// Set to false to completely disable the access gate
export const ACCESS_GATE_ENABLED = true;

// Cookie name for authentication
const AUTH_COOKIE_NAME = "noreva_access";
const AUTH_COOKIE_VALUE = "granted";
const AUTH_COOKIE_DAYS = 7; // How long the access lasts

interface AccessGateProps {
  children: ReactNode;
}

/**
 * Access Gate Component
 * 
 * A simple password protection wrapper that shows a login form
 * before allowing access to the main application.
 * 
 * TO DISABLE: Set ACCESS_GATE_ENABLED to false above
 * TO REMOVE COMPLETELY: Remove <AccessGate> wrapper from layout.tsx
 */
export function AccessGate({ children }: AccessGateProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing access on mount
  useEffect(() => {
    // If gate is disabled, grant access immediately
    if (!ACCESS_GATE_ENABLED) {
      setHasAccess(true);
      return;
    }

    // Check for existing cookie
    const accessCookie = Cookies.get(AUTH_COOKIE_NAME);
    setHasAccess(accessCookie === AUTH_COOKIE_VALUE);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        // Set cookie client-side
        Cookies.set(AUTH_COOKIE_NAME, AUTH_COOKIE_VALUE, { 
          expires: AUTH_COOKIE_DAYS,
          secure: process.env.NODE_ENV === "production",
        });
        setHasAccess(true);
      } else {
        setError(data.error || "Invalid password");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Still checking access status
  if (hasAccess === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Has access - show the app
  if (hasAccess) {
    return <>{children}</>;
  }

  // No access - show the gate
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
          <img
            src="/logo.png"
            alt="Noreva"
            className="h-10 w-auto mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Welcome to Noreva
          </h1>
          <p className="text-sm text-[var(--foreground-muted)] mt-2">
            Enter the access password to continue
          </p>
        </div>

        {/* Login Card */}
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

