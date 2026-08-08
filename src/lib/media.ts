import type { StaticImageData } from "next/image";

/* ---------- new photographic set (assets/new) — the primary library ------ */
import aiRouting from "@/assets/new/AI.png";
import bike from "@/assets/new/bike.png";
import delivery2 from "@/assets/new/delivery2.png";
import deliverybox from "@/assets/new/deliverybox.png";
import dittomartHome from "@/assets/new/dittomarthome.png";
import human from "@/assets/new/human.png";
import logisticDepot from "@/assets/new/logistic1.png";
import ondcMap from "@/assets/new/map.png";
import ondcTruck from "@/assets/new/ONDCTruck.png";
import riderStreet from "@/assets/new/riderimg.png";
import scan from "@/assets/new/scan.png";
import team from "@/assets/new/team.png";
import threePl from "@/assets/new/3pl.png";
import threePlOndc from "@/assets/new/3plandondc.png";

/* ---------- earlier isometric renders — kept only where nothing in the
   new set covers the subject (the money gate, the temperature box and the
   pricing engine have no photographic equivalent) --------------------- */
import coldChainRender from "@/assets/cold-chain.png";
import enginesRender from "@/assets/logistics-engine.png";
import logoMark from "@/assets/logo-mark.png";
import walletRender from "@/assets/wallet-gatekeeper.png";

/**
 * Media manifest.
 *
 * The new photographic set carries the site. It is doing something the
 * isometric renders never could: showing the actual thing — a rider in
 * traffic, a sortation floor, a parcel changing hands — which is worth more
 * to a logistics buyer than any diagram. The remaining renders are kept only
 * for the three subjects photography does not cover.
 *
 * `variant` tells <MediaPlate /> how to frame each one. The renders ship on
 * white and are multiplied into a warm plate; the photographs are full-bleed
 * and must never be blended or they turn to mud.
 */

type Entry = {
  src: StaticImageData;
  alt: string;
  caption: string;
  variant: "render" | "photo";
};

export const media = {
  logo: logoMark,

  /* ---------------- hero ---------------- */
  hero: {
    src: dittomartHome,
    alt: "The DittoMart Go depot at dusk, with a line of branded electric delivery scooters parked outside the lit headquarters building.",
    caption: "DittoMart Go · Chennai depot",
    variant: "photo",
  } satisfies Entry,

  /* §1 Ecosystem — the full-bleed dark plate */
  ecosystem: {
    src: threePlOndc,
    alt: "A sortation floor at night with overhead displays reading 3PL Network and ONDC Integrated above parallel conveyor lines.",
    caption: "3PL network · ONDC integrated",
    variant: "photo",
  } satisfies Entry,

  /* §12 · §24 — the client-facing API and tracking */
  apiGateway: {
    src: scan,
    alt: "A warehouse operative scanning a barcoded parcel label with a handheld terminal.",
    caption: "Scan · track · webhook",
    variant: "photo",
  } satisfies Entry,

  /* §3 · §5 Wallet engine — no photographic equivalent */
  wallet: {
    src: walletRender,
    alt: "Illustration of the wallet gatekeeper: a locked vault door with a payment card and currency symbols.",
    caption: "Wallet Gatekeeper",
    variant: "render",
  } satisfies Entry,

  /* §6 · §7 Tariff and trigger — no photographic equivalent */
  engines: {
    src: enginesRender,
    alt: "Illustration of interlocking gears labelled Tariff and Trigger Engine, surrounded by routing flow diagrams.",
    caption: "Tariff & Trigger Engine",
    variant: "render",
  } satisfies Entry,

  /* §13 · §16 Direct agency fleet */
  agencyFleet: {
    src: logisticDepot,
    alt: "An agency depot interior with a long row of charging electric delivery bikes and staff working at the dispatch counter.",
    caption: "Direct agency depot",
    variant: "photo",
  } satisfies Entry,

  /* §21 Cold chain — no photographic equivalent for the sensor box */
  coldChain: {
    src: coldChainRender,
    alt: "Illustration of an insulated cold-chain box reading minus four degrees Celsius with a snowflake and sensor readout.",
    caption: "Cold-Chain & Food Safety",
    variant: "render",
  } satisfies Entry,

  /* §21 the handover that cold chain protects */
  coldHandover: {
    src: delivery2,
    alt: "A rider handing an insulated food order to a customer at their door.",
    caption: "Temperature-checked handover",
    variant: "photo",
  } satisfies Entry,

  /* §26 · §27 Rider compliance and AI voice */
  riderCompliance: {
    src: riderStreet,
    alt: "A delivery rider on a branded electric scooter moving through dense city traffic at dusk.",
    caption: "Rider compliance · live GPS",
    variant: "photo",
  } satisfies Entry,

  /* §22 · §28 AI and data */
  analytics: {
    src: aiRouting,
    alt: "An automated logistics hall at night with overhead screens reading Bolna AI Interface and Predictive Routing.",
    caption: "Predictive routing · AI",
    variant: "photo",
  } satisfies Entry,

  /* §18–20 ONDC dual role */
  ondc: {
    src: ondcMap,
    alt: "An operations room with a wall-sized world map headed ONDC Dual-Role, showing live network routes and GPS trails.",
    caption: "ONDC dual-role control",
    variant: "photo",
  } satisfies Entry,

  ondcHub: {
    src: ondcTruck,
    alt: "An ONDC Logistics Hub at sunrise with a zero-emission delivery truck loading and a drone on the pad above.",
    caption: "ONDC logistics hub",
    variant: "photo",
  } satisfies Entry,

  /* §11 Dashboards — the people who watch the board */
  operations: {
    src: team,
    alt: "An operations team around a table reviewing route maps and peak-hour goals on a whiteboard.",
    caption: "Operations · route review",
    variant: "photo",
  } satisfies Entry,

  /* proof of delivery */
  proof: {
    src: deliverybox,
    alt: "A rider handing a parcel to a customer at their front door in the early evening.",
    caption: "Proof of delivery",
    variant: "photo",
  } satisfies Entry,

  /* the fleet itself */
  fleet: {
    src: bike,
    alt: "A DittoMart-branded electric delivery scooter with its insulated box and helmet, parked on a city street.",
    caption: "DittoMart Go fleet",
    variant: "photo",
  } satisfies Entry,

  /* partners and people */
  partner: {
    src: human,
    alt: "An agency manager standing with a tablet in front of a row of branded delivery bikes.",
    caption: "Agency partner",
    variant: "photo",
  } satisfies Entry,

  threePl: {
    src: threePl,
    alt: "A large 3PL sortation warehouse with parcels moving along conveyor lines under an illuminated 3PL Integrated sign.",
    caption: "3PL integrated",
    variant: "photo",
  } satisfies Entry,
} as const;

/**
 * Served from /public so the browser can range-request them.
 *
 * The prefix is not decoration. These strings land straight on a `<video src>`,
 * and Next rewrites only the URLs it generates itself — a raw attribute value
 * is left alone, so under a sub-path deployment it would resolve at the domain
 * root and 404. Empty string when the site is mounted at the root.
 */
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const introVideo = `${base}/media/dittomart-go-intro.mp4`;
export const operationsVideo = `${base}/media/homeVDO.mp4`;

export type MediaEntry = Entry;
