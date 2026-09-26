import type { RefObject } from "react";
import { commonCopy } from "../home/copy.ts";
import { Button } from "./Button.tsx";
import "./imageViewerControls.css";

type ImageViewerControlsProps = {
  inputRef: RefObject<HTMLInputElement | null>;
  textValue?: string;
  textSubmitDisabled: boolean;
  onTextChange?: (value: string) => void;
  onTextSubmit?: () => void;
  onReplace: () => void;
  onRemove: () => void;
  showRemove: boolean;
  loading: boolean;
};

export const ImageViewerControls = ({
  inputRef,
  textValue,
  textSubmitDisabled,
  onTextChange,
  onTextSubmit,
  onReplace,
  onRemove,
  showRemove,
  loading,
}: ImageViewerControlsProps) => (
  <div className="image-viewer-actions">
    {onTextChange && onTextSubmit && (
      <div className="image-viewer-text-row">
        <input
          ref={inputRef}
          className="image-viewer-input"
          value={textValue || ""}
          onChange={(event) => onTextChange(event.target.value)}
          aria-label={commonCopy.emojiOrText}
          disabled={loading}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !textSubmitDisabled && !loading) {
              event.preventDefault();
              onTextSubmit();
            }
          }}
        />
        <Button label={commonCopy.useText} onPress={onTextSubmit} disabled={loading || textSubmitDisabled} />
      </div>
    )}
    <Button flex label={commonCopy.pickImage} onPress={onReplace} disabled={loading} />
    {showRemove && (
      <Button variant="danger" flex label={commonCopy.removeImage} onPress={onRemove} disabled={loading} />
    )}
  </div>
);
