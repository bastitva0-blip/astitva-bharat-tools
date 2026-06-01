import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { JsonLd } from "@/components/json-ld";
import { Providers } from "@/components/providers";
import { SegmentBootstrap } from "@/components/segment-bootstrap";
import { TopNav } from "@/components/top-nav";
import { LocaleProvider } from "@/i18n/provider";
import { getCurrentLocale, getDictionary } from "@/i18n/server";
import { organizationSchema, webSiteSchema } from "@/lib/seo/schema";
import { SITE_DESCRIPTION, SITE_KEYWORDS, SITE_NAME, SITE_URL } from "@/lib/seo/site";

const GOOGLE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION;
const BING_VERIFICATION = process.env.NEXT_PUBLIC_BING_VERIFICATION;
const YANDEX_VERIFICATION = process.env.NEXT_PUBLIC_YANDEX_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "BharatTools — Sarkari form photo, PDF & print tools (free, no upload)",
    template: "%s · BharatTools",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: SITE_KEYWORDS,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "utilities",
  alternates: {
    canonical: "/",
    languages: {
      "en-IN": "/",
      "hi-IN": "/",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_IN",
    alternateLocale: ["hi_IN"],
    url: SITE_URL,
    title: "BharatTools — Sarkari form photo, PDF & print tools",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "BharatTools — Sarkari form photo, PDF & print tools",
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  ...((GOOGLE_VERIFICATION || BING_VERIFICATION || YANDEX_VERIFICATION) && {
    verification: {
      ...(GOOGLE_VERIFICATION ? { google: GOOGLE_VERIFICATION } : {}),
      ...(YANDEX_VERIFICATION ? { yandex: YANDEX_VERIFICATION } : {}),
      ...(BING_VERIFICATION ? { other: { "msvalidate.01": BING_VERIFICATION } } : {}),
    },
  }),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  return (
    <html lang={locale} suppressHydrationWarning className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <JsonLd data={[webSiteSchema(), organizationSchema()]} />
        <LocaleProvider locale={locale} dict={dict}>
          <Providers>
            <TopNav />
            {children}
          </Providers>
        </LocaleProvider>
        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id="e00b56de-8cd9-4d71-a3aa-62de53f713de"
          strategy="afterInteractive"
        />
        <SegmentBootstrap />
      </body>
    </html>
  );
}
