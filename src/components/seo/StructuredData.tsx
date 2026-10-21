import React from "react";
import { CONTACT_DETAILS } from "@/data/contactInfo";
import { EVENT, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

/** Renders schema.org JSON-LD so Google and AI assistants understand the page. */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output with "<" escaped so content can't close the script tag
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

const organizers = [
  {
    "@type": "Organization",
    name: "Independent Power Producers' Association, Nepal (IPPAN)",
    url: "https://www.ippan.org.np/",
    email: CONTACT_DETAILS.emails.ippanPrimary,
  },
  {
    "@type": "Organization",
    name: "Event Solution Pvt. Ltd.",
    email: CONTACT_DETAILS.emails.eventSolution,
  },
];

/** Site-wide Event + Organization data (rendered in the root layout). */
export function EventStructuredData() {
  return (
    <JsonLd
      data={[
        {
          "@context": "https://schema.org",
          "@type": "ExhibitionEvent",
          name: SITE_NAME,
          description: SITE_DESCRIPTION,
          url: SITE_URL,
          image: [`${SITE_URL}/opengraph-image`],
          startDate: EVENT.startDate,
          endDate: EVENT.endDate,
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          location: {
            "@type": "Place",
            name: EVENT.venueName,
            address: {
              "@type": "PostalAddress",
              streetAddress: EVENT.streetAddress,
              addressLocality: EVENT.city,
              addressCountry: EVENT.country,
            },
          },
          organizer: organizers,
          offers: {
            "@type": "Offer",
            name: "Trade Visitor Registration",
            url: `${SITE_URL}/register`,
            price: 0,
            priceCurrency: "NPR",
            availability: "https://schema.org/InStock",
          },
        },
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Himalayan Green Energy Expo",
          url: SITE_URL,
          logo: `${SITE_URL}/images/logo.webp`,
          email: CONTACT_DETAILS.emails.expo,
          telephone: CONTACT_DETAILS.mobiles[0].raw,
          address: {
            "@type": "PostalAddress",
            streetAddress: CONTACT_DETAILS.address.street,
            addressLocality: CONTACT_DETAILS.address.district,
            addressCountry: "NP",
          },
        },
      ]}
    />
  );
}
