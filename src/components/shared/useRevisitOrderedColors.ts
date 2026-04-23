import { useEffect, useRef, useState } from "react";
import { Navigation } from "react-native-navigation";

type Entity = { id: string };
type BuildColors<T extends Entity> = (entities: T[]) => Record<string, string>;

const snapshotColors = <T extends Entity>(entities: T[], buildColors: BuildColors<T>) => buildColors([...entities]);

export const useRevisitOrderedColors = <T extends Entity>(
  componentId: string,
  entities: T[],
  buildColors: BuildColors<T>
) => {
  const entitiesRef = useRef(entities);
  const buildColorsRef = useRef(buildColors);
  const [colors, setColors] = useState(() => snapshotColors(entities, buildColors));

  entitiesRef.current = entities;
  buildColorsRef.current = buildColors;

  useEffect(() => {
    if (entities.length === 0 || Object.keys(colors).length > 0) return;
    setColors(snapshotColors(entities, buildColors));
  }, [entities, buildColors, colors]);

  useEffect(() => {
    const subscription = Navigation.events().registerComponentWillAppearListener(({ componentId: appearedId }) => {
      if (appearedId !== componentId) return;
      setColors(snapshotColors(entitiesRef.current, buildColorsRef.current));
    });
    return () => subscription.remove();
  }, [componentId]);

  return colors;
};
