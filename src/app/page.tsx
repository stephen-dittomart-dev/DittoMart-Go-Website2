import type { Metadata } from "next";
import { ChapterRail } from "@/components/motion/chapter-rail";
import { Scene, SceneBlock } from "@/components/motion/color-scene";
import { HoldToEnd } from "@/components/motion/hold-to-end";
import { CTA } from "@/components/sections/cta";
import { Ecosystem } from "@/components/sections/ecosystem";
import { FAQ } from "@/components/sections/faq";
import { Film } from "@/components/sections/film";
import { HomeStage } from "@/components/sections/home-stage";
import { Metrics } from "@/components/sections/metrics";
import { MoatBand } from "@/components/sections/moat-band";
import { NetworkBurst } from "@/components/sections/network-burst";
import { RoutingDecision } from "@/components/sections/routing-decision";
import { faqs } from "@/lib/faqs";
import { providers } from "@/lib/providers";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `${site.name} — ${site.tagline}`,
  description: site.description,
  alternates: { canonical: "/" },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const networkSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "DittoMart Go delivery network",
  itemListElement: providers.map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Service",
      name: p.name,
      serviceType: "Last-mile delivery",
      description: p.tagline,
      areaServed: p.coverage,
      provider: { "@type": "Organization", name: site.company },
    },
  })),
};

/**
 * Home, cut to half its previous length.
 *
 * Everything that explains *how* an engine works now lives on the page that
 * owns it. Home keeps only what a first-time visitor has to see to
 * understand the offer and want a demo: who we are, the network, how routing
 * decides, the money gate, the moat, the proof, the ask.
 *
 * Colour rhythm: every band declares its own scene and consecutive bands
 * never share one, so scrolling reads as moving between rooms.
 *
 *   ink → sand → crimson → ink(burst) → bone → teal → slate → sand → ink
 */
export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(networkSchema) }}
      />

      <ChapterRail
        chapters={[
          { id: "film", label: "The film" },
          { id: "ecosystem", label: "Ecosystem" },
          { id: "network", label: "Nine networks" },
          { id: "routing", label: "Smart routing" },
          { id: "wallet", label: "Wallet & the moat" },
          { id: "metrics", label: "The numbers" },
          { id: "faq", label: "Questions" },
        ]}
      />

      {/* 01 · ink — the opening */}
      <HomeStage />

      {/* ------------------------------------------------------------------
          Three overlap boundaries: the film, the burst and the routing fork
          each stop on their last screenful while the band after them climbs
          over the top.

          Two ingredients, and which one a band needs depends on whether it
          already holds itself:

            · `HoldToEnd` — for a band that just scrolls. It pins the band's
              last screenful and gives it exactly one viewport of hold. See
              that file for why `bottom: 0` cannot do this.

            · `lg:-mt-[100vh]` — on the band doing the climbing. One viewport,
              the same viewport the hold lasts for.

          The burst needs no wrapper: it is 580vh of runway around a
          `sticky top-0` stage already, so it is held by its own mechanism and
          only the band after it has to be pulled up.

          No z-index anywhere. Every band here is positioned, so a later one
          paints over an earlier one in DOM order — which is the order they
          arrive in. The `z-30` that used to sit on the film band was not only
          unnecessary, it outranked the ecosystem that now climbs over it.

          All of it is lg-only. Below that every band flows as before.
          ------------------------------------------------------------------ */}

      {/* 02 · sand — the film. Climbs over the hero, then holds while the
          ecosystem climbs over it. */}
      <HoldToEnd className="lg:-mt-[100vh]">
        <Scene scene="sand" id="film" padded={false} sweep="none">
          <Film />
        </Scene>
      </HoldToEnd>

      {/* 03 · crimson — the ecosystem plate, climbing over the film */}
      <Scene
        scene="crimson"
        id="ecosystem"
        padded={false}
        sweep="none"
        className="lg:-mt-[100vh]"
      >
        <Ecosystem />
      </Scene>

      {/* 04 · ink — the burst. Holds itself; nothing to add here. */}
      <NetworkBurst />

      {/* 05 · bone — the routing fork. Climbs over the burst, then holds while
          the moat band climbs over it. */}
      <HoldToEnd className="lg:-mt-[100vh]">
        <Scene scene="bone" id="routing" padded={false} sweep="none">
          <RoutingDecision />
        </Scene>
      </HoldToEnd>

      {/* 06 · teal — the wallet gate and the moat, climbing over the fork */}
      <div className="lg:-mt-[100vh]">
        <MoatBand />
      </div>

      {/* 07 · slate — the numbers */}
      <Scene scene="slate" id="metrics" padded={false} sweep="none">
        <Metrics />
      </Scene>

      {/* 09 · sand — questions */}
      <Scene scene="sand" padded={false} sweep="none">
        <FAQ />
      </Scene>

      {/* 10 · ink — the ask */}
      <Scene scene="ink" padded={false} sweep="none">
        <SceneBlock>
          <CTA />
        </SceneBlock>
      </Scene>
    </>
  );
}
