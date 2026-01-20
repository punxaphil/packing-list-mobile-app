import { StyleSheet } from "react-native";
import { homeColors, homeSpacing } from "../home/theme.ts";

export const CATEGORY_COPY = {
  header: "Categories",
  createCategory: "+ Add Category",
  createPrompt: "New Category",
  createConfirm: "Create",
  createPlaceholder: "Category name",
  delete: "Delete category",
  deleteIcon: "×",
  deleteConfirmTitle: "Delete Category",
  deleteConfirmMessage: 'Delete "{name}"? Items using this category will become uncategorized.',
  cancel: "Cancel",
  deleteAction: "Delete",
};

export const categoryStyles = StyleSheet.create({
  container: { flex: 1 },
  panel: { flex: 1, backgroundColor: homeColors.surface, borderRadius: 16, padding: homeSpacing.md, gap: homeSpacing.md },
  actions: { flexDirection: "row", alignItems: "center", gap: homeSpacing.sm },
  sortToggle: { flexDirection: "row", alignItems: "center", gap: homeSpacing.xs },
  sortLabel: { fontSize: 12, color: homeColors.muted },
  spacer: { flex: 1 },
  actionButton: { backgroundColor: homeColors.primary, paddingHorizontal: homeSpacing.md, paddingVertical: homeSpacing.sm, borderRadius: 8 },
  actionLabel: { color: homeColors.buttonText, fontSize: 14, fontWeight: "600" },
  scroll: { flex: 1 },
  list: { gap: homeSpacing.sm },
  card: { backgroundColor: homeColors.cardBg, borderRadius: 12, padding: homeSpacing.md, borderWidth: 1, borderColor: homeColors.border },
  cardInner: { flexDirection: "row", alignItems: "center", gap: homeSpacing.sm },
  cardBody: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: "600", color: homeColors.text },
  itemCount: { fontSize: 14, color: homeColors.muted, marginRight: homeSpacing.xs },
  dragHandle: { paddingVertical: homeSpacing.xs, paddingHorizontal: homeSpacing.xs, alignItems: "center", justifyContent: "center" },
  dragHandleIcon: { fontSize: 20, color: homeColors.muted },
  dragHandleDisabled: { color: "#d3d3d3" },
  deleteButton: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  deleteIcon: { fontSize: 20, color: homeColors.danger, fontWeight: "bold" },
  relative: { position: "relative" as const },
  ghost: { position: "absolute" as const, zIndex: 10, elevation: 5, opacity: 0.85 },
  indicator: { position: "absolute" as const, left: -12, right: -12, height: 2, backgroundColor: "#000000", borderRadius: 1, zIndex: 15 },
});
