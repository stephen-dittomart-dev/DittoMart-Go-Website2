import type { StaticImageData } from "next/image";

/**
 * Partner logo slots.
 *
 * Two ways to fill one in — both are picked up automatically by
 * <ProviderLogo />, and until one is present the component falls back to a
 * typeset wordmark so the rail is never broken or empty.
 *
 *   1. Local file (preferred — optimised, cached, no external dependency):
 *        drop the file into  src/assets/logos/<id>.svg | .png
 *        then:  import adloggs from "@/assets/logos/adloggs.svg";
 *               providerLogoFiles = { adloggs, ... }
 *
 *   2. Remote URL (quickest — no download needed):
 *        providerLogoUrls = { adloggs: "https://…/logo.svg", ... }
 *        The host must also be added to `images.remotePatterns` in
 *        next.config.ts, otherwise Next refuses to optimise it.
 *
 * Worth recording rather than burying: being a static site does not change
 * how trademarks work. Showing a partner's mark is fine when you genuinely
 * carry their capacity and describe that factually; it is not fine if it
 * reads as their endorsement. The rail is captioned "networks we route
 * across", which keeps it factual — keep that framing when real marks go in.
 */

export const providerLogoFiles: Record<string, StaticImageData | undefined> = {
  // adloggs: adloggsLogo,
};

export const providerLogoUrls: Record<string, string | undefined> = {
  // adloggs: "https://example.com/adloggs.svg",
};

/**
 * Wordmark fallback styling — how each partner's name is typeset when no
 * image file exists yet. Deliberately monochrome: a wall of mixed brand
 * colours reads as a clip-art collage, whereas single-ink marks that warm on
 * hover is the pattern every serious B2B site uses.
 */
export const providerWordmark: Record<
  string,
  { text: string; weight: number; tracking: string; italic?: boolean }
> = {
  adloggs: { text: "adloggs", weight: 700, tracking: "-0.03em" },
  "shiprocket-quick": { text: "Shiprocket", weight: 700, tracking: "-0.02em" },
  owter: { text: "OWTER", weight: 600, tracking: "0.12em" },
  "flash-shadowfax": {
    text: "Flash",
    weight: 800,
    tracking: "-0.04em",
    italic: true,
  },
  quicka: { text: "Quicka", weight: 700, tracking: "-0.02em" },
  pidge: { text: "pidge", weight: 700, tracking: "-0.02em" },
  "ek-bharath": { text: "Ek Bharath", weight: 600, tracking: "0.01em" },
  "pro-routing": { text: "Pro Routing", weight: 600, tracking: "0.02em" },
  ondc: { text: "ONDC", weight: 800, tracking: "0.06em" },
};
