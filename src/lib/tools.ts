export type ToolIconKind =
  | "photo-resize"
  | "image-compress"
  | "video-compress"
  | "document-photo"
  | "photo-signature-joiner"
  | "print-sheet"
  | "jpg-to-pdf"
  | "pdf-compress"
  | "pdf-merge-split"
  | "print-job-slip"
  | "quick-send"
  | "image-format-convert"
  | "qr-generate"
  | "qr-scan"
  | "heic-to-jpg"
  | "photo-grayscale"
  | "aadhaar-collage"
  | "image-to-text"
  | "pdf-to-jpg"
  | "pdf-rotate"
  | "signature-maker"
  | "image-crop"
  | "image-rotate"
  | "bg-remove"
  | "batch-compress";

export type ToolCategory = "forms" | "sharing" | "utility";

export interface ToolCategoryDef {
  id: ToolCategory;
  label: string;
  description?: string;
}

export const toolCategories: ToolCategoryDef[] = [
  { id: "forms", label: "Sarkari forms" },
  { id: "sharing", label: "Sharing & print shop" },
  { id: "utility", label: "Quick utilities" },
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
export type ToolDomain = "image" | "video" | "pdf" | "sarkari" | "ocr" | "qr" | "utility";

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
    slug: "video-compress",
    href: "/video-compress",
    name: "Video Compressor",
    tagline: "Hit an exact MB target",
    description:
      "Compress any video to under a target size - 10 MB, 25 MB, 50 MB or any custom target. Runs entirely in your browser, nothing uploaded.",
    status: "live",
    category: "sharing",
    iconKind: "video-compress",
    iconColor: "info",
    type: "compress-to-target",
    buildStatus: "shipped",
    domain: "video",
    paywall: "always-free",
    keywords: [
      "video compressor", "compress video", "reduce video size", "shrink video", "video size reducer",
      "video ka size kam karna", "video chota karo", "video compress karo", "video size ghatao",
      "वीडियो कम्प्रेस", "वीडियो साइज़ कम",
      "10mb video", "25mb video", "50mb video", "100mb video",
      "whatsapp video size", "email video attachment size", "video under 25mb", "video under 16mb",
    ],
    inputAccept: ["video/mp4", "video/webm", "video/quicktime", "video/x-matroska"],
    needsWorker: true,
    variants: {
      param: "size",
      values: ["10mb", "25mb", "50mb", "100mb"],
    },
    nextSteps: ["quick-send"],
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
    slug: "pdf-to-jpg",
    href: "/pdf-to-jpg",
    name: "PDF to JPG Converter",
    tagline: "Every page as its own image",
    description:
      "Turn each page of a PDF into a JPG or PNG at 72, 150 or 300 DPI. Download one page or all of them.",
    status: "live",
    category: "forms",
    iconKind: "pdf-to-jpg",
    iconColor: "warning",
    type: "convert",
    buildStatus: "shipped",
    domain: "pdf",
    paywall: "always-free",
    keywords: [
      "pdf to jpg", "pdf to image", "pdf to png", "convert pdf to jpg", "pdf page to image",
      "extract images from pdf", "pdf ko jpg banao", "pdf se photo", "pdf image convert",
      "पीडीएफ से जेपीजी", "पीडीएफ को इमेज",
      "pdf to picture", "pdf screenshot", "pdf page export",
    ],
    inputAccept: ["application/pdf"],
    needsWorker: true,
    needsWasm: ["pdfjs"],
    popularityScore: 0.85,
    nextSteps: ["image-compress", "photo-resize", "image-crop"],
  },
  {
    slug: "pdf-rotate",
    href: "/pdf-rotate",
    name: "PDF Page Rotator",
    tagline: "Fix sideways pages without re-scanning",
    description:
      "Turn one page or every page by 90°, 180° or 270° and save. Page content is copied untouched, so nothing is re-encoded.",
    status: "live",
    category: "forms",
    iconKind: "pdf-rotate",
    iconColor: "info",
    type: "enhance",
    buildStatus: "shipped",
    domain: "pdf",
    paywall: "always-free",
    keywords: [
      "rotate pdf", "pdf rotate", "turn pdf page", "pdf sideways", "fix pdf orientation",
      "pdf ghumao", "pdf seedha karo", "pdf page ghumana",
      "पीडीएफ घुमाओ", "पीडीएफ सीधा",
      "rotate pdf pages online", "pdf upside down",
    ],
    inputAccept: ["application/pdf"],
    needsWorker: true,
    needsWasm: ["pdfjs"],
    nextSteps: ["pdf-compress", "pdf-merge-split", "pdf-to-jpg"],
  },
  {
    slug: "signature-maker",
    href: "/signature-maker",
    name: "Signature Maker",
    tagline: "Draw a signature, download the image",
    description:
      "Sign on screen with a finger, stylus or mouse and download a transparent PNG or white-background JPG, trimmed to the ink. No scanner needed.",
    status: "live",
    category: "forms",
    iconKind: "signature-maker",
    iconColor: "accent",
    type: "generate",
    buildStatus: "shipped",
    domain: "sarkari",
    paywall: "always-free",
    keywords: [
      "signature maker", "draw signature", "signature online", "digital signature image",
      "signature png", "transparent signature", "signature banao", "hastakshar",
      "sign kaise banaye", "signature image banao",
      "हस्ताक्षर", "सिग्नेचर बनाओ",
      "signature for form", "signature upload", "signature without scanner",
    ],
    inputAccept: [],
    needsWorker: false,
    popularityScore: 0.6,
    nextSteps: ["image-compress", "photo-signature-joiner"],
  },
  {
    slug: "image-crop",
    href: "/image-crop",
    name: "Image Cropper",
    tagline: "Free crop, or locked to a ratio",
    description:
      "Crop a photo freehand or lock it to 1:1, 4:3, 3:4, 16:9 or the 3.5:4.5 passport proportion. PNG and WebP keep transparency.",
    status: "live",
    category: "utility",
    iconKind: "image-crop",
    iconColor: "success",
    type: "enhance",
    buildStatus: "shipped",
    domain: "image",
    paywall: "always-free",
    keywords: [
      "crop image", "image crop", "photo crop", "crop photo online", "cut image",
      "photo kaato", "photo crop karo", "image kaatna", "foto crop",
      "फोटो क्रॉप", "इमेज काटो",
      "square crop", "passport crop", "aspect ratio crop", "trim image",
    ],
    inputAccept: IMAGE_ACCEPT,
    needsWorker: false,
    decodedPixelCap: 16_000_000,
    popularityScore: 0.75,
    nextSteps: ["image-compress", "photo-resize", "jpg-to-pdf"],
  },
  {
    slug: "image-rotate",
    href: "/image-rotate",
    name: "Image Rotate & Flip",
    tagline: "Turn or mirror a photo, permanently",
    description:
      "Rotate by 90°, 180° or 270° and mirror left–right or top–bottom. The orientation is written into the pixels, so portals that ignore EXIF still show it right.",
    status: "live",
    category: "utility",
    iconKind: "image-rotate",
    iconColor: "neutral",
    type: "enhance",
    buildStatus: "shipped",
    domain: "image",
    paywall: "always-free",
    keywords: [
      "rotate image", "flip image", "image rotate", "photo rotate", "mirror image",
      "photo ghumao", "photo seedha karo", "photo palto", "image ghumana",
      "फोटो घुमाओ", "इमेज पलटो",
      "rotate photo online", "photo sideways fix", "exif orientation",
    ],
    inputAccept: IMAGE_ACCEPT,
    needsWorker: false,
    decodedPixelCap: 16_000_000,
    nextSteps: ["image-crop", "image-compress", "jpg-to-pdf"],
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
    slug: "image-format-convert",
    href: "/image-format-convert",
    name: "Image Format Converter",
    tagline: "JPG ↔ PNG ↔ WebP, in your browser",
    description:
      "Convert between JPG, PNG and WebP. JPG flattens transparency to white for portal compatibility.",
    status: "live",
    category: "forms",
    iconKind: "image-format-convert",
    iconColor: "info",
    type: "convert",
    buildStatus: "shipped",
    domain: "image",
    paywall: "always-free",
    keywords: [
      "image converter", "jpg to png", "png to jpg", "webp to jpg", "jpg to webp",
      "image format change", "convert image", "image convert", "jpeg to png",
      "इमेज कन्वर्ट", "फोटो फॉर्मेट",
      "format converter", "any to jpg", "any to png",
    ],
    inputAccept: IMAGE_ACCEPT,
    needsWorker: false,
    decodedPixelCap: 16_000_000,
    nextSteps: ["image-compress", "jpg-to-pdf", "photo-signature-joiner"],
  },
  {
    slug: "qr-generate",
    href: "/qr-generate",
    name: "QR Code Generator",
    tagline: "Make a QR for a URL, UPI ID or contact",
    description:
      "Type the text and get a clean, downloadable QR code. Works for URLs, UPI IDs, phone numbers, plain text. PNG download.",
    status: "live",
    category: "utility",
    iconKind: "qr-generate",
    iconColor: "accent",
    type: "generate",
    buildStatus: "shipped",
    domain: "qr",
    paywall: "always-free",
    keywords: [
      "qr code generator", "make qr code", "qr code banao", "upi qr code",
      "url qr", "phone number qr", "qr banaye",
      "क्यूआर कोड", "क्यूआर बनाओ", "यूपीआई क्यूआर",
      "create qr", "generate qr", "qr code free",
    ],
    inputAccept: [],
    needsWorker: false,
    popularityScore: 0.85,
  },
  {
    slug: "qr-scan",
    href: "/qr-scan",
    name: "QR Code Scanner",
    tagline: "Scan a QR with your camera or from an image",
    description:
      "Decode any QR (UPI, URL, phone, plain text) using your camera or by dropping an image. Runs entirely in your browser.",
    status: "live",
    category: "utility",
    iconKind: "qr-scan",
    iconColor: "info",
    type: "extract",
    buildStatus: "shipped",
    domain: "qr",
    paywall: "always-free",
    keywords: [
      "qr code scanner", "scan qr code", "qr scanner", "scan qr", "qr decode",
      "qr code read", "qr padhna", "qr scan karo", "qr code scan online",
      "scan qr from image", "qr code reader",
      "क्यूआर स्कैनर", "क्यूआर स्कैन", "क्यूआर पढ़ो",
      "upi qr scan", "url qr scan", "qr code dekho",
    ],
    inputAccept: ["image/jpeg", "image/png", "image/webp"],
    needsWorker: false,
    popularityScore: 0.75,
  },
  {
    slug: "image-to-text",
    href: "/image-to-text",
    name: "Image to Text (OCR)",
    tagline: "Extract typed text from a photo or scan",
    description:
      "Pull selectable, copyable text out of an image: screenshots, scanned pages, notices. Supports English and Hindi. Runs on your device, nothing uploaded.",
    status: "live",
    category: "utility",
    iconKind: "image-to-text",
    iconColor: "accent",
    type: "extract",
    buildStatus: "shipped",
    domain: "ocr",
    paywall: "always-free",
    keywords: [
      "image to text", "photo to text", "ocr", "extract text from image", "text from photo",
      "picture to text", "screenshot to text", "scan to text", "read text from image",
      "photo se text", "image se text nikalo", "text kaise nikale", "photo ka text",
      "इमेज से टेक्स्ट", "फोटो से टेक्स्ट", "ओसीआर", "टेक्स्ट निकालो",
      "hindi ocr", "english ocr", "copy text from image", "image text extractor",
      "handwriting to text", "document to text", "notice text extract",
    ],
    inputAccept: ["image/jpeg", "image/png", "image/webp"],
    needsWorker: true,
    needsWasm: ["tesseract"],
    decodedPixelCap: 16_000_000,
    popularityScore: 0.65,
    nextSteps: ["jpg-to-pdf"],
  },
  {
    slug: "heic-to-jpg",
    href: "/heic-to-jpg",
    name: "HEIC to JPG Converter",
    tagline: "Turn iPhone HEIC photos into upload-ready JPG",
    description:
      "Indian government portals reject HEIC. Drop an iPhone photo here, get a JPG in seconds. Works on any browser. No upload, no app.",
    status: "live",
    category: "forms",
    iconKind: "heic-to-jpg",
    iconColor: "info",
    type: "convert",
    buildStatus: "shipped",
    domain: "image",
    paywall: "always-free",
    keywords: [
      "heic to jpg", "heic to jpeg", "iphone photo to jpg", "convert heic",
      "heic converter", "heif to jpg", "iphone foto jpg",
      "heic ko jpg banao", "iphone photo convert",
      "एचईआईसी", "आईफोन फोटो",
      "portal heic", "sarkari form iphone photo",
    ],
    inputAccept: ["image/heic", "image/heif"],
    needsWorker: false,
    needsWasm: ["heic"],
    decodedPixelCap: 16_000_000,
    popularityScore: 0.7,
    nextSteps: ["image-compress", "photo-resize", "jpg-to-pdf"],
  },
  {
    slug: "photo-grayscale",
    href: "/photo-grayscale",
    name: "Photo Grayscale Converter",
    tagline: "Convert a colour photo to clean black & white",
    description:
      "Some sarkari portals and print shops want greyscale. One click, on-device, no quality loss.",
    status: "live",
    category: "forms",
    iconKind: "photo-grayscale",
    iconColor: "neutral",
    type: "enhance",
    buildStatus: "shipped",
    domain: "image",
    paywall: "always-free",
    keywords: [
      "grayscale photo", "greyscale photo", "black and white photo", "b&w photo",
      "photo bw", "photo greyscale", "photo black white karo",
      "ब्लैक एंड व्हाइट फोटो", "ग्रेस्केल",
      "convert to grayscale", "remove colour",
    ],
    inputAccept: IMAGE_ACCEPT,
    needsWorker: false,
    decodedPixelCap: 16_000_000,
    nextSteps: ["image-compress", "jpg-to-pdf", "print-sheet"],
  },
  {
    slug: "aadhaar-collage",
    href: "/aadhaar-collage",
    name: "Aadhaar Front + Back Collage",
    tagline: "Combine both sides on a single A4 sheet",
    description:
      "Stack front and back of an Aadhaar card on one A4 page, ready for portals that ask for both sides as a single upload.",
    status: "live",
    category: "forms",
    iconKind: "aadhaar-collage",
    iconColor: "warning",
    type: "compose",
    buildStatus: "shipped",
    domain: "sarkari",
    paywall: "always-free",
    keywords: [
      "aadhaar collage", "aadhaar front back", "aadhaar one page", "aadhaar combine",
      "id card collage", "front back collage",
      "आधार फ्रंट बैक", "आधार एक पेज",
      "aadhar collage", "adhar dono side",
    ],
    inputAccept: ["image/jpeg", "image/png"],
    needsWorker: false,
    nextSteps: ["pdf-compress", "image-compress"],
  },
  {
    slug: "bg-remove",
    href: "/bg-remove",
    name: "Background Remover",
    tagline: "Remove or replace image background — AI, in-browser",
    description:
      "Remove the background from any photo instantly. Keep it transparent (PNG) or replace with white — perfect for exam photos, ID cards, and e-commerce. Runs entirely in your browser.",
    status: "live",
    category: "forms",
    iconKind: "bg-remove",
    iconColor: "success",
    type: "enhance",
    buildStatus: "shipped",
    domain: "image",
    paywall: "always-free",
    keywords: [
      "background remover", "remove background", "bg remove", "background remove",
      "photo background hatao", "background cut karo", "background change",
      "transparent background", "white background", "bg remove online",
      "बैकग्राउंड हटाओ", "बैकग्राउंड रिमूवर",
      "exam photo bg", "passport photo white background", "id photo background",
      "cut out image", "remove bg", "ai background remover",
    ],
    inputAccept: IMAGE_ACCEPT,
    needsWorker: false,
    decodedPixelCap: 16_000_000,
    popularityScore: 0.9,
    nextSteps: ["image-compress", "photo-resize", "jpg-to-pdf"],
  },
  {
    slug: "batch-compress",
    href: "/batch-compress",
    name: "Batch Image Compressor",
    tagline: "Compress multiple images to one KB target in one go",
    description:
      "Upload up to 20 images at once. Pick a preset (20 KB, 50 KB, 100 KB, 200 KB) and compress all to the same target. Download each file individually.",
    status: "live",
    category: "forms",
    iconKind: "batch-compress",
    iconColor: "info",
    type: "compress-to-target",
    buildStatus: "shipped",
    domain: "image",
    paywall: "always-free",
    keywords: [
      "batch compress", "compress multiple images", "bulk compress", "compress all photos",
      "multiple image compress", "batch photo resize", "bulk image compressor",
      "sab photo compress karo", "multiple photo ek saath",
      "बैच कम्प्रेस", "सभी फोटो कम्प्रेस",
      "compress 10 photos", "compress all exam photos",
    ],
    inputAccept: IMAGE_ACCEPT,
    needsWorker: false,
    decodedPixelCap: 16_000_000,
    popularityScore: 0.75,
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
