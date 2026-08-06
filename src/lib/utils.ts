import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Indian number grouping — 1,24,500 not 124,500. */
export function formatIndian(value: number, opts?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat("en-IN", opts).format(value);
}

export function formatCompact(value: number) {
  if (value >= 1_00_00_000) return `${(value / 1_00_00_000).toFixed(1)}Cr`;
  if (value >= 1_00_000) return `${(value / 1_00_000).toFixed(1)}L`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}
