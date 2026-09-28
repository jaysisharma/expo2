export interface SponsorshipTier {
  tier: string;
  amountNPR: string;
  amountUSD: string;
  bareSpace: string;
  promotionalDisplayArea: string;
  inaugurationPass: number;
  galaDinnerPass: number;
  exhibitorPass: number;
  normalPass: number;
  slots?: number | string;
  featured?: boolean;
}

export interface SpaceDetail {
  category: string;
  block: string;
  size: string;
  spaceType: string;
  rateNPR: string;
  rateNPRNum: number;
  rateUSD: string;
  rateUSDNum: number;
  notes?: string;
}

export const EXPO_EVENT_META = {
  title: "HIMALAYAN GREEN ENERGY EXPO 2027",
  theme: "Resilient Energy, Prosperous Nepal",
  datesEnglish: "17th–19th Jan, 2027",
  datesNepali: "3rd–5th Magh, 2083",
  venue: "Bhrikuti Mandap (Bhrikutimandap Exhibition Hall), Kathmandu, Nepal",
  galaDinnerVenue: "Royal Tulip, Kathmandu",
  galaDinnerNationalPrice: "NPR 6,000",
  galaDinnerInternationalPrice: "USD 50",
  notes: [
    "25% extra will be charged on prime stalls.",
    "Irregular size stall will be charged on the basis of size.",
    "13% VAT is applicable in the above-mentioned rates.",
  ],
};

export const SPONSORSHIP_DETAILS: SponsorshipTier[] = [
  {
    tier: "Title Sponsor",
    slots: 1,
    amountNPR: "50,00,000/-",
    amountUSD: "35,000.00",
    bareSpace: "6M × 6M × 2",
    promotionalDisplayArea: "6FT × 4FT × 5",
    inaugurationPass: 50,
    galaDinnerPass: 25,
    exhibitorPass: 20,
    normalPass: 500,
    featured: true,
  },
  {
    tier: "In Association With",
    slots: 1,
    amountNPR: "40,00,000/-",
    amountUSD: "25,000.00",
    bareSpace: "6M × 6M × 1",
    promotionalDisplayArea: "6FT × 4FT × 4",
    inaugurationPass: 50,
    galaDinnerPass: 20,
    exhibitorPass: 20,
    normalPass: 300,
  },
  {
    tier: "Powered By",
    slots: 1,
    amountNPR: "30,00,000/-",
    amountUSD: "20,000.00",
    bareSpace: "6M × 6M × 1",
    promotionalDisplayArea: "6FT × 4FT × 3",
    inaugurationPass: 40,
    galaDinnerPass: 15,
    exhibitorPass: 20,
    normalPass: 200,
  },
  {
    tier: "Sponsor",
    amountNPR: "15,00,000/-",
    amountUSD: "10,000.00",
    bareSpace: "6M × 6M × 1",
    promotionalDisplayArea: "6FT × 4FT × 3",
    inaugurationPass: 20,
    galaDinnerPass: 8,
    exhibitorPass: 20,
    normalPass: 150,
  },
  {
    tier: "Official Partner",
    amountNPR: "13,00,000/-",
    amountUSD: "9,000.00",
    bareSpace: "6M × 6M × 1",
    promotionalDisplayArea: "6FT × 4FT × 2",
    inaugurationPass: 20,
    galaDinnerPass: 5,
    exhibitorPass: 20,
    normalPass: 120,
  },
  {
    tier: "Co-Sponsor",
    amountNPR: "10,00,000/-",
    amountUSD: "7,000.00",
    bareSpace: "6M × 6M × 1",
    promotionalDisplayArea: "6FT × 4FT × 2",
    inaugurationPass: 20,
    galaDinnerPass: 5,
    exhibitorPass: 20,
    normalPass: 100,
  },
  {
    tier: "Supporter",
    amountNPR: "5,00,000/-",
    amountUSD: "5,000.00",
    bareSpace: "6M × 6M × 1",
    promotionalDisplayArea: "6FT × 4FT × 1",
    inaugurationPass: 20,
    galaDinnerPass: 3,
    exhibitorPass: 20,
    normalPass: 50,
  },
];

export const SPACE_DETAILS: SpaceDetail[] = [
  {
    category: "Block A",
    block: "Block A",
    size: "6M × 6M (Other custom sizes)",
    spaceType: "Open Space",
    rateNPR: "3,78,000/-",
    rateNPRNum: 378000,
    rateUSD: "3,000.00",
    rateUSDNum: 3000,
  },
  {
    category: "Block B",
    block: "Block B",
    size: "3M × 3M",
    spaceType: "Octonorm Stall",
    rateNPR: "85,000/-",
    rateNPRNum: 85000,
    rateUSD: "700.00",
    rateUSDNum: 700,
  },
  {
    category: "Block C",
    block: "Block C",
    size: "10M × 7M",
    spaceType: "Open Space",
    rateNPR: "4,50,000/-",
    rateNPRNum: 450000,
    rateUSD: "3,500.00",
    rateUSDNum: 3500,
  },
];
