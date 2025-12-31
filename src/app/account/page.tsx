"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";

export default function AccountPage() {
  const router = useRouter();
  const { user, profile, isLoading, error, isConnected, updateProfile } = useUser();
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    xHandle: "",
    website: "",
    bio: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  // Update form ONLY when profile first loads (not on every change)
  useEffect(() => {
    if (profile && !isFormInitialized) {
      setFormData({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        xHandle: profile.xHandle,
        website: profile.website,
        bio: profile.bio,
      });
      setIsFormInitialized(true);
    }
  }, [profile, isFormInitialized]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSaveSuccess(false);
    setSaveError(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    const success = await updateProfile(formData);

    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setSaveError("Failed to save profile");
    }

    setIsSaving(false);
  };

  // Not connected state
  if (!isConnected) {
    return (
      <main className="min-h-screen bg-[var(--background)]">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-[var(--background-secondary)] rounded-2xl p-8 text-center">
            <WalletIcon className="w-16 h-16 mx-auto mb-4 text-[var(--foreground-muted)]" />
            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
              Connect Your Wallet
            </h1>
            <p className="text-[var(--foreground-muted)] mb-6">
              Please connect your wallet to access your account settings.
            </p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-[var(--accent)] text-white rounded-lg font-medium hover:bg-[var(--accent-hover)] transition-colors"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Loading state
  if (isLoading && !user) {
    return (
      <main className="min-h-screen bg-[var(--background)]">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-[var(--background-secondary)] rounded-2xl p-8 text-center">
            <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[var(--foreground-muted)]">Loading your profile...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
            Account Settings
          </h1>
          <p className="text-[var(--foreground-muted)]">
            Manage your profile information
          </p>
        </div>

        {/* Wallet Info */}
        <div className="bg-[var(--background-secondary)] rounded-xl p-4 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent)] to-purple-600 flex items-center justify-center">
            <WalletIcon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[var(--foreground-muted)]">Connected Wallet</p>
            <p className="text-sm font-mono text-[var(--foreground)] truncate">
              {user?.wallet_address}
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--positive)]/20 rounded-full">
            <span className="w-2 h-2 rounded-full bg-[var(--positive)]" />
            <span className="text-xs text-[var(--positive)] font-medium">Connected</span>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[var(--background-secondary)] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Personal Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter your first name"
              />
              <FormField
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter your last name"
              />
            </div>

            <div className="mt-4">
              <FormField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div className="bg-[var(--background-secondary)] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <LinkIcon className="w-5 h-5" />
              Social Links
            </h2>

            <div className="space-y-4">
              <FormField
                label="X (Twitter)"
                name="xHandle"
                value={formData.xHandle}
                onChange={handleChange}
                placeholder="@username"
                prefix="x.com/"
              />
              <FormField
                label="Website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>

          <div className="bg-[var(--background-secondary)] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <EditIcon className="w-5 h-5" />
              About You
            </h2>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us a bit about yourself..."
                rows={4}
                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>

          {/* Error Message */}
          {(error || saveError) && (
            <div className="bg-[var(--negative)]/10 border border-[var(--negative)]/30 rounded-lg p-4 flex items-center gap-3">
              <ErrorIcon className="w-5 h-5 text-[var(--negative)] flex-shrink-0" />
              <p className="text-sm text-[var(--negative)]">{error || saveError}</p>
            </div>
          )}

          {/* Success Message */}
          {saveSuccess && (
            <div className="bg-[var(--positive)]/10 border border-[var(--positive)]/30 rounded-lg p-4 flex items-center gap-3">
              <CheckIcon className="w-5 h-5 text-[var(--positive)] flex-shrink-0" />
              <p className="text-sm text-[var(--positive)]">Profile saved successfully!</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-[var(--background-tertiary)] text-[var(--foreground)] rounded-lg font-medium hover:bg-[var(--background-hover)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={cn(
                "px-6 py-3 bg-[var(--accent)] text-white rounded-lg font-medium transition-all",
                isSaving
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-[var(--accent-hover)] active:scale-[0.98]"
              )}
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>

        {/* Account Info */}
        <div className="mt-8 pt-6 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--foreground-subtle)] text-center">
            Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
          </p>
        </div>
      </div>
    </main>
  );
}

// Form Field Component
interface FormFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  prefix?: string;
}

function FormField({ label, name, value, onChange, placeholder, type = "text", prefix }: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] text-sm">
            {prefix}
          </span>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={cn(
            "w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg",
            "text-[var(--foreground)] placeholder-[var(--foreground-muted)]",
            "focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all",
            prefix && "pl-16"
          )}
        />
      </div>
    </div>
  );
}

// Icons
function WalletIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

