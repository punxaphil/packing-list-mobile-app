import type { CSSProperties } from "react";
import { homeColors, homeRadius, homeSpacing } from "../home/theme.ts";

export const authTheme = {
  "--auth-background": homeColors.background,
  "--auth-text": homeColors.text,
  "--auth-danger": homeColors.danger,
  "--auth-muted": homeColors.muted,
  "--auth-primary": homeColors.primaryStrong,
  "--auth-border": homeColors.border,
  "--auth-radius": `${homeRadius}px`,
  "--auth-sm": `${homeSpacing.sm}px`,
  "--auth-md": `${homeSpacing.md}px`,
  "--auth-lg": `${homeSpacing.lg}px`,
} as CSSProperties;
