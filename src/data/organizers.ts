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
    logo: "/images/ippan_vector.svg",
    image: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80",
    description:
      "Established in 2001, IPPAN is a non-profit, non-government autonomous organization established to encourage private-sector participation in Nepal’s hydropower sector. It serves as a link between private power developers and government organizations, while supporting the exchange of technology, expertise, knowledge, financial and management information among independent power producers.",
    pillars: [
      "Promoting private-sector participation in Nepal’s energy sector",
      "Connecting the private sector with government and energy stakeholders",
      "Advocating for an investor-friendly environment for power development",
    ],
    websiteUrl: "https://www.ippan.org.np",
  },
  {
    id: "event-solution",
    name: "EVENT SOLUTION",
    fullName: "Event Solution Nepal Pvt. Ltd.",
    roleTitle: "DELIVERED WITH EXPERIENCE",
    logo: "/images/event_solution_vector.svg",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    description:
      "Founded in 2014, Event Solution Nepal is an event management company focused on creating and delivering events from planning through execution. Its services include event planning and consulting, event management and coordination, event production and setup, event rentals, logistics and event operations, and sound, lighting and LED solutions.",
    pillars: [
      "10+ years of experience",
      "500+ events managed",
      "Full-cycle event planning, production and execution",
    ],
    websiteUrl: "https://eventsolutionnepal.com.np/",
  },
];
