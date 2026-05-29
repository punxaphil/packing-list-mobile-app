import i18next from "i18next";
import { ActionSheetIOS, Alert, Platform } from "react-native";

export type ActionSheetItem = {
  text: string;
  style?: "default" | "destructive" | "cancel";
  onPress?: () => void;
  disabled?: boolean;
};

type AndroidActionSheetPayload = {
  title: string;
  items: ActionSheetItem[];
};

type AndroidActionSheetListener = (payload: AndroidActionSheetPayload) => void;

const listenerStack: AndroidActionSheetListener[] = [];

export const pushAndroidActionSheetListener = (listener: AndroidActionSheetListener) => {
  listenerStack.push(listener);
};

export const removeAndroidActionSheetListener = (listener: AndroidActionSheetListener) => {
  const idx = listenerStack.indexOf(listener);
  if (idx !== -1) listenerStack.splice(idx, 1);
};

const getActionItems = (items: ActionSheetItem[]) => items.filter((item) => item.style !== "cancel");

const showAndroidActionSheet = (title: string, items: ActionSheetItem[]) => {
  const listener = listenerStack[listenerStack.length - 1];
  console.log("[showActionSheet] Android, listenerStack length:", listenerStack.length, "hasListener:", !!listener);
  if (listener) {
    listener({ title, items });
    return;
  }

  const buttons = [
    ...getActionItems(items).filter((item) => !item.disabled),
    { text: i18next.t("common.cancel"), style: "cancel" as const },
  ];
  Alert.alert(title, undefined, buttons, { cancelable: true });
};

export const showActionSheet = (title: string, items: ActionSheetItem[]) => {
  if (Platform.OS !== "ios") {
    showAndroidActionSheet(title, items);
    return;
  }

  const actionItems = getActionItems(items);
  const options = [...actionItems.map((i) => i.text), i18next.t("common.cancel")];
  const cancelButtonIndex = actionItems.length;
  const destructiveIndices = actionItems
    .map((item, index) => (item.style === "destructive" ? index : -1))
    .filter((i) => i >= 0);
  const disabledIndices = actionItems.map((item, index) => (item.disabled ? index : -1)).filter((i) => i >= 0);

  ActionSheetIOS.showActionSheetWithOptions(
    {
      title,
      options,
      cancelButtonIndex,
      destructiveButtonIndex: destructiveIndices[0] ?? undefined,
      disabledButtonIndices: disabledIndices.length > 0 ? disabledIndices : undefined,
    },
    (buttonIndex) => {
      if (buttonIndex !== cancelButtonIndex) {
        actionItems[buttonIndex]?.onPress?.();
      }
    }
  );
};
