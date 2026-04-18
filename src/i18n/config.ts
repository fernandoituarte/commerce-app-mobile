import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "./index";

const LANGUAGE_KEY = "app_language";

export const SUPPORTED_LANGUAGES = {
  en: "English",
  es: "Español",
  pt: "Português",
  fr: "Français",
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

export const DEFAULT_LANGUAGE: LanguageCode = "en";

/**
 * Persist and apply a new language.
 */
export async function setLanguage(code: LanguageCode): Promise<void> {
  await AsyncStorage.setItem(LANGUAGE_KEY, code);
  await i18n.changeLanguage(code);
}

/**
 * Read the persisted language (or return the default).
 */
export async function getStoredLanguage(): Promise<LanguageCode> {
  const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
  if (stored && stored in SUPPORTED_LANGUAGES) {
    return stored as LanguageCode;
  }
  return DEFAULT_LANGUAGE;
}
