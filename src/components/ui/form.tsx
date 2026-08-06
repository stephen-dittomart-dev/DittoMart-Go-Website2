import * as React from "react";
import { cn } from "@/lib/utils";

const fieldBase = [
  "w-full rounded-xl border border-line bg-surface-2/60 px-4 text-sm text-fg",
  "placeholder:text-fg-subtle",
  "transition-[border-color,box-shadow,background-color] duration-200",
  "hover:border-line-strong",
  "focus:border-primary-border focus:bg-surface-2 focus:outline-none",
  "focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--primary)_16%,transparent)]",
  "disabled:cursor-not-allowed disabled:opacity-50",
].join(" ");

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(fieldBase, "h-12", className)} {...props} />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(fieldBase, "min-h-32 resize-y py-3.5 leading-relaxed", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(fieldBase, "h-12 appearance-none pr-10", className)}
      {...props}
    >
      {children}
    </select>
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-fg-subtle"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="m5.5 8 4.5 4.5L14.5 8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
));
Select.displayName = "Select";

export function Field({
  label,
  htmlFor,
  hint,
  required,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-fg flex items-center gap-1.5"
      >
        {label}
        {required ? (
          <span className="text-danger" aria-hidden>
            *
          </span>
        ) : (
          <span className="text-2xs font-normal text-fg-subtle">optional</span>
        )}
      </label>
      {children}
      {hint ? <p className="text-xs text-fg-subtle">{hint}</p> : null}
    </div>
  );
}
