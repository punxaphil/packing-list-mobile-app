import i18next from "i18next";
import { ActionSheetIOS } from "react-native";

type ActionSheetItem = {
  text: string;
  style?: "default" | "destructive" | "cancel";
  onPress?: () => void;
  disabled?: boolean;
};

export const showActionSheet = (title: string, items: ActionSheetItem[]) => {
  const actionItems = items.filter((i) => i.style !== "cancel");
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
