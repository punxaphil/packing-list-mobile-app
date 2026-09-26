import { useSyncExternalStore } from "react";

const subscribe = (onResize: () => void) => {
  window.addEventListener("resize", onResize);
  return () => window.removeEventListener("resize", onResize);
};

export const useViewportWidth = () =>
  useSyncExternalStore(
    subscribe,
    () => window.innerWidth,
    () => 0
  );
