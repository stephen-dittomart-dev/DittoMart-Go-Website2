import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { MediaPlate } from "@/components/motion/scene";
import { AgencyChapter } from "@/components/sections/chapters";
import { CTA } from "@/components/sections/cta";
import { NetworkGrid, NetworkStory } from "@/components/sections/network";
import { OndcChapter } from "@/components/sections/ondc-dual";
import { RoutingDecision } from "@/components/sections/routing-decision";
import { media } from "@/lib/media";
import { providers, providerStats } from "@/lib/providers";

export const metadata: Metadata = {
  title: "Delivery Network",
  description: `DittoMart Go aggregates ${providerStats.total} delivery networks — ${providers
    .map((p) => p.name)
    .join(", ")} — behind a single API. One integration, every fleet, automatic routing.`,
  alternates: { canonical: "/network" },
};

export default function NetworkPage() {
  return (
    <>
      <PageHero
        eyebrow="Delivery network"
        title="Nine delivery networks behind one integration"
        highlight={["Nine", "networks"]}
        mode="lines"
        body="Adloggs, Shiprocket Quick, Owter, Flash by Shadowfax, Quicka, Pidge, Ek Bharath, Pro Routing and the ONDC rail carrying Ola and Rapido. You call one endpoint; we decide which of them moves your parcel."
        primary={{ label: "Talk to sales", href: "/contact" }}
        secondary={{ label: "See the API", href: "/developers" }}
        meta={[
          { label: "Networks", value: String(providerStats.total) },
          { label: "Supply rails", value: "3" },
          { label: "Contracts you sign", value: "1" },
        ]}
      >
        <MediaPlate
          src={media.ondc.src}
          alt={media.ondc.alt}
          caption={media.ondc.caption}
          glow="accent"
          className="mx-auto max-w-2xl"
          sizes="(max-width: 1024px) 92vw, 42rem"
          priority
        />
      </PageHero>

      <NetworkStory />
      <RoutingDecision />
      <AgencyChapter />
      <OndcChapter />
      <NetworkGrid />

      <CTA
        title="One integration. Every network above."
        body="Send us a week of real orders and we will show you which partner would have carried each one, and what it would have cost."
        primary={{ label: "Book a demo", href: "/contact" }}
        secondary={{ label: "Read the API docs", href: "/developers" }}
      />
    </>
  );
}
