import { listCopy } from "./listCopy.ts";
import { HOME_COPY } from "./styles.ts";
import type { PackingListSummary } from "./types.ts";
import "./listCardDetails.css";

export const formatListSummary = (list: PackingListSummary) => {
  const total = Number.isFinite(list.itemCount) ? (list.itemCount ?? 0) : 0;
  const packed = Number.isFinite(list.packedCount) ? (list.packedCount ?? 0) : 0;
  if (!total) return HOME_COPY.listNoItems;
  if (list.isTemplate) return `${total} ${total === 1 ? HOME_COPY.itemSingular : HOME_COPY.itemPlural}`;
  const itemsLabel = total === 1 ? HOME_COPY.itemSingular : HOME_COPY.itemPlural;
  const packedLabel = packed === 1 ? HOME_COPY.packedSingular : HOME_COPY.packedPlural;
  return `${total} ${itemsLabel} (${packed} ${packedLabel})`;
};

export const ListCardText = ({ list, summary }: { list: PackingListSummary; summary: string }) => (
  <div className="list-card-text">
    <div className="list-card-name-row">
      <span className="list-card-name">{list.name}</span>
      {list.isTemplate && <span className="list-card-template">{listCopy.template}</span>}
      {list.archived && <span className="list-card-archived">{listCopy.archivedSingular}</span>}
    </div>
    <span className="list-card-summary">{summary}</span>
  </div>
);
