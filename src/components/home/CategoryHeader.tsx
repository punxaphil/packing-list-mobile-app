import i18next from "i18next";
import type { CSSProperties } from "react";
import { getEmojiValue } from "~/services/mediaValue.ts";
import { getPackItemChecked } from "~/services/packItemState.ts";
import { CATEGORY_COPY } from "../shared/entityStyles.ts";
import { AppCheckbox } from "./AppCheckbox.tsx";
import { homeCopy } from "./copy.ts";
import type { SectionGroup } from "./itemsSectionHelpers.ts";
import { showActionSheet } from "./showActionSheet.ts";
import { CHECKBOX_SIZE, homeColors } from "./theme.ts";
import "./categoryHeader.css";

type CategoryHeaderProps = {
  section: SectionGroup;
  color: string;
  checkboxColor: string;
  imageUrl?: string;
  isTemplateList: boolean;
  onAdd: () => void;
  onToggleCategory: (checked: boolean) => void;
  pendingToggle: boolean | null;
  onSortAlpha: () => void;
  onMoveCategory: () => void;
  onDeleteItems: () => void;
  onRename: () => void;
};

export const CategoryHeader = ({
  section,
  color,
  checkboxColor,
  imageUrl,
  isTemplateList,
  onToggleCategory,
  onAdd,
  pendingToggle,
  onSortAlpha,
  onMoveCategory,
  onDeleteItems,
  onRename,
}: CategoryHeaderProps) => {
  const allChecked = section.items.every(getPackItemChecked);
  const indeterminate = !allChecked && section.items.some(getPackItemChecked);
  const displayChecked = pendingToggle ?? allChecked;
  const isUncategorized = section.category.id === "";
  const emoji = getEmojiValue(imageUrl);
  const openMenu = () =>
    showActionSheet(
      section.title,
      [
        ...(isUncategorized ? [] : [{ text: homeCopy.rename, onPress: onRename }]),
        { text: homeCopy.categoryMenuAddItem, onPress: onAdd },
        { text: CATEGORY_COPY.changeCategory, onPress: onMoveCategory },
        { text: homeCopy.categoryMenuSortAlpha, onPress: onSortAlpha },
        { text: homeCopy.categoryMenuDeleteItems, style: "destructive", onPress: onDeleteItems },
      ],
      { color, imageUrl }
    );
  return (
    <div
      className="category-header"
      style={{ "--category-text": homeColors.text, "--category-muted": homeColors.muted } as CSSProperties}
    >
      <AppCheckbox
        checked={displayChecked}
        indeterminate={indeterminate && pendingToggle === null}
        label={section.title}
        onToggle={() => onToggleCategory(!displayChecked)}
        disabled={isTemplateList || pendingToggle !== null}
        size={CHECKBOX_SIZE}
        checkedColor={checkboxColor}
      />
      {emoji ? (
        <span className="category-header-image">{emoji}</span>
      ) : (
        imageUrl && <img className="category-header-image" src={imageUrl} alt="" />
      )}
      {isUncategorized ? (
        <span className="category-header-title">{section.title}</span>
      ) : (
        <button type="button" className="category-header-title" onClick={onRename}>
          {section.title}
        </button>
      )}
      <button
        type="button"
        className="category-header-menu"
        onClick={openMenu}
        aria-label={i18next.t("category.menu")}
        title={i18next.t("category.menu")}
      >
        <span className="mdi mdi-dots-vertical" aria-hidden="true" />
      </button>
    </div>
  );
};
