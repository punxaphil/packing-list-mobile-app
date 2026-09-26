import { CATEGORY_COPY } from "../shared/entityStyles.ts";
import { listCopy } from "./listCopy.ts";
import type { ListActions } from "./listSectionState.ts";
import type { ActionSheetItem } from "./showActionSheet.ts";
import type { PackingListSummary } from "./types.ts";

type MenuOptions = {
  list: PackingListSummary;
  actions: ListActions;
  showDeleteConfirm: () => void;
  showUncheckConfirm: () => void;
  showRename: () => void;
  showImageMenuAction?: boolean;
  handleImageAction: () => void;
  hasImage: boolean;
  showMoveToSpace?: () => void;
};

export const buildListCardMenuItems = ({
  list,
  actions,
  showDeleteConfirm,
  showUncheckConfirm,
  showRename,
  showImageMenuAction,
  handleImageAction,
  hasImage,
  showMoveToSpace,
}: MenuOptions) => {
  const items: ActionSheetItem[] = [
    { text: listCopy.rename, onPress: showRename },
    { text: listCopy.copy, onPress: () => void actions.onCopy(list) },
  ];
  if (showImageMenuAction)
    items.push({
      text: hasImage ? CATEGORY_COPY.updateImage : CATEGORY_COPY.addImage,
      onPress: handleImageAction,
    });
  if (list.archived) items.push({ text: listCopy.restore, onPress: () => void actions.onRestore(list) });
  else {
    items.push(
      list.pinned
        ? { text: listCopy.unpin, onPress: () => void actions.onUnpin(list) }
        : { text: listCopy.pinToTop, onPress: () => void actions.onPin(list) }
    );
    if (list.isTemplate)
      items.push({ text: listCopy.unsetTemplate, onPress: () => void actions.onunsetTemplate(list) });
    else {
      items.push({ text: listCopy.setAsTemplate, onPress: () => void actions.onSetTemplate(list) });
      items.push({ text: listCopy.archive, onPress: () => void actions.onArchive(list) });
      items.push({ text: listCopy.uncheckAll, onPress: showUncheckConfirm, disabled: !(list.packedCount ?? 0) });
    }
  }
  if (showMoveToSpace) items.push({ text: listCopy.moveToSpace, onPress: showMoveToSpace });
  return [
    ...items,
    { text: listCopy.delete, style: "destructive" as const, onPress: showDeleteConfirm },
    { text: listCopy.cancel, style: "cancel" as const },
  ];
};
