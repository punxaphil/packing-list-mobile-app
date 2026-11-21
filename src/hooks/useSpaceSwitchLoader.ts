import { useEffect, useRef, useState } from "react";

const SPACE_SWITCH_DELAY_MS = 500;

export function useSpaceSwitchLoader(spaceId: string, loading: boolean) {
  const previousSpace = useRef(spaceId);
  const [visibleFor, setVisibleFor] = useState<string>();

  useEffect(() => {
    const switched = previousSpace.current !== spaceId;
    previousSpace.current = spaceId;
    setVisibleFor(undefined);
    if (!switched || !loading) return;

    const timer = setTimeout(() => setVisibleFor(spaceId), SPACE_SWITCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [spaceId, loading]);

  return loading && visibleFor === spaceId;
}
