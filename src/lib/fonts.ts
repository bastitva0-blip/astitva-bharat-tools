import { Hind } from "next/font/google";

// Devanagari-first UI face for the homepage's bilingual, Hindi-forward
// content. Hind (Indian Type Foundry) is designed for Devanagari + Latin at UI
// sizes, so Hindi and English sit on a shared rhythm. Self-hosted at build by
// next/font — no runtime CDN call. Exposed as a CSS variable and applied only
// on the landing subtree (see .bt-landing in globals.css); the rest of the app
// keeps the design-system fonts.
export const devanagari = Hind({
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-devanagari",
  display: "swap",
});
