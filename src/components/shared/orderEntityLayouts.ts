import type { RowLayout } from "../home/itemRowProps.ts";
import { homeSpacing } from "../home/theme.ts";

export const orderEntityLayouts = (
  ids: string[],
  layouts: Record<string, RowLayout>,
  initialY = 0,
  separatorIndices: ReadonlySet<number> = new Set()
) => {
  if (ids.some((id) => !layouts[id])) return layouts;
  let y = initialY;
  return Object.fromEntries(
    ids.map((id, index) => {
      const layout = { ...layouts[id], y };
      y += layout.height + homeSpacing.xs + (separatorIndices.has(index) ? homeSpacing.sm : 0);
      return [id, layout];
    })
  ) as Record<string, RowLayout>;
};
