import type { Metadata } from "next";
import { ChapterRail } from "@/components/motion/chapter-rail";
import {
  AgencyChapter,
  AnalyticsChapter,
  ApiChapter,
  ColdChainChapter,
  EnginesChapter,
  RiderChapter,
  WalletChapter,
} from "@/components/sections/chapters";
import { Control } from "@/components/sections/control";
import { CTA } from "@/components/sections/cta";
import { Ecosystem } from "@/components/sections/ecosystem";
import { Engines } from "@/components/sections/engines";
import { FAQ } from "@/components/sections/faq";
import { Film } from "@/components/sections/film";
import { HomeStage } from "@/components/sections/home-stage";
import { OperationsFilm } from "@/components/sections/operations-film";
import { Metrics } from "@/components/sections/metrics";
import { NetworkStory } from "@/components/sections/network";
import { OndcChapter } from "@/components/sections/ondc-dual";
import { Problem } from "@/components/sections/problem";
import { RoutingDecision } from "@/components/sections/routing-decision";
import { Testimonials } from "@/components/sections/testimonials";
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
 * Home reads as a film, not a brochure.
 *
 * Rhythm rule: never two consecutive bands of the same kind. An illustrated
 * chapter is always followed by an interactive diagram, a data strip or the
 * full-bleed dark ecosystem plate, so the page keeps changing texture as you
 * scroll and no screen looks like the one before it.
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
          { id: "why", label: "The problem" },
          { id: "network", label: "Nine networks" },
          { id: "routing", label: "Smart routing" },
          { id: "agency", label: "Own fleet" },
          { id: "tariff", label: "Tariff & trigger" },
          { id: "wallet", label: "Wallet gate" },
          { id: "ondc-intro", label: "ONDC" },
          { id: "cold", label: "Cold chain" },
          { id: "compliance", label: "Rider compliance" },
          { id: "analytics", label: "AI & data" },
          { id: "operations-film", label: "In operation" },
          { id: "api", label: "The API" },
          { id: "faq", label: "Questions" },
        ]}
      />

      <HomeStage />
      <Film />
      <Ecosystem />
      <Problem />
      <NetworkStory />
      <RoutingDecision />
      <AgencyChapter />
      <EnginesChapter />
      <Engines />
      <WalletChapter />
      <Metrics />
      <OndcChapter />
      <ColdChainChapter />
      <RiderChapter />
      <AnalyticsChapter />
      <Control />
      <OperationsFilm />
      <ApiChapter />
      <Testimonials />
      <FAQ />
      <CTA />
    </>
  );
}
