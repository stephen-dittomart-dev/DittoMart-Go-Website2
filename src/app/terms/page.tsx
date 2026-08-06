import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/layout/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms governing use of the DittoMart Go delivery platform, APIs, dashboards and tracking services.",
  alternates: { canonical: "/terms" },
};

const sections: LegalSection[] = [
  {
    id: "agreement",
    heading: "The agreement",
    paragraphs: [
      `These terms govern access to ${site.name}, operated by ${site.legalName}. They apply alongside your signed service agreement and any rate card issued to you. Where a signed agreement conflicts with these terms, the signed agreement prevails.`,
      "By creating an account, issuing an API key or submitting a delivery request, you accept these terms on behalf of the organisation you represent.",
    ],
  },
  {
    id: "service",
    heading: "What the service is",
    paragraphs: [
      "DittoMart Go is an aggregation and orchestration platform. We contract with delivery providers and partner agencies, and we allocate your consignments across them according to the routing configuration on your account.",
      "We are not a courier. Physical carriage is performed by third-party providers or partner agencies. We are responsible for the correctness of the platform, the accuracy of the rates we quote, and the service levels stated in your agreement.",
    ],
  },
  {
    id: "accounts",
    heading: "Accounts and API keys",
    list: [
      "You are responsible for keeping API keys confidential and for all activity conducted under them.",
      "Keys are scoped and revocable. Report suspected compromise immediately so we can rotate them.",
      "You must not share credentials between legal entities or resell platform access without a written reseller agreement.",
      "We may suspend an account or key where we detect abuse, fraud or a security risk, and will tell you why.",
    ],
  },
  {
    id: "wallet",
    heading: "Wallet, pricing and billing",
    paragraphs: [
      "Unless your agreement places you on postpaid terms, the platform operates on a prepaid wallet. Each order is checked against your available balance before any provider is contacted. Orders that cannot be funded are held rather than dispatched, and are released automatically when the balance is topped up.",
      "The rate quoted at confirmation is locked on the order. Surcharges applied afterwards — waiting time, return to origin, or a change requested by you — are billed at the rates published in your rate card.",
    ],
    list: [
      "Wallet top-ups are non-refundable but remain available for future deliveries.",
      "GST is applied at the prevailing statutory rate and a tax invoice is issued monthly.",
      "Refunds for failed or returned deliveries are credited to the wallet, net of any pickup charge stated in your rate card.",
      "Disputed charges must be raised within the window stated in your agreement.",
    ],
  },
  {
    id: "obligations",
    heading: "Your obligations",
    list: [
      "Provide accurate pickup and drop information, including reachable contact numbers.",
      "Declare the correct temperature class, weight, dimensions and value for every consignment.",
      "Ensure consignments are packaged appropriately for the vehicle class requested.",
      "Hold the licences and registrations required for the goods you ship, including FSSAI where applicable.",
      "Obtain any consent required from your customers before passing their contact details to us.",
    ],
  },
  {
    id: "prohibited",
    heading: "Prohibited consignments",
    paragraphs: [
      "The following may not be shipped through the platform under any circumstances, and attempting to do so is grounds for immediate suspension.",
    ],
    list: [
      "Anything unlawful to possess, transport or sell in the relevant jurisdiction.",
      "Hazardous, explosive, flammable, radioactive or corrosive material.",
      "Live animals, human remains and biological material outside a contracted diagnostics agreement.",
      "Currency, bullion, negotiable instruments and unregistered high-value valuables.",
      "Controlled substances and prescription medicine without the required licence.",
    ],
  },
  {
    id: "sla",
    heading: "Service levels and liability",
    paragraphs: [
      "Service levels, penalties and credits are defined in your agreement. Where an SLA is missed on an order, the remedy stated there is the sole remedy.",
      "Our aggregate liability in any twelve-month period is limited to the fees you paid us in the preceding three months, except where liability cannot be limited by law. We are not liable for indirect or consequential loss, including lost profit, lost customers or reputational harm.",
      "Declared value governs claims for loss or damage. Undeclared or misdeclared value limits recovery to the default cover stated in your rate card.",
    ],
  },
  {
    id: "availability",
    heading: "Availability and changes",
    paragraphs: [
      "We target high availability on the order and allocation path and publish planned maintenance in advance. The v1 API contract will not be broken without notice; additive changes may ship at any time.",
      "We may modify these terms. Material changes are communicated to account holders before they take effect.",
    ],
  },
  {
    id: "termination",
    heading: "Termination",
    paragraphs: [
      "Either party may terminate on the notice period stated in the service agreement. On termination we complete deliveries already in progress, issue a final invoice, and refund any remaining wallet balance net of outstanding charges. Records required for statutory or dispute purposes are retained for their required period.",
    ],
  },
  {
    id: "law",
    heading: "Governing law",
    paragraphs: [
      `These terms are governed by the laws of India. Courts at ${site.city}, ${site.region} have exclusive jurisdiction, subject to any arbitration clause in your signed agreement.`,
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="5 August 2026"
      intro="The rules that govern using the platform. Written to be read — if something here is unclear, ask us rather than guessing."
      sections={sections}
    />
  );
}
