import { useCallback, useEffect, useRef, useState } from "react";

const FADE_IN_MS = 300;
const VISIBLE_MS = 800;
const FADE_OUT_MS = 600;

export const useFlashHighlight = () => {
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const flash = useCallback((id: string) => {
    if (timer.current) clearTimeout(timer.current);
    setHighlightId(id);
    timer.current = setTimeout(() => setHighlightId(null), FADE_IN_MS + VISIBLE_MS + FADE_OUT_MS);
  }, []);

  return { highlightId, highlightOpacity: true, flash } as const;
};
