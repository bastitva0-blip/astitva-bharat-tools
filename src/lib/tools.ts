export type ToolIconKind =
  | "photo-resize"
  | "image-compress"
  | "document-photo"
  | "photo-signature-joiner"
  | "print-sheet"
  | "jpg-to-pdf"
  | "pdf-compress"
  | "pdf-merge-split"
  | "print-job-slip"
  | "quick-send";

export type ToolCategory = "forms" | "sharing";

export interface ToolCategoryDef {
  id: ToolCategory;
  label: string;
  description?: string;
}

export const toolCategories: ToolCategoryDef[] = [
  { id: "forms", label: "Sarkari forms" },
  { id: "sharing", label: "Sharing & print shop" },
];

// --- Spec-aligned taxonomy (base-infrastructure-plan §1.1) ----------------

export type ToolType =
  | "resize-to-spec"
  | "compress-to-target"
  | "convert"
  | "compose"
  | "extract"
  | "generate"
  | "transfer"
  | "enhance"
  | "pipeline";

export type ToolBuildStatus = "shipped" | "next" | "later" | "skip";

// Domain taxonomy used by search, sitemap, and segment ranking. Distinct from
// `category` (the UI grouping in the homepage tool grid).
export type ToolDomain = "image" | "pdf" | "sarkari" | "ocr" | "qr" | "utility";

export type Paywall = "always-free" | "batch-gated" | "high-cost";

export type WasmDep = "pdfjs" | "qpdf" | "onnx" | "heic" | "tesseract";

export type Segment =
  | "operator"
  | "professional"
  | "individual-paying"
  | "aspirant"
  | "unknown";

export interface ToolVariants {
  param: string;
  values: string[];
}

export interface Tool {
  // --- existing fields (UI-facing; do not break) --------------------------
  slug: string;
  href: string;
  name: string;
  tagline: string;
  description: string;
  status: "live" | "soon";
  category: ToolCategory;
  iconKind: ToolIconKind;
  iconColor: "accent" | "info" | "success" | "warning" | "error" | "neutral";

  // --- spec fields (base-infrastructure-plan §1.1) ------------------------
  type: ToolType;
  buildStatus: ToolBuildStatus;
  domain: ToolDomain;
  paywall: Paywall;

  // discovery
  keywords: string[];
  popularityScore?: number;

  // segment ranking
  segmentAffinity?: Partial<Record<Segment, number>>;

  // engineering
  inputAccept: string[];
  needsWorker: boolean;
  needsWasm?: WasmDep[];
  decodedPixelCap?: number;

  // routing
  variants?: ToolVariants;

  // cross-tool ("Continue Editing" pipeline targets)
  nextSteps?: string[];

  // i18n (optional; tools migrate to dictionary keys progressively)
  nameKey?: string;
  taglineKey?: string;
  descriptionKey?: string;
}

const IMAGE_ACCEPT = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export const tools: Tool[] = [
  {
    slug: "photo-resize",
    href: "/photo-resize",
    name: "Exam Photo Resizer",
    tagline: "UPSC, SSC, NEET, JEE - exact pixel + KB specs",
    description:
      "Upload a photo, pick the exam, and get a portal-ready JPG with the right pixel size, KB target and white background.",
    status: "live",
    category: "forms",
    iconKind: "photo-resize",
    iconColor: "accent",
    type: "resize-to-spec",
    buildStatus: "shipped",
    domain: "image",
    paywall: "always-free",
    keywords: [
      "photo resize", "exam photo", "passport photo", "photo size", "resize photo",
      "photo ka size", "photo banaye", "foto resize", "exam ka photo", "photo theek karo",
      "फोटो रिसाइज़", "परीक्षा फोटो", "पासपोर्ट फोटो",
      "upsc photo", "ssc photo", "neet photo", "ibps photo", "jee photo", "railway photo",
      "rrb photo", "sbi photo", "bank po photo", "state psc photo", "police photo",
      "20kb photo", "50kb photo", "100kb photo", "200kb photo", "300kb photo",
    ],
    inputAccept: IMAGE_ACCEPT,
    needsWorker: false,
    decodedPixelCap: 16_000_000,
    variants: {
      param: "exam",
      values: ["upsc", "ssc", "neet", "ibps", "railway", "jee", "state-psc", "police", "sbi"],
    },
    nextSteps: ["photo-signature-joiner", "print-sheet", "image-compress"],
  },
  {
    slug: "image-compress",
    href: "/image-compress",
    name: "Image Compressor",
    tagline: "Hit an exact KB target",
    description:
      "Compress any image to a precise KB size - 20 KB, 50 KB, 200 KB or any custom target. Within ±5 KB of your goal.",
    status: "live",
    category: "forms",
    iconKind: "image-compress",
    iconColor: "info",
    type: "compress-to-target",
    buildStatus: "shipped",
    domain: "image",
    paywall: "always-free",
    keywords: [
      "image compressor", "compress image", "reduce photo size", "shrink image", "photo size reducer",
      "photo ka size kam karna", "photo chota karo", "foto compress", "image size kam", "photo size ghatao",
      "photo chhota", "photo chotta", "image kam karo", "photo light",
      "इमेज कम्प्रेस", "फोटो साइज़ कम", "फोटो छोटा",
      "10kb", "20kb", "50kb", "100kb", "200kb", "500kb",
      "10kb photo", "20kb photo", "50kb photo", "100kb photo", "200kb photo",
      "photo under 50kb", "photo under 100kb", "kb photo",
      "ssc photo size", "ibps 50kb", "neet 200kb photo",
    ],
    inputAccept: IMAGE_ACCEPT,
    needsWorker: false,
    decodedPixelCap: 16_000_000,
    variants: {
      param: "size",
      values: ["10kb", "20kb", "50kb", "100kb", "200kb", "500kb"],
    },
    nextSteps: ["jpg-to-pdf", "photo-signature-joiner"],
  },
  {
    slug: "document-photo",
    href: "/document-photo",
    name: "Document Photo Maker",
    tagline: "Aadhaar, PAN, Passport, OCI, Voter ID",
    description:
      "Identity-document photos at exact spec - dimensions, KB and white background. Ready for the portal.",
    status: "live",
    category: "forms",
    iconKind: "document-photo",
    iconColor: "success",
    type: "enhance",
    buildStatus: "shipped",
    domain: "image",
    paywall: "high-cost",
    keywords: [
      "document photo", "id photo", "aadhaar photo", "pan photo", "passport photo", "voter id photo",
      "oci photo", "white background photo", "background remove", "background hatao",
      "aadhar photo", "adhar photo", "passport size", "id ka photo",
      "photo background white karo", "background change",
      "आधार फोटो", "पैन फोटो", "पासपोर्ट साइज़", "सफेद बैकग्राउंड",
      "uidai photo", "aadhaar update photo", "pan card photo",
    ],
    inputAccept: IMAGE_ACCEPT,
    needsWorker: false,
    needsWasm: ["onnx"],
    decodedPixelCap: 6_000_000,
    variants: {
      param: "document",
      values: ["aadhaar", "pan", "passport", "voter-id", "oci"],
    },
    nextSteps: ["photo-signature-joiner", "print-sheet", "image-compress"],
  },
  {
    slug: "photo-signature-joiner",
    href: "/photo-signature-joiner",
    name: "Photo + Signature Joiner",
    tagline: "Combine for SSC and IBPS uploads",
    description:
      "Merge a photo and signature into a single image at portal-standard dimensions. Side-by-side or stacked.",
    status: "live",
    category: "forms",
    iconKind: "photo-signature-joiner",
    iconColor: "warning",
    type: "compose",
    buildStatus: "shipped",
    domain: "sarkari",
    paywall: "always-free",
    keywords: [
      "photo signature joiner", "signature photo combine", "join photo signature",
      "photo aur signature", "signature jodna", "photo signature merge",
      "signature photo banaye", "form ke liye photo signature",
      "फोटो साइन जोड़ो", "हस्ताक्षर फोटो", "सिग्नेचर फोटो",
      "ssc signature", "ibps signature", "bank exam signature",
    ],
    inputAccept: IMAGE_ACCEPT,
    needsWorker: false,
    nextSteps: ["print-sheet", "jpg-to-pdf"],
  },
  {
    slug: "print-sheet",
    href: "/print-sheet",
    name: "Print Sheet Generator",
    tagline: "6–8 passport photos on one sheet",
    description:
      "Lay out passport-size photos on a 4×6 inch or A4 sheet with cutting guides. Print at home or any studio.",
    status: "live",
    category: "forms",
    iconKind: "print-sheet",
    iconColor: "neutral",
    type: "compose",
    buildStatus: "shipped",
    domain: "image",
    paywall: "always-free",
    keywords: [
      "print sheet", "passport photo sheet", "print photos", "photo print layout",
      "ek sheet par photo", "passport size print", "photo a4 par",
      "print ke liye photo", "studio photo sheet",
      "प्रिंट शीट", "पासपोर्ट फोटो प्रिंट", "ए4 पर फोटो",
      "4x6 photo", "a4 photo sheet",
    ],
    inputAccept: ["image/jpeg", "image/png"],
    needsWorker: false,
    segmentAffinity: { operator: 0.9, professional: 0.4 },
    nextSteps: ["jpg-to-pdf"],
  },
  {
    slug: "jpg-to-pdf",
    href: "/jpg-to-pdf",
    name: "JPG / Image to PDF",
    tagline: "Combine images into one PDF",
    description:
      "Stitch one or many images into a PDF, reorder pages, rotate as needed. A4 or Letter, portrait or landscape.",
    status: "live",
    category: "forms",
    iconKind: "jpg-to-pdf",
    iconColor: "error",
    type: "convert",
    buildStatus: "shipped",
    domain: "pdf",
    paywall: "always-free",
    keywords: [
      "jpg to pdf", "image to pdf", "photo to pdf", "convert jpg pdf", "png to pdf",
      "jpg ko pdf banao", "photo se pdf", "image se pdf banaye", "pdf banao photo se",
      "jpg pdf kaise banaye", "ek pdf me photo",
      "जेपीजी पीडीएफ", "फोटो से पीडीएफ", "इमेज पीडीएफ",
      "documents to pdf", "scan to pdf",
    ],
    inputAccept: ["image/jpeg", "image/png", "image/webp"],
    needsWorker: false,
    popularityScore: 0.9,
    nextSteps: ["pdf-compress", "pdf-merge-split"],
  },
  {
    slug: "pdf-compress",
    href: "/pdf-compress",
    name: "PDF Compressor",
    tagline: "Shrink PDFs to fit the upload limit",
    description:
      "Re-encodes embedded photos and strips metadata to hit form-portal upload limits. Light, recommended or stronger - your call.",
    status: "live",
    category: "forms",
    iconKind: "pdf-compress",
    iconColor: "info",
    type: "compress-to-target",
    buildStatus: "shipped",
    domain: "pdf",
    paywall: "always-free",
    keywords: [
      "pdf compressor", "compress pdf", "reduce pdf size", "shrink pdf", "pdf size reducer",
      "pdf ka size kam karo", "pdf chota karo", "pdf kam karo", "pdf size ghatao",
      "पीडीएफ कम्प्रेस", "पीडीएफ साइज़ कम", "पीडीएफ छोटा",
      "pdf under 100kb", "pdf under 500kb", "pdf 1mb",
    ],
    inputAccept: ["application/pdf"],
    needsWorker: true,
    needsWasm: ["pdfjs"],
    popularityScore: 0.95,
    nextSteps: ["pdf-merge-split"],
  },
  {
    slug: "pdf-merge-split",
    href: "/pdf-merge-split",
    name: "PDF Merge & Split",
    tagline: "Combine PDFs or split by page ranges",
    description:
      "Merge several PDFs into one, or split a PDF into separate files using page ranges like '1-3, 5, 7-9'. All in-browser.",
    status: "live",
    category: "forms",
    iconKind: "pdf-merge-split",
    iconColor: "accent",
    type: "compose",
    buildStatus: "shipped",
    domain: "pdf",
    paywall: "always-free",
    keywords: [
      "pdf merge", "merge pdf", "combine pdf", "join pdf", "pdf split", "split pdf",
      "pdf ko jodo", "pdf alag karo", "pdf jodna", "pdf todo", "pdf milao",
      "do pdf ek karo", "pdf pages alag",
      "पीडीएफ मर्ज", "पीडीएफ जोड़ो", "पीडीएफ अलग",
      "merge and split pdf", "pdf pages extract",
    ],
    inputAccept: ["application/pdf"],
    needsWorker: true,
    needsWasm: ["pdfjs"],
    popularityScore: 0.9,
    nextSteps: ["pdf-compress"],
  },
  {
    slug: "print-job-slip",
    href: "/print-job-slip",
    name: "Print Job Slip",
    tagline: "Bundle files with shop-ready instructions",
    description:
      "Pick files, set copies, color or B&W, sides and page ranges. Outputs one PDF starting with a cover sheet the print shop can read at a glance.",
    status: "live",
    category: "sharing",
    iconKind: "print-job-slip",
    iconColor: "warning",
    type: "generate",
    buildStatus: "shipped",
    domain: "utility",
    paywall: "always-free",
    keywords: [
      "print job slip", "print shop", "print order", "print instructions",
      "print shop ke liye", "print ka order", "xerox shop",
      "प्रिंट जॉब", "प्रिंट ऑर्डर",
      "cover sheet print", "print specifications",
    ],
    inputAccept: ["application/pdf", "image/jpeg", "image/png"],
    needsWorker: false,
    segmentAffinity: { operator: 0.8 },
  },
  {
    slug: "quick-send",
    href: "/quick-send",
    name: "Quick Send",
    tagline: "Send files to a print shop - scan a QR, no app, no number",
    description:
      "Browser-to-browser file transfer. Print-shop opens Quick Send, customer scans the QR with their phone and sends files directly. P2P - files never stored on a server.",
    status: "live",
    category: "sharing",
    iconKind: "quick-send",
    iconColor: "info",
    type: "transfer",
    buildStatus: "shipped",
    domain: "utility",
    paywall: "always-free",
    keywords: [
      "quick send", "send files", "share files", "transfer files", "p2p file transfer",
      "file bhejna", "file share karo", "qr se file", "print shop ko bhejo",
      "फाइल भेजो", "फाइल शेयर",
      "wifi file transfer", "phone to laptop", "send to print shop",
    ],
    inputAccept: ["*/*"],
    needsWorker: false,
  },
];

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}
