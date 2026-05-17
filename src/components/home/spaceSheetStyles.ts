import { StyleSheet } from "react-native";
import { homeColors, homeSpacing } from "./theme.ts";

const ICON_SIZE_SM = 18;
const ICON_SIZE_MD = 22;
const ROW_RADIUS = 18;
const ROW_PADDING = 14;
const SHEET_RADIUS = 16;
const SHEET_MAX_WIDTH = 400;
const NAME_GAP = 6;
const PRESS_SCALE = 0.985;

export { ICON_SIZE_MD, ICON_SIZE_SM };

export const spaceSheetStyles = StyleSheet.create({
  sheetList: { flex: 1, minHeight: 0 },
  sheetListAndroid: { flexShrink: 1 },
  sheetListContent: { paddingBottom: homeSpacing.sm, gap: homeSpacing.sm },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: NAME_GAP,
    paddingVertical: homeSpacing.xs,
  },
  spaceName: {
    fontSize: 22,
    fontWeight: "700",
    color: homeColors.text,
    flexShrink: 1,
  },
  actions: { gap: homeSpacing.sm },
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
    borderRadius: ROW_RADIUS,
    paddingHorizontal: ROW_PADDING,
    paddingVertical: ROW_PADDING,
  },
  rowPressed: {
    backgroundColor: homeColors.rowPressed,
    transform: [{ scale: PRESS_SCALE }],
  },
  rowLabel: { flex: 1, fontSize: 16, color: homeColors.text },
});

export const androidSheetStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: homeColors.overlayMuted,
    justifyContent: "center",
    alignItems: "center",
    padding: homeSpacing.lg,
  },
  sheet: {
    width: "100%",
    maxWidth: SHEET_MAX_WIDTH,
    maxHeight: "80%",
    backgroundColor: homeColors.surface,
    borderRadius: SHEET_RADIUS,
    padding: homeSpacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: homeSpacing.sm,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: homeColors.text },
});
