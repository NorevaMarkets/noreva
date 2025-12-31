"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

export function SearchInput({
  placeholder = "Search stocks...",
  onSearch,
  className,
}: SearchInputProps) {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onSearch?.(newValue);
  };

  return (
    <div
      className={cn(
        "relative w-full",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 h-10 px-3 rounded-lg border transition-all",
          "bg-[var(--background-secondary)]",
          isFocused
            ? "border-[var(--accent)] shadow-[0_0_0_1px_var(--accent)]"
            : "border-[var(--border)] hover:border-[var(--border-hover)]"
        )}
      >
        {/* Search Icon */}
        <SearchIcon className="w-4 h-4 text-[var(--foreground-subtle)] shrink-0" />
        
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-subtle)] outline-none"
        />
        
{/* Keyboard shortcut removed to prevent overlap issues */}
        
        {/* Clear button */}
        {value && (
          <button
            onClick={() => {
              setValue("");
              onSearch?.("");
            }}
            className="p-0.5 text-[var(--foreground-subtle)] hover:text-[var(--foreground)] transition-colors"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
      />
    </svg>
  );
}

