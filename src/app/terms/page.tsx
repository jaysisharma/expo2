import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/legal/LegalPage";
import { CONTACT_DETAILS } from "@/data/contactInfo";

export const metadata: Metadata = {
  title: "Terms & Conditions | Himalayan Green Energy Expo 2027",
  description: "Terms for using the Himalayan Green Energy Expo website, registering, and booking stalls, sponsorships and passes.",
};

export default function TermsPage() {
  const email = CONTACT_DETAILS.emails.expo;

  return (
    <LegalPage
      title="Terms & Conditions"
      intro={
        <p>
          These terms apply to your use of this website and to registrations and bookings made through it for the Himalayan Green
          Energy Expo 2027, {CONTACT_DETAILS.venue.dates}, {CONTACT_DETAILS.venue.shortName}, {CONTACT_DETAILS.venue.city}. The Expo is
          jointly organised by IPPAN and Event Solution Pvt. Ltd. (&ldquo;the Organisers&rdquo;). By using the site or making a
          booking you agree to these terms.
        </p>
      }
      sections={[
        {
          heading: "Registration and entry passes",
          body: (
            <ul>
              <li>You must provide accurate, complete information when registering. Passes are issued to the named person.</li>
              <li>Each QR pass is personal and non-transferable unless the Organisers agree in writing. Duplicated, altered or resold passes may be cancelled without refund.</li>
              <li>Please carry your QR pass (printed or on your phone) and photo ID for entry. The Organisers may refuse entry for safety, security or conduct reasons.</li>
            </ul>
          ),
        },
        {
          heading: "Stall, sponsorship and pass bookings",
          body: (
            <ul>
              <li>A booking is confirmed only after the Organisers verify payment, or accept a written hold, and send confirmation.</li>
              <li>Free holds (such as 72-hour reservations) expire automatically if payment or confirmation is not completed in time, and the stall may be released to others.</li>
              <li>Stall allocation, layout and floor plan are subject to change for operational or safety reasons; the Organisers will offer a comparable alternative where possible.</li>
              <li>Exhibitors must follow the exhibitor manual, venue rules, build-up and dismantling schedules, and all applicable laws.</li>
              <li>Prices are shown in NPR and/or USD and include VAT where stated.</li>
            </ul>
          ),
        },
        {
          heading: "Payments",
          body: (
            <p>
              Online payments are handled by third-party gateways (Khalti) or by bank transfer / QR. You are
              responsible for any bank or transfer charges. If a payment is deducted but the booking fails, contact us with your
              transaction reference and we will reconcile it.
            </p>
          ),
        },
        {
          heading: "Cancellations and refunds",
          body: (
            <p>
              Cancellation and refund terms for stalls and sponsorships are set out in the booking form and your confirmation. Unless
              stated otherwise, visitor and dinner passes are non-refundable but may be transferred to a colleague with prior notice to{" "}
              <a href={`mailto:${email}`}>{email}</a>.
            </p>
          ),
        },
        {
          heading: "Changes to the event",
          body: (
            <p>
              The Organisers may change the programme, speakers, schedule or venue arrangements. If the Expo is postponed or cancelled
              for reasons beyond our reasonable control (including natural disaster, government order, strikes or public-health measures),
              the Organisers will try to reschedule and will communicate options to registered participants.
            </p>
          ),
        },
        {
          heading: "Photography and recording",
          body: (
            <p>
              The Expo is photographed and filmed. By attending you agree that images or footage in which you appear may be used in
              Expo reports, the website, social media and future promotion.
            </p>
          ),
        },
        {
          heading: "Use of this website",
          body: (
            <ul>
              <li>Do not misuse the site, attempt unauthorised access, interfere with its operation, or scrape it in bulk.</li>
              <li>Content, logos and materials on this site belong to the Organisers or their partners and may not be reused without permission.</li>
              <li>Information on the site is provided in good faith but may change; please confirm important details with the Organisers.</li>
            </ul>
          ),
        },
        {
          heading: "Liability",
          body: (
            <p>
              To the extent permitted by law, the Organisers are not liable for indirect or consequential loss, or for loss or damage to
              personal property or exhibits at the venue. Exhibitors are responsible for insuring their own goods and staff. Nothing in
              these terms limits liability that cannot be limited by law.
            </p>
          ),
        },
        {
          heading: "Privacy",
          body: (
            <p>
              Our use of your personal information is described in our <Link href="/privacy-policy">Privacy Policy</Link> and{" "}
              <Link href="/cookie-policy">Cookie Policy</Link>.
            </p>
          ),
        },
        {
          heading: "Governing law and contact",
          body: (
            <p>
              These terms are governed by the laws of Nepal, and disputes are subject to the courts of Nepal. Questions? Email{" "}
              <a href={`mailto:${email}`}>{email}</a> or call {CONTACT_DETAILS.mobiles[0].display}.
            </p>
          ),
        },
      ]}
    />
  );
}
