import { useCallback, useRef, useState } from "react";
import { Animated } from "react-native";

const FADE_IN_MS = 300;
const VISIBLE_MS = 800;
const FADE_OUT_MS = 600;

export const useFlashHighlight = () => {
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;

  const flash = useCallback(
    (id: string) => {
      setHighlightId(id);
      opacity.setValue(0);
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: FADE_IN_MS,
          useNativeDriver: true,
        }),
        Animated.delay(VISIBLE_MS),
        Animated.timing(opacity, {
          toValue: 0,
          duration: FADE_OUT_MS,
          useNativeDriver: true,
        }),
      ]).start(() => setHighlightId(null));
    },
    [opacity]
  );

  return { highlightId, highlightOpacity: opacity, flash } as const;
};
