import { CATEGORY_COPY } from "../shared/entityStyles.ts";
import { homeCopy } from "./copy.ts";
import type { CategoryItemRowProps } from "./itemRowProps.ts";
import { assignMembersCopy, copyToListCopy } from "./listCopy.ts";
import { showActionSheet } from "./showActionSheet.ts";

export const createItemRowMenu = (props: CategoryItemRowProps) => () =>
  showActionSheet(
    props.item.name,
    [
      { text: homeCopy.rename, onPress: props.onOpenRename },
      { text: assignMembersCopy.title, onPress: props.onOpenAssignMembers },
      { text: CATEGORY_COPY.changeCategory, onPress: props.onOpenMoveCategory },
      { text: props.itemImage ? CATEGORY_COPY.updateImage : CATEGORY_COPY.addImage, onPress: props.onOpenImagePicker },
      ...(props.hasOtherLists ? [{ text: copyToListCopy.title, onPress: props.onOpenCopyToList }] : []),
      { text: homeCopy.deleteItem, style: "destructive", onPress: () => props.onDeleteItem(props.item.id) },
    ],
    { color: props.color, imageUrl: props.itemImage?.url }
  );
