import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/layout/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How DittoMart Go collects, uses, retains and protects personal data under India's Digital Personal Data Protection Act.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

const sections: LegalSection[] = [
  {
    id: "scope",
    heading: "Scope",
    paragraphs: [
      `This policy covers ${site.name}, the B2B delivery platform operated by ${site.legalName}. It applies to our website, our client dashboard, our APIs, the white-label tracking pages we serve on behalf of clients, and the rider application.`,
      "It does not cover the practices of our clients. When you receive a delivery arranged through our platform, the business that sold you the goods remains the primary data fiduciary for that transaction; we act largely as a data processor on their instructions.",
    ],
  },
  {
    id: "collect",
    heading: "What we collect",
    paragraphs: [
      "We collect the minimum needed to move a consignment and to account for it afterwards.",
    ],
    list: [
      "Business account data — company name, GST registration, registered address, authorised contacts and billing details.",
      "Delivery data — pickup and drop addresses, contact numbers, package attributes, temperature class, COD amount and service level.",
      "Operational telemetry — rider location during an active delivery, order state transitions, proof of delivery photographs, OTP verification results and temperature readings.",
      "Technical data — API keys in hashed form, request logs, IP address, device and browser information, and error traces.",
      "Communications — messages you send us through forms, email or support channels.",
    ],
  },
  {
    id: "use",
    heading: "How we use it",
    list: [
      "To price, allocate, dispatch, track and settle deliveries.",
      "To produce proof of delivery, temperature evidence and dispute resolution records.",
      "To detect fraud, including falsified proof, location spoofing and collusion.",
      "To meet statutory obligations including GST invoicing and food-safety record keeping.",
      "To operate, secure, debug and improve the platform.",
      "To respond to you when you contact us.",
    ],
    paragraphs: [
      "We do not sell personal data. We do not use delivery contact details for marketing, and we do not build advertising profiles.",
    ],
  },
  {
    id: "sharing",
    heading: "Who we share it with",
    paragraphs: [
      "Fulfilling a delivery necessarily involves third parties. We share the minimum field set required for each of them to perform their role.",
    ],
    list: [
      "Delivery providers and partner agencies — the pickup and drop details needed to complete the assignment, with recipient numbers masked where the provider supports it.",
      "Riders — the addresses and masked contact number for the active assignment only, revoked on completion.",
      "Infrastructure providers — cloud hosting, object storage, messaging and mapping services operating under contract.",
      "Payment and financial partners — for wallet top-ups, settlement and reconciliation.",
      "Authorities — where disclosure is legally required, and only to the extent required.",
    ],
  },
  {
    id: "retention",
    heading: "Retention",
    paragraphs: [
      "Retention is set by purpose rather than convenience. Delivery records and proof artefacts are retained for the period required to support disputes, tax obligations and food-safety compliance. Rider location traces are retained for a short operational window and then reduced to the aggregate needed for scorecards and route analysis.",
      "Data that is no longer needed for a stated purpose is deleted or irreversibly anonymised.",
    ],
  },
  {
    id: "rights",
    heading: "Your rights",
    paragraphs: [
      "Under the Digital Personal Data Protection Act you may request access to your personal data, correction of inaccuracies, erasure where retention is no longer justified, and withdrawal of consent where consent is the basis for processing. You may also nominate another person to exercise these rights on your behalf.",
      `Send requests to ${site.email}. We verify identity before acting and respond within the statutory period. Where you are a customer of one of our clients, we may need to route your request through them.`,
    ],
  },
  {
    id: "security",
    heading: "Security",
    list: [
      "Encryption in transit and at rest.",
      "API keys stored only as hashes — we cannot reveal an existing key, only issue a new one.",
      "Signed webhooks with idempotency keys.",
      "Tenant isolation enforced at the data-access layer and verified by an automated test suite.",
      "Role-based access for internal staff, with every privileged action written to an append-only audit log.",
      "Contact numbers masked by default across dashboards, tracking pages and the rider app.",
    ],
  },
  {
    id: "cookies",
    heading: "Cookies",
    paragraphs: [
      "This website uses only what is necessary to function: a session cookie for authenticated areas and a local preference for your light or dark theme. We do not run third-party advertising or cross-site tracking scripts.",
    ],
  },
  {
    id: "changes",
    heading: "Changes to this policy",
    paragraphs: [
      "We version this policy and record the date of each revision. Material changes are communicated to account holders before they take effect. Continued use after that point constitutes acceptance.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="5 August 2026"
      intro="We collect what a delivery requires and keep it for as long as the obligation lasts. This page states exactly what that means in practice."
      sections={sections}
    />
  );
}
