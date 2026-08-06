import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { Scene } from "@/components/motion/color-scene";
import { MediaPlate } from "@/components/motion/scene";
import { ApiChapter } from "@/components/sections/chapters";
import { CTA } from "@/components/sections/cta";
import {
  DevAuth,
  DevEndpoints,
  DevExperience,
  DevSandbox,
  DevWebhooks,
} from "@/components/sections/developers-parts";
import { CodeWindow } from "@/components/visuals/code-window";
import { createOrderResponse, createOrderSamples } from "@/lib/code-samples";
import { media } from "@/lib/media";

export const metadata: Metadata = {
  title: "Developers",
  description:
    "The DittoMart Go delivery API — nine REST endpoints, signed webhooks, a full sandbox and SDKs. Sandbox credentials at signup, integration in a day.",
  alternates: { canonical: "/developers" },
};

export default function DevelopersPage() {
  return (
    <>
      <Scene scene="ink" padded={false} sweep="none">
        <PageHero
          eyebrow="Developers"
          title="Nine endpoints. One webhook contract. One afternoon."
          highlight={["Nine", "endpoints."]}
          mode="chars"
          body="The whole delivery surface fits on a page. No SDK is required, no integration consultant exists, and the sandbox is open before anyone has signed anything."
          primary={{ label: "Get sandbox access", href: "/contact" }}
          secondary={{ label: "Talk to an engineer", href: "/contact" }}
          meta={[
            { label: "Endpoints", value: "9" },
            { label: "Webhook events", value: "9" },
            { label: "Median response", value: "142ms" },
          ]}
        >
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <CodeWindow
                samples={createOrderSamples}
                response={createOrderResponse}
                title="Create a delivery"
              />
            </div>
            <div className="lg:col-span-5">
              <MediaPlate
                entry={media.apiGateway}
                sizes="(max-width: 1024px) 92vw, 30rem"
                motion="flip"
                priority
              />
            </div>
          </div>
        </PageHero>
      </Scene>

      <Scene scene="sand" padded={false} sweep="none">
        <DevExperience />
      </Scene>

      <Scene scene="slate" padded={false} sweep="none">
        <ApiChapter />
        <DevEndpoints />
      </Scene>

      <Scene scene="bone" padded={false} sweep="none">
        <DevAuth />
      </Scene>

      <Scene scene="crimson" padded={false} sweep="none">
        <DevWebhooks />
      </Scene>

      <Scene scene="olive" padded={false} sweep="none">
        <DevSandbox />
      </Scene>

      <Scene scene="ink" padded={false} sweep="none">
        <CTA
          title="Get a sandbox key"
          body="No sales call required to start building. Tell us your stack and we will send credentials and a quickstart the same day."
          primary={{ label: "Request access", href: "/contact" }}
          secondary={{ label: "See the platform", href: "/platform" }}
        />
      </Scene>
    </>
  );
}
