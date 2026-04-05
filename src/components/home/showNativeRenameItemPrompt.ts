import { Alert } from "react-native";
import { PackItem } from "~/types/PackItem.ts";
import { hasDuplicateName } from "./itemHandlers.ts";
import { showNativeTextPrompt } from "./showNativeTextPrompt.ts";
import { HOME_COPY } from "./styles.ts";

const submitRename = (item: PackItem, items: PackItem[], onRename: (name: string) => void, text: string) => {
  const trimmed = text.trim();
  if (!trimmed || trimmed === item.name) return;
  if (hasDuplicateName(trimmed, item.category, items, item.id)) {
    Alert.alert(HOME_COPY.renameItemPrompt, HOME_COPY.duplicateItemName, [
      { text: HOME_COPY.cancel, style: "cancel" },
      {
        text: HOME_COPY.rename,
        onPress: () => showNativeRenameItemPrompt(item, items, onRename),
      },
    ]);
    return;
  }
  onRename(trimmed);
};

export const showNativeRenameItemPrompt = (item: PackItem, items: PackItem[], onRename: (name: string) => void) => {
  return showNativeTextPrompt({
    title: HOME_COPY.renameItemPrompt,
    confirmLabel: HOME_COPY.renameListConfirm,
    cancelLabel: HOME_COPY.cancel,
    value: item.name,
    onSubmit: (text) => submitRename(item, items, onRename, text),
  });
};
