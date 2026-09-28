/**
 * Centralized Official Contact Information
 * Himalayan Green Energy Expo 2027
 */

export const CONTACT_DETAILS = {
  // Mobile / Hotline Numbers
  mobiles: [
    { display: '+977-9703606340', raw: '+9779703606340', label: 'Primary Hotline' },
    { display: '9703606355', raw: '+9779703606355', label: 'Help Desk' },
  ],
  hotlineDisplay: '+977-9703606340 | 9703606355',

  // Landline Numbers
  landlines: [
    { display: '01-5268535', raw: '+97715268535' },
    { display: '4169175', raw: '+97714169175' },
  ],
  landlineDisplay: '01-5268535, 4169175',

  // Office Location
  address: {
    street: 'Jwagal',
    district: 'Lalitpur',
    country: 'Nepal',
    short: 'Jwagal, Lalitpur',
    full: 'IPPAN Office, Jwagal, Lalitpur, Nepal',
    googleMapsQuery: 'IPPAN, Jwagal, Lalitpur, Nepal',
    googleMapsUrl: 'https://maps.google.com/?q=IPPAN+Jwagal+Lalitpur+Nepal',
  },

  // Official Email Contacts
  emails: {
    expo: 'info@nepalenergyexpo.com',
    eventSolution: 'info@eventsolutionnepal.com.np',
    ippanPrimary: 'info@ippan.org.np',
    ippanSecondary: 'ippan2001@gmail.com',
    ippanDisplay: 'info@ippan.org.np | ippan2001@gmail.com',
  },

  // Venue & Dates
  venue: {
    name: 'Bhrikuti Mandap (Bhrikutimandap Exhibition Hall)',
    shortName: 'Bhrikuti Mandap',
    address: 'Exhibition Road, Kathmandu, Nepal',
    city: 'Kathmandu, Nepal',
    dates: '17–19 January 2027',
    bikramSambatDates: 'Magh 3–5, 2083',
    googleMapsUrl: 'https://maps.google.com/?q=Bhrikutimandap+Exhibition+Hall+Kathmandu',
  },

  // VIP Gala Dinner
  galaDinner: {
    venue: 'Royal Tulip Kathmandu (Gwarko)',
    date: 'Monday, 18 January 2027',
    time: '6:00 PM onwards',
    nationalPrice: 'NPR 6,000',
    nationalPriceNum: 6000,
    internationalPrice: 'USD 50',
    internationalPriceNum: 50,
  },

  // Organizers
  organizers: [
    {
      id: 'ippan',
      name: "Independent Power Producers' Association, Nepal (IPPAN)",
      shortName: 'IPPAN',
      role: 'Apex Clean Energy Producers Body',
      url: 'https://ippan.org.np',
      logo: '/images/ippan_vector.svg',
      email: 'info@ippan.org.np',
    },
    {
      id: 'event-solution',
      name: 'Event Solution Pvt. Ltd.',
      shortName: 'Event Solution',
      role: 'Exhibition Management & Operations',
      url: 'https://eventsolutionnepal.com.np',
      logo: '/images/event_solution_vector.svg',
      email: 'info@eventsolutionnepal.com.np',
    },
  ],

  // Social Links
  socials: {
    linkedin: 'https://www.linkedin.com/company/ippan',
    facebook: 'https://www.facebook.com/ippan.org.np',
    youtube: 'https://www.youtube.com/@ippan-nepal',
    instagram: 'https://www.instagram.com',
  },
} as const;

export const EVENT_VENUE = CONTACT_DETAILS.venue.name;
export const GALA_VENUE = CONTACT_DETAILS.galaDinner.venue;
export const GALA_NATIONAL_PRICE = CONTACT_DETAILS.galaDinner.nationalPrice;
export const GALA_INTERNATIONAL_PRICE = CONTACT_DETAILS.galaDinner.internationalPrice;
