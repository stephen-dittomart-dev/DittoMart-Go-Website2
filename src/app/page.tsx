import type { Metadata } from "next";
import { ChapterRail } from "@/components/motion/chapter-rail";
import { Scene, SceneBlock } from "@/components/motion/color-scene";
import { ColdChainChapter, WalletChapter } from "@/components/sections/chapters";
import { CTA } from "@/components/sections/cta";
import { Ecosystem } from "@/components/sections/ecosystem";
import { FAQ } from "@/components/sections/faq";
import { Film } from "@/components/sections/film";
import { HomeStage } from "@/components/sections/home-stage";
import { Metrics } from "@/components/sections/metrics";
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
 *   ink → sand → crimson → ink(burst) → bone → ember → teal → slate → ink
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
          { id: "wallet", label: "Wallet gate" },
          { id: "cold", label: "Cold chain" },
          { id: "metrics", label: "The numbers" },
          { id: "faq", label: "Questions" },
        ]}
      />

      {/* 01 · ink — the opening */}
      <HomeStage />

      {/* 02 · sand — the film */}
      <Scene scene="sand" id="film" padded={false} sweep="none">
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

      {/* 06 · ember — the money gate */}
      <Scene scene="ember" padded={false} sweep="none">
        <WalletChapter />
      </Scene>

      {/* 07 · teal — the moat */}
      <Scene scene="teal" padded={false} sweep="none">
        <ColdChainChapter />
      </Scene>

      {/* 08 · slate — the numbers */}
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
