import { type CSSProperties, type PropsWithChildren, type RefObject, useEffect, useId, useRef } from "react";
import "@mdi/font/css/materialdesignicons.css";
import { commonCopy } from "../home/copy.ts";
import { homeColors, homeSpacing } from "../home/theme.ts";
import "./pageSheet.css";

type PageSheetProps = PropsWithChildren<{
  visible: boolean;
  title: string;
  onClose: () => void;
  scrollViewRef?: RefObject<HTMLDivElement | null>;
  onShow?: () => void;
}>;

const theme = {
  "--sheet-background": homeColors.primaryLight,
  "--sheet-surface": homeColors.surface,
  "--sheet-text": homeColors.text,
  "--sheet-border": homeColors.border,
  "--sheet-overlay": homeColors.overlayMuted,
  "--sheet-md": `${homeSpacing.md}px`,
  "--sheet-lg": `${homeSpacing.lg}px`,
  "--sheet-sm": `${homeSpacing.sm}px`,
  "--sheet-xs": `${homeSpacing.xs}px`,
} as CSSProperties;

export const PageSheet = ({ visible, title, onClose, scrollViewRef, onShow, children }: PageSheetProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (visible && !dialog.open) {
      dialog.showModal();
      onShow?.();
    } else if (!visible && dialog.open) dialog.close();
  }, [visible, onShow]);

  return (
    <dialog
      ref={dialogRef}
      className="page-sheet"
      style={theme}
      aria-labelledby={titleId}
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
      <header className="page-sheet-header">
        <button type="button" className="page-sheet-close" onClick={onClose} aria-label={commonCopy.cancel}>
          <span className="mdi mdi-close" aria-hidden="true" />
        </button>
        <h2 id={titleId}>{title}</h2>
        <span className="page-sheet-spacer" />
      </header>
      <div className="page-sheet-scroll" ref={scrollViewRef}>
        <div className="page-sheet-content">{children}</div>
      </div>
    </dialog>
  );
};
