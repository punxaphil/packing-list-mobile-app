import type { Space } from "~/types/Space.ts";

export type ActionSheetItem = {
  text: string;
  style?: "default" | "destructive" | "cancel";
  onPress?: () => void;
  disabled?: boolean;
  disabledReason?: string;
  space?: Space;
};

export type ActionSheetHeader = { color?: string; imageUrl?: string; previewItems?: { id: string; name: string }[] };

type ActionSheetPayload = {
  title: string;
  items: ActionSheetItem[];
  header?: ActionSheetHeader;
  onDismiss?: () => void;
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

export const showActionSheet = (
  title: string,
  items: ActionSheetItem[],
  header?: ActionSheetHeader,
  onDismiss?: () => void
) => {
  const listener = listenerStack[listenerStack.length - 1];
  if (listener) {
    listener({ title, items, header, onDismiss });
    return;
  }

  const actions = getActionItems(items).filter((item) => !item.disabled);
  const choice = window.prompt(`${title}\n${actions.map((item, index) => `${index + 1}. ${item.text}`).join("\n")}`);
  const action = choice === null ? undefined : actions[Number(choice) - 1];
  if (action) action.onPress?.();
  else onDismiss?.();
};
