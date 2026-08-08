import type { NextConfig } from "next";

/**
 * Where the site is mounted on its host. Kept in one place because two things
 * need it and Next only applies it to one of them: it rewrites the URLs it
 * generates itself (`next/image`, `next/link`, `/_next/*`), but a plain string
 * handed to a DOM attribute — a `<video src>` pointing into /public — passes
 * through untouched and would resolve at the domain root. See src/lib/media.ts.
 */
const basePath = "/GO/website";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  /**
   * The site is served from a sub-path on a shared host — Apache proxies
   * `/GO/website` through to this app. Without this, every asset URL Next
   * emits (`/_next/...`) would resolve at the domain root, where nothing is
   * listening, and the pages would arrive unstyled.
   */
  basePath,

  /** Exposed so client code can prefix its own /public URLs. */
  env: { NEXT_PUBLIC_BASE_PATH: basePath },

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
