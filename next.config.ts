import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.STANDALONE === "true" ? "standalone" : undefined,
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
