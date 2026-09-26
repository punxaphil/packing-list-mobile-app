import { useEffect, useRef } from "react";
import glyphs from "react-native-vector-icons/glyphmaps/MaterialCommunityIcons.json";
import { commonCopy } from "../home/copy.ts";
import { ImageViewerControls } from "./ImageViewerControls.tsx";
import { ImageViewerPreview } from "./ImageViewerPreview.tsx";
import { viewerTheme } from "./imageViewerTheme.ts";
import "./imageViewerModal.css";

type ImageViewerModalProps = {
  visible: boolean;
  imageUrl?: string;
  placeholderLabel?: string;
  title?: string;
  connectedLabel?: string;
  showRemove?: boolean;
  loading?: boolean;
  textValue?: string;
  textSubmitDisabled?: boolean;
  onTextChange?: (value: string) => void;
  onTextSubmit?: () => void;
  onClose: () => void;
  onReplace: () => void;
  onRemove: () => void;
};

export const ImageViewerModal = ({
  visible,
  imageUrl,
  placeholderLabel = "?",
  title,
  showRemove = true,
  loading = false,
  textValue,
  textSubmitDisabled = false,
  onTextChange,
  onTextSubmit,
  onClose,
  onReplace,
  onRemove,
}: ImageViewerModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (visible && !dialog.open) {
      dialog.showModal();
      if (!imageUrl) inputRef.current?.focus();
    } else if (!visible && dialog.open) dialog.close();
  }, [visible, imageUrl]);

  return (
    <dialog
      ref={dialogRef}
      className="image-viewer"
      style={viewerTheme}
      aria-label={title || commonCopy.pickImage}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onClose();
        }
      }}
    >
      <button type="button" className="image-viewer-close" onClick={onClose} aria-label={commonCopy.cancel}>
        <span className="web-button-icon" aria-hidden="true">
          {String.fromCodePoint(glyphs.close)}
        </span>
      </button>
      <button type="button" className="image-viewer-stage" onClick={onClose} aria-label={commonCopy.cancel}>
        <ImageViewerPreview imageUrl={imageUrl} placeholderLabel={placeholderLabel} />
        {loading && (
          <span className="image-viewer-loading" role="status">
            <span className="image-viewer-spinner" />
          </span>
        )}
      </button>
      <ImageViewerControls
        {...{
          inputRef,
          textValue,
          textSubmitDisabled,
          onTextChange,
          onTextSubmit,
          onReplace,
          onRemove,
          showRemove,
          loading,
        }}
      />
    </dialog>
  );
};
