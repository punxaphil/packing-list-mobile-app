import type { ComponentType } from "react";
import { AndroidActionSheetHost } from "~/components/home/AndroidActionSheetHost.tsx";
import { ScreenProvider } from "./ScreenProvider";

export function withProviders<P extends object>(Component: ComponentType<P>) {
  return function WrappedScreen(props: P) {
    return (
      <ScreenProvider>
        <Component {...props} />
        <AndroidActionSheetHost />
      </ScreenProvider>
    );
  };
}
