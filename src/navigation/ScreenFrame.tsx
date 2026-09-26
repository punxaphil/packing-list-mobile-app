import type { ReactNode } from "react";
import { homeSpacing } from "~/components/home/theme.ts";

export const ScreenFrame = ({ children, top = false }: { children: ReactNode; top?: boolean }) => (
  <div
    style={{
      display: "flex",
      flex: 1,
      flexDirection: "column",
      width: "100%",
      minHeight: 0,
      gap: homeSpacing.sm,
      paddingTop: top ? "env(safe-area-inset-top)" : undefined,
    }}
  >
    {children}
  </div>
);
