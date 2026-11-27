import i18next from "i18next";
import { useSpace } from "~/providers/SpaceContext.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { hasDuplicateEntityName } from "../shared/entityValidation.ts";
import { useItemUrlPaste } from "./ItemUrlPastePrompt.tsx";
import { hasDuplicateName } from "./itemHandlers.ts";
import { HOME_COPY } from "./styles.ts";
import { TextPromptDialog } from "./TextPromptDialog.tsx";
import { useToast } from "./Toast.tsx";

type CategoryRenameDialogsProps = {
  renameItem: PackItem | null;
  renameItemText: string;
  allItems: PackItem[];
  renameCategoryVisible: boolean;
  renameCategoryText: string;
  category: NamedEntity;
  categories: NamedEntity[];
  onChangeItemText: (text: string) => void;
  onCancelItem: () => void;
  onSubmitItem: () => void;
  onChangeCategoryText: (text: string) => void;
  onCancelCategory: () => void;
  onSubmitCategory: () => void;
};

export const getRenameItemError = (item: PackItem | null, text: string, items: PackItem[]) => {
  if (!item) return null;
  const trimmed = text.trim();
  if (!trimmed || trimmed === item.name) return null;
  return hasDuplicateName(trimmed, item.category, items, item.id) ? HOME_COPY.duplicateItemName : null;
};

export const getRenameCategoryError = (category: NamedEntity, text: string, categories: NamedEntity[]) => {
  const trimmed = text.trim();
  if (!trimmed || trimmed === category.name) return null;
  return hasDuplicateEntityName(trimmed, categories, category.id) ? HOME_COPY.duplicateCategoryName : null;
};

export const CategoryRenameDialogs = (props: CategoryRenameDialogsProps) => {
  const { writeDb } = useSpace();
  const { show } = useToast();
  const paste = useItemUrlPaste(
    !!props.renameItem,
    (url) => {
      const item = props.renameItem;
      if (!item) return;
      if (props.renameItemText === item.name) props.onCancelItem();
      void writeDb.updatePackItemUrl(item.id, url).catch(() => show(i18next.t("home.itemUrlSaveFailed")));
    },
    props.onChangeItemText
  );
  const renameItemError = getRenameItemError(props.renameItem, props.renameItemText, props.allItems);
  const renameCategoryError = getRenameCategoryError(props.category, props.renameCategoryText, props.categories);
  return (
    <>
      <TextPromptDialog
        visible={!!props.renameItem}
        title={HOME_COPY.renameItemPrompt}
        confirmLabel={HOME_COPY.renameListConfirm}
        value={props.renameItemText}
        error={renameItemError}
        disabled={!props.renameItemText.trim() || !!renameItemError}
        onChange={props.onChangeItemText}
        onPaste={paste.onPaste}
        onCancel={props.onCancelItem}
        onSubmit={props.onSubmitItem}
      />
      {paste.prompt}
      <TextPromptDialog
        visible={props.renameCategoryVisible}
        title={HOME_COPY.renameCategoryPrompt}
        confirmLabel={HOME_COPY.renameListConfirm}
        value={props.renameCategoryText}
        error={renameCategoryError}
        disabled={!props.renameCategoryText.trim() || !!renameCategoryError}
        onChange={props.onChangeCategoryText}
        onCancel={props.onCancelCategory}
        onSubmit={props.onSubmitCategory}
      />
    </>
  );
};
