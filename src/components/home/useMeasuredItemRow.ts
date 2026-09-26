import { useEffect, useRef } from "react";
import type { CategoryItemRowProps } from "./itemRowProps.ts";

export const useMeasuredItemRow = (onLayout?: CategoryItemRowProps["onLayout"]) => {
  const rowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = rowRef.current;
    if (!element || !onLayout) return;
    const measure = () => {
      const row = element.getBoundingClientRect();
      const body = element.parentElement?.getBoundingClientRect();
      onLayout({ x: row.x - (body?.x ?? 0), y: row.y - (body?.y ?? 0), width: row.width, height: row.height });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    const parent = element.parentElement;
    if (parent) observer.observe(parent);
    const mutations = new MutationObserver(measure);
    if (parent) mutations.observe(parent, { childList: true });
    measure();
    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, [onLayout]);
  return rowRef;
};
