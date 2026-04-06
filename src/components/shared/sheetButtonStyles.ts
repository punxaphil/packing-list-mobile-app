import { StyleSheet } from "react-native";
import { homeColors } from "../home/theme.ts";

export const sheetButtonStyles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  centered: { alignSelf: "center" },
  filledSoft: { backgroundColor: "rgba(255,255,255,0.82)" },
  filledPrimary: { backgroundColor: homeColors.primaryStrong },
  outlineNeutral: { borderWidth: 1, borderColor: homeColors.border, backgroundColor: homeColors.surface },
  outlineDanger: { borderWidth: 1, borderColor: homeColors.danger, backgroundColor: homeColors.surface },
  text: { fontSize: 14, fontWeight: "600", color: homeColors.muted, textAlign: "center" },
  textPrimary: { fontSize: 16, fontWeight: "600", color: homeColors.primaryForeground, textAlign: "center" },
  textNeutral: { fontSize: 16, fontWeight: "600", color: homeColors.text, textAlign: "center" },
  textDanger: { fontSize: 16, fontWeight: "600", color: homeColors.danger, textAlign: "center" },
});
