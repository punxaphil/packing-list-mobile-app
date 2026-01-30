import type { ComponentType } from "react";
import { ScreenProvider } from "./ScreenProvider";

export function withProviders<P extends object>(Component: ComponentType<P>) {
  return function WrappedScreen(props: P) {
    return (
      <ScreenProvider>
        <Component {...props} />
      </ScreenProvider>
    );
  };
}
