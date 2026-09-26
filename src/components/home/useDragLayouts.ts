import { useCallback, useState } from "react";
import type { RowLayout } from "./itemRowProps.ts";

export const useDragLayouts = () => {
  const [layouts, setLayouts] = useState<Record<string, RowLayout>>({});
  const [sectionLayouts, setSectionLayouts] = useState<Record<string, RowLayout>>({});
  const [bodyLayouts, setBodyLayouts] = useState<Record<string, RowLayout>>({});

  const recordLayout = useCallback((id: string, layout: RowLayout) => {
    setLayouts((current) => {
      const previous = current[id];
      if (previous && previous.height === layout.height && previous.y === layout.y) return current;
      return { ...current, [id]: layout };
    });
  }, []);

  const recordSectionLayout = useCallback((id: string, layout: RowLayout) => {
    setSectionLayouts((current) => {
      const previous = current[id];
      if (previous && previous.height === layout.height && previous.y === layout.y) return current;
      return { ...current, [id]: layout };
    });
  }, []);

  const recordBodyLayout = useCallback((id: string, layout: RowLayout) => {
    setBodyLayouts((current) => {
      const previous = current[id];
      if (previous && previous.height === layout.height && previous.y === layout.y) return current;
      return { ...current, [id]: layout };
    });
  }, []);

  return { layouts, sectionLayouts, bodyLayouts, recordLayout, recordSectionLayout, recordBodyLayout } as const;
};
