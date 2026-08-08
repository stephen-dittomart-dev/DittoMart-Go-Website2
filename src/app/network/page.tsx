import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { Scene } from "@/components/motion/color-scene";
import { HoldToEnd } from "@/components/motion/hold-to-end";
import { AgencyChapter } from "@/components/sections/chapters";
import { CTA } from "@/components/sections/cta";
import { NetworkGrid, NetworkStory } from "@/components/sections/network";
import { OndcChapter } from "@/components/sections/ondc-dual";
import { RoutingDecision } from "@/components/sections/routing-decision";
import { NetworkOrbitScene } from "@/components/visuals/hero-scenes";
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
    // Inner pages run the tighter section rhythm; see globals.css.
    <div data-density="tight">
      {/* ------------------------------------------------------------------
          Three overlap boundaries: the hero, the routing fork and the ONDC
          rail each stop on their last screenful while the band after them
          climbs over the top.

          `HoldToEnd` pins a band's last screenful and gives it exactly one
          viewport of hold; `-mt-[100vh]` on the next band is that same
          viewport, so the hold and the climb are one number and cannot drift
          apart. See `hold-to-end.tsx` for why `bottom: 0` cannot do this.

          Nothing inside any band is touched. No z-index either: every band is
          positioned, so a later one paints over an earlier one in DOM order,
          which is the order they arrive in. Every width.
          ------------------------------------------------------------------ */}

      {/* 01 · ink — the hero, held while the network story climbs over it */}
      <HoldToEnd>
        <Scene scene="ink" padded={false} sweep="none">
          <PageHero
            eyebrow="Delivery network"
            title="Nine delivery networks behind one integration"
            highlight={["Nine", "networks"]}
            mode="lines"
            body="Adloggs, Shiprocket Quick, Qwqer, Flash by Shadowfax, Quicka, Pidge, Ek Bharath, Pro Routing and the ONDC rail carrying Ola and Rapido. You call one endpoint; we decide which of them moves your parcel."
            primary={{ label: "Talk to sales", href: "/contact" }}
            secondary={{ label: "See the API", href: "/developers" }}
            meta={[
              { label: "Networks", value: String(providerStats.total) },
              { label: "Supply rails", value: "3" },
              { label: "Contracts you sign", value: "1" },
            ]}
            visual={<NetworkOrbitScene />}
          />
        </Scene>
      </HoldToEnd>

      {/* 02 · sand — the network story, climbing over the hero.

          This band holds its own narrator with `lg:sticky lg:top-32` inside
          `StickyStory`. That is unaffected: the wrapper above pins the *hero*,
          not this band, and this one only carries a negative margin. */}
      <Scene
        scene="sand"
        padded={false}
        sweep="none"
        className="-mt-[100vh]"
      >
        <NetworkStory />
      </Scene>

      {/* 03 · bone — the routing fork, held while the agency band climbs */}
      <HoldToEnd>
        <Scene scene="bone" padded={false} sweep="none">
          <RoutingDecision />
        </Scene>
      </HoldToEnd>

      {/* 04 · teal — the agency fleet, climbing over the routing fork */}
      <Scene
        scene="teal"
        padded={false}
        sweep="none"
        className="-mt-[100vh]"
      >
        <AgencyChapter />
      </Scene>

      {/* 05 · crimson — the ONDC rail, held while the grid climbs over it */}
      <HoldToEnd>
        <Scene scene="crimson" padded={false} sweep="none">
          <OndcChapter />
        </Scene>
      </HoldToEnd>

      {/* 06 · slate — the full grid, climbing over the ONDC rail */}
      <Scene
        scene="slate"
        padded={false}
        sweep="none"
        className="-mt-[100vh]"
      >
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
    </div>
  );
}
