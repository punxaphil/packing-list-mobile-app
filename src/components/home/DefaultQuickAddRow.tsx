import { useTranslation } from "react-i18next";
import { MultiEditButton } from "../shared/MultiEditButton.tsx";
import { commonCopy, homeCopy } from "./copy.ts";
import type { AddItemDialogState } from "./ItemsPanel.tsx";
import { listCopy } from "./listCopy.ts";
import { QuickRowIconButton } from "./QuickRowIconButton.tsx";
import { HOME_COPY } from "./styles.ts";
import { homeColors, homeSpacing } from "./theme.ts";
import type { FilterDialogState } from "./useFilterDialog.ts";
import "./searchRow.css";

type Props = {
  addDialog: AddItemDialogState;
  filterDialog: FilterDialogState;
  onSearch: () => void;
  onNotes: () => void;
  hasNotes: boolean;
  onBulkEdit: () => void;
  bulkEditing: boolean;
  onUndo: () => void;
  canUndo: boolean;
};

export const DefaultQuickAddRow = ({
  addDialog,
  filterDialog,
  onSearch,
  onNotes,
  hasNotes,
  onBulkEdit,
  bulkEditing,
  onUndo,
  canUndo,
}: Props) => {
  const { t } = useTranslation();
  return (
    <div className="quick-search-row" style={{ gap: homeSpacing.xs }}>
      <button
        className="quick-add-trigger"
        type="button"
        onClick={() => addDialog.open()}
        style={{ color: homeColors.muted }}
      >
        {HOME_COPY.addItemQuick}
      </button>
      <div className="quick-search-actions" style={{ gap: homeSpacing.xs }}>
        <QuickRowIconButton name="undo" label={commonCopy.undo} onPress={onUndo} disabled={!canUndo} />
        <QuickRowIconButton name="note-text-outline" label={listCopy.title} onPress={onNotes} active={hasNotes} />
        <QuickRowIconButton name="magnify" label={t("search.placeholder")} onPress={onSearch} />
        <MultiEditButton label={homeCopy.bulkEdit} onPress={onBulkEdit} disabled={bulkEditing} />
        <QuickRowIconButton
          name="filter-variant"
          label={t("filter.title")}
          onPress={filterDialog.open}
          active={filterDialog.hasActiveFilter}
        />
      </div>
    </div>
  );
};
