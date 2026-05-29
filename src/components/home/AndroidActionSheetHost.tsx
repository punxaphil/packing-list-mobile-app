import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { ActionMenu } from "./ActionMenu.tsx";
import {
  ActionSheetItem,
  pushAndroidActionSheetListener,
  removeAndroidActionSheetListener,
} from "./showActionSheet.ts";

type SheetState = {
  title: string;
  items: ActionSheetItem[];
};

export const AndroidActionSheetHost = () => {
  const [sheet, setSheet] = useState<SheetState | null>(null);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    pushAndroidActionSheetListener(setSheet);
    return () => {
      removeAndroidActionSheetListener(setSheet);
    };
  }, []);

  if (Platform.OS !== "android" || !sheet) return null;

  return <ActionMenu visible title={sheet.title} items={sheet.items} onClose={() => setSheet(null)} />;
};
