import type { Metadata } from "next";
import { ChapterRail } from "@/components/motion/chapter-rail";
import { Scene, SceneBlock } from "@/components/motion/color-scene";
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

      {/* 02 · sand — the film.

          It overlaps the hero rather than following it.

          `-mt-[100vh]` pulls this band a full screen back up the document, so
          its top edge sits one viewport before the hero's runway ends. The
          hero stage is still stuck to the top through all of that, so for
          that last screen of scroll the rider keeps running underneath while
          this band climbs over him and takes the frame. `z-30` decides who is
          on top; the sheet inside the hero is `z-20`.

          No JavaScript, no second ScrollTrigger. The overlap is the browser
          scrolling one box over a stuck one — the only version of this that
          cannot drift out of sync with the animation it is covering.

          Desktop only: below `lg` the hero runway is 168vh and the white
          intermission never renders, so eating a whole viewport of it would
          swallow the dissolve that is the handover there.

          There is also no `enter="zoom"` any more. That entrance started the
          band at 1.28× and fully transparent until its top reached 22% of the
          viewport — so the thing climbing over the hero would have been
          invisible for most of the climb. */}
      <Scene
        scene="sand"
        id="film"
        padded={false}
        sweep="none"
        className="lg:z-30 lg:-mt-[100vh]"
      >
        <Film />
      </Scene>

      {/* 03 · crimson — the ecosystem plate */}
      <Scene scene="crimson" id="ecosystem" padded={false} sweep="none">
        <Ecosystem />
      </Scene>

      {/* 04 · ink — the pinned burst */}
      <NetworkBurst />

      {/* 05 · bone — the routing fork */}
      <Scene scene="bone" id="routing" padded={false} sweep="none">
        <RoutingDecision />
      </Scene>

      {/* 06 · teal — the wallet gate and the moat, one held green stage */}
      <MoatBand />

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
