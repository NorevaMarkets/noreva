"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { formatUsd } from "@/lib/utils/format";

interface AnimatedPriceProps {
  value: number;
  className?: string;
  formatFn?: (value: number) => string;
}

/**
 * AnimatedPrice Component
 * 
 * Displays a price with a flash animation when the value changes.
 * - Green flash when price increases
 * - Red flash when price decreases
 */
export function AnimatedPrice({ 
  value, 
  className,
  formatFn = formatUsd 
}: AnimatedPriceProps) {
  const [flashClass, setFlashClass] = useState<string>("");
  const prevValueRef = useRef<number>(value);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip animation on first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevValueRef.current = value;
      return;
    }

    const prevValue = prevValueRef.current;
    
    // Only animate if value actually changed
    if (value !== prevValue) {
      const newFlashClass = value > prevValue ? "price-flash-up" : "price-flash-down";
      setFlashClass(newFlashClass);
      
      // Remove class after animation completes
      const timer = setTimeout(() => {
        setFlashClass("");
      }, 800);

      prevValueRef.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <span className={cn("inline-block px-1 -mx-1 transition-colors", flashClass, className)}>
      {formatFn(value)}
    </span>
  );
}

interface AnimatedPercentProps {
  value: number;
  className?: string;
  showSign?: boolean;
  decimals?: number;
}

/**
 * AnimatedPercent Component
 * 
 * Displays a percentage with flash animation when value changes.
 */
export function AnimatedPercent({ 
  value, 
  className,
  showSign = true,
  decimals = 2
}: AnimatedPercentProps) {
  const [flashClass, setFlashClass] = useState<string>("");
  const prevValueRef = useRef<number>(value);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevValueRef.current = value;
      return;
    }

    const prevValue = prevValueRef.current;
    
    if (value !== prevValue) {
      const newFlashClass = value > prevValue ? "price-flash-up" : "price-flash-down";
      setFlashClass(newFlashClass);
      
      const timer = setTimeout(() => {
        setFlashClass("");
      }, 800);

      prevValueRef.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);

  const formattedValue = `${showSign && value > 0 ? "+" : ""}${value.toFixed(decimals)}%`;

  return (
    <span className={cn("inline-block px-1 -mx-1 transition-colors", flashClass, className)}>
      {formattedValue}
    </span>
  );
}

