export interface SponsorshipTier {
  tier: string;
  amountNPR: string;
  amountUSD: string;
  bareSpace: string;
  promotionalDisplayArea: string;
  inaugurationInvitationPass: number;
  inaugurationPass?: number;
  networkingDinnerPass: number;
  galaDinnerPass?: number;
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
  perSqMtr?: string;
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
  venue: "BHRIKUTIMANDAP, KATHMANDU, NEPAL",
  galaDinnerVenue: "Royal Tulip Kathmandu (Gwarko)",
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
    tier: "TITLE SPONSOR (1)",
    slots: 1,
    amountNPR: "50,00,000/-",
    amountUSD: "35,000.00",
    bareSpace: "6M X 6M X 2",
    promotionalDisplayArea: "6FT X 4FT X 5",
    inaugurationInvitationPass: 50,
    inaugurationPass: 50,
    networkingDinnerPass: 25,
    galaDinnerPass: 25,
    exhibitorPass: 20,
    normalPass: 500,
    featured: true,
  },
  {
    tier: "IN ASSOCIATION WITH (1)",
    slots: 1,
    amountNPR: "35,00,000/-",
    amountUSD: "25,000.00",
    bareSpace: "6M X 6M X 1",
    promotionalDisplayArea: "6FT X 4FT X 4",
    inaugurationInvitationPass: 50,
    inaugurationPass: 50,
    networkingDinnerPass: 20,
    galaDinnerPass: 20,
    exhibitorPass: 20,
    normalPass: 300,
  },
  {
    tier: "POWERED BY (1)",
    slots: 1,
    amountNPR: "27,00,000/-",
    amountUSD: "20,000.00",
    bareSpace: "6M X 6M X 1",
    promotionalDisplayArea: "6FT X 4FT X 3",
    inaugurationInvitationPass: 40,
    inaugurationPass: 40,
    networkingDinnerPass: 15,
    galaDinnerPass: 15,
    exhibitorPass: 20,
    normalPass: 200,
  },
  {
    tier: "SPONSOR",
    amountNPR: "15,00,000/-",
    amountUSD: "10,000.00",
    bareSpace: "6M X 6M X 1",
    promotionalDisplayArea: "6FT X 4FT X 3",
    inaugurationInvitationPass: 20,
    inaugurationPass: 20,
    networkingDinnerPass: 8,
    galaDinnerPass: 8,
    exhibitorPass: 20,
    normalPass: 150,
  },
  {
    tier: "OFFICIAL PARTNER",
    amountNPR: "13,00,000/-",
    amountUSD: "9,000.00",
    bareSpace: "6M X 6M X 1",
    promotionalDisplayArea: "6FT X 4FT X 2",
    inaugurationInvitationPass: 20,
    inaugurationPass: 20,
    networkingDinnerPass: 5,
    galaDinnerPass: 5,
    exhibitorPass: 20,
    normalPass: 120,
  },
  {
    tier: "CO-SPONSOR",
    amountNPR: "10,00,000/-",
    amountUSD: "7,000.00",
    bareSpace: "6M X 6M X 1",
    promotionalDisplayArea: "6FT X 4FT X 2",
    inaugurationInvitationPass: 20,
    inaugurationPass: 20,
    networkingDinnerPass: 5,
    galaDinnerPass: 5,
    exhibitorPass: 20,
    normalPass: 100,
  },
  {
    tier: "SUPPORTER",
    amountNPR: "6,50,000/-",
    amountUSD: "5,000.00",
    bareSpace: "6M X 6M X 1",
    promotionalDisplayArea: "6FT X 4FT X 1",
    inaugurationInvitationPass: 20,
    inaugurationPass: 20,
    networkingDinnerPass: 3,
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
    perSqMtr: "10,500/- | $ 85",
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
    perSqMtr: "-",
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
    perSqMtr: "6,500/- | $ 50",
    rateNPR: "4,50,000/-",
    rateNPRNum: 450000,
    rateUSD: "3,500.00",
    rateUSDNum: 3500,
  },
  {
    category: "Irregular Bare Space",
    block: "Custom Space",
    size: "Custom m² (Charged per sq.m)",
    spaceType: "Open Space / Bare Space",
    perSqMtr: "10,500/- | $ 85",
    rateNPR: "10,500 / sq.m",
    rateNPRNum: 10500,
    rateUSD: "83.33 / sq.m",
    rateUSDNum: 83.33,
    notes: "Irregular size stalls are charged based on actual size. Prime stalls +25%.",
  },
];
