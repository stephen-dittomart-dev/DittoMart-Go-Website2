import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { Scene } from "@/components/motion/color-scene";
import { Chapter, MediaPlate } from "@/components/motion/scene";
import { Eyebrow } from "@/components/ui/primitives";
import { ColdChainChapter } from "@/components/sections/chapters";
import { ColdChain } from "@/components/sections/cold-chain";
import { ColdChainProtocol } from "@/components/sections/cold-chain-protocol";
import { CTA } from "@/components/sections/cta";
import { ColdTraceScene } from "@/components/visuals/hero-scenes";
import { media } from "@/lib/media";

export const metadata: Metadata = {
  title: "Cold Chain",
  description:
    "Temperature-classed delivery with evidence attached - frozen, chilled, ambient and hot, vehicle capability matching, FSSAI fields, perishable RTO protocol and a Proof of Freshness certificate on every consignment.",
  alternates: { canonical: "/cold-chain" },
};

export default function ColdChainPage() {
  return (
    // Inner pages run the tighter section rhythm; see globals.css.
    <div data-density="tight">
      <Scene scene="teal" padded={false} sweep="none">
        <PageHero
          eyebrow="Cold chain"
          title="Anyone can move a box. We can prove it stayed cold."
          highlight={["prove", "cold."]}
          mode="lines-alt"
          body="Frozen, chilled, ambient and hot are properties of the order, not a note in a comments field. Capability matching is a hard filter, the temperature trace is retained, and the certificate is the deliverable."
          primary={{ label: "Talk to sales", href: "/contact" }}
          secondary={{ label: "See the network", href: "/network" }}
          meta={[
            { label: "Temperature classes", value: "4" },
            { label: "Reading interval", value: "30s" },
            { label: "Unverifiable handovers", value: "0" },
          ]}
          visual={<ColdTraceScene />}
        />
      </Scene>

      <Scene scene="bone" padded={false} sweep="none">
        <ColdChain />
      </Scene>

      <Scene scene="olive" padded={false} sweep="none">
        <ColdChainChapter />
      </Scene>

      <Scene scene="crimson" padded={false} sweep="none">
        <Chapter
          id="handover"
          flip
          eyebrow={<Eyebrow>The handover</Eyebrow>}
          media={<MediaPlate entry={media.coldHandover} motion="slide" aspect="wide" />}
        >
          <h2 className="mt-6 text-3xl font-semibold leading-[1.08] tracking-[-0.03em] md:text-4xl">
            The last thirty seconds are the ones that get disputed
          </h2>
          <p className="mt-5 text-base leading-relaxed text-fg-muted md:text-lg">
            Everything upstream is preparation for this moment. The rider
            confirms the temperature class on the checklist, captures the
            handover, and the OTP closes the order — so a cold-chain claim is
            settled by evidence rather than by argument.
          </p>
        </Chapter>
      </Scene>

      <Scene scene="sand" padded={false} sweep="none">
        <ColdChainProtocol />
      </Scene>

      <Scene scene="ink" padded={false} sweep="none">
        <CTA
          title="Send us your hardest consignment"
          body="Meat, dairy, vaccines, diagnostic samples. Tell us the range it has to hold and we will show you the evidence trail it produces."
          primary={{ label: "Book a demo", href: "/contact" }}
          secondary={{ label: "See the network", href: "/network" }}
        />
      </Scene>
    </div>
  );
}