export interface OrganizerItem {
  id: string;
  name: string;
  fullName: string;
  roleTitle: string;
  logo: string;
  image: string;
  description: string;
  pillars: string[];
  websiteUrl: string;
}

export const organizersData: OrganizerItem[] = [
  {
    id: "ippan",
    name: "IPPAN",
    fullName: "Independent Power Producers' Association, Nepal",
    roleTitle: "POWERED BY INDUSTRY",
    logo: "/ippan.png",
    image: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80",
    description:
      "The apex representative body of private hydropower developers in Nepal, advocating policy reforms, mobilizing domestic capital, and shaping sovereign energy growth.",
    pillars: [
      "Industry Leadership",
      "Hydropower Ecosystem",
      "Policy & Advocacy",
      "Developer Representation",
    ],
    websiteUrl: "https://ippan.org.np",
  },
  {
    id: "event-solution",
    name: "EVENT SOLUTION",
    fullName: "Event Solution Pvt. Ltd.",
    roleTitle: "DELIVERED WITH EXPERIENCE",
    logo: "/event_solution.png",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    description:
      "Nepal's premier exhibition and event management enterprise, specializing in large-scale trade expos, international conference production, and flawless operations.",
    pillars: [
      "Exhibition Management",
      "Production & Operations",
      "International Pavilions",
      "Visitor & Exhibitor Experience",
    ],
    websiteUrl: "/contact",
  },
];
