import { useEffect, useState } from "react";

type Entity = { id: string };
type BuildColors<T extends Entity> = (entities: T[]) => Record<string, string>;

const snapshotColors = <T extends Entity>(entities: T[], buildColors: BuildColors<T>) => buildColors([...entities]);

export const useRevisitOrderedColors = <T extends Entity>(entities: T[], buildColors: BuildColors<T>) => {
  const [colors, setColors] = useState(() => snapshotColors(entities, buildColors));

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

  return colors;
};
