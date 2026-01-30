import { useEffect, useRef } from "react";
import { Animated, Keyboard, Platform } from "react-native";

const ANIMATION_DURATION = 250;

export const useKeyboardOffset = () => {
  const offset = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, (e) => {
      Animated.timing(offset, {
        toValue: -e.endCoordinates.height / 2,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }).start();
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      Animated.timing(offset, { toValue: 0, duration: ANIMATION_DURATION, useNativeDriver: true }).start();
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [offset]);
  return offset;
};
