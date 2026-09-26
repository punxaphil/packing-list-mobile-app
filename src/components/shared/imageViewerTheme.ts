import type { CSSProperties } from "react";
import { homeColors, homeSpacing } from "../home/theme.ts";

export const viewerTheme = {
  "--viewer-white": homeColors.surface,
  "--viewer-sm": `${homeSpacing.sm}px`,
  "--viewer-md": `${homeSpacing.md}px`,
  "--viewer-lg": `${homeSpacing.lg}px`,
} as CSSProperties;
