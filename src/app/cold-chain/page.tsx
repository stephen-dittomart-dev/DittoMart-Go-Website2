import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { MediaPlate } from "@/components/motion/scene";
import { ColdChainChapter } from "@/components/sections/chapters";
import { ColdChain } from "@/components/sections/cold-chain";
import { ColdChainProtocol } from "@/components/sections/cold-chain-protocol";
import { CTA } from "@/components/sections/cta";
import { media } from "@/lib/media";

export const metadata: Metadata = {
  title: "Cold Chain",
  description:
    "Temperature-classed delivery with evidence attached — frozen, chilled, ambient and hot, vehicle capability matching, FSSAI fields, perishable RTO protocol and a Proof of Freshness certificate on every consignment.",
  alternates: { canonical: "/cold-chain" },
};

export default function ColdChainPage() {
  return (
    <>
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
      >
        <MediaPlate
          src={media.coldChain.src}
          alt={media.coldChain.alt}
          caption={media.coldChain.caption}
          glow="accent"
          className="mx-auto max-w-2xl"
          sizes="(max-width: 1024px) 92vw, 42rem"
          priority
        />
      </PageHero>

      <ColdChain />
      <ColdChainChapter />
      <ColdChainProtocol />

      <CTA
        title="Send us your hardest consignment"
        body="Meat, dairy, vaccines, diagnostic samples. Tell us the range it has to hold and we will show you the evidence trail it produces."
        primary={{ label: "Book a demo", href: "/contact" }}
        secondary={{ label: "See the network", href: "/network" }}
      />
    </>
  );
}
