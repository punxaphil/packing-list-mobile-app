import { StyleSheet } from "react-native";
import { homeColors, homeSpacing } from "../home/theme.ts";

export const entityStyles = StyleSheet.create({
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
  imageContainer: { width: 32, height: 32, alignItems: "center", justifyContent: "center", borderRadius: 16 },
  imagePlaceholder: { borderWidth: 1, borderColor: homeColors.border, borderStyle: "dashed" },
  image: { width: 32, height: 32, borderRadius: 16 },
  uploadIcon: { fontSize: 16, color: homeColors.muted },
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

export type EntityCopy = {
  header: string;
  addButton: string;
  createPrompt: string;
  createConfirm: string;
  createPlaceholder: string;
  delete: string;
  deleteIcon: string;
  deleteConfirmTitle: string;
  deleteConfirmMessage: string;
  deleteBlockedTitle: string;
  deleteBlockedMessage: string;
  cancel: string;
  deleteAction: string;
  moveItems: string;
  imageTitle: string;
  imageReplace: string;
  imageRemove: string;
};

export const CATEGORY_COPY: EntityCopy = {
  header: "Categories",
  addButton: "+ Add Category",
  createPrompt: "New Category",
  createConfirm: "Create",
  createPlaceholder: "Category name",
  delete: "Delete category",
  deleteIcon: "×",
  deleteConfirmTitle: "Delete Category",
  deleteConfirmMessage: 'Delete "{name}"?',
  deleteBlockedTitle: "Has Items",
  deleteBlockedMessage: '"{name}" has {count} items. Move them first?',
  cancel: "Cancel",
  deleteAction: "Delete",
  moveItems: "Move Items",
  imageTitle: "Category Image",
  imageReplace: "Replace Image",
  imageRemove: "Remove Image",
};

export const MEMBER_COPY: EntityCopy = {
  header: "Members",
  addButton: "+ Add Member",
  createPrompt: "New Member",
  createConfirm: "Create",
  createPlaceholder: "Member name",
  delete: "Delete member",
  deleteIcon: "×",
  deleteConfirmTitle: "Delete Member",
  deleteConfirmMessage: 'Delete "{name}"?',
  deleteBlockedTitle: "Has Items",
  deleteBlockedMessage: '"{name}" has {count} items. Move them first?',
  cancel: "Cancel",
  deleteAction: "Delete",
  moveItems: "Move Items",
  imageTitle: "Member Image",
  imageReplace: "Replace Image",
  imageRemove: "Remove Image",
};
