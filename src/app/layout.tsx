import type { Metadata } from "next";
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
      </body>
    </html>
  );
}
