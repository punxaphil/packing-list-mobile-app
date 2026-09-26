import { DragHandle } from "./ListCardControls.tsx";
import { formatListSummary, ListCardText } from "./ListCardDetails.tsx";
import { listCardTheme } from "./listCardTheme.ts";
import type { PackingListSummary } from "./types.ts";

export const ListCardPreview = ({ list, color }: { list: PackingListSummary; color: string }) => (
  <div className="list-card list-card-preview" style={{ ...listCardTheme, backgroundColor: color }}>
    <div className="list-card-inner">
      <DragHandle />
      <div className="list-card-select">
        <ListCardText list={list} summary={formatListSummary(list)} />
      </div>
      <span className="list-card-menu mdi mdi-dots-vertical" aria-hidden="true" />
    </div>
  </div>
);
