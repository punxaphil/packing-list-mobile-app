import type { CSSProperties } from "react";
import { homeColors, homeSpacing } from "../home/theme.ts";

export const viewerTheme = {
  "--viewer-white": homeColors.surface,
  "--viewer-backdrop": "rgba(0, 0, 0, 0.9)",
  "--viewer-loading": "rgba(0, 0, 0, 0.28)",
  "--viewer-placeholder": "rgba(255, 255, 255, 0.2)",
  "--viewer-input-border": "rgba(255, 255, 255, 0.5)",
  "--viewer-input-background": "rgba(255, 255, 255, 0.12)",
  "--viewer-sm": `${homeSpacing.sm}px`,
  "--viewer-md": `${homeSpacing.md}px`,
  "--viewer-lg": `${homeSpacing.lg}px`,
} as CSSProperties;
