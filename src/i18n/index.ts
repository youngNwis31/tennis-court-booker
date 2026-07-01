import { en } from "./en";
import { fil } from "./fil";

export type Lang = "en" | "fil";

const locales: Record<Lang, Record<string, string>> = { en, fil };

export function translate(lang: Lang, key: string): string {
  return locales[lang]?.[key] ?? key;
}
