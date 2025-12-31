import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "positive" | "negative" | "accent" | "muted";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-[var(--background-tertiary)] text-[var(--foreground)]",
  positive: "bg-[var(--positive)]/10 text-[var(--positive)]",
  negative: "bg-[var(--negative)]/10 text-[var(--negative)]",
  accent: "bg-[var(--accent-muted)] text-[var(--accent-light)]",
  muted: "bg-[var(--background-tertiary)] text-[var(--foreground-muted)]",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

