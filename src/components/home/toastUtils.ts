import { Animated, StyleSheet } from "react-native";
import { homeColors, homeSpacing } from "./theme.ts";

const TOAST_ANIMATION_DURATION = 200;
const TOAST_DISPLAY_DURATION = 2000;
const TOAST_BOTTOM_POSITION = 100;
const TOAST_BORDER_RADIUS = 8;

export const TOAST_STYLES = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: TOAST_BOTTOM_POSITION,
    left: homeSpacing.lg,
    right: homeSpacing.lg,
    backgroundColor: homeColors.text,
    borderRadius: TOAST_BORDER_RADIUS,
    padding: homeSpacing.md,
    alignItems: "center",
  },
  text: {
    color: homeColors.surface,
    fontSize: 14,
    textAlign: "center",
  },
});

export const animateToast = (opacity: Animated.Value, onComplete: () => void) => {
  Animated.sequence([
    Animated.timing(opacity, {
      toValue: 1,
      duration: TOAST_ANIMATION_DURATION,
      useNativeDriver: true,
    }),
    Animated.delay(TOAST_DISPLAY_DURATION),
    Animated.timing(opacity, {
      toValue: 0,
      duration: TOAST_ANIMATION_DURATION,
      useNativeDriver: true,
    }),
  ]).start(onComplete);
};
