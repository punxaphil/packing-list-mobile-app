import type { CSSProperties, RefObject } from "react";
import type { Image } from "~/types/Image.ts";
import type { NamedEntity } from "~/types/NamedEntity.ts";
import { CategoryDropdown } from "./CategoryFields.tsx";
import { addItemCopy } from "./listCopy.ts";
import { homeColors, homeSpacing } from "./theme.ts";
import "./textPromptDialog.css";

const labelStyle = {
  display: "block",
  margin: `0 0 ${homeSpacing.xs}px`,
  fontSize: 14,
  fontWeight: 500,
  color: homeColors.muted,
} as CSSProperties;

type MoveCategoryFieldsProps = {
  categories: NamedEntity[];
  categoryImages: Image[];
  selected: NamedEntity;
  disabled: boolean;
  submitting: boolean;
  name: string;
  error: string | null;
  inputRef: RefObject<HTMLInputElement | null>;
  onSelect: (category: NamedEntity) => void;
  onNameChange: (name: string) => void;
};

export const MoveCategoryFields = (props: MoveCategoryFieldsProps) => (
  <>
    <p style={labelStyle}>{addItemCopy.existingCategory}</p>
    <CategoryDropdown
      categories={props.categories}
      categoryImages={props.categoryImages}
      selected={props.selected}
      onSelect={props.onSelect}
      disabled={props.disabled}
    />
    <label style={labelStyle}>
      {addItemCopy.newCategory}
      <input
        ref={props.inputRef}
        className="text-prompt-input"
        type="text"
        value={props.name}
        onChange={(event) => props.onNameChange(event.target.value)}
        disabled={props.submitting}
      />
    </label>
    {props.error && (
      <span className="text-prompt-error" role="alert">
        {props.error}
      </span>
    )}
  </>
);
