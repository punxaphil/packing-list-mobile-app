import i18next from "i18next";
import { Alert } from "react-native";
import type { Space } from "~/types/Space.ts";

export type ActionSheetItem = {
  text: string;
  style?: "default" | "destructive" | "cancel";
  onPress?: () => void;
  disabled?: boolean;
  space?: Space;
};

type ActionSheetPayload = {
  title: string;
  items: ActionSheetItem[];
};

type ActionSheetListener = (payload: ActionSheetPayload) => void;

const listenerStack: ActionSheetListener[] = [];

export const pushActionSheetListener = (listener: ActionSheetListener) => {
  listenerStack.push(listener);
};

export const removeActionSheetListener = (listener: ActionSheetListener) => {
  const idx = listenerStack.indexOf(listener);
  if (idx !== -1) listenerStack.splice(idx, 1);
};

const getActionItems = (items: ActionSheetItem[]) => items.filter((item) => item.style !== "cancel");

export const showActionSheet = (title: string, items: ActionSheetItem[]) => {
  const listener = listenerStack[listenerStack.length - 1];
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
