import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { JsonLd } from "@/components/json-ld";
import { Providers } from "@/components/providers";
import { TopNav } from "@/components/top-nav";
import { organizationSchema, webSiteSchema } from "@/lib/seo/schema";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "BharatTools - Har Sarkari form ka saathi",
    template: "%s · BharatTools",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_IN",
    url: SITE_URL,
    title: "BharatTools - Har Sarkari form ka saathi",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "BharatTools - Har Sarkari form ka saathi",
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <JsonLd data={[webSiteSchema(), organizationSchema()]} />
        <Providers>
          <TopNav />
          {children}
        </Providers>
        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id="e00b56de-8cd9-4d71-a3aa-62de53f713de"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
