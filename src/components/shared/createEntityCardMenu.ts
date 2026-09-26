import i18next from "i18next";
import { homeCopy } from "../home/copy.ts";
import { showActionSheet } from "../home/showActionSheet.ts";
import type { EntityCardProps, EntityMenuAction } from "./entityCardTypes.ts";

export const createEntityCardMenu = (props: EntityCardProps, openRename: () => void) => {
  const items: EntityMenuAction[] = [...(props.menuItems ?? [])];
  if (!props.readOnly) items.unshift({ text: homeCopy.rename, onPress: openRename });
  if (!props.readOnly && props.showImageMenuAction) {
    items.push({
      text: props.image ? i18next.t("category.updateImage") : i18next.t("category.addImage"),
      onPress: props.onImagePress,
    });
  }
  if (!props.readOnly) {
    items.push({
      text: props.copy.deleteAction,
      style: "destructive",
      onPress: () => void props.actions.onDelete(props.entity),
    });
  }
  return {
    disabled: items.length === 0,
    open: () => showActionSheet(props.entity.name, items, { color: props.color, imageUrl: props.image?.url }),
  };
};
