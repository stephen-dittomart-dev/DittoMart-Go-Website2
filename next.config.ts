import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  /**
   * Rewrites `import { X } from "pkg"` into a direct deep import at build
   * time. It matters most for lucide-react, whose barrel pulls a very large
   * module graph that the dev server then has to walk on every route compile.
   */
  experimental: {
    optimizePackageImports: ["lucide-react", "gsap", "@gsap/react"],
  },
  images: {
    /**
     * WebP only — AVIF is removed deliberately.
     *
     * Measured on this project's own artwork: a 1.5MB source PNG takes ~470ms
     * to encode to AVIF on a cold request versus ~151ms to WebP. Pages here
     * carry 9–31 optimised variants, so that difference is the whole reason a
     * first visit to a page felt slow — the markup arrived in ~20ms and then
     * the browser sat waiting on the image pipeline. AVIF's extra ~35% file
     * saving is not worth a 3× encode cost on a site this image-heavy.
     */
    formats: ["image/webp"],

    /**
     * Next generates one variant per entry in this list that a `sizes` value
     * can select. The defaults run to 3840px, which nothing here ever
     * displays — trimming the top end removes variants that only ever cost
     * encode time.
     */
    deviceSizes: [640, 828, 1080, 1200, 1600, 1920],
    imageSizes: [128, 256, 384],

    /** Optimised output is immutable per source hash — cache it hard. */
    minimumCacheTTL: 60 * 60 * 24 * 365,
    /**
     * Hosts allowed for partner logos supplied as remote URLs in
     * src/lib/provider-logos.ts. Add the specific host you are pulling from —
     * a wildcard here would let any URL in the app proxy arbitrary images
     * through your own domain, which is a genuine abuse vector.
     */
    remotePatterns: [
      { protocol: "https", hostname: "**.cloudfront.net" },
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "logo.clearbit.com" },
      { protocol: "https", hostname: "cdn.simpleicons.org" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
