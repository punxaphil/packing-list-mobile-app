import { useEffect, useState } from "react";
import { ActionMenu } from "./ActionMenu.tsx";
import { ActionSheetItem, pushActionSheetListener, removeActionSheetListener } from "./showActionSheet.ts";

type SheetState = {
  title: string;
  items: ActionSheetItem[];
};

export const ActionSheetHost = () => {
  const [sheet, setSheet] = useState<SheetState | null>(null);

  useEffect(() => {
    pushActionSheetListener(setSheet);
    return () => {
      removeActionSheetListener(setSheet);
    };
  }, []);

  if (!sheet) return null;

  return <ActionMenu visible title={sheet.title} items={sheet.items} onClose={() => setSheet(null)} />;
};
