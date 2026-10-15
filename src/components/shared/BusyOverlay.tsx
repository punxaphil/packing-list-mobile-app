import { useLayoutEffect, useRef, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import { homeColors } from "~/components/home/theme.ts";
import { busyOperation } from "~/services/busyOperation.ts";
import { AppLoadingState } from "./AppLoadingState.tsx";
import "./busyOverlay.css";

export function BusyOverlay() {
  const { t } = useTranslation();
  const { busy, showLoader, details } = useSyncExternalStore(busyOperation.subscribe, busyOperation.getSnapshot);
  const message = t(`operations.${details?.message ?? "saving"}`, { count: details?.total });
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
      aria-label={message}
      aria-busy={busy}
      tabIndex={-1}
      onCancel={(event) => event.preventDefault()}
      onKeyDown={(event) => {
        if (event.key === "Escape") event.preventDefault();
      }}
    >
      {showLoader && (
        <AppLoadingState message={message}>
          {details?.total !== undefined && (
            <div role="status" aria-live="polite" style={{ color: homeColors.muted }}>
              <p>{t("operations.progress", { completed: details.completed ?? 0, total: details.total })}</p>
              <progress value={details.completed ?? 0} max={details.total || 1} aria-label={message} />
            </div>
          )}
        </AppLoadingState>
      )}
    </dialog>
  );
}
