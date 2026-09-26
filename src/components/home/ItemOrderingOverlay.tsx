import type { PackItem } from "~/types/PackItem.ts";
import { DragHandle } from "./CategoryItemRow.tsx";
import type { RowLayout } from "./itemRowProps.ts";
import { homeColors, homeRadius, homeSpacing } from "./theme.ts";
import type { DragSnapshot } from "./useDragState.ts";
import "./itemOrderingOverlay.css";

type GhostRowProps = {
  items: PackItem[];
  drag: DragSnapshot;
  layouts: Record<string, RowLayout>;
};

export const GhostRow = ({ items, drag, layouts }: GhostRowProps) => {
  if (!drag) return null;
  const layout = layouts[drag.id];
  const item = items.find((candidate) => candidate.id === drag.id);
  if (!layout || !item) return null;
  return (
    <div
      className="item-ordering-ghost"
      style={{
        top: drag.frozenY ?? layout.y,
        height: layout.height,
        transform: drag.frozenY == null ? `translateY(${drag.offsetY}px)` : undefined,
        backgroundColor: homeColors.surface,
        borderRadius: homeRadius / 2,
        left: homeSpacing.xs,
        right: homeSpacing.xs,
      }}
    >
      <DragHandle />
      <span className="item-ordering-checkbox" style={{ borderColor: homeColors.border }} />
      <span className="item-ordering-name" style={{ color: homeColors.text }}>
        {item.name}
      </span>
    </div>
  );
};

type DropIndicatorProps = {
  targetId: string | null;
  layouts: Record<string, RowLayout>;
  below: boolean;
};

export const DropIndicator = ({ targetId, layouts, below }: DropIndicatorProps) => {
  if (!targetId) return null;
  const layout = layouts[targetId];
  if (!layout) return null;
  return (
    <div
      className="item-ordering-indicator"
      style={{ top: below ? layout.y + layout.height - 2 : layout.y - 2, backgroundColor: homeColors.dropIndicator }}
    />
  );
};
