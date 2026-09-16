export interface ExpoResource {
  id: string;
  title: string;
  category: "Official Report & Bulletin" | "Technical Schedule" | "Event Background & Proposal" | "External Media Archive";
  fileType: "PDF" | "External Portal" | "Media";
  fileSize?: string;
  url: string;
  description: string;
}

export const expoResources: ExpoResource[] = [
  {
    id: "ippan-bulletin-march-2024",
    title: "IPPAN Bulletin (March 2024 Special Edition)",
    category: "Official Report & Bulletin",
    fileType: "PDF",
    fileSize: "4.8 MB",
    url: "https://www.ippan.org.np/wp-content/uploads/2024/04/Ippan-Bulletine_2024-March.pdf",
    description: "Comprehensive quarterly industry bulletin detailing installed capacities, transmission lines, and private hydro developments.",
  },
  {
    id: "technical-sessions-schedule-pdf",
    title: "Himalayan Hydro Expo Technical Sessions & Agenda",
    category: "Technical Schedule",
    fileType: "PDF",
    fileSize: "2.1 MB",
    url: "https://www.ippan.org.np/wp-content/uploads/2024/04/Himalyan-Hydro-Final-Session.pdf",
    description: "Complete breakdown of high-head turbine panels, cross-border power trading workshops, and keynote speakers.",
  },
  {
    id: "event-background-proposal-pdf",
    title: "Himalayan Hydro Expo Event Background & Proposal",
    category: "Event Background & Proposal",
    fileType: "PDF",
    fileSize: "3.5 MB",
    url: "https://www.himalayanhydroexpo.com/files/hydroproposal-13-2-2024.pdf",
    description: "Strategic event prospectus, exhibitor profiles, stall classifications, and international patron endorsements.",
  },
  {
    id: "ippan-official-portal-2024",
    title: "IPPAN 4th Himalayan Hydro Expo 2024 Portal",
    category: "External Media Archive",
    fileType: "External Portal",
    url: "https://www.ippan.org.np/4771",
    description: "Official IPPAN association archives and recap of the 4th edition at Bhrikutimandap.",
  },
  {
    id: "ippan-official-photo-gallery",
    title: "IPPAN Official High-Resolution Photo Repository",
    category: "External Media Archive",
    fileType: "External Portal",
    url: "https://www.ippan.org.np/category/gallery/photogallery",
    description: "Complete photographic record of IPPAN committee meetings, press conferences, and expo inaugurations.",
  },
  {
    id: "ippan-official-video-gallery",
    title: "IPPAN Official Video Gallery & Media Archives",
    category: "External Media Archive",
    fileType: "External Portal",
    url: "https://www.ippan.org.np/category/gallery/videogallery",
    description: "Speeches by ministers, documentary releases, and press meet recordings.",
  },
  {
    id: "himalayan-hydro-expo-official-domain",
    title: "Himalayan Hydro Expo Official Portal",
    category: "External Media Archive",
    fileType: "External Portal",
    url: "https://www.himalayanhydroexpo.com/",
    description: "Legacy expo domain and historical conference directory.",
  },
];
