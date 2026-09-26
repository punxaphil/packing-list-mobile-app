import { getEmojiValue } from "~/services/mediaValue.ts";
import { homeColors } from "../home/theme.ts";
import type { EntityCopy } from "./entityStyles.ts";

type EntityImageProps = {
  imageUrl?: string;
  loading?: boolean;
  disabled?: boolean;
  hidePlaceholder?: boolean;
  onPress: () => void;
  copy: EntityCopy;
};

export const EntityImage = ({ imageUrl, loading, disabled, hidePlaceholder, onPress, copy }: EntityImageProps) => {
  if (!imageUrl && hidePlaceholder) return null;
  const emoji = getEmojiValue(imageUrl);
  return (
    <button
      type="button"
      onClick={onPress}
      disabled={loading || disabled}
      aria-label={copy.imageTitle}
      aria-busy={loading}
      style={{
        display: "flex",
        flex: "none",
        alignItems: "center",
        justifyContent: "center",
        width: 32,
        height: 32,
        padding: 0,
        border: 0,
        borderRadius: "50%",
        backgroundColor: imageUrl ? "transparent" : homeColors.border,
        color: homeColors.muted,
        cursor: "pointer",
      }}
    >
      {loading ? (
        <span className="mdi mdi-loading mdi-spin" aria-hidden="true" />
      ) : emoji ? (
        <span style={{ fontSize: 18 }} aria-hidden="true">
          {emoji}
        </span>
      ) : imageUrl ? (
        <img src={imageUrl} alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
      ) : (
        <span className="mdi mdi-cloud-upload-outline" aria-hidden="true" style={{ fontSize: 20 }} />
      )}
    </button>
  );
};
