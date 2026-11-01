/**
 * Single source of truth for the downloadable expo PDFs.
 *
 * The files live ONLY in `public/files/`. To update a document, overwrite the
 * file there with the same name — every link on the site points here.
 *
 * next.config.ts reads this list to:
 *  - rewrite the old short URLs (aliases) to the file in public/files/
 *  - send `Content-Disposition: attachment` so every URL downloads the file
 *    under its friendly `filename` instead of opening it in the browser.
 *
 * Keep this file free of imports: next.config.ts loads it directly.
 */
export interface ExpoPdf {
  /** Public URL of the file in public/files/ */
  url: string;
  /** Name the visitor's browser saves the file as */
  filename: string;
  /** Older/alternate URLs that should serve the same file */
  aliases: string[];
}

export const PDF_DOCS = {
  proposal: {
    url: "/files/Proposal.pdf",
    filename: "Himalayan-Green-Energy-Expo-Proposal.pdf",
    aliases: ["/Proposal.pdf", "/proposal.pdf"],
  },
  bookingForm: {
    url: "/files/booking-form.pdf",
    filename: "Himalayan-Expo-Stall-Booking-Form.pdf",
    // /files/form.pdf was the student-entry link; it was a copy of this form.
    aliases: ["/booking-form.pdf", "/form.pdf", "/files/form.pdf"],
  },
  sponsorsSheet: {
    url: "/files/sponsors-sheet.pdf",
    filename: "Himalayan-Expo-Sponsorship-Rates-Sheet.pdf",
    aliases: ["/sponsors-sheet.pdf", "/sponsor-sheet.pdf"],
  },
  floorPlan: {
    url: "/files/floor-plan.pdf",
    filename: "Himalayan-Expo-Floor-Plan.pdf",
    aliases: ["/floor-plan.pdf", "/floorplan.pdf"],
  },
} satisfies Record<string, ExpoPdf>;

export type PdfKey = keyof typeof PDF_DOCS;

/** Shorthand URLs for links: href={PDFS.proposal} */
export const PDFS = Object.fromEntries(
  Object.entries(PDF_DOCS).map(([key, doc]) => [key, doc.url]),
) as Record<PdfKey, string>;

/** Find the document a link points to (by its url or any alias). */
export function findPdfDoc(href: string): ExpoPdf | undefined {
  const path = href.split(/[?#]/)[0].toLowerCase();
  return Object.values(PDF_DOCS).find(
    (doc) =>
      doc.url.toLowerCase() === path ||
      doc.aliases.some((alias) => alias.toLowerCase() === path),
  );
}
