import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { Scene } from "@/components/motion/color-scene";
import { MediaPlate } from "@/components/motion/scene";
import {
  AnalyticsChapter,
  ApiChapter,
  EnginesChapter,
  RiderChapter,
  WalletChapter,
} from "@/components/sections/chapters";
import { Control } from "@/components/sections/control";
import { CTA } from "@/components/sections/cta";
import { Engines } from "@/components/sections/engines";
import { HowItWorks } from "@/components/sections/how-it-works";
import { OperationsFilm } from "@/components/sections/operations-film";
import {
  PlatformArchitecture,
  PlatformGuarantees,
  PlatformRails,
  PlatformSequence,
} from "@/components/sections/platform-parts";
import { media } from "@/lib/media";

export const metadata: Metadata = {
  title: "Platform",
  description:
    "The architecture of DittoMart Go — tariff, wallet, routing and allocation engines sitting between your business and three supply rails: 3PL fleets, direct agency fleets and the ONDC network.",
  alternates: { canonical: "/platform" },
};

/**
 * Platform now carries the depth that used to sit on home: the full engine
 * set, the order lifecycle, the operations console and the second film.
 * Home makes the argument; this page proves it.
 */
export default function PlatformPage() {
  return (
    <>
      <Scene scene="ink" padded={false} sweep="none">
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
            motion="rotate"
            priority
          />
        </PageHero>
      </Scene>

      <Scene scene="sand" padded={false} sweep="none">
        <PlatformArchitecture />
      </Scene>

      <Scene scene="slate" padded={false} sweep="none">
        <HowItWorks />
      </Scene>

      <Scene scene="bone" padded={false} sweep="none">
        <Engines />
      </Scene>

      <Scene scene="ember" padded={false} sweep="none">
        <EnginesChapter />
        <WalletChapter />
      </Scene>

      <Scene scene="ink" padded={false} sweep="none">
        <PlatformRails />
        <PlatformSequence />
      </Scene>

      <Scene scene="olive" padded={false} sweep="none">
        <RiderChapter />
      </Scene>

      <Scene scene="crimson" padded={false} sweep="none">
        <AnalyticsChapter />
      </Scene>

      <Scene scene="slate" padded={false} sweep="none">
        <Control />
      </Scene>

      <OperationsFilm />

      <Scene scene="bone" padded={false} sweep="none">
        <ApiChapter />
        <PlatformGuarantees />
      </Scene>

      <Scene scene="ink" padded={false} sweep="none">
        <CTA
          title="See it run against your own volumes"
          body="Bring a week of real order data. We will model the routing, show you the rate card, and tell you honestly where we do not help."
          primary={{ label: "Book a technical demo", href: "/contact" }}
          secondary={{ label: "Read the docs", href: "/developers" }}
        />
      </Scene>
    </>
  );
}
