import { createContext, useCallback, useContext, useState } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { homeColors, homeSpacing } from "./theme.ts";

type ToastContextValue = { show: (message: string) => void };
const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context.show;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [message, setMessage] = useState<string | null>(null);
  const [opacity] = useState(() => new Animated.Value(0));

  const show = useCallback(
    (text: string) => {
      setMessage(text);
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(2000),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => setMessage(null));
    },
    [opacity]
  );

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {message && (
        <Animated.View style={[styles.container, { opacity }]}>
          <Text style={styles.text}>{message}</Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 100,
    left: homeSpacing.lg,
    right: homeSpacing.lg,
    backgroundColor: homeColors.text,
    borderRadius: 8,
    padding: homeSpacing.md,
    alignItems: "center",
  },
  text: { color: homeColors.surface, fontSize: 14, textAlign: "center" },
});
