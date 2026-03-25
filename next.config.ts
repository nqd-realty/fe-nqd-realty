import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/project/under-construction/g4",
        destination: "/project/under-construction/g4/index.html",
      },
    ];
  },
};

export default nextConfig;
