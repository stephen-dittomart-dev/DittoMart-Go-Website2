import agencyFleet from "@/assets/agency-fleet.png";
import b2bApiGateway from "@/assets/b2b-api-gateway.png";
import coldChain from "@/assets/cold-chain.png";
import logisticsEngine from "@/assets/logistics-engine.png";
import logoMark from "@/assets/logo-mark.png";
import ondcBuyerSeller from "@/assets/ondc-buyer-seller.png";
import predictiveAnalytics from "@/assets/predictive-analytics.png";
import riderCompliance from "@/assets/rider-compliance.png";
import walletGatekeeper from "@/assets/wallet-gatekeeper.png";

/**
 * Media manifest.
 *
 * Every render is statically imported so Next.js can emit width/height and a
 * blur placeholder — that removes layout shift entirely, which matters far
 * more here than usual because these images sit inside pinned scroll scenes
 * where a late reflow would visibly jump the pin.
 *
 * The renders share one visual language: isometric, glassy, cyan-to-green
 * glow on white. That reads as *system diagram*, so they are always framed on
 * a light plate and the orange brand comes from the chrome around them —
 * the same separation Apple keeps between product shots and UI.
 */
export const media = {
  logo: logoMark,

  /** §12 API Architecture · §24 endpoint map — the client-facing API. */
  apiGateway: {
    src: b2bApiGateway,
    alt: "Isometric illustration of the DittoMart Go B2B client API gateway, showing a server stack feeding an API module.",
    caption: "B2B Client API Gateway",
  },

  /** §3 Wallet Engine · §5 Wallet Balance Decision Gate. */
  wallet: {
    src: walletGatekeeper,
    alt: "Isometric illustration of the wallet gatekeeper — a locked vault door with a payment card and currency symbols.",
    caption: "Wallet Gatekeeper",
  },

  /** §6 Tariff Engine · §7 Trigger Mode Configuration. */
  engines: {
    src: logisticsEngine,
    alt: "Isometric illustration of interlocking gears labelled Tariff and Trigger Engine, surrounded by routing flow diagrams.",
    caption: "Tariff & Trigger Engine",
  },

  /** §13 Direct Agency Onboarding · §16 Agency Dashboard. */
  agencyFleet: {
    src: agencyFleet,
    alt: "Isometric illustration of a delivery agency depot with parked bikes and a fleet management dashboard.",
    caption: "Direct Agency Fleet Management",
  },

  /** §21 Cold-Chain & Food/Meat Vertical. */
  coldChain: {
    src: coldChain,
    alt: "Isometric illustration of an insulated cold-chain box reading minus four degrees Celsius with a snowflake and sensor readout.",
    caption: "Cold-Chain & Food Safety",
  },

  /** §26 Rider Compliance Monitoring · §27 AI Voice Call. */
  riderCompliance: {
    src: riderCompliance,
    alt: "Isometric illustration of a rider helmet and bicycle under a monitoring radar sweep.",
    caption: "Rider Compliance & AI Monitoring",
  },

  /** §22 AI & Data Pipeline · §28 the 12 AI features. */
  analytics: {
    src: predictiveAnalytics,
    alt: "Isometric illustration of a glass sphere containing a neural network and charts, labelled predictive analytics.",
    caption: "Predictive Analytics",
  },

  /** §18–20 ONDC dual role, buyer and seller. */
  ondc: {
    src: ondcBuyerSeller,
    alt: "Isometric illustration of two interlocking gears labelled Buyer and Seller, representing the ONDC dual role.",
    caption: "ONDC Buyer & Seller",
  },
} as const;

/** Served from /public so the browser can range-request them. */
export const introVideo = "/media/dittomart-go-intro.mp4";
export const operationsVideo = "/media/homeVDO.mp4";

export type MediaEntry = (typeof media)[keyof Omit<typeof media, "logo">];
