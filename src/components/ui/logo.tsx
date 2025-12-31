/**
 * Noreva Logo Component
 * Noreva Logo
 */

import Image from "next/image";

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 32, className }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="Noreva Logo"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}

/**
 * Simplified logo icon for small sizes
 */
export function LogoIcon({ size = 20, className }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="Noreva Logo"
      width={size}
      height={size}
      className={className}
    />
  );
}
