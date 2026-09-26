import type { ReactNode } from "react";
import { homeColors, homeRadius, homeSpacing } from "./theme.ts";

export const PanelShell = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      display: "flex",
      flex: 1,
      minWidth: 0,
      minHeight: 0,
      flexDirection: "column",
      gap: homeSpacing.md,
      paddingInline: homeSpacing.md,
      borderRadius: homeRadius + homeSpacing.xs,
      backgroundColor: homeColors.surface,
    }}
  >
    {children}
  </div>
);
