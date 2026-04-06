import { StyleSheet } from "react-native";
import { homeColors, homeSpacing } from "./theme.ts";

export const actionMenuStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: homeSpacing.lg },
  menu: { backgroundColor: homeColors.surface, borderRadius: 12, overflow: "hidden" },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: homeSpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: homeColors.border,
  },
  titleText: {
    fontSize: 16,
    fontWeight: "600",
    color: homeColors.muted,
    textAlign: "center",
    flex: 1,
  },
  titleSpacer: { width: 28, alignItems: "center", justifyContent: "center" },
  item: { padding: homeSpacing.md, borderBottomWidth: 1, borderBottomColor: homeColors.border },
  itemRow: { flexDirection: "row", alignItems: "center" },
  itemSpacer: { width: 28, alignItems: "center", justifyContent: "center" },
  itemText: { fontSize: 16, color: homeColors.text, textAlign: "center", flex: 1 },
  destructive: { color: homeColors.danger },
  disabled: { color: homeColors.muted },
  cancelItem: { padding: homeSpacing.md, backgroundColor: homeColors.background },
  cancelText: { fontSize: 16, fontWeight: "600", color: homeColors.muted, textAlign: "center" },
});
