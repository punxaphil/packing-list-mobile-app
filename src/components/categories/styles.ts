import { StyleSheet } from "react-native";
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

export const moveStyles = StyleSheet.create({
  subtitle: {
    fontSize: 14,
    color: homeColors.text,
    marginBottom: homeSpacing.sm,
  },
  itemsList: {
    maxHeight: 120,
    borderWidth: 1,
    borderColor: homeColors.border,
    borderRadius: 8,
    padding: homeSpacing.sm,
    marginBottom: homeSpacing.md,
  },
  itemText: { fontSize: 13, color: homeColors.muted, paddingVertical: 2 },
  sortRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: homeSpacing.sm,
  },
  sortLabel: { fontSize: 14, fontWeight: "600", color: homeColors.text },
  categoryList: { maxHeight: 150, marginBottom: homeSpacing.md },
  categoryItem: {
    padding: homeSpacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: homeColors.border,
    marginBottom: homeSpacing.xs,
  },
  sheetCategoryItem: {
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  categorySelected: {
    borderColor: homeColors.primary,
    borderWidth: 2,
    backgroundColor: homeColors.primaryLight,
  },
  categoryName: { fontSize: 14, color: homeColors.text },
  empty: {
    fontSize: 14,
    color: homeColors.muted,
    textAlign: "center",
    padding: homeSpacing.md,
  },
});
