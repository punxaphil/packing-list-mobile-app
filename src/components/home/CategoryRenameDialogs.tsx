import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { hasDuplicateEntityName } from "../shared/entityValidation.ts";
import { hasDuplicateName } from "./itemHandlers.ts";
import { HOME_COPY } from "./styles.ts";
import { TextPromptDialog } from "./TextPromptDialog.tsx";

type CategoryRenameDialogsProps = {
  renameItem: PackItem | null;
  renameItemText: string;
  sectionItems: PackItem[];
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
  const renameItemError = getRenameItemError(props.renameItem, props.renameItemText, props.sectionItems);
  const renameCategoryError = getRenameCategoryError(props.category, props.renameCategoryText, props.categories);
  return (
    <>
      <TextPromptDialog
        visible={!!props.renameItem}
        title={HOME_COPY.renameItemPrompt}
        confirmLabel={HOME_COPY.renameListConfirm}
        value={props.renameItemText}
        error={renameItemError}
        disabled={!!renameItemError}
        onChange={props.onChangeItemText}
        onCancel={props.onCancelItem}
        onSubmit={props.onSubmitItem}
      />
      <TextPromptDialog
        visible={props.renameCategoryVisible}
        title={HOME_COPY.renameCategoryPrompt}
        confirmLabel={HOME_COPY.renameListConfirm}
        value={props.renameCategoryText}
        error={renameCategoryError}
        disabled={!!renameCategoryError}
        onChange={props.onChangeCategoryText}
        onCancel={props.onCancelCategory}
        onSubmit={props.onSubmitCategory}
      />
    </>
  );
};
