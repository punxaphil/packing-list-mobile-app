import { getEmojiValue } from "~/services/mediaValue.ts";

export const ImageViewerPreview = ({ imageUrl, placeholderLabel }: { imageUrl?: string; placeholderLabel: string }) => {
  const emoji = getEmojiValue(imageUrl);
  if (emoji) return <span className="image-viewer-emoji">{emoji}</span>;
  if (imageUrl) return <img className="image-viewer-image" src={imageUrl} alt="" />;
  return <span className="image-viewer-placeholder">{placeholderLabel}</span>;
};
