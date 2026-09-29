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
        source: "/booking-form.pdf",
        destination: "/files/booking-form.pdf",
      },
      {
        source: "/form.pdf",
        destination: "/files/booking-form.pdf",
      },
      {
        source: "/sponsors-sheet.pdf",
        destination: "/files/sponsors-sheet.pdf",
      },
      {
        source: "/sponsor-sheet.pdf",
        destination: "/files/sponsors-sheet.pdf",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/files/Proposal.pdf",
        headers: [
          {
            key: "Content-Disposition",
            value: 'attachment; filename="Himalayan-Green-Energy-Expo-Proposal.pdf"',
          },
          {
            key: "Content-Type",
            value: "application/pdf",
          },
        ],
      },
      {
        source: "/Proposal.pdf",
        headers: [
          {
            key: "Content-Disposition",
            value: 'attachment; filename="Himalayan-Green-Energy-Expo-Proposal.pdf"',
          },
          {
            key: "Content-Type",
            value: "application/pdf",
          },
        ],
      },
      {
        source: "/files/booking-form.pdf",
        headers: [
          {
            key: "Content-Disposition",
            value: 'attachment; filename="Himalayan-Expo-Stall-Booking-Form.pdf"',
          },
          {
            key: "Content-Type",
            value: "application/pdf",
          },
        ],
      },
      {
        source: "/booking-form.pdf",
        headers: [
          {
            key: "Content-Disposition",
            value: 'attachment; filename="Himalayan-Expo-Stall-Booking-Form.pdf"',
          },
          {
            key: "Content-Type",
            value: "application/pdf",
          },
        ],
      },
      {
        source: "/files/form.pdf",
        headers: [
          {
            key: "Content-Disposition",
            value: 'attachment; filename="Himalayan-Expo-Stall-Booking-Form.pdf"',
          },
          {
            key: "Content-Type",
            value: "application/pdf",
          },
        ],
      },
      {
        source: "/files/sponsors-sheet.pdf",
        headers: [
          {
            key: "Content-Disposition",
            value: 'attachment; filename="Himalayan-Expo-Sponsorship-Rates-Sheet.pdf"',
          },
          {
            key: "Content-Type",
            value: "application/pdf",
          },
        ],
      },
      {
        source: "/sponsors-sheet.pdf",
        headers: [
          {
            key: "Content-Disposition",
            value: 'attachment; filename="Himalayan-Expo-Sponsorship-Rates-Sheet.pdf"',
          },
          {
            key: "Content-Type",
            value: "application/pdf",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
