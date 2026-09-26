import type { CSSProperties } from "react";
import { homeColors, homeSpacing } from "./theme.ts";

export const actionMenuTheme = {
  "--action-menu-surface": homeColors.surface,
  "--action-menu-background": homeColors.background,
  "--action-menu-border": homeColors.border,
  "--action-menu-text": homeColors.text,
  "--action-menu-muted": homeColors.muted,
  "--action-menu-danger": homeColors.danger,
  "--action-menu-overlay": homeColors.overlayDark,
  "--action-menu-sm": `${homeSpacing.sm}px`,
  "--action-menu-md": `${homeSpacing.md}px`,
  "--action-menu-lg": `${homeSpacing.lg}px`,
} as CSSProperties;
