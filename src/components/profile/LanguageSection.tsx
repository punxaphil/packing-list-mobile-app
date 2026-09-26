import i18next from "i18next";
import { useEffect, useState } from "react";
import {
  getDeviceLanguage,
  type LanguagePreference,
  loadLanguagePreference,
  resolveLanguage,
  SUPPORTED_LANGUAGES,
  saveLanguagePreference,
} from "~/services/languagePreference.ts";
import { showActionSheet } from "../home/showActionSheet.ts";
import { PreferenceToggle } from "./PreferenceToggle.tsx";
import { profileCopy } from "./profileCopy.ts";

export const LanguageSection = () => {
  const [pref, setPref] = useState<LanguagePreference>({
    useDeviceLanguage: true,
    language: getDeviceLanguage(),
  });

  useEffect(() => {
    void loadLanguagePreference().then(setPref);
  }, []);

  const apply = async (newPref: LanguagePreference) => {
    setPref(newPref);
    await saveLanguagePreference(newPref);
    await i18next.changeLanguage(resolveLanguage(newPref));
  };

  const openLanguagePicker = () => {
    showActionSheet(
      profileCopy.selectLanguage,
      SUPPORTED_LANGUAGES.map((l) => ({
        text: l.label,
        onPress: () => void apply({ ...pref, useDeviceLanguage: false, language: l.code }),
      }))
    );
  };

  const currentLabel = SUPPORTED_LANGUAGES.find((l) => l.code === resolveLanguage(pref))?.label ?? "";

  return (
    <div className="profile-language">
      <PreferenceToggle
        label={profileCopy.useDeviceLanguage}
        checked={pref.useDeviceLanguage}
        onChange={(value) => void apply({ ...pref, useDeviceLanguage: value })}
      />
      {!pref.useDeviceLanguage && (
        <button className="profile-preference-row profile-language-picker" type="button" onClick={openLanguagePicker}>
          <span className="profile-preference-label">{profileCopy.language}</span>
          <span className="profile-language-value">{currentLabel}</span>
          <span className="profile-language-chevron" aria-hidden="true">
            &#xF0142;
          </span>
        </button>
      )}
    </div>
  );
};
