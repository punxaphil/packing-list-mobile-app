import { StyleSheet } from "react-native";
import { homeColors, homeSpacing } from "../home/theme.ts";

export const authStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: homeColors.background },
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
    paddingHorizontal: homeSpacing.lg,
    paddingVertical: 32,
    gap: homeSpacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    color: homeColors.text,
    marginBottom: homeSpacing.md,
  },
  error: { color: homeColors.danger, textAlign: "center", fontSize: 14 },
});
