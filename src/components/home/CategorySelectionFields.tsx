import type { RefObject } from "react";
import type { Image } from "~/types/Image.ts";
import type { NamedEntity } from "~/types/NamedEntity.ts";
import { FormField } from "../shared/FormField.tsx";
import { CategoryDropdown } from "./CategoryFields.tsx";
import { addItemCopy } from "./listCopy.ts";
import "./textPromptDialog.css";

type CategorySelectionFieldsProps = {
  categories: NamedEntity[];
  categoryImages: Image[];
  usedCategoryIds: string[];
  selected: NamedEntity;
  name: string;
  disabled: boolean;
  submitting: boolean;
  inputRef?: RefObject<HTMLInputElement | null>;
  onSelect: (category: NamedEntity) => void;
  onNameChange: (name: string) => void;
};

export const CategorySelectionFields = (props: CategorySelectionFieldsProps) => (
  <>
    <FormField label={addItemCopy.existingCategory} group>
      <CategoryDropdown
        categories={props.categories}
        categoryImages={props.categoryImages}
        usedCategoryIds={props.usedCategoryIds}
        selected={props.selected}
        onSelect={props.onSelect}
        disabled={props.disabled}
      />
    </FormField>
    <FormField label={addItemCopy.newCategory}>
      <input
        ref={props.inputRef}
        className="text-prompt-input"
        type="text"
        value={props.name}
        onChange={(event) => props.onNameChange(event.target.value)}
        disabled={props.submitting}
      />
    </FormField>
  </>
);
