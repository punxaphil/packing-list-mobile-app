import { type CSSProperties, type PropsWithChildren, useEffect, useId, useRef } from "react";
import { homeColors, homeRadius, homeSpacing } from "../home/theme.ts";
import "./dialogShell.css";

export { DialogActions, DialogSingleAction } from "./DialogActions.tsx";

type DialogShellProps = PropsWithChildren<{
  visible: boolean;
  title: string;
  onClose: () => void;
  actions?: React.ReactNode;
  onShow?: () => void;
}>;

const theme = {
  "--dialog-surface": homeColors.surface,
  "--dialog-text": homeColors.text,
  "--dialog-primary": homeColors.primaryStrong,
  "--dialog-border": homeColors.border,
  "--dialog-danger": homeColors.danger,
  "--dialog-overlay": homeColors.overlayMuted,
  "--dialog-radius": `${homeRadius}px`,
  "--dialog-sm": `${homeSpacing.sm}px`,
  "--dialog-xs": `${homeSpacing.xs}px`,
  "--dialog-md": `${homeSpacing.md}px`,
  "--dialog-lg": `${homeSpacing.lg}px`,
} as CSSProperties;

export const DialogShell = ({ visible, title, onClose, children, actions, onShow }: DialogShellProps) => {
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
      className="web-dialog"
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
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="web-dialog-content">
        <div className="web-dialog-scroll">
          <h2 className="web-dialog-title" id={titleId}>
            {title}
          </h2>
          {children}
        </div>
        {actions}
      </div>
    </dialog>
  );
};
