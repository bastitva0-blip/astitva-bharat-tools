export const SUPPORTED_LOCALES = ["en", "hi"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "bt-locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function pickLocaleFromAcceptLanguage(header: string | null): Locale {
  if (!header) return DEFAULT_LOCALE;
  const parts = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      const lang = tag?.toLowerCase().split("-")[0] ?? "";
      const quality = q ? Number.parseFloat(q) : 1;
      return { lang, quality: Number.isFinite(quality) ? quality : 1 };
    })
    .sort((a, b) => b.quality - a.quality);
  for (const part of parts) {
    if (isLocale(part.lang)) return part.lang;
  }
  return DEFAULT_LOCALE;
}

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  hi: "हिन्दी",
};
