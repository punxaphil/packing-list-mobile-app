import type { ReactNode } from "react";
import { ToastProvider } from "~/components/home/Toast";

type ScreenProviderProps = { children: ReactNode };

export function ScreenProvider({ children }: ScreenProviderProps) {
  return <ToastProvider>{children}</ToastProvider>;
}
