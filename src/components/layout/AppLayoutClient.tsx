"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/components/footer/Footer";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";

import WelcomeExpoModal from "@/components/modals/WelcomeExpoModal";
import PdfDownloadModal from "@/components/modals/PdfDownloadModal";
import HydroLoadingScreen from "@/components/ui/HydroLoadingScreen";
import TurbineCursor from "@/components/ui/TurbineCursor";

export default function AppLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isBuilderPage = pathname?.startsWith("/floor-plan/builder");
  const isAdminPage = pathname?.startsWith("/admin");

  if (isBuilderPage || isAdminPage) {
    return (
      <main className="w-full min-h-screen">
        <TurbineCursor />
        {children}
      </main>
    );
  }

  return (
    <SmoothScrollProvider>
      <TurbineCursor />
      <HydroLoadingScreen />
      <Navbar />
      <div className="flex-grow w-full">{children}</div>
      <Footer />
      <WelcomeExpoModal />
      <PdfDownloadModal />
    </SmoothScrollProvider>
  );
}
