import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { DialogShell, DialogSingleAction } from "../shared/DialogShell.tsx";
import { orderLists } from "./listOrdering.ts";
import { homeColors, homeSpacing } from "./theme.ts";
import { PackingListSummary } from "./types.ts";
import "./copyToListModal.css";

type CopyToListModalProps = {
  visible: boolean;
  lists: PackingListSummary[];
  currentListId: string;
  onClose: () => void;
  onSelect: (list: PackingListSummary) => Promise<void>;
};

export const CopyToListModal = (props: CopyToListModalProps) => {
  const { visible, lists, currentListId, onClose, onSelect } = props;
  const { t } = useTranslation();
  const availableLists = orderLists(lists.filter((list) => list.id !== currentListId && !list.archived));

  const handleSelect = async (list: PackingListSummary) => {
    onClose();
    await onSelect(list);
  };

  if (availableLists.length === 0) return null;

  return (
    <DialogShell
      visible={visible}
      title={t("copyToList.title")}
      onClose={onClose}
      actions={<DialogSingleAction label={t("copyToList.cancel")} onPress={onClose} />}
    >
      <div
        className="copy-to-list-options"
        style={
          {
            marginBottom: homeSpacing.sm,
            "--copy-border": homeColors.border,
            "--copy-text": homeColors.text,
            "--copy-muted": homeColors.muted,
            "--copy-spacing": `${homeSpacing.sm}px`,
          } as CSSProperties
        }
      >
        {availableLists.map((list) => (
          <ListOption key={list.id} list={list} onSelect={handleSelect} />
        ))}
      </div>
    </DialogShell>
  );
};

type ListOptionProps = {
  list: PackingListSummary;
  onSelect: (l: PackingListSummary) => void;
};

const ListOption = ({ list, onSelect }: ListOptionProps) => {
  const { t } = useTranslation();
  const count = list.itemCount ?? 0;
  const label = count === 1 ? t("copyToList.item") : t("copyToList.items");
  return (
    <button type="button" className="copy-to-list-option" onClick={() => onSelect(list)}>
      <span className="copy-to-list-name">{list.name}</span>
      <span className="copy-to-list-count">
        {count} {label}
      </span>
    </button>
  );
};
