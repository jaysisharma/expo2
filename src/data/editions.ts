export interface EditionItem {
  year: string;
  edition: string;
  tag: string;
  theme: string;
  description: string;
  primaryImage: string;
  secondaryImage?: string;
  highlightStat?: string;
  isUpcoming?: boolean;
}

export const editionsData: EditionItem[] = [
  {
    year: "2018",
    edition: "1ST EDITION",
    tag: "INAUGURAL MILESTONE",
    theme: "Where the clean energy journey began",
    description:
      "Nepal's pioneering dedicated hydropower exposition uniting developers, global turbine OEMs, and public utilities under one roof at Bhrikutimandap.",
    primaryImage: "/images/gallery/2018/IMG_0047.webp",
    secondaryImage: "/images/gallery/2018/IMG_0578.webp",
    highlightStat: "Inaugural platform launch · 10,000+ Visitors",
  },
  {
    year: "2019",
    edition: "2ND EDITION",
    tag: "SCALING MOMENTUM",
    theme: "Building nationwide clean power momentum",
    description:
      "Expanded international participation with European technology pavilions, domestic banking syndicates, and technical turbine symposiums.",
    primaryImage: "/images/gallery/2019/shankar(MATINA P & V)289.webp",
    secondaryImage: "/images/gallery/2019/shankar(MATINA P & V)114.webp",
    highlightStat: "Global technology pavilions & PPA dialogues",
  },
  {
    year: "2022",
    edition: "3RD EDITION",
    tag: "RESILIENCE & EXPANSION",
    theme: "Physical reunion & cross-border expansion",
    description:
      "Reconvening the regional energy sector, spotlighting high-head silt engineering, digital substations, and cross-border power transmission.",
    primaryImage: "/images/gallery/2022/DSC_6673.webp",
    secondaryImage: "/images/gallery/2022/FOTO6017.webp",
    highlightStat: "Cross-border grid & transmission dialogue",
  },
  {
    year: "2024",
    edition: "4TH EDITION",
    tag: "RECORD SCALE",
    theme: "South Asia's clean energy hub",
    description:
      "The largest edition with 100+ global brands, trilateral trade delegations from India & Bangladesh, student innovation awards, and high-level sovereign energy summits.",
    primaryImage: "/images/gallery/press-meet/SML02566.webp",
    secondaryImage: "/images/banner.webp",
    highlightStat: "100+ Global Brands & Trilateral Delegations",
  },
  {
    year: "2027",
    edition: "5TH EDITION",
    tag: "THE FUTURE",
    theme: "Now, The Fifth Milestone.",
    description:
      "The landmark 5th edition uniting 10,000+ delegates, multi-billion dollar clean energy concessions, and cutting-edge regional grid technologies.",
    primaryImage: "/images/hero.png",
    highlightStat: "Magh 2 - 4 · Kathmandu, Nepal",
    isUpcoming: true,
  },
];
