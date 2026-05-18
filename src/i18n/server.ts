import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "@/i18n/config";
import en from "@/i18n/dictionaries/en.json";
import hi from "@/i18n/dictionaries/hi.json";

export type Dictionary = typeof en;

const DICTIONARIES: Record<Locale, Dictionary> = {
  en,
  hi: hi as Dictionary,
};

export async function getCurrentLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}
