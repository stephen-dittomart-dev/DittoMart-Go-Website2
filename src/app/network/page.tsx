import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { Scene } from "@/components/motion/color-scene";
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
      <Scene scene="ink" padded={false} sweep="none">
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
            motion="flip"
            priority
          />
        </PageHero>
      </Scene>

      <Scene scene="sand" padded={false} sweep="none">
        <NetworkStory />
      </Scene>

      <Scene scene="bone" padded={false} sweep="none">
        <RoutingDecision />
      </Scene>

      <Scene scene="teal" padded={false} sweep="none">
        <AgencyChapter />
      </Scene>

      <Scene scene="crimson" padded={false} sweep="none">
        <OndcChapter />
      </Scene>

      <Scene scene="slate" padded={false} sweep="none">
        <NetworkGrid />
      </Scene>

      <Scene scene="ink" padded={false} sweep="none">
        <CTA
          title="One integration. Every network above."
          body="Send us a week of real orders and we will show you which partner would have carried each one, and what it would have cost."
          primary={{ label: "Book a demo", href: "/contact" }}
          secondary={{ label: "Read the API docs", href: "/developers" }}
        />
      </Scene>
    </>
  );
}
