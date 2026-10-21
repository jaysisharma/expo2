import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/legal/LegalPage";
import { CONTACT_DETAILS } from "@/data/contactInfo";

export const metadata: Metadata = {
  title: "Privacy Policy | Himalayan Green Energy Expo 2027",
  description: "How the Himalayan Green Energy Expo collects, uses and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  const email = CONTACT_DETAILS.emails.expo;

  return (
    <LegalPage
      title="Privacy Policy"
      intro={
        <p>
          The Himalayan Green Energy Expo (&ldquo;the Expo&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is jointly organised by
          the Independent Power Producers&apos; Association, Nepal (IPPAN) and Event Solution Pvt. Ltd., {CONTACT_DETAILS.address.full}.
          This policy explains what personal information we collect through this website, why we collect it, and the choices you have.
        </p>
      }
      sections={[
        {
          heading: "Information we collect",
          body: (
            <>
              <p>
                <strong>Information you give us</strong> when you register as a visitor or delegate, book a stall or sponsorship,
                reserve a dinner pass, sign up for the EV Rally or contact us:
              </p>
              <ul>
                <li>Name, email address, phone number, organisation, job title and country</li>
                <li>Pass type, areas of interest, dietary needs and special requests</li>
                <li>Booking details such as stall numbers, package, fascia name and power requirements</li>
                <li>For EV Rally participants: vehicle details, registration and licence number, and emergency contact</li>
                <li>Payment references and, where you choose QR / bank transfer, the payment screenshot you upload</li>
              </ul>
              <p>
                <strong>Information collected automatically</strong>: the page you landed on, the website or app that referred you
                (for example Facebook, Google or WhatsApp), any campaign tag in the link, your device type and approximate country
                (derived from your IP address by our hosting provider). We do not store your IP address in our analytics records.
              </p>
            </>
          ),
        },
        {
          heading: "How we use your information",
          body: (
            <ul>
              <li>To process registrations and bookings, issue QR entry passes and check you in at the venue</li>
              <li>To send confirmations, receipts, pass emails and important event updates</li>
              <li>To respond to your inquiries and provide visa invitation or customs support where requested</li>
              <li>To verify payments and prevent fraud or misuse of passes</li>
              <li>To understand which channels bring visitors to the Expo and improve our outreach (see our <Link href="/cookie-policy">Cookie Policy</Link>)</li>
            </ul>
          ),
        },
        {
          heading: "Payments",
          body: (
            <p>
              Online payments are processed by our payment partners (Khalti) on their own secure pages. We do not
              receive or store your card, wallet PIN or banking passwords. We keep the payment reference and status needed to confirm your booking.
            </p>
          ),
        },
        {
          heading: "Who we share information with",
          body: (
            <>
              <p>We do not sell your personal information. We share it only with:</p>
              <ul>
                <li>The co-organisers (IPPAN and Event Solution Pvt. Ltd.) and staff who run registration and venue check-in</li>
                <li>Service providers that host and operate this website on our behalf: website hosting, database (Google Firebase), image storage (Cloudinary), email delivery and payment gateways</li>
                <li>Authorities, where required by the laws of Nepal</li>
              </ul>
              <p>
                Exhibitor and sponsor company names, logos and stall numbers may be shown publicly on the website and floor plan.
              </p>
            </>
          ),
        },
        {
          heading: "International transfers",
          body: (
            <p>
              Some of our service providers store data on servers outside Nepal. We use providers that apply recognised security
              safeguards to the data they process for us.
            </p>
          ),
        },
        {
          heading: "How long we keep information",
          body: (
            <p>
              We keep registration and booking records for as long as needed to run the Expo and its future editions, and to meet
              accounting and legal obligations. Anonymous visit statistics may be kept indefinitely. You can ask us to delete your
              information at any time, subject to records we are legally required to keep.
            </p>
          ),
        },
        {
          heading: "Your rights",
          body: (
            <p>
              You may ask to access, correct or delete your personal information, or to stop receiving event emails, by writing to{" "}
              <a href={`mailto:${email}`}>{email}</a>. You can change your cookie choice at any time using &ldquo;Cookie Settings&rdquo; in
              the website footer.
            </p>
          ),
        },
        {
          heading: "Security",
          body: (
            <p>
              We use reasonable technical and organisational measures to protect your information, including encrypted connections
              (HTTPS) and signed QR passes. No method of transmission over the internet is completely secure.
            </p>
          ),
        },
        {
          heading: "Children",
          body: <p>This website is intended for professionals and the general public aged 16 and over. We do not knowingly collect data from children.</p>,
        },
        {
          heading: "Changes and contact",
          body: (
            <p>
              We may update this policy and will change the &ldquo;Last updated&rdquo; date above when we do. Questions? Email{" "}
              <a href={`mailto:${email}`}>{email}</a> or call {CONTACT_DETAILS.mobiles[0].display}.
            </p>
          ),
        },
      ]}
    />
  );
}
