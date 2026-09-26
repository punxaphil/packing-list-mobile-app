import type { CSSProperties } from "react";
import { homeColors } from "./theme.ts";

export const categoryFieldTheme = {
  "--category-text": homeColors.text,
  "--category-muted": homeColors.muted,
  "--category-border": homeColors.border,
  "--category-surface": homeColors.surface,
  "--category-selected": homeColors.primaryLight,
} as CSSProperties;

const DROPDOWN_ROW_HEIGHT = 49;
const DROPDOWN_MAX_SCREEN_RATIO = 0.4;
const DROPDOWN_MARGIN = 8;

export const getPopoverPosition = (button: HTMLButtonElement, count: number) => {
  const { top, bottom, left, width } = button.getBoundingClientRect();
  const maxHeight = Math.min(count * DROPDOWN_ROW_HEIGHT, window.innerHeight * DROPDOWN_MAX_SCREEN_RATIO);
  const below = window.innerHeight - bottom - DROPDOWN_MARGIN;
  const above = top - DROPDOWN_MARGIN;
  const showAbove = below < maxHeight && above > below;
  const height = Math.min(maxHeight, showAbove ? above : below);
  return { top: showAbove ? top - height : bottom, left, width, maxHeight: height };
};
