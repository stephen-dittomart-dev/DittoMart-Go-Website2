import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { Scene } from "@/components/motion/color-scene";
import { HoldToEnd } from "@/components/motion/hold-to-end";
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
import { RequestLogScene } from "@/components/visuals/hero-scenes";
import { createOrderResponse, createOrderSamples } from "@/lib/code-samples";

export const metadata: Metadata = {
  title: "Developers",
  description:
    "The DittoMart Go delivery API — nine REST endpoints, signed webhooks, a full sandbox and SDKs. Sandbox credentials at signup, integration in a day.",
  alternates: { canonical: "/developers" },
};

export default function DevelopersPage() {
  return (
    // Inner pages run the tighter section rhythm; see globals.css.
    <div data-density="tight">
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
          visual={<RequestLogScene />}
        >
          {/*
            The gateway plate that used to sit beside the code window has
            moved out. The hero now carries a live request log in its right
            column, and a still photograph of the same subject next to it read
            as two illustrations of one idea.
          */}
          <CodeWindow
            samples={createOrderSamples}
            response={createOrderResponse}
            title="Create a delivery"
          />
        </PageHero>
      </Scene>

      {/* ----------------------------------------------------------------
          One overlap boundary: 2 → 3.

          `HoldToEnd` pins the experience band on its last screenful and gives
          it one viewport of hold, during which it recedes and dims;
          `lg:-mt-[100vh]` on the endpoints band is that same viewport, so the
          hold and the climb are one number and cannot drift apart.

          Nothing inside either band is touched, and no z-index is involved —
          both are positioned, so the later one paints over the earlier one in
          DOM order. lg-only; a band that turns out to fit the frame opts
          itself out inside `HoldToEnd`.
          ---------------------------------------------------------------- */}

      {/* 02 · sand — the developer experience, held for the endpoints */}
      <HoldToEnd>
        <Scene scene="sand" padded={false} sweep="none">
          <DevExperience />
        </Scene>
      </HoldToEnd>

      {/* 03 · slate — the API chapter and the endpoints, climbing over it */}
      <Scene
        scene="slate"
        padded={false}
        sweep="none"
        className="lg:-mt-[100vh]"
      >
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
    </div>
  );
}
