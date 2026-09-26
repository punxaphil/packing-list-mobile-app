import type { CSSProperties } from "react";
import { getEmojiValue } from "~/services/mediaValue.ts";
import type { CategoryItemRowProps } from "./itemRowProps.ts";
import { MemberInitials } from "./MemberInitials.tsx";
import { homeColors } from "./theme.ts";
import "./itemRowDetails.css";

type DetailsProps = Pick<
  CategoryItemRowProps,
  | "item"
  | "itemImage"
  | "initialsMap"
  | "memberNames"
  | "memberImages"
  | "checkboxColor"
  | "onToggleMemberPacked"
  | "onOpenRename"
> & { checked: boolean; wrapItemText: boolean };

export const ItemRowDetails = ({
  item,
  itemImage,
  initialsMap,
  memberNames,
  memberImages,
  checkboxColor,
  onToggleMemberPacked,
  onOpenRename,
  checked,
  wrapItemText,
}: DetailsProps) => {
  const emoji = getEmojiValue(itemImage?.url);
  return (
    <div
      className="item-row-body"
      style={{ "--item-text": homeColors.text, "--item-muted": homeColors.muted } as CSSProperties}
    >
      {itemImage &&
        (emoji ? (
          <span className="item-row-image">{emoji}</span>
        ) : (
          <img className="item-row-image" src={itemImage.url} alt="" />
        ))}
      <div className="item-row-content">
        <button
          type="button"
          onClick={onOpenRename}
          className={`item-row-name${checked ? " item-row-name-checked" : ""}${wrapItemText ? " item-row-name-wrap" : ""}`}
        >
          {item.name}
        </button>
        <MemberInitials
          item={item}
          initialsMap={initialsMap}
          memberNames={memberNames}
          memberImages={memberImages}
          checkedColor={checkboxColor}
          onToggle={onToggleMemberPacked}
        />
      </div>
    </div>
  );
};
