import type { RefObject } from "react";
import type { Image } from "~/types/Image.ts";
import type { NamedEntity } from "~/types/NamedEntity.ts";
import type { PackItem } from "~/types/PackItem.ts";
import { Button } from "../shared/Button.tsx";
import { FormField } from "../shared/FormField.tsx";
import { AppCheckbox } from "./AppCheckbox.tsx";
import { CategorySelectionFields } from "./CategorySelectionFields.tsx";
import { addItemCopy } from "./listCopy.ts";
import { HOME_COPY } from "./styles.ts";
import { homeColors } from "./theme.ts";
import type { useAddItemDialogState } from "./useAddItemDialogState.ts";
import "./addItemDialog.css";
import "./textPromptDialog.css";

type AddItemFieldsProps = {
  state: ReturnType<typeof useAddItemDialogState>;
  inputRef: RefObject<HTMLInputElement | null>;
  categories: NamedEntity[];
  categoryImages: Image[];
  items: PackItem[];
  submitting: boolean;
  onSubmit: () => void;
  onBrowseKits: () => void;
};

export const AddItemFields = ({
  state,
  inputRef,
  categories,
  categoryImages,
  items,
  submitting,
  onSubmit,
  onBrowseKits,
}: AddItemFieldsProps) => (
  <>
    <FormField label={HOME_COPY.newItem}>
      <input
        ref={inputRef}
        className={`text-prompt-input${state.error ? " text-prompt-input-error" : ""}`}
        type="text"
        value={state.itemName}
        onChange={(event) => {
          state.setItemName(event.target.value);
          state.setError(null);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && state.itemName.trim() && !submitting) onSubmit();
        }}
        disabled={submitting}
      />
    </FormField>
    {state.error && (
      <span className="text-prompt-error" role="alert">
        {state.error}
      </span>
    )}
    <CategorySelectionFields
      categories={categories}
      categoryImages={categoryImages}
      usedCategoryIds={items.map((item) => item.category)}
      selected={state.selectedCategory}
      name={state.newCategoryName}
      disabled={submitting || Boolean(state.newCategoryName.trim())}
      submitting={submitting}
      onSelect={(category) => {
        state.setSelectedCategory(category);
        state.setError(null);
      }}
      onNameChange={(name) => {
        state.setNewCategoryName(name);
        state.setError(null);
      }}
    />
    <label className="add-item-keep-open" htmlFor="add-item-keep-open" style={{ color: homeColors.text }}>
      <AppCheckbox
        id="add-item-keep-open"
        checked={state.keepOpen}
        label={addItemCopy.keepOpen}
        onToggle={() => state.setKeepOpen((value) => !value)}
        size={24}
        disabled={submitting}
      />
      <span>{addItemCopy.keepOpen}</span>
    </label>
    <Button label={addItemCopy.browseKits} onPress={onBrowseKits} disabled={submitting} />
  </>
);
