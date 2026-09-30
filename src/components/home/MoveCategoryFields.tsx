import type { RefObject } from "react";
import type { Image } from "~/types/Image.ts";
import type { NamedEntity } from "~/types/NamedEntity.ts";
import { CategorySelectionFields } from "./CategorySelectionFields.tsx";
import "./textPromptDialog.css";

type MoveCategoryFieldsProps = {
  categories: NamedEntity[];
  usedCategoryIds: string[];
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
    <CategorySelectionFields {...props} />
    {props.error && (
      <span className="text-prompt-error" role="alert">
        {props.error}
      </span>
    )}
  </>
);
