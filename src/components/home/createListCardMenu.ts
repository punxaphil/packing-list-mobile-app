import type { ListCardProps } from "./ListCard.tsx";
import { buildListCardMenuItems } from "./listCardMenuItems.ts";
import { listCopy } from "./listCopy.ts";
import { showActionSheet } from "./showActionSheet.ts";

export const createListCardMenu = (props: ListCardProps, showRename: () => void) => {
  const header = { color: props.color, imageUrl: props.image?.url };
  const showDeleteConfirm = () =>
    showActionSheet(
      listCopy.deleteConfirm.replace("{name}", props.list.name),
      [{ text: listCopy.delete, style: "destructive", onPress: () => void props.actions.onDelete(props.list) }],
      header
    );
  const showUncheckConfirm = () =>
    showActionSheet(
      listCopy.uncheckConfirm.replace("{name}", props.list.name),
      [{ text: listCopy.uncheckAll, onPress: () => void props.actions.onUncheckAll(props.list) }],
      header
    );
  const showMoveToSpace = () =>
    showActionSheet(
      listCopy.moveToSpace,
      props.spaces
        .filter((space) => space.id !== props.currentSpaceId)
        .map((space) => ({
          text: space.name,
          space,
          onPress: () => props.onMoveToSpace(props.list.id, space.id),
        })),
      header
    );
  return () =>
    showActionSheet(
      props.list.name,
      buildListCardMenuItems({
        list: props.list,
        actions: props.actions,
        showDeleteConfirm,
        showUncheckConfirm,
        showRename,
        showImageMenuAction: props.showImageMenuAction,
        handleImageAction: () => props.onImagePress(props.list.id, props.image),
        hasImage: !!props.image,
        showMoveToSpace: props.spaces.length > 1 ? showMoveToSpace : undefined,
      }),
      header
    );
};
