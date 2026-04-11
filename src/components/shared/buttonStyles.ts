import { StyleSheet } from "react-native";
import { homeColors } from "../home/theme.ts";

export const buttonStyles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  centered: { alignSelf: "center" },
  flex: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  disabled: { opacity: 0.4 },
  disabledText: { opacity: 0.6 },
  outlineNeutral: { borderWidth: 1, borderColor: homeColors.border, backgroundColor: homeColors.surface },
  outlineDanger: { borderWidth: 1, borderColor: homeColors.danger, backgroundColor: homeColors.surface },
  filledPrimary: { backgroundColor: homeColors.primaryStrong },
  filledApple: { backgroundColor: "#000", borderRadius: 12 },
  ghost: { backgroundColor: "transparent" },
  text: { fontSize: 16, fontWeight: "600", textAlign: "center" },
  textNeutral: { color: homeColors.text },
  textDanger: { color: homeColors.danger },
  textPrimary: { color: homeColors.primaryForeground },
  textApple: { color: "#fff", fontSize: 18 },
  textGhost: { color: homeColors.muted, fontSize: 14 },
});

export const ICON_COLORS = {
  apple: "#fff",
  ghost: homeColors.muted,
  primary: homeColors.primaryForeground,
  danger: homeColors.danger,
  default: homeColors.text,
} as const;
