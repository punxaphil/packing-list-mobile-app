import type { ReactNode } from "react";
import type { Space } from "~/types/Space.ts";
import type { MemberInfo } from "./memberInfo.ts";
import { SpaceRow } from "./SpaceSheetParts.tsx";
import { useToast } from "./Toast.tsx";
import "./actionMenuItem.css";

export type ActionMenuItem = {
  text: string;
  style?: "default" | "destructive" | "cancel";
  onPress?: () => void;
  disabled?: boolean;
  disabledReason?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onRightPress?: () => void;
  space?: Space;
};

type Props = {
  item: ActionMenuItem;
  onSelect: (action?: () => void) => void;
  members?: MemberInfo[];
};

export const MenuItem = ({ item, onSelect, members }: Props) => {
  const { show: showToast } = useToast();
  const handlePress = () => {
    if (item.disabled) {
      if (item.disabledReason) showToast(item.disabledReason);
      return;
    }
    onSelect(item.onPress);
  };
  if (members) return <SpaceRow label={item.text} members={members} onPress={handlePress} />;
  return (
    <div className="action-menu-item-row" title={item.disabled ? item.disabledReason : undefined}>
      <button
        type="button"
        className={`action-menu-item${item.disabled ? " action-menu-item-disabled" : ""}${item.style === "destructive" ? " action-menu-item-danger" : ""}`}
        onClick={handlePress}
        aria-disabled={item.disabled || undefined}
      >
        <span className="action-menu-item-icon">{item.leftIcon}</span>
        <span className="action-menu-item-text">{item.text}</span>
        <span className="action-menu-item-icon">{!item.onRightPress && item.rightIcon}</span>
      </button>
      {item.rightIcon && item.onRightPress && (
        <button type="button" className="action-menu-right" onClick={item.onRightPress} aria-label={item.text}>
          {item.rightIcon}
        </button>
      )}
    </div>
  );
};
