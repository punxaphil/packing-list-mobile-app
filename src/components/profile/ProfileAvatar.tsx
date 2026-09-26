import type { CSSProperties } from "react";
import { getEmojiValue } from "~/services/mediaValue.ts";
import { homeColors } from "../home/theme.ts";
import { profileCopy } from "./profileCopy.ts";
import "./profileAvatar.css";

type ProfileAvatarProps = { initial: string; imageUrl?: string; onPress: () => void; loading: boolean };

const theme = {
  "--avatar-background": homeColors.primary,
  "--avatar-foreground": homeColors.primaryForeground,
  "--avatar-surface": homeColors.surface,
  "--avatar-overlay": homeColors.overlayDark,
} as CSSProperties;

export const ProfileAvatar = ({ initial, imageUrl, onPress, loading }: ProfileAvatarProps) => {
  const emoji = getEmojiValue(imageUrl);
  return (
    <button
      type="button"
      className="profile-avatar-button"
      style={theme}
      onClick={onPress}
      disabled={loading}
      aria-label={profileCopy.imageTitle}
      aria-busy={loading}
    >
      {emoji ? (
        <span className="profile-avatar-emoji" aria-hidden="true">
          {emoji}
        </span>
      ) : imageUrl ? (
        <img className="profile-avatar-image" src={imageUrl} alt="" />
      ) : (
        <span className="profile-avatar-initial" aria-hidden="true">
          {initial}
        </span>
      )}
      {loading && (
        <span className="profile-avatar-loading" aria-hidden="true">
          <span className="profile-avatar-spinner" />
        </span>
      )}
    </button>
  );
};
