import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { ActionMenu } from "./ActionMenu.tsx";
import { ActionSheetItem, pushActionSheetListener, removeActionSheetListener } from "./showActionSheet.ts";

type SheetState = {
  title: string;
  items: ActionSheetItem[];
};

export const ActionSheetHost = () => {
  const [sheet, setSheet] = useState<SheetState | null>(null);
  const select = (action?: () => void) => {
    flushSync(() => setSheet(null));
    flushSync(() => action?.());
  };

  useEffect(() => {
    pushActionSheetListener(setSheet);
    return () => {
      removeActionSheetListener(setSheet);
    };
  }, []);

  if (!sheet) return null;

  return (
    <ActionMenu visible title={sheet.title} items={sheet.items} onClose={() => setSheet(null)} onSelect={select} />
  );
};
