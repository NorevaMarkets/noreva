import { cn } from "@/lib/utils";
import { formatPercent } from "@/lib/utils/format";

interface PriceChangeProps {
  value: number;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PriceChange({ 
  value, 
  showIcon = true, 
  size = "md",
  className 
}: PriceChangeProps) {
  const isPositive = value > 0;
  const isNeutral = value === 0;
  
  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-mono tabular-nums",
        sizeClasses[size],
        isNeutral 
          ? "text-[var(--foreground-muted)]" 
          : isPositive 
            ? "text-[var(--positive)]" 
            : "text-[var(--negative)]",
        className
      )}
    >
      {showIcon && !isNeutral && (
        <span className="text-[0.75em]">
          {isPositive ? "▲" : "▼"}
        </span>
      )}
      {formatPercent(Math.abs(value), { showSign: false })}
    </span>
  );
}

