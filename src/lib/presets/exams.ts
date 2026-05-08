export interface ExamPreset {
  slug: string;
  name: string;
  fullName: string;
  dimensions: { widthPx: number; heightPx: number; widthCm?: number; heightCm?: number };
  kbRange: { min: number; max: number };
  format: "jpg";
  background: "white";
  notes?: string[];
  portalUrl?: string;
  lastVerified: string;
}

export const examPresets: ExamPreset[] = [
  {
    slug: "upsc",
    name: "UPSC",
    fullName: "Union Public Service Commission",
    dimensions: { widthPx: 350, heightPx: 350, widthCm: 4, heightCm: 5 },
    kbRange: { min: 20, max: 300 },
    format: "jpg",
    background: "white",
    notes: ["Face should occupy ~75% of the frame.", "Name and date stamp may be required for some submissions."],
    portalUrl: "https://www.upsc.gov.in/",
    lastVerified: "2026-04-15",
  },
  {
    slug: "ssc",
    name: "SSC",
    fullName: "Staff Selection Commission",
    dimensions: { widthPx: 100, heightPx: 120, widthCm: 3.5, heightCm: 4.5 },
    kbRange: { min: 20, max: 50 },
    format: "jpg",
    background: "white",
    notes: ["Plain white background.", "Recent passport-style photo, no cap or sunglasses."],
    portalUrl: "https://ssc.nic.in/",
    lastVerified: "2026-04-15",
  },
  {
    slug: "neet",
    name: "NEET",
    fullName: "National Eligibility cum Entrance Test",
    dimensions: { widthPx: 200, heightPx: 230 },
    kbRange: { min: 10, max: 200 },
    format: "jpg",
    background: "white",
    notes: ["NTA portal upload spec.", "Front-facing, neutral expression."],
    portalUrl: "https://neet.nta.nic.in/",
    lastVerified: "2026-04-15",
  },
  {
    slug: "ibps",
    name: "IBPS",
    fullName: "Institute of Banking Personnel Selection",
    dimensions: { widthPx: 200, heightPx: 230 },
    kbRange: { min: 20, max: 50 },
    format: "jpg",
    background: "white",
    notes: ["Used by PO, Clerk and SO exams.", "White background; signature uploaded separately."],
    portalUrl: "https://www.ibps.in/",
    lastVerified: "2026-04-15",
  },
  {
    slug: "railway",
    name: "Railway (RRB)",
    fullName: "Railway Recruitment Board",
    dimensions: { widthPx: 200, heightPx: 230 },
    kbRange: { min: 20, max: 50 },
    format: "jpg",
    background: "white",
    notes: ["RRB portal upload spec."],
    portalUrl: "https://www.rrcb.gov.in/",
    lastVerified: "2026-04-15",
  },
  {
    slug: "jee",
    name: "JEE Main",
    fullName: "Joint Entrance Examination (Main)",
    dimensions: { widthPx: 200, heightPx: 230 },
    kbRange: { min: 10, max: 200 },
    format: "jpg",
    background: "white",
    notes: ["NTA portal upload spec.", "Same spec also used for JEE Advanced."],
    portalUrl: "https://jeemain.nta.nic.in/",
    lastVerified: "2026-04-15",
  },
  {
    slug: "state-psc",
    name: "State PSC",
    fullName: "State Public Service Commission (generic)",
    dimensions: { widthPx: 350, heightPx: 450, widthCm: 4, heightCm: 5 },
    kbRange: { min: 20, max: 100 },
    format: "jpg",
    background: "white",
    notes: ["Generic preset; check your state's PSC portal for exact spec."],
    lastVerified: "2026-04-15",
  },
  {
    slug: "police",
    name: "Police Recruitment",
    fullName: "State Police Recruitment Boards",
    dimensions: { widthPx: 350, heightPx: 450, widthCm: 3.5, heightCm: 4.5 },
    kbRange: { min: 20, max: 50 },
    format: "jpg",
    background: "white",
    notes: ["Spec varies by state; this is a common default."],
    lastVerified: "2026-04-15",
  },
  {
    slug: "sbi",
    name: "SBI / Bank PO",
    fullName: "State Bank of India / Generic Bank PO",
    dimensions: { widthPx: 200, heightPx: 230 },
    kbRange: { min: 20, max: 50 },
    format: "jpg",
    background: "white",
    notes: ["Generic banking exam upload spec."],
    portalUrl: "https://www.sbi.co.in/",
    lastVerified: "2026-04-15",
  },
];

export function getExamPreset(slug: string): ExamPreset | undefined {
  return examPresets.find((p) => p.slug === slug);
}
