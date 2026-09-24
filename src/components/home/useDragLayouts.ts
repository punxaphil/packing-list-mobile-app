import { useCallback, useState } from "react";
import type { LayoutRectangle } from "react-native";

export const useDragLayouts = () => {
  const [layouts, setLayouts] = useState<Record<string, LayoutRectangle>>({});
  const [sectionLayouts, setSectionLayouts] = useState<Record<string, LayoutRectangle>>({});
  const [bodyLayouts, setBodyLayouts] = useState<Record<string, LayoutRectangle>>({});

  const recordLayout = useCallback((id: string, layout: LayoutRectangle) => {
    setLayouts((current) => {
      const previous = current[id];
      if (previous && previous.height === layout.height && previous.y === layout.y) return current;
      return { ...current, [id]: layout };
    });
  }, []);

  const recordSectionLayout = useCallback((id: string, layout: LayoutRectangle) => {
    setSectionLayouts((current) => {
      const previous = current[id];
      if (previous && previous.height === layout.height && previous.y === layout.y) return current;
      return { ...current, [id]: layout };
    });
  }, []);

  const recordBodyLayout = useCallback((id: string, layout: LayoutRectangle) => {
    setBodyLayouts((current) => {
      const previous = current[id];
      if (previous && previous.height === layout.height && previous.y === layout.y) return current;
      return { ...current, [id]: layout };
    });
  }, []);

  return { layouts, sectionLayouts, bodyLayouts, recordLayout, recordSectionLayout, recordBodyLayout } as const;
};
