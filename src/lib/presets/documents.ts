import type { PhotoSpecPreset } from "./photo-spec";

export type DocumentPreset = PhotoSpecPreset;

export const documentPresets: DocumentPreset[] = [
  {
    slug: "aadhaar",
    name: "Aadhaar",
    fullName: "UIDAI Aadhaar update / enrolment",
    dimensions: { widthPx: 413, heightPx: 531, widthCm: 3.5, heightCm: 4.5 },
    kbRange: { min: 0, max: 50 },
    format: "jpg",
    background: "white",
    notes: [
      "Plain white background, neutral expression.",
      "Avoid glasses with reflection or tinted lenses.",
      "Face should occupy ~70% of the frame.",
    ],
    portalUrl: "https://uidai.gov.in/",
    lastVerified: "2026-04-15",
  },
  {
    slug: "pan",
    name: "PAN",
    fullName: "PAN application (NSDL / UTIITSL online)",
    dimensions: { widthPx: 213, heightPx: 213 },
    kbRange: { min: 0, max: 20 },
    format: "jpg",
    background: "white",
    notes: [
      "NSDL / UTIITSL online uploads accept 213×213 px JPG.",
      "Square crop — match the aspect on the crop tool.",
    ],
    portalUrl: "https://www.protean-tinpan.com/",
    lastVerified: "2026-04-15",
  },
  {
    slug: "passport",
    name: "Indian Passport",
    fullName: "Passport Seva (ICAO-compliant)",
    dimensions: { widthPx: 350, heightPx: 450, widthCm: 3.5, heightCm: 4.5 },
    kbRange: { min: 10, max: 300 },
    format: "jpg",
    background: "white",
    notes: [
      "ICAO-compliant spec required since September 2025.",
      "Plain white background, no shadow on face or wall.",
      "Both ears visible, no head covering except for religious reasons.",
    ],
    portalUrl: "https://www.passportindia.gov.in/",
    lastVerified: "2026-04-15",
  },
  {
    slug: "voter-id",
    name: "Voter ID (EPIC)",
    fullName: "Election Commission Voter ID",
    dimensions: { widthPx: 413, heightPx: 531, widthCm: 3.5, heightCm: 4.5 },
    kbRange: { min: 0, max: 100 },
    format: "jpg",
    background: "white",
    notes: ["Standard passport-style photo.", "Plain background, recent."],
    portalUrl: "https://voters.eci.gov.in/",
    lastVerified: "2026-04-15",
  },
  {
    slug: "oci",
    name: "OCI Card",
    fullName: "Overseas Citizen of India card",
    dimensions: { widthPx: 600, heightPx: 600 },
    kbRange: { min: 0, max: 1024 },
    format: "jpg",
    background: "white",
    notes: [
      "2×2 inch (600×600 px @ 300 DPI), square aspect.",
      "Country variant requirements may differ; check the application portal.",
    ],
    portalUrl: "https://ociservices.gov.in/",
    lastVerified: "2026-04-15",
  },
];

export function getDocumentPreset(slug: string): DocumentPreset | undefined {
  return documentPresets.find((p) => p.slug === slug);
}
