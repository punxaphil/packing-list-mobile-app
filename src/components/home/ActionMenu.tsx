import { type ReactNode, useMemo } from "react";
import { ActionMenuHeader } from "./ActionMenuHeader.tsx";
import { type ActionMenuItem, MenuItem } from "./ActionMenuItem.tsx";
import { ActionMenuPreview } from "./ActionMenuPreview.tsx";
import { actionMenuTheme } from "./actionMenuTheme.ts";
import { commonCopy } from "./copy.ts";
import { ToastProvider } from "./Toast.tsx";
import { useActionMenuDialog } from "./useActionMenuDialog.ts";
import { useSpaceMemberInfo } from "./useSpaceMemberInfo.ts";
import "./actionMenu.css";

type ActionMenuProps = {
  visible: boolean;
  title: string;
  items: ActionMenuItem[];
  previewItems?: { id: string; name: string }[];
  onClose: () => void;
  onSelect: (action?: () => void) => void;
  headerColor?: string;
  headerImageUrl?: string;
  headerTextColor?: string;
  headerRight?: ReactNode;
};

export const ActionMenu = (props: ActionMenuProps) => {
  const {
    visible,
    title,
    items,
    previewItems,
    onClose,
    onSelect,
    headerColor,
    headerImageUrl,
    headerTextColor,
    headerRight,
  } = props;
  const spaces = useMemo(() => items.flatMap((item) => (item.space ? [item.space] : [])), [items]);
  const { memberInfoBySpaceId } = useSpaceMemberInfo(spaces);
  const { dialogRef, headerRef, headerHeight } = useActionMenuDialog(visible);
  return (
    <dialog
      ref={dialogRef}
      className="action-menu"
      style={actionMenuTheme}
      aria-label={title}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onClose();
        }
      }}
    >
      <ToastProvider>
        <ActionMenuHeader
          title={title}
          headerRef={headerRef}
          color={headerColor}
          imageUrl={headerImageUrl}
          textColor={headerTextColor}
          right={headerRight}
        />
        {previewItems && <ActionMenuPreview items={previewItems} headerHeight={headerHeight} />}
        <div className="action-menu-list">
          {items
            .filter((item) => item.style !== "cancel")
            .map((item) => (
              <MenuItem
                key={item.text}
                item={item}
                onSelect={onSelect}
                members={item.space ? (memberInfoBySpaceId[item.space.id] ?? []) : undefined}
              />
            ))}
        </div>
        <button type="button" className="action-menu-cancel" onClick={onClose}>
          {items.find((item) => item.style === "cancel")?.text ?? commonCopy.cancel}
        </button>
      </ToastProvider>
    </dialog>
  );
};
