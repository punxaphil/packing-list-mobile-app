import type { CSSProperties } from "react";
import { homeColors, homeRadius, homeSpacing } from "./theme.ts";

export const listCardTheme = {
  "--list-border": homeColors.border,
  "--list-selected": homeColors.primaryStrong,
  "--list-muted": homeColors.muted,
  "--list-text": homeColors.text,
  "--list-surface": homeColors.surface,
  "--list-image-placeholder": homeColors.overlayMuted,
  "--list-template": homeColors.templateBadge,
  "--list-radius": `${homeRadius}px`,
  "--list-sm": `${homeSpacing.sm}px`,
  "--list-md": `${homeSpacing.md}px`,
  "--list-xs": `${homeSpacing.xs}px`,
} as CSSProperties;
