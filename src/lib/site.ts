export const site = {
  name: "DittoMart Go",
  company: "DittoMart",
  legalName: "DittoMart Technologies",
  tagline: "We are on your route",
  description:
    "DittoMart Go connects your business to nine delivery networks through one API — ONDC carrying Ola and Rapido, plus Adloggs, Shiprocket Quick, Qwqer, Flash by Shadowfax, Quicka, Pidge, Ek Bharath and Pro Routing. Routing, tracking, wallet, billing and settlement handled automatically.",
  url: "https://go.dittomart.in",
  locale: "en_IN",
  city: "Chennai",
  region: "Tamil Nadu",
  country: "IN",
  email: "sales@dittomart.in",
  supportEmail: "support@dittomart.in",
  phone: "+91 44 4000 0000",
  address: "Guindy, Chennai, Tamil Nadu 600032, India",
  twitter: "@dittomart",
  founded: "2024",
} as const;

export type NavLink = {
  label: string;
  href: string;
  description?: string;
  icon?: string;
  badge?: string;
};

export type NavGroup = {
  label: string;
  href?: string;
  columns?: {
    heading: string;
    links: NavLink[];
  }[];
  featured?: {
    eyebrow: string;
    title: string;
    body: string;
    href: string;
    cta: string;
  };
};

/**
 * Five items, no mega menu.
 *
 * The previous nav carried six groups with dropdowns; it buried the one thing
 * the site exists to say — that nine delivery networks sit behind one
 * integration. Network is now first and the rest is trimmed to what the
 * A-to-Z flowchart actually covers.
 */
export const navigation: NavGroup[] = [
  { label: "Network", href: "/network" },
  { label: "Platform", href: "/platform" },
  { label: "Cold chain", href: "/cold-chain" },
  { label: "Developers", href: "/developers" },
  { label: "Contact", href: "/contact" },
];

/** Retained for reference — the previous mega-menu structure. Unused. */
const legacyNavigation: NavGroup[] = [
  {
    label: "Platform",
    href: "/platform",
    columns: [
      {
        heading: "The engines",
        links: [
          {
            label: "Routing engine",
            href: "/platform#routing",
            description: "Ranks every provider on cost, ETA and reliability.",
            icon: "Route",
          },
          {
            label: "Allocation engine",
            href: "/platform#allocation",
            description: "Broadcast dispatch with an atomic first-accept lock.",
            icon: "Radio",
          },
          {
            label: "Tariff engine",
            href: "/platform#tariff",
            description: "Priority-matched pricing. Configured, never deployed.",
            icon: "Calculator",
          },
          {
            label: "Wallet & settlement",
            href: "/platform#wallet",
            description: "Prepaid control, GST invoicing, weekly settlement.",
            icon: "Wallet",
          },
        ],
      },
      {
        heading: "Supply network",
        links: [
          {
            label: "3PL network",
            href: "/platform#supply",
            description: "National fleets, reached through one contract.",
            icon: "Truck",
          },
          {
            label: "Direct fleet",
            href: "/platform#supply",
            description: "Partner agencies operating under our SLA.",
            icon: "Bike",
          },
          {
            label: "ONDC network",
            href: "/technology#ondc",
            description: "Buy and sell logistics capacity on the open network.",
            icon: "Network",
            badge: "New",
          },
          {
            label: "Live tracking",
            href: "/solutions#tracking",
            description: "White-label tracking under your brand.",
            icon: "MapPin",
          },
        ],
      },
    ],
    featured: {
      eyebrow: "Architecture",
      title: "See the whole system",
      body: "An interactive map of every layer between your order and your customer's door.",
      href: "/platform",
      cta: "Explore the platform",
    },
  },
  {
    label: "Solutions",
    href: "/solutions",
    columns: [
      {
        heading: "By capability",
        links: [
          {
            label: "Enterprise logistics",
            href: "/solutions#enterprise",
            description: "Multi-city, multi-provider, one control plane.",
            icon: "Building2",
          },
          {
            label: "Hyperlocal delivery",
            href: "/solutions#hyperlocal",
            description: "Same-hour dispatch with live rider visibility.",
            icon: "Timer",
          },
          {
            label: "Cold chain",
            href: "/solutions#cold-chain",
            description: "Temperature-classed delivery with verified proof.",
            icon: "Snowflake",
          },
          {
            label: "Analytics",
            href: "/solutions#analytics",
            description: "Cost, SLA and provider performance in one view.",
            icon: "BarChart3",
          },
        ],
      },
      {
        heading: "By surface",
        links: [
          {
            label: "Delivery API",
            href: "/developers",
            description: "REST, webhooks, sandbox. Live in an afternoon.",
            icon: "Code2",
          },
          {
            label: "Operations console",
            href: "/solutions#console",
            description: "Every order, every exception, one screen.",
            icon: "LayoutDashboard",
          },
          {
            label: "White-label tracking",
            href: "/solutions#tracking",
            description: "Your brand on every tracking link.",
            icon: "Link2",
          },
          {
            label: "Billing & settlement",
            href: "/solutions#billing",
            description: "Reconciled automatically, disputed automatically.",
            icon: "Receipt",
          },
        ],
      },
    ],
    featured: {
      eyebrow: "Cold chain",
      title: "Proof of Freshness",
      body: "Pickup photo, temperature curve, delivery photo — sealed into one verifiable certificate.",
      href: "/solutions#cold-chain",
      cta: "See how it works",
    },
  },
  {
    label: "Industries",
    href: "/industries",
  },
  {
    label: "Technology",
    href: "/technology",
  },
  {
    label: "Developers",
    href: "/developers",
  },
  {
    label: "Company",
    href: "/about",
    columns: [
      {
        heading: "Company",
        links: [
          {
            label: "About",
            href: "/about",
            description: "Why we built a delivery operating system.",
            icon: "Compass",
          },
          {
            label: "Contact sales",
            href: "/contact",
            description: "Talk to the team about volume and coverage.",
            icon: "Mail",
          },
        ],
      },
      {
        heading: "Legal",
        links: [
          {
            label: "Privacy",
            href: "/privacy",
            description: "How we handle data under the DPDP Act.",
            icon: "Shield",
          },
          {
            label: "Terms",
            href: "/terms",
            description: "Service terms and acceptable use.",
            icon: "FileText",
          },
        ],
      },
    ],
  },
];

export const footerNav = [
  {
    heading: "Network",
    links: [
      { label: "All nine networks", href: "/network" },
      { label: "Smart routing", href: "/network#routing" },
      { label: "ONDC · Ola & Rapido", href: "/network#ondc" },
      { label: "Own agency fleet", href: "/network#routing" },
    ],
  },
  {
    heading: "Platform",
    links: [
      { label: "Overview", href: "/platform" },
      { label: "Wallet gate", href: "/platform#wallet" },
      { label: "Tariff engine", href: "/platform#tariff" },
      { label: "Allocation engine", href: "/platform#allocation" },
      { label: "Order lifecycle", href: "/platform#lifecycle" },
      { label: "Billing & settlement", href: "/platform#billing" },
    ],
  },
  {
    heading: "Developers",
    links: [
      { label: "API overview", href: "/developers" },
      { label: "Authentication", href: "/developers#auth" },
      { label: "Webhooks", href: "/developers#webhooks" },
      { label: "Sandbox", href: "/developers#sandbox" },
      { label: "SDKs", href: "/developers#sdks" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Cold chain", href: "/cold-chain" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
] as const;
