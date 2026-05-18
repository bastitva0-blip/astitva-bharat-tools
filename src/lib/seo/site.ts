export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://bharattools.app"
).replace(/\/$/, "");

export const SITE_NAME = "BharatTools";
export const SITE_TAGLINE = "Har Sarkari form ka saathi";
export const SITE_DESCRIPTION =
  "Free browser-only utilities for Indian sarkari forms - resize photos to UPSC, SSC, NEET, JEE, IBPS, RRB specs, compress to 20 KB / 50 KB / 100 KB / 200 KB / 500 KB, join photo and signature, compress PDFs, merge or split PDFs, JPG to PDF, passport-size print sheets and Aadhaar/PAN/passport document photos. 100% on-device - files never leave your browser.";
export const ORG_NAME = "BharatTools";
export const ORG_ALTERNATE_NAMES = [
  "Bharat Tools",
  "Bharattools",
  "भारत टूल्स",
  "BharatTools.app",
];

/** Common keyword set used across the site. Edit here, propagates everywhere. */
export const SITE_KEYWORDS: string[] = [
  // brand
  "BharatTools",
  "Bharat Tools",
  "bharattools.app",
  "भारत टूल्स",
  // category - sarkari / government forms
  "sarkari form tools",
  "government form photo",
  "Indian government form upload",
  "online sarkari form helper",
  "सरकारी फॉर्म फोटो",
  // exam photos
  "exam photo resizer",
  "UPSC photo size",
  "UPSC photo resizer",
  "SSC photo size",
  "SSC photo signature joiner",
  "NEET photo size",
  "JEE photo size",
  "IBPS photo size",
  "RRB photo size",
  "passport size photo online",
  "passport size photo maker",
  // KB compression
  "compress photo to 20 KB",
  "compress photo to 50 KB",
  "compress photo to 100 KB",
  "compress photo to 200 KB",
  "compress photo to 500 KB",
  "compress photo to 1 MB",
  "image compressor in KB",
  "reduce image size online",
  "photo size kam karein",
  // document photos
  "Aadhaar card photo",
  "PAN card photo",
  "passport photo white background",
  "OCI photo",
  "voter ID photo",
  "document photo maker",
  // PDF tools
  "compress PDF online India",
  "reduce PDF size to 200 KB",
  "PDF size kam karein",
  "PDF compressor for upload",
  "merge PDF online",
  "combine PDF files",
  "split PDF",
  "JPG to PDF converter",
  "image to PDF",
  // signature
  "photo signature joiner",
  "photo signature combine",
  "signature merge online",
  // print
  "passport photo print sheet",
  "6 photo print sheet",
  "print shop file send",
  "print job slip",
  // sharing
  "file send to print shop",
  "browser to browser file transfer",
  "P2P file share India",
  "Quick Send",
  // privacy / model
  "no upload",
  "files never leave browser",
  "offline image compressor",
  "private image tools",
];

export function absoluteUrl(path: string): string {
  if (!path.startsWith("/")) return `${SITE_URL}/${path}`;
  return `${SITE_URL}${path}`;
}
