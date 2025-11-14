import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.kdgn.tech',
        pathname: '/instax/**',
      },
    ],
  },
};

export default nextConfig;
