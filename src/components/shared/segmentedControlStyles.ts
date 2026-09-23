import { StyleSheet } from "react-native";
import { homeColors, homeRadius, homeSpacing } from "~/components/home/theme.ts";

export const segmentedControlStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: homeSpacing.xs,
    padding: homeSpacing.xs,
    borderRadius: homeRadius,
    backgroundColor: homeColors.primaryLight,
  },
  segment: {
    flex: 1,
    alignItems: "center",
    paddingVertical: homeSpacing.sm,
    borderRadius: homeRadius,
  },
  segmentSelected: { backgroundColor: homeColors.surface },
  label: { fontSize: 14, color: homeColors.muted },
  labelSelected: { color: homeColors.text, fontWeight: "600" },
});
