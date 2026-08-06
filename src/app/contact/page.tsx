import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { Scene } from "@/components/motion/color-scene";
import { MediaPlate } from "@/components/motion/scene";
import { ContactForm } from "@/components/sections/contact-form";
import { ContactDetails, ContactRoutes } from "@/components/sections/contact-parts";
import { Section } from "@/components/ui/primitives";
import { RadarScene } from "@/components/visuals/hero-scenes";
import { media } from "@/lib/media";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Talk to the DittoMart Go team about a demo, an API review, pricing and coverage, or enterprise onboarding. Based in Chennai.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    // Inner pages run the tighter section rhythm; see globals.css.
    <div data-density="tight">
      <Scene scene="ink" padded={false} sweep="none">
        <PageHero
          eyebrow="Contact"
          title="Tell us what you ship"
          highlight={["what", "ship"]}
          mode="chars"
          body="We will tell you honestly whether the platform helps, where it does not, and what it would cost. No discovery sequence, no gated deck."
          meta={[
            { label: "Response time", value: "1 business day" },
            { label: "Based in", value: site.city },
          ]}
          visual={<RadarScene />}
        >
          <MediaPlate
            entry={media.partner}
            aspect="wide"
            motion="slide"
            priority
          />
        </PageHero>
      </Scene>

      <Scene scene="bone" padded={false} sweep="none">
        <ContactRoutes />
      </Scene>

      <Scene scene="sand" padded={false} sweep="none">
        <Section id="form" className="scroll-mt-24">
          <div className="container-page">
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-7">
                <ContactForm />
              </div>
              <div className="lg:col-span-5">
                <ContactDetails />
              </div>
            </div>
          </div>
        </Section>
      </Scene>
    </div>
  );
}
