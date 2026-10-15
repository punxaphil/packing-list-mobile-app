import i18next from "i18next";
import { useLayoutEffect, useRef, useSyncExternalStore } from "react";
import { busyOperation } from "~/services/busyOperation.ts";
import { AppLoadingState } from "./AppLoadingState.tsx";
import "./busyOverlay.css";

export function BusyOverlay() {
  const { busy, showLoader } = useSyncExternalStore(busyOperation.subscribe, busyOperation.getSnapshot);
  const dialogRef = useRef<HTMLDialogElement>(null);
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (busy && !dialog?.open) dialog?.showModal();
    else if (!busy && dialog?.open) dialog.close();
    return () => dialog?.close();
  }, [busy]);
  return (
    <dialog
      ref={dialogRef}
      className="busy-overlay"
      closedby="none"
      aria-label={i18next.t("home.loading")}
      aria-busy={busy}
      tabIndex={-1}
      onCancel={(event) => event.preventDefault()}
      onKeyDown={(event) => {
        if (event.key === "Escape") event.preventDefault();
      }}
    >
      {showLoader && <AppLoadingState />}
    </dialog>
  );
}
