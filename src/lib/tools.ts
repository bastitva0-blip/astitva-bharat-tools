export type ToolIconKind =
  | "photo-resize"
  | "image-compress"
  | "document-photo"
  | "photo-signature-joiner"
  | "print-sheet"
  | "jpg-to-pdf"
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

export interface Tool {
  slug: string;
  href: string;
  name: string;
  tagline: string;
  description: string;
  status: "live" | "soon";
  category: ToolCategory;
  iconKind: ToolIconKind;
  iconColor: "accent" | "info" | "success" | "warning" | "error" | "neutral";
}

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
  },
];

export const navTools = tools.filter((t) => t.category === "forms").slice(0, 4);
