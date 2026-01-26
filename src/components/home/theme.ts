export const homeColors = {
  background: "#f5f5f5",
  surface: "#ffffff",
  primary: "#2563eb",
  primaryLight: "#dbeafe",
  text: "#111827",
  muted: "#6b7280",
  border: "#e5e7eb",
  buttonText: "#ffffff",
  cardBg: "#ffffff",
  danger: "#dc2626",
} as const;

export const homeSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
} as const;

export const homeRadius = 12;
export const homeMaxWidth = 480;
export const TAB_BAR_HEIGHT = 90;

export const homeEmptyStateCopy = "No packing lists yet.";

export const homeCardStyle = {
  backgroundColor: homeColors.surface,
  borderColor: homeColors.border,
  borderRadius: homeRadius,
  borderWidth: 1,
  padding: homeSpacing.md,
  gap: homeSpacing.sm,
} as const;

export type HomeTheme = {
  colors: typeof homeColors;
  spacing: typeof homeSpacing;
  radius: number;
  maxWidth: number;
  emptyStateCopy: string;
  card: typeof homeCardStyle;
};

export const homeTheme: HomeTheme = {
  colors: homeColors,
  spacing: homeSpacing,
  radius: homeRadius,
  maxWidth: homeMaxWidth,
  emptyStateCopy: homeEmptyStateCopy,
  card: homeCardStyle,
};
