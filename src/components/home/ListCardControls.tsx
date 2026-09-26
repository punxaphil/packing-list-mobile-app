import { getEmojiValue } from "~/services/mediaValue.ts";
import { homeCopy } from "./copy.ts";
import { listCopy } from "./listCopy.ts";

export const DragHandle = () => (
  <span className="list-card-drag" aria-hidden="true">
    ≡
  </span>
);

export const PinButton = ({ onPress }: { onPress: () => void }) => (
  <button type="button" className="list-card-pin" onClick={onPress} aria-label={listCopy.unpin}>
    <span className="mdi mdi-pin-outline" aria-hidden="true" />
  </button>
);

type ImageProps = { imageUrl?: string; loading?: boolean; hidePlaceholder?: boolean; onPress: () => void };

export const ListImage = ({ imageUrl, loading, hidePlaceholder, onPress }: ImageProps) => {
  if (!imageUrl && hidePlaceholder) return null;
  const emoji = getEmojiValue(imageUrl);
  return (
    <button
      type="button"
      className={`list-card-image${imageUrl ? "" : " list-card-image-placeholder"}`}
      onClick={onPress}
      disabled={loading}
      aria-label={homeCopy.listImage}
    >
      {loading ? (
        <span className="mdi mdi-loading mdi-spin" aria-hidden="true" />
      ) : emoji ? (
        emoji
      ) : imageUrl ? (
        <img src={imageUrl} alt="" />
      ) : (
        <span className="mdi mdi-cloud-upload-outline" aria-hidden="true" />
      )}
    </button>
  );
};

export const ListMenuButton = ({ onPress }: { onPress: () => void }) => (
  <button type="button" className="list-card-menu" onClick={onPress} aria-label={listCopy.listMenu}>
    <span className="mdi mdi-dots-vertical" aria-hidden="true" />
  </button>
);
