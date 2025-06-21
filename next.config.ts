import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Just hackathon things
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
