import { ORG_ALTERNATE_NAMES, ORG_NAME, SITE_NAME, SITE_URL, absoluteUrl } from "./site";

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

export interface SoftwareAppInputExt extends SoftwareAppInput {
  /** Extra capability bullets surfaced as featureList in schema. */
  featureList?: string[];
  /** Finer category, e.g. "PhotoEditingApplication". */
  applicationSubCategory?: string;
  /** Browser requirements string for SoftwareApp schema. */
  browserRequirements?: string;
  /** Keywords array surfaced into schema.org keywords field. */
  keywords?: string[];
}

export function softwareAppSchema({
  name,
  description,
  path,
  price = "0",
  priceCurrency = "INR",
  featureList,
  applicationSubCategory,
  browserRequirements = "Requires JavaScript. Works on any modern browser - Chrome, Safari, Firefox, Edge.",
  keywords,
}: SoftwareAppInputExt) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    url: absoluteUrl(path),
    applicationCategory: "WebApplication",
    ...(applicationSubCategory ? { applicationSubCategory } : {}),
    operatingSystem: "Any",
    browserRequirements,
    inLanguage: ["en", "hi"],
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price, priceCurrency },
    ...(featureList && featureList.length ? { featureList } : {}),
    ...(keywords && keywords.length ? { keywords: keywords.join(", ") } : {}),
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
    alternateName: ORG_ALTERNATE_NAMES,
    url: SITE_URL,
    logo: `${SITE_URL}/android-chrome-512x512.png`,
    areaServed: { "@type": "Country", name: "India" },
  };
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export function faqPageSchema(entries: FaqEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((e) => ({
      "@type": "Question",
      name: e.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: e.answer,
      },
    })),
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
