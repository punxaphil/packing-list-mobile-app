import { Alert, Platform } from "react-native";
import { PackItem } from "~/types/PackItem.ts";
import { hasDuplicateName } from "./itemHandlers.ts";
import { HOME_COPY } from "./styles.ts";

const submitRename = (item: PackItem, items: PackItem[], onRename: (name: string) => void, text: string) => {
  const trimmed = text.trim();
  if (!trimmed || trimmed === item.name) return;
  if (hasDuplicateName(trimmed, item.category, items, item.id)) {
    Alert.alert(HOME_COPY.renameItemPrompt, HOME_COPY.duplicateItemName, [
      { text: HOME_COPY.cancel, style: "cancel" },
      { text: HOME_COPY.rename, onPress: () => showNativeRenameItemPrompt(item, items, onRename) },
    ]);
    return;
  }
  onRename(trimmed);
};

export const showNativeRenameItemPrompt = (item: PackItem, items: PackItem[], onRename: (name: string) => void) => {
  if (Platform.OS !== "ios") return false;
  Alert.prompt(
    HOME_COPY.renameItemPrompt,
    undefined,
    [
      { text: HOME_COPY.cancel, style: "cancel" },
      {
        text: HOME_COPY.renameListConfirm,
        onPress: (text?: string) => submitRename(item, items, onRename, text ?? ""),
      },
    ],
    "plain-text",
    item.name
  );
  return true;
};
