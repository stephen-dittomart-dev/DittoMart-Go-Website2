import { cn } from "@/lib/utils";

/**
 * Ambient backdrop: hairline grid + soft colour spots.
 * Static CSS only — no JS, no canvas, no per-frame cost. The "movement" in
 * the hero comes from the diagram, not from the background.
 */
export function AmbientBackdrop({
  className,
  variant = "hero",
}: {
  className?: string;
  variant?: "hero" | "section" | "quiet";
}) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <div
        className={cn(
          "absolute inset-0",
          variant === "quiet" ? "bg-grid-fine opacity-40" : "bg-grid",
          variant === "hero" ? "mask-radial-fade" : "mask-fade-b"
        )}
      />

      {variant !== "quiet" ? (
        <>
          <div
            className="absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full blur-[120px]"
            style={{
              background:
                "radial-gradient(closest-side, var(--spot-1), transparent 70%)",
            }}
          />
          <div
            className="absolute -right-32 top-1/4 h-[420px] w-[520px] rounded-full blur-[110px]"
            style={{
              background:
                "radial-gradient(closest-side, var(--spot-2), transparent 70%)",
            }}
          />
          <div
            className="absolute -left-40 bottom-0 h-[420px] w-[520px] rounded-full blur-[110px]"
            style={{
              background:
                "radial-gradient(closest-side, var(--spot-3), transparent 70%)",
            }}
          />
        </>
      ) : null}
    </div>
  );
}

/** A single hairline that fades at both ends — used to separate major bands. */
export function GlowRule({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "h-px w-full bg-gradient-to-r from-transparent via-primary-border to-transparent",
        className
      )}
    />
  );
}
