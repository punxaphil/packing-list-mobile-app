import type { CSSProperties } from "react";
import { MultiEditButton } from "../shared/MultiEditButton.tsx";
import { homeCopy } from "./copy.ts";
import { listCopy } from "./listCopy.ts";
import { homeColors, homeSpacing } from "./theme.ts";
import "./listHeader.css";

type Props = {
  onAdd: () => void;
  onBulkEdit: () => void;
  bulkEditing: boolean;
  showArchived: boolean;
  hasArchived: boolean;
  onToggleArchived: () => void;
};

const theme = {
  "--list-header-gap": `${homeSpacing.sm}px`,
  "--list-header-xs": `${homeSpacing.xs}px`,
  "--list-header-muted": homeColors.muted,
  "--list-header-on": homeColors.primary,
  "--list-header-off": homeColors.border,
  "--list-header-knob": homeColors.surface,
} as CSSProperties;

export const ListHeader = ({ onAdd, onBulkEdit, bulkEditing, showArchived, hasArchived, onToggleArchived }: Props) => (
  <div className="list-header" style={theme}>
    <button type="button" className="list-header-create" onClick={onAdd} aria-label={homeCopy.createList}>
      {listCopy.createList}
    </button>
    <span className="list-header-spacer" />
    <MultiEditButton label={listCopy.bulkEdit} onPress={onBulkEdit} disabled={bulkEditing} />
    {hasArchived && (
      <label className="list-header-archive">
        <span>{listCopy.archivedPlural}</span>
        <input type="checkbox" checked={showArchived} onChange={onToggleArchived} />
      </label>
    )}
  </div>
);
