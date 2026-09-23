import { useEffect, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

type Entity = { id: string };
type BuildColors<T extends Entity> = (entities: T[]) => Record<string, string>;

const snapshotColors = <T extends Entity>(entities: T[], buildColors: BuildColors<T>) => buildColors([...entities]);

export const useRevisitOrderedColors = <T extends Entity>(
  entities: T[],
  buildColors: BuildColors<T>
) => {
  const entitiesRef = useRef(entities);
  const buildColorsRef = useRef(buildColors);
  const [colors, setColors] = useState(() => snapshotColors(entities, buildColors));

  entitiesRef.current = entities;
  buildColorsRef.current = buildColors;

  useEffect(() => {
    if (entities.length === 0) return;
    const missingIds = entities.filter((entity) => !colors[entity.id]).map((entity) => entity.id);
    if (missingIds.length === 0) return;
    const nextColors = snapshotColors(entities, buildColors);
    setColors((current) => {
      const merged = { ...current };
      missingIds.forEach((id) => {
        merged[id] = nextColors[id];
      });
      return merged;
    });
  }, [entities, buildColors, colors]);

  // Reset colors when screen comes into focus
  useFocusEffect(() => {
    setColors(snapshotColors(entitiesRef.current, buildColorsRef.current));
  });

  return colors;
};
