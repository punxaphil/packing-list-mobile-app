import i18next from "i18next";
import type { CSSProperties } from "react";
import { commonCopy } from "../home/copy.ts";
import { homeColors } from "../home/theme.ts";
import { MultiEditButton } from "./MultiEditButton.tsx";
import "./entityHeader.css";

type Props = {
  addLabel: string;
  bulkEditLabel: string;
  onAdd: () => void;
  onBulkEdit: () => void;
  bulkEditing: boolean;
  sortByAlpha: boolean;
  onToggleSort: () => void;
};

export const EntityHeader = ({
  addLabel,
  bulkEditLabel,
  onAdd,
  onBulkEdit,
  bulkEditing,
  sortByAlpha,
  onToggleSort,
}: Props) => (
  <div className="entity-actions" style={{ color: homeColors.muted }}>
    <button className="entity-actions-add" type="button" onClick={onAdd}>
      {addLabel}
    </button>
    <span className="entity-actions-spacer" />
    <MultiEditButton label={bulkEditLabel} onPress={onBulkEdit} disabled={bulkEditing} />
    <label className="entity-sort">
      <span>{sortByAlpha ? "A-Z" : commonCopy.rank}</span>
      <input
        className="entity-sort-switch"
        type="checkbox"
        role="switch"
        checked={sortByAlpha}
        aria-checked={sortByAlpha}
        onChange={onToggleSort}
        aria-label={i18next.t("common.sortAlphabetically")}
        style={
          {
            "--entity-sort-active": homeColors.primary,
            "--entity-sort-inactive": homeColors.border,
            "--entity-sort-thumb": homeColors.surface,
          } as CSSProperties
        }
      />
    </label>
  </div>
);
