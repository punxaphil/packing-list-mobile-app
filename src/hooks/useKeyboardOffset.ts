import { useEffect, useRef } from "react";
import { Animated, Keyboard, Platform } from "react-native";

const ANIMATION_DURATION = 250;

export const useKeyboardOffset = () => {
  const offset = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (Platform.OS !== "ios") return;
    const showSub = Keyboard.addListener("keyboardWillShow", (e) => {
      Animated.timing(offset, {
        toValue: -e.endCoordinates.height / 2,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }).start();
    });
    const hideSub = Keyboard.addListener("keyboardWillHide", () => {
      Animated.timing(offset, { toValue: 0, duration: ANIMATION_DURATION, useNativeDriver: true }).start();
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [offset]);
  return offset;
};
