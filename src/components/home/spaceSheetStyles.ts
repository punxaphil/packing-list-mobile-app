import { StyleSheet } from "react-native";
import { homeColors, homeSpacing } from "./theme.ts";

export const spaceSheetStyles = StyleSheet.create({
  sheetList: { flex: 1, minHeight: 0 },
  sheetListContent: { paddingBottom: homeSpacing.sm, gap: homeSpacing.sm },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: homeSpacing.xs,
  },
  spaceName: { fontSize: 22, fontWeight: "700", color: homeColors.text, flex: 1 },
  actions: { gap: homeSpacing.sm },
  buttonRow: { flexDirection: "row", gap: homeSpacing.sm },
  actionButton: { flexDirection: "row", gap: homeSpacing.xs, flex: 1 },
  disabled: { opacity: 0.4 },
  disabledText: { opacity: 0.6 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: homeColors.muted,
    marginTop: homeSpacing.xs,
    marginBottom: homeSpacing.xs,
  },
  rowMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: homeSpacing.sm,
    backgroundColor: homeColors.rowBg,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  rowPressed: {
    backgroundColor: homeColors.rowPressed,
    transform: [{ scale: 0.985 }],
  },
  rowLabel: { flex: 1, fontSize: 16, color: homeColors.text },
});
