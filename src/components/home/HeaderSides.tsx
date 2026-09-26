import i18next from "i18next";
import { getEmojiValue } from "~/services/mediaValue.ts";
import { homeCopy } from "./copy.ts";
import "./headerSides.css";

type LeftProps = {
  onBack?: () => void;
  leftImageUrl?: string;
  leftImageLoading?: boolean;
  hideLeftImagePlaceholder?: boolean;
  onPressLeftImage?: () => void;
};

export const BackButton = ({
  onBack,
  leftImageUrl,
  leftImageLoading,
  hideLeftImagePlaceholder,
  onPressLeftImage,
}: LeftProps) => (
  <div className={`home-header-side${onBack ? " home-header-side-back" : ""}`}>
    {onBack ? (
      <button type="button" className="home-header-back" onClick={onBack}>
        {homeCopy.back}
      </button>
    ) : onPressLeftImage && (leftImageUrl || !hideLeftImagePlaceholder) ? (
      <button
        type="button"
        className={`home-header-image-button${leftImageUrl ? "" : " home-header-placeholder"}`}
        onClick={onPressLeftImage}
        disabled={leftImageLoading}
        aria-label={homeCopy.listImage}
      >
        {leftImageLoading ? (
          <span className="mdi mdi-loading mdi-spin" aria-hidden="true" />
        ) : getEmojiValue(leftImageUrl) ? (
          getEmojiValue(leftImageUrl)
        ) : leftImageUrl ? (
          <img src={leftImageUrl} alt="" className="home-header-avatar-image" />
        ) : (
          <span className="mdi mdi-cloud-upload-outline" aria-hidden="true" />
        )}
      </button>
    ) : null}
  </div>
);

type AvatarProps = { email: string; imageUrl?: string; onProfile?: () => void };

export const AvatarButton = ({ email, imageUrl, onProfile }: AvatarProps) => (
  <div className="home-header-avatar-slot">
    <button type="button" className="home-header-avatar" onClick={onProfile} aria-label={i18next.t("profile.title")}>
      {getEmojiValue(imageUrl) ||
        (imageUrl ? (
          <img src={imageUrl} alt="" className="home-header-avatar-image" />
        ) : (
          <span className="home-header-initial">{email.trim()[0]?.toUpperCase() ?? homeCopy.avatarFallback}</span>
        ))}
    </button>
  </div>
);
