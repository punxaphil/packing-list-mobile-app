import { type CSSProperties, type PropsWithChildren, useEffect, useRef, useSyncExternalStore } from "react";
import { busyOperation } from "~/services/busyOperation.ts";
import { spaceCopy } from "./spaceCopy.ts";
import { homeColors, homeSpacing } from "./theme.ts";
import "./spaceSheetDialog.css";

type Props = PropsWithChildren<{ visible: boolean; onClose: () => void }>;

export const SpaceSheetDialog = ({ visible, onClose, children }: Props) => {
  const { busy } = useSyncExternalStore(busyOperation.subscribe, busyOperation.getSnapshot);
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (visible && !busy && !dialog.open) dialog.showModal();
    else if ((!visible || busy) && dialog.open) dialog.close();
  }, [visible, busy]);

  return (
    <dialog
      ref={dialogRef}
      className="space-sheet-dialog"
      style={
        {
          backgroundColor: homeColors.surface,
          "--space-overlay": homeColors.overlayMuted,
          "--space-spacing": `${homeSpacing.md}px`,
          "--space-outer": `${homeSpacing.lg}px`,
          "--space-small": `${homeSpacing.sm}px`,
        } as CSSProperties
      }
      aria-label={spaceCopy.spacesTitle}
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
      {children}
    </dialog>
  );
};
