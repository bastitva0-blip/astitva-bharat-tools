import { ORG_NAME, SITE_NAME, SITE_URL, absoluteUrl } from "./site";

export interface BreadcrumbCrumb {
  label: string;
  /** Absolute or root-relative path. The last crumb may omit it. */
  href?: string;
}

export function breadcrumbSchema(crumbs: BreadcrumbCrumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: absoluteUrl(c.href) } : {}),
    })),
  };
}

export interface SoftwareAppInput {
  name: string;
  description: string;
  /** Path on this site, e.g. "/photo-resize/upsc". */
  path: string;
  /** Optional offer; defaults to free in INR. */
  price?: string;
  priceCurrency?: string;
}

export function softwareAppSchema({
  name,
  description,
  path,
  price = "0",
  priceCurrency = "INR",
}: SoftwareAppInput) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    url: absoluteUrl(path),
    applicationCategory: "WebApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price, priceCurrency },
    publisher: { "@type": "Organization", name: ORG_NAME, url: SITE_URL },
  };
}

export interface HowToStepInput {
  name: string;
  text: string;
}

export function howToSchema({
  name,
  description,
  steps,
  totalTimeIso = "PT1M",
}: {
  name: string;
  description?: string;
  steps: HowToStepInput[];
  totalTimeIso?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    ...(description ? { description } : {}),
    totalTime: totalTimeIso,
    step: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

export function webSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: ORG_NAME,
    url: SITE_URL,
  };
}

export function collectionPageSchema({
  name,
  description,
  path,
  items,
}: {
  name: string;
  description: string;
  path: string;
  items: { name: string; path: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: absoluteUrl(path),
    hasPart: items.map((it) => ({
      "@type": "WebPage",
      name: it.name,
      url: absoluteUrl(it.path),
    })),
  };
}
