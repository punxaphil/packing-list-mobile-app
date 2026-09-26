import type { CSSProperties } from "react";
import { translatedCopy } from "~/i18n/translatedCopy.ts";
import { homeColors, homeSpacing } from "../home/theme.ts";

type MoveCopy = {
  title: string;
  subtitle: string;
  subtitleAll: string;
  noItems: string;
  selectTarget: string;
  noCategories: string;
  selectCategory: string;
  moveTo: string;
  cancel: string;
  close: string;
};

export const MOVE_COPY = translatedCopy<MoveCopy>("move");

export const moveTheme = {
  "--move-text": homeColors.text,
  "--move-muted": homeColors.muted,
  "--move-border": homeColors.border,
  "--move-selected": homeColors.primaryLight,
  "--move-primary": homeColors.primaryStrong,
  "--move-sm": `${homeSpacing.sm}px`,
  "--move-md": `${homeSpacing.md}px`,
  "--move-xs": `${homeSpacing.xs}px`,
} as CSSProperties;
