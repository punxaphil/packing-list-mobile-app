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
  header: { alignItems: "center", gap: spacing.sm },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "400",
    color: colors.muted,
    textAlign: "center",
  },
  highlight: { color: colors.primary, fontWeight: "600" },
  panels: { flex: 1, flexDirection: "column", gap: spacing.lg },
  listContainer: { ...homeCardStyle },
  detailContainer: { ...homeCardStyle },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
  },
  detailHeader: {
    fontSize: 18,
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
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  hint: { fontSize: 14, color: colors.muted, textAlign: "center" },
  empty: { alignItems: "center", paddingVertical: spacing.md },
  emptyText: {
    fontSize: 16,
    color: colors.muted,
    fontWeight: "500",
    textAlign: "center",
  },
  button: { alignSelf: "center", marginTop: spacing.md, width: "100%" },
});
