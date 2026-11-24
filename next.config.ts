import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.STANDALONE === "true" ? "standalone" : undefined,
  poweredByHeader: false,
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "geolocation=(self), microphone=(), camera=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
