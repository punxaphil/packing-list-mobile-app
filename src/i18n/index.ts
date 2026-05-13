import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "react-native-localize";
import { loadLanguagePreference, resolveLanguage } from "~/services/languagePreference.ts";
import en from "./locales/en.json";
import sv from "./locales/sv.json";

const deviceLang = getLocales()[0]?.languageCode ?? "en";

i18next.use(initReactI18next).init({
  resources: { en: { translation: en }, sv: { translation: sv } },
  lng: deviceLang,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
    prefix: "{",
    suffix: "}",
  },
  missingInterpolationHandler: (_text, value) => value[0],
  returnNull: false,
});

export const applyStoredLanguage = async (): Promise<void> => {
  const pref = await loadLanguagePreference();
  const lang = resolveLanguage(pref);
  if (lang !== i18next.language) await i18next.changeLanguage(lang);
};
