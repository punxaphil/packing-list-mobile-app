import type { CSSProperties } from "react";
import { useSpace } from "~/providers/SpaceContext.ts";
import {
  updateProfileAddNewItemsOnTop,
  updateProfileCheckedItemsLast,
  updateProfileForceSingleColumn,
  updateProfileHideImagePlaceholder,
  updateProfileWrapItemText,
} from "~/services/spaceDatabase.ts";
import { homeColors, homeSpacing } from "../home/theme.ts";
import { LanguageSection } from "./LanguageSection.tsx";
import { PreferenceToggle } from "./PreferenceToggle.tsx";
import { profileCopy } from "./profileCopy.ts";
import "./preferences.css";

const theme = {
  "--preference-text": homeColors.text,
  "--preference-muted": homeColors.muted,
  "--preference-primary": homeColors.primaryStrong,
  "--preference-focus": homeColors.primaryStrong,
  "--preference-surface": homeColors.surface,
  "--preference-sm": `${homeSpacing.sm}px`,
  "--preference-lg": `${homeSpacing.lg}px`,
} as CSSProperties;

export const PreferencesSection = () => {
  const { profile } = useSpace();
  const wrapItemText = profile?.wrapItemText ?? false;
  const hideImagePlaceholder = profile?.hideImagePlaceholder ?? false;
  const addNewItemsOnTop = profile?.addNewItemsOnTop ?? false;
  const checkedItemsLast = profile?.checkedItemsLast ?? false;
  const forceSingleColumn = profile?.forceSingleColumn ?? false;

  const toggleWrapItemText = (value: boolean) => {
    if (!profile?.id) return;
    void updateProfileWrapItemText(profile.id, value);
  };

  const toggleHideImagePlaceholder = (value: boolean) => {
    if (!profile?.id) return;
    void updateProfileHideImagePlaceholder(profile.id, value);
  };

  const toggleAddNewItemsOnTop = (value: boolean) => {
    if (!profile?.id) return;
    void updateProfileAddNewItemsOnTop(profile.id, value);
  };

  const toggleCheckedItemsLast = (value: boolean) => {
    if (!profile?.id) return;
    void updateProfileCheckedItemsLast(profile.id, value);
  };

  const toggleForceSingleColumn = (value: boolean) => {
    if (!profile?.id) return;
    void updateProfileForceSingleColumn(profile.id, value);
  };

  return (
    <section className="profile-preferences" style={theme} aria-labelledby="profile-preferences-title">
      <h2 className="profile-preferences-title" id="profile-preferences-title">
        {profileCopy.preferencesTitle}
      </h2>
      <LanguageSection />
      <PreferenceToggle label={profileCopy.wrapItemText} checked={wrapItemText} onChange={toggleWrapItemText} />
      <PreferenceToggle
        label={profileCopy.hideImagePlaceholder}
        checked={hideImagePlaceholder}
        onChange={toggleHideImagePlaceholder}
      />
      <PreferenceToggle
        label={profileCopy.addNewItemsOnTop}
        checked={addNewItemsOnTop}
        onChange={toggleAddNewItemsOnTop}
      />
      <PreferenceToggle
        label={profileCopy.checkedItemsLast}
        checked={checkedItemsLast}
        onChange={toggleCheckedItemsLast}
      />
      <PreferenceToggle
        label={profileCopy.forceSingleColumn}
        checked={forceSingleColumn}
        onChange={toggleForceSingleColumn}
      />
    </section>
  );
};
