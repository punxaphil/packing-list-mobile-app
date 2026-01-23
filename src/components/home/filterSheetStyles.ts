import { StyleSheet } from "react-native";
import { homeColors, homeRadius, homeSpacing } from "./theme.ts";

export const filterSheetStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(17,24,39,0.4)", justifyContent: "center", alignItems: "center", padding: homeSpacing.lg },
  sheet: { width: "100%", maxWidth: 400, maxHeight: "70%", backgroundColor: homeColors.surface, borderRadius: homeRadius, padding: homeSpacing.md, gap: homeSpacing.md },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 18, fontWeight: "700", color: homeColors.text },
  clearText: { fontSize: 14, fontWeight: "600", color: homeColors.primary },
  list: { flexGrow: 0 },
  row: { flexDirection: "row", alignItems: "center", gap: homeSpacing.sm, paddingVertical: homeSpacing.sm, borderBottomWidth: 1, borderBottomColor: homeColors.border },
  checkbox: { width: 22, height: 22, borderRadius: 4, borderWidth: 2, borderColor: homeColors.border, alignItems: "center", justifyContent: "center" },
  checkboxSelected: { backgroundColor: homeColors.primary, borderColor: homeColors.primary },
  checkmark: { color: "#fff", fontSize: 14, fontWeight: "700" },
  rowText: { fontSize: 16, color: homeColors.text },
  empty: { fontSize: 14, color: homeColors.muted, textAlign: "center", paddingVertical: homeSpacing.md },
  doneButton: { alignSelf: "flex-end", paddingHorizontal: homeSpacing.md, paddingVertical: homeSpacing.sm, backgroundColor: homeColors.primary, borderRadius: homeRadius / 2 },
  doneText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
