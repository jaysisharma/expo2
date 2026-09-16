export interface OfficialStall {
  id: string;
  number: string;
  block: "Block A" | "Block B" | "Block C" | "Special" | "Outdoor";
  category:
    | "6M X 6M SPACE"
    | "PRIME SPACE"
    | "CENTRAL SPACE"
    | "3M X 3M STALL"
    | "10M X 7M BARE SPACE"
    | "5M X 6M PRIME SPACE"
    | "20 FT X 60 FT BARE SPACE"
    | "HYDRO COMPETITION"
    | "FOOD COURT"
    | "SEMINAR HALL";
  dimensions: string;
  sizeSqM: number;
  sizeSqFt: number;
  priceNPR: number;
  priceUSD: number;
  status: "Available" | "Reserved" | "Booked";
  bookedBy?: string;
  powerIncluded?: string;
  powerSupply?: string;
  colorCode: string;
  // SVG placement coordinates on a 1000 x 700 canvas
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

export const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string; fillHex: string }> = {
  "6M X 6M SPACE": {
    bg: "bg-[#FBBF24]",
    border: "border-[#D97706]",
    text: "text-amber-950",
    fillHex: "#F59E0B",
  },
  "PRIME SPACE": {
    bg: "bg-[#22C55E]",
    border: "border-[#16A34A]",
    text: "text-emerald-950",
    fillHex: "#22C55E",
  },
  "CENTRAL SPACE": {
    bg: "bg-[#991B1B]",
    border: "border-[#7F1D1D]",
    text: "text-white",
    fillHex: "#991B1B",
  },
  "3M X 3M STALL": {
    bg: "bg-[#EF4444]",
    border: "border-[#DC2626]",
    text: "text-white",
    fillHex: "#EF4444",
  },
  "10M X 7M BARE SPACE": {
    bg: "bg-[#06B6D4]",
    border: "border-[#0891B2]",
    text: "text-cyan-950",
    fillHex: "#06B6D4",
  },
  "5M X 6M PRIME SPACE": {
    bg: "bg-[#94A3B8]",
    border: "border-[#64748B]",
    text: "text-slate-900",
    fillHex: "#94A3B8",
  },
  "20 FT X 60 FT BARE SPACE": {
    bg: "bg-[#854D0E]",
    border: "border-[#713F12]",
    text: "text-amber-100",
    fillHex: "#78716C",
  },
  "HYDRO COMPETITION": {
    bg: "bg-[#A855F7]",
    border: "border-[#9333EA]",
    text: "text-white",
    fillHex: "#A855F7",
  },
  "FOOD COURT": {
    bg: "bg-[#EA580C]",
    border: "border-[#C2410C]",
    text: "text-white",
    fillHex: "#EA580C",
  },
  "SEMINAR HALL": {
    bg: "bg-[#451A03]",
    border: "border-[#292524]",
    text: "text-white",
    fillHex: "#4A0404",
  },
};

// Generate precise stalls data mapped to the uploaded floor plan
export const officialStalls: OfficialStall[] = [
  // =========================================================================
  // BLOCK C: 10M X 7M BARE SPACE (Cyan Blue) - 16 Stalls
  // =========================================================================
  // Bottom Row C1 - C8
  { id: "C1", number: "C1", block: "Block C", category: "10M X 7M BARE SPACE", dimensions: "10m x 7m", sizeSqM: 70, sizeSqFt: 753, priceNPR: 875000, priceUSD: 6500, status: "Available", powerIncluded: "3-Phase 32A", colorCode: "#06B6D4", x: 440, y: 375, width: 44, height: 48, rotation: -9 },
  { id: "C2", number: "C2", block: "Block C", category: "10M X 7M BARE SPACE", dimensions: "10m x 7m", sizeSqM: 70, sizeSqFt: 753, priceNPR: 875000, priceUSD: 6500, status: "Available", powerIncluded: "3-Phase 32A", colorCode: "#06B6D4", x: 484, y: 382, width: 44, height: 48, rotation: -9 },
  { id: "C3", number: "C3", block: "Block C", category: "10M X 7M BARE SPACE", dimensions: "10m x 7m", sizeSqM: 70, sizeSqFt: 753, priceNPR: 875000, priceUSD: 6500, status: "Booked", bookedBy: "Voith Hydro International", powerIncluded: "3-Phase 32A", colorCode: "#06B6D4", x: 528, y: 389, width: 44, height: 48, rotation: -9 },
  { id: "C4", number: "C4", block: "Block C", category: "10M X 7M BARE SPACE", dimensions: "10m x 7m", sizeSqM: 70, sizeSqFt: 753, priceNPR: 875000, priceUSD: 6500, status: "Available", powerIncluded: "3-Phase 32A", colorCode: "#06B6D4", x: 572, y: 396, width: 44, height: 48, rotation: -9 },
  { id: "C5", number: "C5", block: "Block C", category: "10M X 7M BARE SPACE", dimensions: "10m x 7m", sizeSqM: 70, sizeSqFt: 753, priceNPR: 875000, priceUSD: 6500, status: "Reserved", powerIncluded: "3-Phase 32A", colorCode: "#06B6D4", x: 616, y: 403, width: 44, height: 48, rotation: -9 },
  { id: "C6", number: "C6", block: "Block C", category: "10M X 7M BARE SPACE", dimensions: "10m x 7m", sizeSqM: 70, sizeSqFt: 753, priceNPR: 875000, priceUSD: 6500, status: "Available", powerIncluded: "3-Phase 32A", colorCode: "#06B6D4", x: 660, y: 410, width: 44, height: 48, rotation: -9 },
  { id: "C7", number: "C7", block: "Block C", category: "10M X 7M BARE SPACE", dimensions: "10m x 7m", sizeSqM: 70, sizeSqFt: 753, priceNPR: 875000, priceUSD: 6500, status: "Available", powerIncluded: "3-Phase 32A", colorCode: "#06B6D4", x: 704, y: 417, width: 44, height: 48, rotation: -9 },
  { id: "C8", number: "C8", block: "Block C", category: "10M X 7M BARE SPACE", dimensions: "10m x 7m", sizeSqM: 70, sizeSqFt: 753, priceNPR: 875000, priceUSD: 6500, status: "Available", powerIncluded: "3-Phase 32A", colorCode: "#06B6D4", x: 748, y: 424, width: 44, height: 48, rotation: -9 },
  // Top Row C9 - C16
  { id: "C9", number: "C9", block: "Block C", category: "10M X 7M BARE SPACE", dimensions: "10m x 7m", sizeSqM: 70, sizeSqFt: 753, priceNPR: 875000, priceUSD: 6500, status: "Available", powerIncluded: "3-Phase 32A", colorCode: "#06B6D4", x: 455, y: 280, width: 44, height: 48, rotation: -9 },
  { id: "C10", number: "C10", block: "Block C", category: "10M X 7M BARE SPACE", dimensions: "10m x 7m", sizeSqM: 70, sizeSqFt: 753, priceNPR: 875000, priceUSD: 6500, status: "Available", powerIncluded: "3-Phase 32A", colorCode: "#06B6D4", x: 499, y: 287, width: 44, height: 48, rotation: -9 },
  { id: "C11", number: "C11", block: "Block C", category: "10M X 7M BARE SPACE", dimensions: "10m x 7m", sizeSqM: 70, sizeSqFt: 753, priceNPR: 875000, priceUSD: 6500, status: "Booked", bookedBy: "Andritz Hydro GmbH", powerIncluded: "3-Phase 32A", colorCode: "#06B6D4", x: 543, y: 294, width: 44, height: 48, rotation: -9 },
  { id: "C12", number: "C12", block: "Block C", category: "10M X 7M BARE SPACE", dimensions: "10m x 7m", sizeSqM: 70, sizeSqFt: 753, priceNPR: 875000, priceUSD: 6500, status: "Available", powerIncluded: "3-Phase 32A", colorCode: "#06B6D4", x: 587, y: 301, width: 44, height: 48, rotation: -9 },
  { id: "C13", number: "C13", block: "Block C", category: "10M X 7M BARE SPACE", dimensions: "10m x 7m", sizeSqM: 70, sizeSqFt: 753, priceNPR: 875000, priceUSD: 6500, status: "Available", powerIncluded: "3-Phase 32A", colorCode: "#06B6D4", x: 631, y: 308, width: 44, height: 48, rotation: -9 },
  { id: "C14", number: "C14", block: "Block C", category: "10M X 7M BARE SPACE", dimensions: "10m x 7m", sizeSqM: 70, sizeSqFt: 753, priceNPR: 875000, priceUSD: 6500, status: "Reserved", powerIncluded: "3-Phase 32A", colorCode: "#06B6D4", x: 675, y: 315, width: 44, height: 48, rotation: -9 },
  { id: "C15", number: "C15", block: "Block C", category: "10M X 7M BARE SPACE", dimensions: "10m x 7m", sizeSqM: 70, sizeSqFt: 753, priceNPR: 875000, priceUSD: 6500, status: "Available", powerIncluded: "3-Phase 32A", colorCode: "#06B6D4", x: 719, y: 322, width: 44, height: 48, rotation: -9 },
  { id: "C16", number: "C16", block: "Block C", category: "10M X 7M BARE SPACE", dimensions: "10m x 7m", sizeSqM: 70, sizeSqFt: 753, priceNPR: 875000, priceUSD: 6500, status: "Available", powerIncluded: "3-Phase 32A", colorCode: "#06B6D4", x: 763, y: 329, width: 44, height: 48, rotation: -9 },

  // =========================================================================
  // BLOCK B: 3M X 3M STALLS (Red / Coral) - 22 Stalls
  // =========================================================================
  { id: "B1", number: "B1", block: "Block B", category: "3M X 3M STALL", dimensions: "3m x 3m", sizeSqM: 9, sizeSqFt: 97, priceNPR: 180000, priceUSD: 1350, status: "Available", powerIncluded: "Single Phase 15A", colorCode: "#EF4444", x: 335, y: 430, width: 18, height: 18, rotation: -60 },
  { id: "B2", number: "B2", block: "Block B", category: "3M X 3M STALL", dimensions: "3m x 3m", sizeSqM: 9, sizeSqFt: 97, priceNPR: 180000, priceUSD: 1350, status: "Available", powerIncluded: "Single Phase 15A", colorCode: "#EF4444", x: 325, y: 412, width: 18, height: 18, rotation: -60 },
  { id: "B3", number: "B3", block: "Block B", category: "3M X 3M STALL", dimensions: "3m x 3m", sizeSqM: 9, sizeSqFt: 97, priceNPR: 180000, priceUSD: 1350, status: "Booked", bookedBy: "Flovel Energy", powerIncluded: "Single Phase 15A", colorCode: "#EF4444", x: 315, y: 394, width: 18, height: 18, rotation: -60 },
  { id: "B4", number: "B4", block: "Block B", category: "3M X 3M STALL", dimensions: "3m x 3m", sizeSqM: 9, sizeSqFt: 97, priceNPR: 180000, priceUSD: 1350, status: "Available", powerIncluded: "Single Phase 15A", colorCode: "#EF4444", x: 305, y: 376, width: 18, height: 18, rotation: -60 },
  { id: "B5", number: "B5", block: "Block B", category: "3M X 3M STALL", dimensions: "3m x 3m", sizeSqM: 9, sizeSqFt: 97, priceNPR: 180000, priceUSD: 1350, status: "Available", powerIncluded: "Single Phase 15A", colorCode: "#EF4444", x: 295, y: 358, width: 18, height: 18, rotation: -60 },
  { id: "B6", number: "B6", block: "Block B", category: "3M X 3M STALL", dimensions: "3m x 3m", sizeSqM: 9, sizeSqFt: 97, priceNPR: 180000, priceUSD: 1350, status: "Reserved", powerIncluded: "Single Phase 15A", colorCode: "#EF4444", x: 285, y: 340, width: 18, height: 18, rotation: -60 },
  { id: "B7", number: "B7", block: "Block B", category: "3M X 3M STALL", dimensions: "3m x 3m", sizeSqM: 9, sizeSqFt: 97, priceNPR: 180000, priceUSD: 1350, status: "Available", powerIncluded: "Single Phase 15A", colorCode: "#EF4444", x: 275, y: 322, width: 18, height: 18, rotation: -60 },
  { id: "B8", number: "B8", block: "Block B", category: "3M X 3M STALL", dimensions: "3m x 3m", sizeSqM: 9, sizeSqFt: 97, priceNPR: 180000, priceUSD: 1350, status: "Available", powerIncluded: "Single Phase 15A", colorCode: "#EF4444", x: 265, y: 304, width: 18, height: 18, rotation: -60 },
  { id: "B9", number: "B9", block: "Block B", category: "3M X 3M STALL", dimensions: "3m x 3m", sizeSqM: 9, sizeSqFt: 97, priceNPR: 180000, priceUSD: 1350, status: "Available", powerIncluded: "Single Phase 15A", colorCode: "#EF4444", x: 255, y: 286, width: 18, height: 18, rotation: -60 },
  { id: "B10", number: "B10", block: "Block B", category: "3M X 3M STALL", dimensions: "3m x 3m", sizeSqM: 9, sizeSqFt: 97, priceNPR: 180000, priceUSD: 1350, status: "Available", powerIncluded: "Single Phase 15A", colorCode: "#EF4444", x: 245, y: 268, width: 18, height: 18, rotation: -60 },
  { id: "B11", number: "B11", block: "Block B", category: "3M X 3M STALL", dimensions: "3m x 3m", sizeSqM: 9, sizeSqFt: 97, priceNPR: 180000, priceUSD: 1350, status: "Available", powerIncluded: "Single Phase 15A", colorCode: "#EF4444", x: 235, y: 250, width: 18, height: 18, rotation: -60 },

  // Inner Column B12 - B22
  { id: "B12", number: "B12", block: "Block B", category: "3M X 3M STALL", dimensions: "3m x 3m", sizeSqM: 9, sizeSqFt: 97, priceNPR: 180000, priceUSD: 1350, status: "Available", powerIncluded: "Single Phase 15A", colorCode: "#EF4444", x: 252, y: 258, width: 18, height: 18, rotation: -60 },
  { id: "B13", number: "B13", block: "Block B", category: "3M X 3M STALL", dimensions: "3m x 3m", sizeSqM: 9, sizeSqFt: 97, priceNPR: 180000, priceUSD: 1350, status: "Available", powerIncluded: "Single Phase 15A", colorCode: "#EF4444", x: 262, y: 276, width: 18, height: 18, rotation: -60 },
  { id: "B14", number: "B14", block: "Block B", category: "3M X 3M STALL", dimensions: "3m x 3m", sizeSqM: 9, sizeSqFt: 97, priceNPR: 180000, priceUSD: 1350, status: "Booked", bookedBy: "GE Hydro Services", powerIncluded: "Single Phase 15A", colorCode: "#EF4444", x: 272, y: 294, width: 18, height: 18, rotation: -60 },
  { id: "B15", number: "B15", block: "Block B", category: "3M X 3M STALL", dimensions: "3m x 3m", sizeSqM: 9, sizeSqFt: 97, priceNPR: 180000, priceUSD: 1350, status: "Available", powerIncluded: "Single Phase 15A", colorCode: "#EF4444", x: 282, y: 312, width: 18, height: 18, rotation: -60 },
  { id: "B16", number: "B16", block: "Block B", category: "3M X 3M STALL", dimensions: "3m x 3m", sizeSqM: 9, sizeSqFt: 97, priceNPR: 180000, priceUSD: 1350, status: "Available", powerIncluded: "Single Phase 15A", colorCode: "#EF4444", x: 292, y: 330, width: 18, height: 18, rotation: -60 },
  { id: "B17", number: "B17", block: "Block B", category: "3M X 3M STALL", dimensions: "3m x 3m", sizeSqM: 9, sizeSqFt: 97, priceNPR: 180000, priceUSD: 1350, status: "Available", powerIncluded: "Single Phase 15A", colorCode: "#EF4444", x: 302, y: 348, width: 18, height: 18, rotation: -60 },
  { id: "B18", number: "B18", block: "Block B", category: "3M X 3M STALL", dimensions: "3m x 3m", sizeSqM: 9, sizeSqFt: 97, priceNPR: 180000, priceUSD: 1350, status: "Available", powerIncluded: "Single Phase 15A", colorCode: "#EF4444", x: 312, y: 366, width: 18, height: 18, rotation: -60 },
  { id: "B19", number: "B19", block: "Block B", category: "3M X 3M STALL", dimensions: "3m x 3m", sizeSqM: 9, sizeSqFt: 97, priceNPR: 180000, priceUSD: 1350, status: "Reserved", powerIncluded: "Single Phase 15A", colorCode: "#EF4444", x: 322, y: 384, width: 18, height: 18, rotation: -60 },
  { id: "B20", number: "B20", block: "Block B", category: "3M X 3M STALL", dimensions: "3m x 3m", sizeSqM: 9, sizeSqFt: 97, priceNPR: 180000, priceUSD: 1350, status: "Available", powerIncluded: "Single Phase 15A", colorCode: "#EF4444", x: 332, y: 402, width: 18, height: 18, rotation: -60 },
  { id: "B21", number: "B21", block: "Block B", category: "3M X 3M STALL", dimensions: "3m x 3m", sizeSqM: 9, sizeSqFt: 97, priceNPR: 180000, priceUSD: 1350, status: "Available", powerIncluded: "Single Phase 15A", colorCode: "#EF4444", x: 342, y: 420, width: 18, height: 18, rotation: -60 },
  { id: "B22", number: "B22", block: "Block B", category: "3M X 3M STALL", dimensions: "3m x 3m", sizeSqM: 9, sizeSqFt: 97, priceNPR: 180000, priceUSD: 1350, status: "Available", powerIncluded: "Single Phase 15A", colorCode: "#EF4444", x: 352, y: 438, width: 18, height: 18, rotation: -60 },

  // =========================================================================
  // HYDRO COMPETITION (H1 - H8) & FOOD COURT (F1, F2) & SEMINAR HALL
  // =========================================================================
  { id: "H1", number: "H1", block: "Special", category: "HYDRO COMPETITION", dimensions: "2m x 2m", sizeSqM: 4, sizeSqFt: 43, priceNPR: 50000, priceUSD: 380, status: "Available", powerIncluded: "5A Single Phase", colorCode: "#A855F7", x: 226, y: 242, width: 12, height: 12, rotation: -60 },
  { id: "H2", number: "H2", block: "Special", category: "HYDRO COMPETITION", dimensions: "2m x 2m", sizeSqM: 4, sizeSqFt: 43, priceNPR: 50000, priceUSD: 380, status: "Available", powerIncluded: "5A Single Phase", colorCode: "#A855F7", x: 234, y: 238, width: 12, height: 12, rotation: -60 },
  { id: "H3", number: "H3", block: "Special", category: "HYDRO COMPETITION", dimensions: "2m x 2m", sizeSqM: 4, sizeSqFt: 43, priceNPR: 50000, priceUSD: 380, status: "Available", powerIncluded: "5A Single Phase", colorCode: "#A855F7", x: 242, y: 234, width: 12, height: 12, rotation: -60 },
  { id: "H4", number: "H4", block: "Special", category: "HYDRO COMPETITION", dimensions: "2m x 2m", sizeSqM: 4, sizeSqFt: 43, priceNPR: 50000, priceUSD: 380, status: "Available", powerIncluded: "5A Single Phase", colorCode: "#A855F7", x: 250, y: 230, width: 12, height: 12, rotation: -60 },
  { id: "H5", number: "H5", block: "Special", category: "HYDRO COMPETITION", dimensions: "2m x 2m", sizeSqM: 4, sizeSqFt: 43, priceNPR: 50000, priceUSD: 380, status: "Available", powerIncluded: "5A Single Phase", colorCode: "#A855F7", x: 258, y: 226, width: 12, height: 12, rotation: -60 },
  { id: "H6", number: "H6", block: "Special", category: "HYDRO COMPETITION", dimensions: "2m x 2m", sizeSqM: 4, sizeSqFt: 43, priceNPR: 50000, priceUSD: 380, status: "Available", powerIncluded: "5A Single Phase", colorCode: "#A855F7", x: 266, y: 222, width: 12, height: 12, rotation: -60 },
  { id: "H7", number: "H7", block: "Special", category: "HYDRO COMPETITION", dimensions: "2m x 2m", sizeSqM: 4, sizeSqFt: 43, priceNPR: 50000, priceUSD: 380, status: "Available", powerIncluded: "5A Single Phase", colorCode: "#A855F7", x: 274, y: 218, width: 12, height: 12, rotation: -60 },
  { id: "H8", number: "H8", block: "Special", category: "HYDRO COMPETITION", dimensions: "2m x 2m", sizeSqM: 4, sizeSqFt: 43, priceNPR: 50000, priceUSD: 380, status: "Available", powerIncluded: "5A Single Phase", colorCode: "#A855F7", x: 282, y: 214, width: 12, height: 12, rotation: -60 },

  { id: "F1", number: "F1", block: "Outdoor", category: "FOOD COURT", dimensions: "6m x 6m", sizeSqM: 36, sizeSqFt: 387, priceNPR: 300000, priceUSD: 2250, status: "Booked", bookedBy: "Himalayan Coffee & Catering", powerIncluded: "16A Single Phase", colorCode: "#EA580C", x: 390, y: 155, width: 28, height: 28, rotation: 0 },
  { id: "F2", number: "F2", block: "Outdoor", category: "FOOD COURT", dimensions: "6m x 6m", sizeSqM: 36, sizeSqFt: 387, priceNPR: 300000, priceUSD: 2250, status: "Available", powerIncluded: "16A Single Phase", colorCode: "#EA580C", x: 420, y: 155, width: 28, height: 28, rotation: 0 },

  { id: "SEMINAR_HALL", number: "SEMINAR HALL", block: "Special", category: "SEMINAR HALL", dimensions: "20m x 40m", sizeSqM: 800, sizeSqFt: 8611, priceNPR: 0, priceUSD: 0, status: "Booked", bookedBy: "Official Plenary & Summit Sessions", powerIncluded: "Main Auditorium AV / Power", colorCode: "#451A03", x: 535, y: 165, width: 180, height: 50, rotation: -7 },

  // =========================================================================
  // BLOCK A: OUTER CURVED WALL STALLS A9 - A22 (Yellow / 6m x 6m Space)
  // =========================================================================
  { id: "A9", number: "A9", block: "Block A", category: "6M X 6M SPACE", dimensions: "6m x 6m", sizeSqM: 36, sizeSqFt: 387, priceNPR: 540000, priceUSD: 4000, status: "Available", powerIncluded: "16A Single Phase", colorCode: "#F59E0B", x: 50, y: 745, width: 26, height: 26, rotation: -90 },
  { id: "A10", number: "A10", block: "Block A", category: "6M X 6M SPACE", dimensions: "6m x 6m", sizeSqM: 36, sizeSqFt: 387, priceNPR: 540000, priceUSD: 4000, status: "Available", powerIncluded: "16A Single Phase", colorCode: "#F59E0B", x: 50, y: 715, width: 26, height: 26, rotation: -90 },
  { id: "A11", number: "A11", block: "Block A", category: "6M X 6M SPACE", dimensions: "6m x 6m", sizeSqM: 36, sizeSqFt: 387, priceNPR: 540000, priceUSD: 4000, status: "Booked", bookedBy: "Hitachi Energy Switzerland", powerIncluded: "16A Single Phase", colorCode: "#F59E0B", x: 50, y: 685, width: 26, height: 26, rotation: -90 },
  { id: "A12", number: "A12", block: "Block A", category: "6M X 6M SPACE", dimensions: "6m x 6m", sizeSqM: 36, sizeSqFt: 387, priceNPR: 540000, priceUSD: 4000, status: "Available", powerIncluded: "16A Single Phase", colorCode: "#F59E0B", x: 50, y: 655, width: 26, height: 26, rotation: -90 },
  { id: "A13", number: "A13", block: "Block A", category: "6M X 6M SPACE", dimensions: "6m x 6m", sizeSqM: 36, sizeSqFt: 387, priceNPR: 540000, priceUSD: 4000, status: "Available", powerIncluded: "16A Single Phase", colorCode: "#F59E0B", x: 50, y: 625, width: 26, height: 26, rotation: -90 },
  { id: "A14", number: "A14", block: "Block A", category: "6M X 6M SPACE", dimensions: "6m x 6m", sizeSqM: 36, sizeSqFt: 387, priceNPR: 540000, priceUSD: 4000, status: "Available", powerIncluded: "16A Single Phase", colorCode: "#F59E0B", x: 56, y: 575, width: 26, height: 26, rotation: -80 },
  { id: "A15", number: "A15", block: "Block A", category: "6M X 6M SPACE", dimensions: "6m x 6m", sizeSqM: 36, sizeSqFt: 387, priceNPR: 540000, priceUSD: 4000, status: "Reserved", powerIncluded: "16A Single Phase", colorCode: "#F59E0B", x: 65, y: 545, width: 26, height: 26, rotation: -70 },
  { id: "A16", number: "A16", block: "Block A", category: "6M X 6M SPACE", dimensions: "6m x 6m", sizeSqM: 36, sizeSqFt: 387, priceNPR: 540000, priceUSD: 4000, status: "Available", powerIncluded: "16A Single Phase", colorCode: "#F59E0B", x: 88, y: 472, width: 26, height: 26, rotation: -50 },
  { id: "A17", number: "A17", block: "Block A", category: "6M X 6M SPACE", dimensions: "6m x 6m", sizeSqM: 36, sizeSqFt: 387, priceNPR: 540000, priceUSD: 4000, status: "Available", powerIncluded: "16A Single Phase", colorCode: "#F59E0B", x: 109, y: 447, width: 26, height: 26, rotation: -40 },
  { id: "A18", number: "A18", block: "Block A", category: "6M X 6M SPACE", dimensions: "6m x 6m", sizeSqM: 36, sizeSqFt: 387, priceNPR: 540000, priceUSD: 4000, status: "Available", powerIncluded: "16A Single Phase", colorCode: "#F59E0B", x: 133, y: 427, width: 26, height: 26, rotation: -30 },
  { id: "A19", number: "A19", block: "Block A", category: "6M X 6M SPACE", dimensions: "6m x 6m", sizeSqM: 36, sizeSqFt: 387, priceNPR: 540000, priceUSD: 4000, status: "Booked", bookedBy: "BHEL India", powerIncluded: "16A Single Phase", colorCode: "#F59E0B", x: 160, y: 412, width: 26, height: 26, rotation: -25 },
  { id: "A20", number: "A20", block: "Block A", category: "6M X 6M SPACE", dimensions: "6m x 6m", sizeSqM: 36, sizeSqFt: 387, priceNPR: 540000, priceUSD: 4000, status: "Available", powerIncluded: "16A Single Phase", colorCode: "#F59E0B", x: 188, y: 398, width: 26, height: 26, rotation: -25 },
  { id: "A21", number: "A21", block: "Block A", category: "6M X 6M SPACE", dimensions: "6m x 6m", sizeSqM: 36, sizeSqFt: 387, priceNPR: 540000, priceUSD: 4000, status: "Available", powerIncluded: "16A Single Phase", colorCode: "#F59E0B", x: 216, y: 385, width: 26, height: 26, rotation: -25 },
  { id: "A22", number: "A22", block: "Block A", category: "6M X 6M SPACE", dimensions: "6m x 6m", sizeSqM: 36, sizeSqFt: 387, priceNPR: 540000, priceUSD: 4000, status: "Available", powerIncluded: "16A Single Phase", colorCode: "#F59E0B", x: 244, y: 372, width: 26, height: 26, rotation: -25 },

  // =========================================================================
  // BLOCK A: BOTTOM PRIME 5M X 6M STALLS (Grey) A5 - A8
  // =========================================================================
  { id: "A5", number: "A5", block: "Block A", category: "5M X 6M PRIME SPACE", dimensions: "5m x 6m", sizeSqM: 30, sizeSqFt: 322, priceNPR: 450000, priceUSD: 3400, status: "Available", powerIncluded: "16A Single Phase", colorCode: "#94A3B8", x: 165, y: 805, width: 26, height: 22, rotation: 0 },
  { id: "A6", number: "A6", block: "Block A", category: "5M X 6M PRIME SPACE", dimensions: "5m x 6m", sizeSqM: 30, sizeSqFt: 322, priceNPR: 450000, priceUSD: 3400, status: "Available", powerIncluded: "16A Single Phase", colorCode: "#94A3B8", x: 135, y: 805, width: 26, height: 22, rotation: 0 },
  { id: "A7", number: "A7", block: "Block A", category: "5M X 6M PRIME SPACE", dimensions: "5m x 6m", sizeSqM: 30, sizeSqFt: 322, priceNPR: 450000, priceUSD: 3400, status: "Available", powerIncluded: "16A Single Phase", colorCode: "#94A3B8", x: 105, y: 805, width: 26, height: 22, rotation: 0 },
  { id: "A8", number: "A8", block: "Block A", category: "5M X 6M PRIME SPACE", dimensions: "5m x 6m", sizeSqM: 30, sizeSqFt: 322, priceNPR: 450000, priceUSD: 3400, status: "Available", powerIncluded: "16A Single Phase", colorCode: "#94A3B8", x: 80, y: 805, width: 24, height: 22, rotation: 0 },

  // =========================================================================
  // BLOCK A: CENTRAL SPACE (Maroon) A47
  // =========================================================================
  { id: "A47", number: "A47", block: "Block A", category: "CENTRAL SPACE", dimensions: "8m x 8m", sizeSqM: 64, sizeSqFt: 688, priceNPR: 1200000, priceUSD: 9000, status: "Available", powerIncluded: "3-Phase 32A Prime Island", colorCode: "#991B1B", x: 138, y: 565, width: 34, height: 34, rotation: -35 },

  // =========================================================================
  // BLOCK A: ISLAND 1 (Angled Right: A23 - A30)
  // =========================================================================
  { id: "A23", number: "A23", block: "Block A", category: "PRIME SPACE", dimensions: "6m x 6m", sizeSqM: 36, sizeSqFt: 387, priceNPR: 600000, priceUSD: 4500, status: "Available", powerIncluded: "16A Single Phase", colorCode: "#22C55E", x: 265, y: 355, width: 24, height: 24, rotation: -60 },
  { id: "A24", number: "A24", block: "Block A", category: "6M X 6M SPACE", dimensions: "6m x 6m", sizeSqM: 36, sizeSqFt: 387, priceNPR: 540000, priceUSD: 4000, status: "Available", powerIncluded: "16A Single Phase", colorCode: "#F59E0B", x: 277, y: 376, width: 24, height: 24, rotation: -60 },
  { id: "A25", number: "A25", block: "Block A", category: "6M X 6M SPACE", dimensions: "6m x 6m", sizeSqM: 36, sizeSqFt: 387, priceNPR: 540000, priceUSD: 4000, status: "Available", powerIncluded: "16A Single Phase", colorCode: "#F59E0B", x: 289, y: 397, width: 24, height: 24, rotation: -60 },
  { id: "A26", number: "A26", block: "Block A", category: "PRIME SPACE", dimensions: "6m x 6m", sizeSqM: 36, sizeSqFt: 387, priceNPR: 600000, priceUSD: 4500, status: "Available", powerIncluded: "16A Single Phase", colorCode: "#22C55E", x: 301, y: 418, width: 24, height: 24, rotation: -60 },
  { id: "A27", number: "A27", block: "Block A", category: "PRIME SPACE", dimensions: "6m x 6m", sizeSqM: 36, sizeSqFt: 387, priceNPR: 600000, priceUSD: 4500, status: "Available", powerIncluded: "16A Single Phase", colorCode: "#22C55E", x: 295, y: 500, width: 24, height: 24, rotation: -60 },
  { id: "A28", number: "A28", block: "Block A", category: "6M X 6M SPACE", dimensions: "6m x 6m", sizeSqM: 36, sizeSqFt: 387, priceNPR: 540000, priceUSD: 4000, status: "Available", powerIncluded: "16A Single Phase", colorCode: "#F59E0B", x: 275, y: 512, width: 24, height: 24, rotation: -60 },
  { id: "A29", number: "A29", block: "Block A", category: "6M X 6M SPACE", dimensions: "6m x 6m", sizeSqM: 36, sizeSqFt: 387, priceNPR: 540000, priceUSD: 4000, status: "Available", powerIncluded: "16A Single Phase", colorCode: "#F59E0B", x: 255, y: 524, width: 24, height: 24, rotation: -60 },
  { id: "A30", number: "A30", block: "Block A", category: "PRIME SPACE", dimensions: "6m x 6m", sizeSqM: 36, sizeSqFt: 387, priceNPR: 600000, priceUSD: 4500, status: "Available", powerIncluded: "16A Single Phase", colorCode: "#22C55E", x: 235, y: 536, width: 24, height: 24, rotation: -60 },

  // =========================================================================
  // BLOCK A: ISLAND 2 (Angled Middle: A31 - A38)
  // =========================================================================
  { id: "A38", number: "A38", block: "Block A", category: "PRIME SPACE", dimensions: "6m x 6m", sizeSqM: 36, sizeSqFt: 387, priceNPR: 600000, priceUSD: 4500, status: "Available", powerIncluded: "16A Single Phase", colorCode: "#22C55E", x: 165, y: 475, width: 24, height: 24, rotation: -30 },
  { id: "A37", number: "A37", block: "Block A", category: "6M X 6M SPACE", dimensions: "6m x 6m", sizeSqM: 36, sizeSqFt: 387, priceNPR: 540000, priceUSD: 4000, status: "Available", powerIncluded: "16A Single Phase", colorCode: "#F59E0B", x: 188, y: 462, width: 24, height: 24, rotation: -30 },
  { id: "A36", number: "A36", block: "Block A", category: "6M X 6M SPACE", dimensions: "6m x 6m", sizeSqM: 36, sizeSqFt: 387, priceNPR: 540000, priceUSD: 4000, status: "Available", powerIncluded: "16A Single Phase", colorCode: "#F59E0B", x: 211, y: 449, width: 24, height: 24, rotation: -30 },
  { id: "A35", number: "A35", block: "Block A", category: "PRIME SPACE", dimensions: "6m x 6m", sizeSqM: 36, sizeSqFt: 387, priceNPR: 600000, priceUSD: 4500, status: "Available", powerIncluded: "16A Single Phase", colorCode: "#22C55E", x: 234, y: 436, width: 24, height: 24, rotation: -30 },
  { id: "A34", number: "A34", block: "Block A", category: "PRIME SPACE", dimensions: "6m x 6m", sizeSqM: 36, sizeSqFt: 387, priceNPR: 600000, priceUSD: 4500, status: "Available", powerIncluded: "16A Single Phase", colorCode: "#22C55E", x: 245, y: 462, width: 24, height: 24, rotation: -30 },
  { id: "A33", number: "A33", block: "Block A", category: "6M X 6M SPACE", dimensions: "6m x 6m", sizeSqM: 36, sizeSqFt: 387, priceNPR: 540000, priceUSD: 4000, status: "Available", powerIncluded: "16A Single Phase", colorCode: "#F59E0B", x: 222, y: 475, width: 24, height: 24, rotation: -30 },
  { id: "A32", number: "A32", block: "Block A", category: "6M X 6M SPACE", dimensions: "6m x 6m", sizeSqM: 36, sizeSqFt: 387, priceNPR: 540000, priceUSD: 4000, status: "Available", powerIncluded: "16A Single Phase", colorCode: "#F59E0B", x: 199, y: 488, width: 24, height: 24, rotation: -30 },
  { id: "A31", number: "A31", block: "Block A", category: "PRIME SPACE", dimensions: "6m x 6m", sizeSqM: 36, sizeSqFt: 387, priceNPR: 600000, priceUSD: 4500, status: "Available", powerIncluded: "16A Single Phase", colorCode: "#22C55E", x: 176, y: 501, width: 24, height: 24, rotation: -30 },

  // =========================================================================
  // BLOCK A: ISLAND 3 (Bottom Left Vertical: A39 - A46)
  // =========================================================================
  { id: "A39", number: "A39", block: "Block A", category: "PRIME SPACE", dimensions: "6m x 6m", sizeSqM: 36, sizeSqFt: 387, priceNPR: 600000, priceUSD: 4500, status: "Available", powerIncluded: "16A Single Phase", colorCode: "#22C55E", x: 105, y: 620, width: 24, height: 24, rotation: 0 },
  { id: "A40", number: "A40", block: "Block A", category: "6M X 6M SPACE", dimensions: "6m x 6m", sizeSqM: 36, sizeSqFt: 387, priceNPR: 540000, priceUSD: 4000, status: "Available", powerIncluded: "16A Single Phase", colorCode: "#F59E0B", x: 105, y: 646, width: 24, height: 24, rotation: 0 },
  { id: "A41", number: "A41", block: "Block A", category: "6M X 6M SPACE", dimensions: "6m x 6m", sizeSqM: 36, sizeSqFt: 387, priceNPR: 540000, priceUSD: 4000, status: "Available", powerIncluded: "16A Single Phase", colorCode: "#F59E0B", x: 105, y: 672, width: 24, height: 24, rotation: 0 },
  { id: "A42", number: "A42", block: "Block A", category: "PRIME SPACE", dimensions: "6m x 6m", sizeSqM: 36, sizeSqFt: 387, priceNPR: 600000, priceUSD: 4500, status: "Available", powerIncluded: "16A Single Phase", colorCode: "#22C55E", x: 105, y: 730, width: 24, height: 24, rotation: 0 },

  { id: "A46", number: "A46", block: "Block A", category: "PRIME SPACE", dimensions: "6m x 6m", sizeSqM: 36, sizeSqFt: 387, priceNPR: 600000, priceUSD: 4500, status: "Available", powerIncluded: "16A Single Phase", colorCode: "#22C55E", x: 131, y: 620, width: 24, height: 24, rotation: 0 },
  { id: "A45", number: "A45", block: "Block A", category: "6M X 6M SPACE", dimensions: "6m x 6m", sizeSqM: 36, sizeSqFt: 387, priceNPR: 540000, priceUSD: 4000, status: "Available", powerIncluded: "16A Single Phase", colorCode: "#F59E0B", x: 131, y: 646, width: 24, height: 24, rotation: 0 },
  { id: "A44", number: "A44", block: "Block A", category: "6M X 6M SPACE", dimensions: "6m x 6m", sizeSqM: 36, sizeSqFt: 387, priceNPR: 540000, priceUSD: 4000, status: "Available", powerIncluded: "16A Single Phase", colorCode: "#F59E0B", x: 131, y: 672, width: 24, height: 24, rotation: 0 },
  { id: "A43", number: "A43", block: "Block A", category: "PRIME SPACE", dimensions: "6m x 6m", sizeSqM: 36, sizeSqFt: 387, priceNPR: 600000, priceUSD: 4500, status: "Available", powerIncluded: "16A Single Phase", colorCode: "#22C55E", x: 131, y: 730, width: 24, height: 24, rotation: 0 },

  // =========================================================================
  // BLOCK A: ISLAND 4 (Bottom Vertical: A1 - A4)
  // =========================================================================
  { id: "A1", number: "A1", block: "Block A", category: "PRIME SPACE", dimensions: "6m x 6m", sizeSqM: 36, sizeSqFt: 387, priceNPR: 600000, priceUSD: 4500, status: "Available", powerIncluded: "16A Single Phase", colorCode: "#22C55E", x: 185, y: 645, width: 24, height: 24, rotation: 0 },
  { id: "A2", number: "A2", block: "Block A", category: "6M X 6M SPACE", dimensions: "6m x 6m", sizeSqM: 36, sizeSqFt: 387, priceNPR: 540000, priceUSD: 4000, status: "Available", powerIncluded: "16A Single Phase", colorCode: "#F59E0B", x: 185, y: 675, width: 24, height: 24, rotation: 0 },
  { id: "A3", number: "A3", block: "Block A", category: "6M X 6M SPACE", dimensions: "6m x 6m", sizeSqM: 36, sizeSqFt: 387, priceNPR: 540000, priceUSD: 4000, status: "Available", powerIncluded: "16A Single Phase", colorCode: "#F59E0B", x: 185, y: 705, width: 24, height: 24, rotation: 0 },
  { id: "A4", number: "A4", block: "Block A", category: "PRIME SPACE", dimensions: "6m x 6m", sizeSqM: 36, sizeSqFt: 387, priceNPR: 600000, priceUSD: 4500, status: "Available", powerIncluded: "16A Single Phase", colorCode: "#22C55E", x: 185, y: 760, width: 24, height: 24, rotation: 0 },

  // =========================================================================
  // 20 FT X 60 FT BARE SPACE (Olive Gold)
  // =========================================================================
  { id: "BS1", number: "20 FT X 60 FT", block: "Outdoor", category: "20 FT X 60 FT BARE SPACE", dimensions: "20ft x 60ft", sizeSqM: 111, sizeSqFt: 1200, priceNPR: 1450000, priceUSD: 11000, status: "Available", powerIncluded: "3-Phase 63A Heavy Machinery", colorCode: "#854D0E", x: 260, y: 550, width: 95, height: 42, rotation: -30 },
  { id: "BS2", number: "20 FT X 60 FT", block: "Outdoor", category: "20 FT X 60 FT BARE SPACE", dimensions: "20ft x 60ft", sizeSqM: 111, sizeSqFt: 1200, priceNPR: 1450000, priceUSD: 11000, status: "Available", powerIncluded: "3-Phase 63A Heavy Machinery", colorCode: "#854D0E", x: 215, y: 670, width: 42, height: 110, rotation: 0 },
];
