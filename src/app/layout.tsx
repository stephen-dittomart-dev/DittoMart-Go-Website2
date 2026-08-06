import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { themeScript } from "@/components/layout/theme-toggle";
import { BackToTop } from "@/components/motion/back-to-top";
import { Cursor } from "@/components/motion/cursor";
import { ScrollProgress } from "@/components/motion/interactions";
import { RouteProgress } from "@/components/motion/route-progress";
import { ScrollProvider } from "@/components/motion/scroll-provider";
import { AmbientCanvas } from "@/components/visuals/ambient-canvas";
import { site } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-jet",
  display: "swap",
  weight: ["400", "500"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#080605" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "Adloggs",
    "Shiprocket Quick",
    "Flash by Shadowfax",
    "Pidge delivery",
    "ONDC logistics Ola Rapido",
    "delivery aggregator Chennai",
    "delivery as a service",
    "logistics API",
    "3PL aggregator",
    "delivery aggregation platform",
    "hyperlocal delivery API",
    "cold chain logistics",
    "ONDC logistics",
    "last mile delivery platform",
    "B2B logistics software India",
    "delivery management system",
  ],
  authors: [{ name: site.company }],
  creator: site.company,
  publisher: site.legalName,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: site.locale,
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${site.name} — ${site.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: site.twitter,
    creator: site.twitter,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${site.url}/#organization`,
      name: site.company,
      legalName: site.legalName,
      url: site.url,
      email: site.email,
      telephone: site.phone,
      foundingDate: site.founded,
      address: {
        "@type": "PostalAddress",
        addressLocality: site.city,
        addressRegion: site.region,
        addressCountry: site.country,
        streetAddress: site.address,
      },
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "sales",
          email: site.email,
          telephone: site.phone,
          areaServed: "IN",
          availableLanguage: ["en", "ta"],
        },
      ],
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${site.url}/#software`,
      name: site.name,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web, iOS, Android",
      description: site.description,
      publisher: { "@id": `${site.url}/#organization` },
      offers: {
        "@type": "Offer",
        priceCurrency: "INR",
        price: "0",
        description: "Usage-based pricing. Pay per delivery.",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      url: site.url,
      name: site.name,
      publisher: { "@id": `${site.url}/#organization` },
      inLanguage: "en-IN",
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en-IN"
      className={`${inter.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="min-h-dvh antialiased">
        <ScrollProvider>
          <AmbientCanvas />
          <Cursor />
          <ScrollProgress />
          <RouteProgress />
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <BackToTop />
        </ScrollProvider>
      </body>
    </html>
  );
}
