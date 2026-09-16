import React from "react";
import FloorPlanCanvasStudio from "@/components/floor-plan/FloorPlanCanvasStudio";

export const metadata = {
  title: "Stall Drawing Canvas Studio | Himalayan Green Energy Expo 2027",
  description: "Interactive floor plan studio to draw, configure, and save exhibition stalls manually on the blueprint.",
};

export default function FloorPlanBuilderPage() {
  return <FloorPlanCanvasStudio />;
}
