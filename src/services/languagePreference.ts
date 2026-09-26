const STORAGE_KEY = "@language_pref";

export type LanguageCode = "en" | "sv";

export const SUPPORTED_LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: "en", label: "English" },
  { code: "sv", label: "Svenska" },
];

export type LanguagePreference = {
  useDeviceLanguage: boolean;
  language: LanguageCode;
};

export const getDeviceLanguage = (): LanguageCode => {
  const lang = navigator.language.split("-")[0];
  return SUPPORTED_LANGUAGES.find((l) => l.code === lang)?.code ?? "en";
};

export const loadLanguagePreference = async (): Promise<LanguagePreference> => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { useDeviceLanguage: true, language: getDeviceLanguage() };
  return JSON.parse(raw) as LanguagePreference;
};

export const saveLanguagePreference = async (pref: LanguagePreference): Promise<void> => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pref));
};

export const resolveLanguage = (pref: LanguagePreference): LanguageCode =>
  pref.useDeviceLanguage ? getDeviceLanguage() : pref.language;
