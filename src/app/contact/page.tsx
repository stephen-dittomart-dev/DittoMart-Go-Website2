import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { ContactForm } from "@/components/sections/contact-form";
import { ContactDetails, ContactRoutes } from "@/components/sections/contact-parts";
import { Section } from "@/components/ui/primitives";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Talk to the DittoMart Go team about a demo, an API review, pricing and coverage, or enterprise onboarding. Based in Chennai.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
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
      />

      <ContactRoutes />

      <Section id="form" className="scroll-mt-24 border-b border-line">
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
    </>
  );
}
