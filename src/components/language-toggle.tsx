"use client";

import { Languages } from "lucide-react";
import { Button } from "@devalok/shilp-sutra/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@devalok/shilp-sutra/ui/dropdown-menu";
import { LOCALE_LABELS, SUPPORTED_LOCALES, type Locale } from "@/i18n/config";
import { useLocale } from "@/i18n/provider";

export function LanguageToggle() {
  const { locale, setLocale, dict } = useLocale();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={dict.nav.languageAria}>
          <Languages size={18} aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SUPPORTED_LOCALES.map((l) => (
          <DropdownMenuItem
            key={l}
            onSelect={() => setLocale(l as Locale)}
            data-active={locale === l ? "true" : undefined}
          >
            {LOCALE_LABELS[l]}
            {locale === l ? "  ✓" : ""}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
