import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { ActionMenu } from "./ActionMenu.tsx";
import {
  ActionSheetHeader,
  ActionSheetItem,
  pushActionSheetListener,
  removeActionSheetListener,
} from "./showActionSheet.ts";

type SheetState = {
  title: string;
  items: ActionSheetItem[];
  header?: ActionSheetHeader;
};

export const ActionSheetHost = ({ onVisibilityChange }: { onVisibilityChange?: (visible: boolean) => void } = {}) => {
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

  useEffect(() => onVisibilityChange?.(sheet !== null), [sheet, onVisibilityChange]);

  if (!sheet) return null;

  return (
    <ActionMenu
      visible
      title={sheet.title}
      items={sheet.items}
      previewItems={sheet.header?.previewItems}
      headerColor={sheet.header?.color}
      headerImageUrl={sheet.header?.imageUrl}
      onClose={() => setSheet(null)}
      onSelect={select}
    />
  );
};
