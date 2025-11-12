import { StyleSheet } from "react-native";
import {
  homeCardStyle,
  homeColors,
  homeMaxWidth,
  homeRadius,
  homeSpacing,
} from "./theme.ts";
import { homeCopy } from "./copy.ts";

const colors = homeColors;
const spacing = homeSpacing;
const maxWidth = homeMaxWidth;

export const HOME_COPY = homeCopy;

export const homeStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  loadingText: { fontSize: 16, color: colors.muted, fontWeight: "500" },
  home: {
    flex: 1,
    alignSelf: "center",
    maxWidth,
    width: "100%",
    gap: spacing.lg,
  },
  panel: { ...homeCardStyle, gap: spacing.md },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  panelTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  backButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    minWidth: spacing.lg * 3,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  backPlaceholder: {
    width: spacing.lg * 3,
    height: spacing.lg,
  },
  backText: { color: colors.primary, fontWeight: "600" },
  avatar: {
    width: spacing.lg,
    height: spacing.lg,
    borderRadius: spacing.lg / 2,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLabel: { color: "#ffffff", fontWeight: "700" },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
  },
  list: { gap: spacing.xs },
  listItem: {
    fontSize: 16,
    color: colors.text,
    paddingVertical: spacing.xs,
  },
  activeItem: {
    backgroundColor: colors.primary,
    borderRadius: homeRadius / 2,
    color: "#ffffff",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  detailItem: {
    fontSize: 16,
    color: colors.text,
    paddingVertical: spacing.xs,
  },
  empty: { alignItems: "center", paddingVertical: spacing.md },
  emptyText: {
    fontSize: 16,
    color: colors.muted,
    fontWeight: "500",
    textAlign: "center",
  },
  swipeAction: { width: spacing.lg * 3 },
});
