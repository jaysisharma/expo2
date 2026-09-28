import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/Proposal.pdf",
        destination: "/files/Proposal.pdf",
      },
      {
        source: "/proposal.pdf",
        destination: "/files/Proposal.pdf",
      },
      {
        source: "/files/proposal.pdf",
        destination: "/files/Proposal.pdf",
      },
    ];
  },
};

export default nextConfig;
