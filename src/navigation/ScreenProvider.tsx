import type { ReactNode } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ToastProvider } from "~/components/home/Toast";

type ScreenProviderProps = { children: ReactNode };

export function ScreenProvider({ children }: ScreenProviderProps) {
  return (
    <SafeAreaProvider>
      <ToastProvider>{children}</ToastProvider>
    </SafeAreaProvider>
  );
}
