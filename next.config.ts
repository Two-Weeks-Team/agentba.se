import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // A stray lockfile in a parent directory makes Turbopack guess the wrong
  // workspace root. Pin it.
  turbopack: { root: import.meta.dirname },

  // The `.md` mirrors are rendered from the same content modules as the HTML
  // pages, so a crawler or an agent reads exactly what a person reads.
  async rewrites() {
    return [
      { source: "/index.md", destination: "/api/md/en/home" },
      { source: "/ko/index.md", destination: "/api/md/ko/home" },
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
