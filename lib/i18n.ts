import { home as en } from "@/content/en/home";
import { home as ko } from "@/content/ko/home";
import type { HomeContent } from "@/content/en/home";

export const LOCALES = ["en", "ko"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const SITE = "https://agentba.se";

const DICT: Record<Locale, HomeContent> = { en, ko };

export function getContent(locale: Locale): HomeContent {
  return DICT[locale];
}

/** Canonical path for a locale. English lives at the root. */
export function pathFor(locale: Locale): string {
  return locale === "en" ? "/" : `/${locale}`;
}

/**
 * hreflang for every locale plus x-default, which points at English.
 * There is no Accept-Language redirect: a crawler and a person must land on
 * the same page, and an auto-redirect makes x-default meaningless.
 */
export function alternatesFor(locale: Locale) {
  return {
    canonical: `${SITE}${pathFor(locale)}`,
    languages: {
      en: `${SITE}/`,
      ko: `${SITE}/ko`,
      "x-default": `${SITE}/`,
    },
  };
}

/** Locale-aware number formatting with stable grouping. */
export function fmt(locale: Locale, n: number, opts?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(locale === "ko" ? "ko-KR" : "en-US", opts).format(n);
}
