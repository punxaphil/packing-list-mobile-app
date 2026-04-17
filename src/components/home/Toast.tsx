import { createContext, useCallback, useState } from "react";
import { Animated, Text } from "react-native";
import { animateToast, TOAST_STYLES } from "./toastUtils.ts";

type ToastContextValue = { show: (message: string) => void };
const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [message, setMessage] = useState<string | null>(null);
  const [opacity] = useState(() => new Animated.Value(0));

  const show = useCallback(
    (text: string) => {
      setMessage(text);
      animateToast(opacity, () => setMessage(null));
    },
    [opacity]
  );

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {message && (
        <Animated.View style={[TOAST_STYLES.container, { opacity }]}>
          <Text style={TOAST_STYLES.text}>{message}</Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};
