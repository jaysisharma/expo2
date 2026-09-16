export interface Exhibitor {
  id: string;
  slug: string;
  name: string;
  logo: string;
  country: string;
  countryCode: string;
  category: string;
  boothNumber: string;
  hall: string;
  featured: boolean;
  tagline: string;
  description: string;
  website: string;
  contactEmail: string;
  products: {
    title: string;
    description: string;
    specs?: string[];
  }[];
  services: string[];
  boothLocation: {
    hall: string;
    zone: string;
    areaSqM: number;
    type: "Shell Scheme" | "Bare Space" | "Island" | "Corner" | "Premium Corner" | "Island Pavilion" | "Standard Shell";
  };
}

export interface Speaker {
  id: string;
  slug: string;
  name: string;
  title: string;
  organization: string;
  photo: string;
  category: "Keynote" | "Policy & Government" | "Engineering & Tech" | "Finance & Investment" | "Regional Energy" | "IPPAN Leadership";
  bio: string;
  featured: boolean;
  sessionIds: string[];
  socials?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}

export interface ConferenceSession {
  id: string;
  slug: string;
  title: string;
  day: number; // 1, 2, 3
  date: string; // e.g. "April 16, 2026"
  startTime: string; // "09:30"
  endTime: string; // "11:00"
  hall: string; // "Main Plenary Hall (Himalayan Stage)", "Technical Hall A", etc.
  track: "Keynote Plenary" | "Engineering & Turbines" | "Cross-Border Trade" | "Green Hydrogen & Storage" | "Project Finance & ESG" | "Tunneling & Civil";
  sessionType: "Keynote" | "Panel Discussion" | "Technical Presentation" | "Fireside Chat" | "Workshop";
  description: string;
  speakerIds: string[];
  moderatorId?: string;
  keyTakeaways?: string[];
}

export interface Booth {
  id: string; // e.g. "A-101"
  hall: "Hall A - Heavy Equipment & Turbines" | "Hall B - Automation & Power Systems" | "Outdoor Heavy Machinery Arena" | string;
  number: string;
  sizeSqM: number;
  type: "Standard Shell" | "Premium Corner" | "Island Pavilion" | string;
  priceUSD: number;
  priceNPR: number;
  status: "Available" | "Reserved" | "Booked";
  exhibitorId?: string;
  exhibitorName?: string;
  dimensions: string; // e.g. "3m x 3m" or "6m x 6m"
  powerIncluded: string; // e.g. "3-Phase 15A"
  inclusions?: string[];
  orientation?: string;
  passesIncluded?: string;
  suitableFor?: string;
  description?: string;
  exhibitorCountry?: string;
  exhibitorWebsite?: string;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface Sector {
  id: string;
  number: string;
  title: string;
  nepaliTitle?: string;
  description: string;
  image: string;
  subsectors: string[];
  highlights: string;
  iconName: string;
}

export interface HydroProject {
  id: string;
  name: string;
  capacityMW: number;
  riverBasin: "Koshi Basin" | "Gandaki Basin" | "Karnali & Mahakali Basin" | "Bagmati & Trishuli";
  status: "Operational" | "Under Construction" | "Advanced Planning" | "Cross-Border Export";
  district: string;
  coordinates: {
    lat: number;
    lng: number;
    mapXPercent: number;
    mapYPercent: number;
  };
  details: string;
  turbineType: string;
  headMeters: number;
  exportDestination?: string;
}

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  date: string;
  category: "Expo Update" | "Policy & Market" | "Technology" | "Press Release";
  author: string;
  readTime: string;
  summary: string;
  content: string[];
  image: string;
  featured: boolean;
  sourceName?: string;
  sourceUrl?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
  caption: string;
  year: string;
  aspectRatio?: "landscape" | "portrait" | "square";
}

export interface VideoItem {
  id: string;
  title: string;
  category: string;
  year: string;
  thumbnail: string;
  videoUrl: string;
  duration?: string;
  description?: string;
  sourceType?: "youtube" | "vimeo" | "mp4" | "external";
}

export interface FAQItem {
  id: string;
  category: "General & Visiting" | "Exhibition & Stalls" | "Conference & Speakers" | "International Delegates & Visas" | "Sponsorship";
  question: string;
  answer: string;
}

export interface SponsorCategory {
  tier:
    | "Government & Patron"
    | "Country & International Partners"
    | "Apex Endorsing Bodies & Chambers"
    | "Strategic Global OEMs & Technology"
    | "Official Hospitality & Enterprise Partners"
    | "Strategic Partners"
    | "Platinum Sponsors"
    | "Gold Sponsors"
    | "Knowledge & Technical Partners"
    | "Media & Global Network"
    | string;
  description: string;
  sponsors: {
    name: string;
    logo: string;
    type: string;
    url: string;
  }[];
}
