import { ActionSheetIOS, type ActionSheetIOSOptions } from "react-native";

export const showIosActionSheet = (options: ActionSheetIOSOptions, onSelect: (index: number) => void) =>
  ActionSheetIOS.showActionSheetWithOptions(options, onSelect);
