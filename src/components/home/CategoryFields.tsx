import { useEffect, useRef, useState } from "react";
import type { Image } from "~/types/Image.ts";
import type { NamedEntity } from "~/types/NamedEntity.ts";
import {
  CategoryDropdownPopover,
  CategoryMedia,
  getCategoryImageUrl,
  orderCategories,
} from "./CategoryDropdownOptions.tsx";
import { categoryFieldTheme, getPopoverPosition } from "./CategoryFieldStyles.ts";
import "./categoryFields.css";

export const CategoryDropdown = ({
  categories,
  categoryImages,
  selected,
  onSelect,
  disabled,
  usedCategoryIds,
}: {
  categories: NamedEntity[];
  categoryImages: Image[];
  selected: NamedEntity;
  onSelect: (category: NamedEntity) => void;
  disabled: boolean;
  usedCategoryIds?: string[];
}) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, maxHeight: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const allCategories = orderCategories(categories, usedCategoryIds);
  const selectedImageUrl = getCategoryImageUrl(categoryImages, selected.id);

  useEffect(() => {
    if (disabled && popoverRef.current?.matches(":popover-open")) popoverRef.current.hidePopover();
  }, [disabled]);

  useEffect(() => {
    const dialog = buttonRef.current?.closest("dialog");
    const closePopover = () => {
      if (popoverRef.current?.matches(":popover-open")) popoverRef.current.hidePopover();
    };
    dialog?.addEventListener("close", closePopover);
    return () => dialog?.removeEventListener("close", closePopover);
  }, []);

  const toggle = () => {
    if (disabled) return;
    if (popoverRef.current?.matches(":popover-open")) return popoverRef.current.hidePopover();
    if (!buttonRef.current) return;
    setPosition(getPopoverPosition(buttonRef.current, allCategories.length));
    popoverRef.current?.showPopover();
    popoverRef.current?.querySelector("button")?.focus();
  };

  const handleSelect = (category: NamedEntity) => {
    onSelect(category);
    popoverRef.current?.hidePopover();
    buttonRef.current?.focus();
  };

  return (
    <div className="category-field" style={categoryFieldTheme}>
      <button
        ref={buttonRef}
        type="button"
        className="category-field-button"
        onClick={toggle}
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span className="category-field-value">
          <span className="category-field-name">{selected.name}</span>
          <span className="category-field-media">
            <CategoryMedia imageUrl={selectedImageUrl} />
          </span>
        </span>
        <span className="category-field-arrow" aria-hidden="true">
          {open ? "▲" : "▼"}
        </span>
      </button>
      <CategoryDropdownPopover
        popoverRef={popoverRef}
        position={position}
        categories={allCategories}
        categoryImages={categoryImages}
        selected={selected}
        onSelect={handleSelect}
        onToggle={() => setOpen(popoverRef.current?.matches(":popover-open") ?? false)}
        onEscape={() => {
          popoverRef.current?.hidePopover();
          buttonRef.current?.focus();
        }}
      />
    </div>
  );
};
