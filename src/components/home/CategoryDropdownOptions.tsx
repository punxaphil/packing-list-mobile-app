import type { CSSProperties, RefObject } from "react";
import { getEmojiValue } from "~/services/mediaValue.ts";
import { getCategoryKey, UNCATEGORIZED } from "~/services/utils.ts";
import type { Image } from "~/types/Image.ts";
import type { NamedEntity } from "~/types/NamedEntity.ts";
import { addItemCopy } from "./listCopy.ts";

type CategoryDropdownPopoverProps = {
  popoverRef: RefObject<HTMLDivElement | null>;
  position: CSSProperties;
  categories: NamedEntity[];
  categoryImages: Image[];
  selected: NamedEntity;
  onSelect: (category: NamedEntity) => void;
  onToggle: () => void;
  onEscape: () => void;
};

export const CategoryDropdownPopover = (props: CategoryDropdownPopoverProps) => (
  <div
    ref={props.popoverRef}
    popover="auto"
    role="dialog"
    aria-label={addItemCopy.existingCategory}
    className="category-field-popover"
    style={props.position}
    onToggle={props.onToggle}
    onKeyDown={(event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      props.onEscape();
    }}
  >
    <CategoryDropdownOptions {...props} />
  </div>
);

export const getCategoryImageUrl = (images: Image[], categoryId: string) =>
  images.find((image) => image.typeId === categoryId)?.url;

export const CategoryMedia = ({ imageUrl }: { imageUrl?: string }) => {
  const emoji = getEmojiValue(imageUrl);
  if (emoji)
    return (
      <span className="category-field-emoji" aria-hidden="true">
        {emoji}
      </span>
    );
  if (imageUrl) return <img src={imageUrl} alt="" className="category-field-image" />;
  return null;
};

export const orderCategories = (categories: NamedEntity[], usedCategoryIds: string[] = []) => {
  const usedIds = new Set(usedCategoryIds);
  const remaining = categories.filter((category) => category.id !== UNCATEGORIZED.id);
  const sorted = remaining.sort((first, second) => first.name.localeCompare(second.name));
  return [
    UNCATEGORIZED,
    ...sorted.filter((category) => usedIds.has(category.id)),
    ...sorted.filter((category) => !usedIds.has(category.id)),
  ];
};

const CategoryDropdownOptions = ({
  categories,
  categoryImages,
  selected,
  onSelect,
}: {
  categories: NamedEntity[];
  categoryImages: Image[];
  selected: NamedEntity;
  onSelect: (category: NamedEntity) => void;
}) => (
  <div className="category-field-options">
    {categories.map((category) => {
      const imageUrl = getCategoryImageUrl(categoryImages, category.id);
      return (
        <button
          type="button"
          key={getCategoryKey(category)}
          className="category-field-option"
          aria-pressed={getCategoryKey(category) === getCategoryKey(selected)}
          onClick={() => onSelect(category)}
        >
          <span className="category-field-value">
            <span className="category-field-name">{category.name}</span>
            <span className="category-field-media">
              <CategoryMedia imageUrl={imageUrl} />
            </span>
          </span>
        </button>
      );
    })}
  </div>
);
