import i18next from "i18next";
import type { CSSProperties } from "react";
import { parseItemUrl } from "~/services/itemUrl.ts";
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
  | "onOpenImagePicker"
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
  onOpenImagePicker,
  checked,
  wrapItemText,
}: DetailsProps) => {
  const emoji = getEmojiValue(itemImage?.url);
  const url = parseItemUrl(item.url);
  const linkLabel = i18next.t("home.openItemUrl", { name: item.name });
  return (
    <div
      className="item-row-body"
      style={{ "--item-text": homeColors.text, "--item-muted": homeColors.muted } as CSSProperties}
    >
      {itemImage && (
        <button
          type="button"
          className="item-row-image"
          onClick={onOpenImagePicker}
          aria-label={i18next.t("home.viewItemImage", { name: item.name })}
        >
          {emoji ?? <img src={itemImage.url} alt="" />}
        </button>
      )}
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
      {url && (
        <a className="item-row-link" href={url} target="_blank" rel="noopener noreferrer" title={linkLabel}>
          <span className="mdi mdi-link-variant" aria-hidden="true" />
          <span className="item-row-link-label">{linkLabel}</span>
        </a>
      )}
    </div>
  );
};
