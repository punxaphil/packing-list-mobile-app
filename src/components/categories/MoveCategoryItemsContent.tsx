import type { NamedEntity } from "~/types/NamedEntity.ts";
import type { PackItem } from "~/types/PackItem.ts";
import { commonCopy } from "../home/copy.ts";
import { DialogActions } from "../shared/DialogShell.tsx";
import { MOVE_COPY } from "./styles.ts";

type MoveCategoryContentProps = {
  sourceName: string;
  items: PackItem[];
  targets: NamedEntity[];
  selectedId: string | null;
  sortByAlpha: boolean;
  onSort: () => void;
  onSelect: (id: string) => void;
};

export const MoveCategoryContent = (props: MoveCategoryContentProps) => {
  const { sourceName, items, targets, selectedId, sortByAlpha, onSort, onSelect } = props;
  return (
    <>
      <p className="move-category-subtitle">
        {MOVE_COPY.subtitle.replace("{name}", sourceName).replace("{count}", String(items.length))}
      </p>
      <div className="move-category-items">
        {items.map((item) => (
          <div className="move-category-item" key={item.id}>
            • {item.name}
          </div>
        ))}
      </div>
      <div className="move-category-sort">
        <span className="move-category-sort-title">{MOVE_COPY.selectTarget}</span>
        <label className="move-category-sort-control">
          <span>{sortByAlpha ? "A-Z" : commonCopy.rank}</span>
          <input type="checkbox" checked={sortByAlpha} onChange={onSort} />
        </label>
      </div>
      <div className="move-category-targets">
        {targets.map((category) => (
          <button
            type="button"
            key={category.id}
            className="move-category-target"
            aria-pressed={selectedId === category.id}
            onClick={() => onSelect(category.id)}
          >
            {category.name}
          </button>
        ))}
        {targets.length === 0 && <p className="move-category-empty">{MOVE_COPY.noCategories}</p>}
      </div>
    </>
  );
};

type MoveCategoryActionsProps = {
  selectedId: string | null;
  targets: NamedEntity[];
  onMove: () => void;
  onClose: () => void;
};

export const MoveCategoryActions = ({ selectedId, targets, onMove, onClose }: MoveCategoryActionsProps) => {
  const targetName = targets.find((category) => category.id === selectedId)?.name;
  const confirmLabel = selectedId ? MOVE_COPY.moveTo.replace("{name}", targetName ?? "") : MOVE_COPY.selectCategory;
  return (
    <DialogActions
      cancelLabel={MOVE_COPY.cancel}
      confirmLabel={confirmLabel}
      onCancel={onClose}
      onConfirm={onMove}
      disabled={!selectedId}
    />
  );
};
