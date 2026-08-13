import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // A stray lockfile in a parent directory makes Turbopack guess the wrong
  // workspace root. Pin it.
  turbopack: { root: import.meta.dirname },

  // PostHog's ingestion endpoints are trailing-slash paths (`/e/`, `/flags/`).
  // Next would answer each one with a 308 to the slashless form, putting a
  // redirect in front of every event this site sends. Canonical URLs are
  // declared in metadata, so nothing about SEO depends on that redirect.
  skipTrailingSlashRedirect: true,

  // The `.md` mirrors are rendered from the same content modules as the HTML
  // pages, so a crawler or an agent reads exactly what a person reads.
  async rewrites() {
    return [
      { source: "/index.md", destination: "/api/md/en/home" },
      { source: "/ko/index.md", destination: "/api/md/ko/home" },

      // PostHog, proxied through this origin so that an ad blocker does not
      // get to decide whether the company can count its own visitors. The
      // static bundle is served from a different host than the ingestion API,
      // so that rule has to be matched first — order is load-bearing here.
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      { source: "/ingest/:path*", destination: "https://us.i.posthog.com/:path*" },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
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
