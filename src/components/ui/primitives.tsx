import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

/* ------------------------------- Badge ---------------------------------- */
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border font-medium tracking-tight",
  {
    variants: {
      variant: {
        default: "border-line bg-surface-2 text-fg-muted",
        brand: "border-primary-border bg-primary-soft text-primary",
        accent:
          "border-[color-mix(in_oklab,var(--accent)_30%,transparent)] bg-accent-soft text-accent",
        ai: "border-[color-mix(in_oklab,var(--ai)_30%,transparent)] bg-ai-soft text-ai",
        success:
          "border-[color-mix(in_oklab,var(--success)_30%,transparent)] bg-success-soft text-success",
        warning:
          "border-[color-mix(in_oklab,var(--warning)_30%,transparent)] bg-warning-soft text-warning",
        outline: "border-line text-fg-muted",
      },
      size: {
        sm: "px-2 py-0.5 text-2xs",
        md: "px-2.5 py-1 text-xs",
        lg: "px-3.5 py-1.5 text-sm",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
);

export function Badge({
  className,
  variant,
  size,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

/* -------------------------------- Card ---------------------------------- */
export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative rounded-2xl border border-line bg-surface",
      "transition-[border-color,box-shadow,transform] duration-300",
      "[transition-timing-function:var(--ease-standard)]",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

export function CardBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 md:p-7", className)} {...props} />;
}

/* -------------------------- Eyebrow / Section --------------------------- */
export function Eyebrow({
  children,
  className,
  icon,
}: {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-line bg-surface-2/60 px-3 py-1.5",
        "font-mono text-2xs font-medium uppercase tracking-[0.14em] text-fg-muted",
        className
      )}
    >
      {icon ? <span className="text-primary">{icon}</span> : null}
      {children}
    </span>
  );
}

export function Section({
  className,
  children,
  id,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <section
      id={id}
      /* `dm-section` is a hook, not a style. It lets a page opt into the
         tighter vertical rhythm (see `[data-density="tight"]` in globals)
         without every call site growing a prop. It does nothing on its own. */
      className={cn("dm-section relative py-24 md:py-32", className)}
      {...props}
    >
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  body,
  align = "left",
  className,
  titleClassName,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  body?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  titleClassName?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        align === "center" && "items-center text-center",
        className
      )}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2
        className={cn(
          "max-w-3xl text-3xl md:text-4xl font-semibold leading-[1.08] tracking-[-0.028em]",
          titleClassName
        )}
      >
        {title}
      </h2>
      {body ? (
        <p
          className={cn(
            "max-w-2xl text-base md:text-lg leading-relaxed text-fg-muted",
            align === "center" && "mx-auto"
          )}
        >
          {body}
        </p>
      ) : null}
    </div>
  );
}

/* ------------------------------- Divider -------------------------------- */
export function HairlineDivider({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "h-px w-full bg-gradient-to-r from-transparent via-line-strong to-transparent",
        className
      )}
    />
  );
}

/* --------------------------- Stat / Metric ------------------------------ */
export function Stat({
  value,
  label,
  hint,
  className,
}: {
  value: React.ReactNode;
  label: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="text-3xl md:text-4xl font-semibold tracking-[-0.03em] tnum">
        {value}
      </div>
      <div className="text-sm font-medium text-fg">{label}</div>
      {hint ? <div className="text-xs text-fg-subtle">{hint}</div> : null}
    </div>
  );
}
