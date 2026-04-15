import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "react-native-localize";
import en from "./locales/en.json";

const deviceLang = getLocales()[0]?.languageCode ?? "en";

i18next.use(initReactI18next).init({
  resources: { en: { translation: en } },
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
