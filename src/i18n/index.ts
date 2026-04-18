import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import es from "./locales/es.json";
import pt from "./locales/pt.json";
import fr from "./locales/fr.json";

// ─── Resources ────────────────────────────────────────────────────

const resources = {
  en: { translation: en },
  es: { translation: es },
  pt: { translation: pt },
  fr: { translation: fr },
} as const;

// ─── Init ─────────────────────────────────────────────────────────

i18n.use(initReactI18next).init({
  resources,
  lng: "en", // overridden at startup after reading AsyncStorage
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React Native handles escaping
  },
});

export default i18n;
