"use client";

import { useCountUp } from "@/hooks/use-motion";
import { cn } from "@/lib/utils";

/**
 * GSAP-driven counter. Runs once on first view — a number that re-animates on
 * every scroll-back reads as decoration, and decorative numbers are not
 * trusted on a page whose whole argument is "the metrics are inspectable".
 */
export function CountUp({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1.8,
  className,
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useCountUp(value, { decimals, duration });

  return (
    <span className={cn("tnum", className)}>
      {prefix}
      <span ref={ref}>0</span>
      {suffix}
    </span>
  );
}
