import type { NextConfig } from "next";
import path from "path";
import { PDF_DOCS } from "./src/lib/pdfs";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname),
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
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
  // PDFs live only in public/files/. The list in src/lib/pdfs.ts drives both
  // the rewrites (old short URLs keep working) and the download headers.
  async rewrites() {
    return Object.values(PDF_DOCS).flatMap((doc) =>
      doc.aliases.map((alias) => ({ source: alias, destination: doc.url })),
    );
  },
  async headers() {
    return Object.values(PDF_DOCS).flatMap((doc) =>
      [doc.url, ...doc.aliases].map((source) => ({
        source,
        headers: [
          { key: "Content-Disposition", value: `attachment; filename="${doc.filename}"` },
          { key: "Content-Type", value: "application/pdf" },
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      })),
    );
  },
};

export default nextConfig;
