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
          Two overlap boundaries: the film and the routing fork each stop on
          their last screenful while the band after them climbs over the top.

          The burst used to be a third. It is not any more — the fork below no
          longer rises over it, so the burst runs its runway out and leaves the
          way any ordinary band does.

          Two ingredients, and which one a band needs depends on whether it
          already holds itself:

            · `HoldToEnd` — for a band that just scrolls. It pins the band's
              last screenful and gives it exactly one viewport of hold. See
              that file for why `bottom: 0` cannot do this.

            · `-mt-[100vh]` — on the band doing the climbing. One viewport,
              the same viewport the hold lasts for.

          The burst needs neither: it is 580vh of runway around a `sticky top-0`
          stage, so its own runway already carries it off the screen.

          No z-index anywhere. Every band here is positioned, so a later one
          paints over an earlier one in DOM order — which is the order they
          arrive in. The `z-30` that used to sit on the film band was not only
          unnecessary, it outranked the ecosystem that now climbs over it.

          Every width. This used to be lg-only, which left phones and tablets
          with a plain stack of bands and none of the overlap.
          ------------------------------------------------------------------ */}

      {/* 02 · sand — the film. Climbs over the hero, then holds while the
          ecosystem climbs over it. */}
      <HoldToEnd className="-mt-[100vh]">
        {/* The id lives on the <Film> section itself, not here. Two elements
            answering to `#film` meant the chapter rail and any deep link
            resolved to whichever the browser found first — the outer band,
            whose top is a viewport above the content it is named for. */}
        <Scene scene="sand" padded={false} sweep="none">
          <Film />
        </Scene>
      </HoldToEnd>

      {/* 03 · crimson — the ecosystem plate, climbing over the film */}
      <Scene
        scene="crimson"
        id="ecosystem"
        padded={false}
        sweep="none"
        className="-mt-[100vh]"
      >
        <Ecosystem />
      </Scene>

      {/* 04 · ink — the burst. Holds itself; nothing to add here. */}
      <NetworkBurst />

      {/* 05 · bone — the routing fork.

          No climb here, deliberately. It used to carry `-mt-[100vh]` and
          rise over the burst's last screenful like every other boundary on
          this page; that overlap is gone. The burst simply scrolls up and out
          under its own runway and the fork follows it, the two moving together
          as one page rather than one sliding over the other.

          It still *holds* — the wrapper stays. That is the boundary after this
          one, where the moat band climbs over the fork, and it is unaffected:
          `HoldToEnd` pins this band's end and the moat's own `-mt-[100vh]` is
          what does the climbing there. The two jobs were only ever on the same
          element by coincidence. */}
      <HoldToEnd>
        <Scene scene="bone" id="routing" padded={false} sweep="none">
          <RoutingDecision />
        </Scene>
      </HoldToEnd>

      {/* 06 · teal — the wallet gate and the moat, climbing over the fork */}
      <div className="-mt-[100vh]">
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
