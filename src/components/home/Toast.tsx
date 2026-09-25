import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Animated, Text } from "react-native";
import { animateToast, TOAST_STYLES } from "./toastUtils.ts";

type ToastContextValue = { show: (message: string) => void };
const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("ToastProvider is required");
  return context;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [message, setMessage] = useState<string | null>(null);
  const [opacity] = useState(() => new Animated.Value(0));
  const animation = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => () => animation.current?.stop(), []);

  const show = useCallback(
    (text: string) => {
      animation.current?.stop();
      opacity.setValue(0);
      setMessage(text);
      animation.current = animateToast(opacity, () => setMessage(null));
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
