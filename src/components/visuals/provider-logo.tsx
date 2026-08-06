"use client";

import Image from "next/image";
import {
  providerLogoFiles,
  providerLogoUrls,
  providerWordmark,
} from "@/lib/provider-logos";
import { cn } from "@/lib/utils";

/**
 * One partner mark.
 *
 * Resolution order: local file → remote URL → typeset wordmark. The wordmark
 * is not a placeholder box — it is a finished monochrome treatment, so the
 * rail looks intentional whether or not the real artwork has landed yet.
 */
export function ProviderLogo({
  id,
  name,
  className,
  height = 28,
  tone = "muted",
}: {
  id: string;
  name: string;
  className?: string;
  height?: number;
  tone?: "muted" | "solid";
}) {
  const file = providerLogoFiles[id];
  const url = providerLogoUrls[id];
  const mark = providerWordmark[id];

  const colour =
    tone === "solid" ? "text-fg" : "text-fg-muted";

  if (file || url) {
    return (
      <span
        className={cn("relative block", className)}
        style={{ height, width: height * 4 }}
      >
        <Image
          src={file ?? (url as string)}
          alt={name}
          fill
          sizes={`${height * 4}px`}
          className="object-contain object-left"
          unoptimized={Boolean(url && url.endsWith(".svg"))}
        />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "block select-none whitespace-nowrap leading-none",
        colour,
        className
      )}
      style={{
        fontSize: height,
        fontWeight: mark?.weight ?? 700,
        letterSpacing: mark?.tracking ?? "-0.02em",
        fontStyle: mark?.italic ? "italic" : "normal",
      }}
    >
      {mark?.text ?? name}
    </span>
  );
}
