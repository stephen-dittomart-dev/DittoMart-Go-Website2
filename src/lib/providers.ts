/**
 * The supply network DittoMart Go aggregates.
 *
 * This is the single source of truth for every partner shown on the site —
 * home rail, /network page, footer counts. Correcting a partner name or
 * adding a new one is a one-line edit here and it propagates everywhere.
 *
 * `verified` marks names confirmed by the client. Anything false is rendered
 * exactly as supplied and is awaiting confirmation of the legal spelling.
 */

export type ProviderRail = "3PL" | "ONDC" | "ROUTING" | "NETWORK";

export type Provider = {
  id: string;
  name: string;
  /** Short label for dense contexts — rails, chips, tables. */
  short: string;
  rail: ProviderRail;
  /** Registry key from icon-registry.ts */
  icon: string;
  tagline: string;
  body: string;
  strengths: string[];
  /** What this partner is chosen for by the routing engine. */
  bestFor: string;
  coverage: string;
  verified: boolean;
};

export const providers: Provider[] = [
  /*
    ONDC first, deliberately.

    Every network section on the site iterates this array in order — the home
    burst, the /network grid, the footer rail, the structured data — so the
    order here is the order the reader meets them in, and ONDC is the rail
    that carries Ola and Rapido and the one worth leading with. It used to sit
    last simply because it was added last.

    Safe to reorder: the logos are keyed by `id` in `network-marks.ts`
    precisely so that this could be done without a parallel array quietly
    pairing the wrong mark with the wrong network. Nothing indexes this array
    by position.
  */
  {
    id: "ondc",
    name: "ONDC",
    short: "ONDC",
    rail: "ONDC",
    icon: "Globe2",
    tagline: "Ola · Rapido, over the open network",
    body: "The open network rail. Through ONDC's LOG10 logistics domain we reach Ola and Rapido capacity without a bilateral contract with either — and we can sell our own fleet back to the network when riders would otherwise sit idle.",
    strengths: [
      "Ola and Rapido capacity via one integration",
      "No bilateral contract required",
      "Sell idle fleet back to the network",
    ],
    bestFor: "National reach and idle-fleet monetisation",
    coverage: "ONDC network",
    verified: true,
  },
  {
    id: "adloggs",
    name: "Adloggs",
    short: "Adloggs",
    rail: "3PL",
    icon: "Bike",
    tagline: "Hyperlocal gig fleet",
    body: "On-demand two-wheeler capacity across dense city clusters, drawn from a gig rider pool rather than a fixed fleet. Strong at absorbing sudden demand without a capacity commitment from us.",
    strengths: [
      "Elastic capacity during peaks",
      "Two-wheeler and three-wheeler mix",
      "Fast pickup in dense clusters",
    ],
    bestFor: "Peak-hour overflow and dense urban clusters",
    coverage: "Metro clusters",
    verified: true,
  },
  {
    id: "shiprocket-quick",
    name: "Shiprocket Quick",
    short: "Shiprocket",
    rail: "3PL",
    icon: "Package",
    tagline: "Same-day and intracity",
    body: "Shiprocket's intracity arm, giving us same-day and scheduled-slot capacity backed by one of the largest seller logistics networks in the country.",
    strengths: [
      "Same-day intracity delivery",
      "Deep D2C and marketplace experience",
      "Scheduled and slotted pickups",
    ],
    bestFor: "Same-day e-commerce and D2C dispatch",
    coverage: "Pan-India intracity",
    verified: true,
  },
  {
    id: "qwqer",
    name: "Qwqer",
    short: "Qwqer",
    rail: "3PL",
    icon: "Truck",
    tagline: "Intracity fleet",
    body: "Contracted intracity capacity used for larger consignments and multi-drop runs where a two-wheeler is not the right vehicle.",
    strengths: [
      "Larger vehicle classes",
      "Multi-drop route capability",
      "Predictable contracted rates",
    ],
    bestFor: "Bulk, multi-drop and larger vehicle classes",
    coverage: "Intracity",
    verified: false,
  },
  {
    id: "flash-shadowfax",
    name: "Flash by Shadowfax",
    short: "Flash",
    rail: "3PL",
    icon: "Zap",
    tagline: "Quick commerce rail",
    body: "Shadowfax's rapid-delivery product, built for sub-hour promises. This is the rail the routing engine reaches for when the SLA on the order is measured in minutes.",
    strengths: [
      "Sub-hour delivery windows",
      "High rider density in metros",
      "Built for quick commerce volume",
    ],
    bestFor: "Sub-hour SLAs and quick commerce",
    coverage: "Metro and tier-1",
    verified: true,
  },
  {
    id: "quicka",
    name: "Quicka",
    short: "Quicka",
    rail: "3PL",
    icon: "Timer",
    tagline: "Express hyperlocal",
    body: "Express hyperlocal capacity for short-radius, high-frequency runs — the kind of work where pickup latency matters more than distance.",
    strengths: [
      "Very short pickup latency",
      "High-frequency short-radius runs",
      "Good density in core zones",
    ],
    bestFor: "Short-radius, high-frequency dispatch",
    coverage: "Core city zones",
    verified: false,
  },
  {
    id: "pidge",
    name: "Pidge",
    short: "Pidge",
    rail: "3PL",
    icon: "Network",
    tagline: "Multi-fleet network",
    body: "A logistics network rather than a single fleet, which gives us reach into riders we would otherwise have to contract one by one. Useful redundancy on the 3PL rail.",
    strengths: [
      "Access to multiple underlying fleets",
      "Redundancy when a single fleet is saturated",
      "Broad serviceability footprint",
    ],
    bestFor: "Coverage gaps and provider redundancy",
    coverage: "Multi-city",
    verified: true,
  },
  {
    id: "ek-bharath",
    name: "Ek Bharath",
    short: "Ek Bharath",
    rail: "3PL",
    icon: "Boxes",
    tagline: "Regional distribution",
    body: "Regional distribution capacity for the runs that leave the dense core — the routes where metro-focused fleets stop being economical.",
    strengths: [
      "Reach beyond metro cores",
      "Regional and tier-2 corridors",
      "Cost-efficient on longer runs",
    ],
    bestFor: "Tier-2 corridors and longer intracity runs",
    coverage: "Regional",
    verified: false,
  },
  {
    id: "pro-routing",
    name: "Pro Routing",
    short: "Pro Routing",
    rail: "ROUTING",
    icon: "Route",
    tagline: "Route optimisation layer",
    body: "Route optimisation feeding the allocation engine — sequencing multi-drop runs and estimating realistic travel time per rail before an order is ever triggered.",
    strengths: [
      "Multi-drop sequencing",
      "Realistic travel-time estimates",
      "Feeds provider ranking directly",
    ],
    bestFor: "Multi-drop sequencing and ETA accuracy",
    coverage: "All rails",
    verified: false,
  },
];

/** Providers reached through the ONDC rail specifically. */
export const ondcCarriers = ["Ola", "Rapido"] as const;

export const providerStats = {
  total: providers.length,
  direct3pl: providers.filter((p) => p.rail === "3PL").length,
  rails: 3,
} as const;
