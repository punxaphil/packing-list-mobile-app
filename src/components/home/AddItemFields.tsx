import type { RefObject } from "react";
import type { Image } from "~/types/Image.ts";
import type { NamedEntity } from "~/types/NamedEntity.ts";
import type { PackItem } from "~/types/PackItem.ts";
import { Button } from "../shared/Button.tsx";
import { AppCheckbox } from "./AppCheckbox.tsx";
import { CategoryDropdown } from "./CategoryFields.tsx";
import { addItemCopy } from "./listCopy.ts";
import { HOME_COPY } from "./styles.ts";
import { homeColors } from "./theme.ts";
import type { useAddItemDialogState } from "./useAddItemDialogState.ts";
import "./addItemDialog.css";
import "./textPromptDialog.css";

const mutedLabel = { color: homeColors.muted };
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
    <label className="add-item-field-label" style={mutedLabel}>
      {HOME_COPY.newItem}
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
    </label>
    {state.error && (
      <span className="text-prompt-error" role="alert">
        {state.error}
      </span>
    )}
    <p className="add-item-field-label" style={mutedLabel}>
      {addItemCopy.existingCategory}
    </p>
    <CategoryDropdown
      categories={categories}
      categoryImages={categoryImages}
      usedCategoryIds={items.map((item) => item.category).filter(Boolean)}
      selected={state.selectedCategory}
      onSelect={(category) => {
        state.setSelectedCategory(category);
        state.setError(null);
      }}
      disabled={submitting || Boolean(state.newCategoryName.trim())}
    />
    <label className="add-item-field-label" style={mutedLabel}>
      {addItemCopy.newCategory}
      <input
        className="text-prompt-input"
        type="text"
        value={state.newCategoryName}
        onChange={(event) => {
          state.setNewCategoryName(event.target.value);
          state.setError(null);
        }}
        disabled={submitting}
      />
    </label>
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
