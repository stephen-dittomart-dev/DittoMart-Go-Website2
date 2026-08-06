import Image from "next/image";
import { media } from "@/lib/media";
import { cn } from "@/lib/utils";

/**
 * The official DittoMart mark, used as supplied.
 *
 * The source PNG carries a faint circular halo baked into it. On the light
 * theme that is invisible against white; on dark it would show as a grey
 * disc, so the mark is composited on its own white puck rather than sitting
 * directly on the page.
 */
export function LogoMark({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
  /** Accepted for call-site compatibility; the raster mark needs no id. */
  id?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-white",
        className
      )}
    >
      <Image
        src={media.logo}
        alt=""
        fill
        sizes="48px"
        priority={priority}
        className="scale-[1.18] object-contain"
      />
    </span>
  );
}

export function Logo({
  className,
  showWordmark = true,
  priority = false,
}: {
  className?: string;
  showWordmark?: boolean;
  priority?: boolean;
  id?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className="size-9" priority={priority} />
      {showWordmark ? (
        <span className="flex flex-col leading-none">
          <span className="text-[0.95rem] font-bold tracking-[0.01em]">
            <span className="text-[var(--color-crimson-700)]">DITTO</span>
            <span className="text-[var(--color-ember-600)]">MART</span>
            <span className="ml-1 font-semibold text-fg">Go</span>
          </span>
          <span className="mt-[3px] font-mono text-[7.5px] font-medium uppercase tracking-[0.2em] text-fg-subtle">
            We are on your route
          </span>
        </span>
      ) : null}
    </span>
  );
}
