import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import {
  AnalyticsChapter,
  ApiChapter,
  EnginesChapter,
  RiderChapter,
  WalletChapter,
} from "@/components/sections/chapters";
import { CTA } from "@/components/sections/cta";
import { Engines } from "@/components/sections/engines";
import {
  PlatformArchitecture,
  PlatformGuarantees,
  PlatformRails,
  PlatformSequence,
} from "@/components/sections/platform-parts";
import { MediaPlate } from "@/components/motion/scene";
import { media } from "@/lib/media";

export const metadata: Metadata = {
  title: "Platform",
  description:
    "The architecture of DittoMart Go — tariff, wallet, routing and allocation engines sitting between your business and three supply rails: 3PL fleets, direct agency fleets and the ONDC network.",
  alternates: { canonical: "/platform" },
};

export default function PlatformPage() {
  return (
    <>
      <PageHero
        eyebrow="Platform"
        title="The layer between your order and every fleet that can carry it"
        highlight={["every", "fleet"]}
        mode="lines"
        body="DittoMart Go is not a courier and not a marketplace. It is the intelligence layer that decides what a delivery should cost, who should carry it, and what happens when that goes wrong."
        primary={{ label: "Book a demo", href: "/contact" }}
        secondary={{ label: "See the API", href: "/developers" }}
        meta={[
          { label: "Engines", value: "4" },
          { label: "Supply rails", value: "3" },
          { label: "Decision time", value: "<1s" },
        ]}
      >
        <MediaPlate
          src={media.engines.src}
          alt={media.engines.alt}
          caption={media.engines.caption}
          className="mx-auto max-w-2xl"
          sizes="(max-width: 1024px) 92vw, 42rem"
          priority
        />
      </PageHero>

      <PlatformArchitecture />
      <Engines />
      <EnginesChapter />
      <WalletChapter />
      <PlatformRails />
      <PlatformSequence />
      <RiderChapter />
      <AnalyticsChapter />
      <ApiChapter />
      <PlatformGuarantees />

      <CTA
        title="See it run against your own volumes"
        body="Bring a week of real order data. We will model the routing, show you the rate card, and tell you honestly where we do not help."
        primary={{ label: "Book a technical demo", href: "/contact" }}
        secondary={{ label: "Read the docs", href: "/developers" }}
      />
    </>
  );
}
