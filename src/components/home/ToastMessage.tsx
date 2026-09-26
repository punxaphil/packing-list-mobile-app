import type { CSSProperties } from "react";
import { homeColors, homeSpacing } from "./theme.ts";
import "./toastMessage.css";

type ToastMessageProps = {
  toast: { id: number; message: string; displayDuration: number };
  onDone: (id: number) => void;
};

export const ToastMessage = ({ toast, onDone }: ToastMessageProps) => (
  <div
    role="status"
    className="app-toast"
    style={
      {
        "--toast-display-duration": `${toast.displayDuration}ms`,
        backgroundColor: homeColors.text,
        color: homeColors.surface,
        left: homeSpacing.lg,
        right: homeSpacing.lg,
        padding: homeSpacing.md,
      } as CSSProperties
    }
    onAnimationEnd={(event) => {
      if (event.animationName === "toast-exit") onDone(toast.id);
    }}
  >
    {toast.message}
  </div>
);
