import { useCallback, useRef, useState } from "react";
import type { Image } from "~/types/Image.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { DialogActions, DialogShell } from "../shared/DialogShell.tsx";
import { AddItemFields } from "./AddItemFields.tsx";
import { HOME_COPY } from "./styles.ts";
import { useToastMessage } from "./Toast.tsx";
import { ToastMessage } from "./ToastMessage.tsx";
import { useAddItemDialogState } from "./useAddItemDialogState.ts";
import { type AddItemSubmit, useAddItemSubmit } from "./useAddItemSubmit.ts";

type AddItemDialogProps = {
  visible: boolean;
  initialCategory?: NamedEntity;
  categories: NamedEntity[];
  categoryImages: Image[];
  items: PackItem[];
  onCancel: () => void;
  onSubmit: AddItemSubmit;
  onBrowseKits: () => void;
};

export const AddItemDialog = (props: AddItemDialogProps) => {
  const { visible, initialCategory, categories, categoryImages, items, onCancel, onSubmit, onBrowseKits } = props;
  const { toast, show: showToast, dismiss } = useToastMessage();
  const state = useAddItemDialogState(visible, initialCategory);
  const {
    itemName,
    setItemName,
    selectedCategory,
    setSelectedCategory,
    newCategoryName,
    setNewCategoryName,
    keepOpen,
    setError,
  } = state;
  const inputRef = useRef<HTMLInputElement>(null);
  const submittingRef = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const hasNewCategory = newCategoryName.trim().length > 0;
  const targetCategoryId = hasNewCategory ? "" : selectedCategory.id;
  const submit = useAddItemSubmit(
    itemName,
    selectedCategory,
    newCategoryName,
    hasNewCategory,
    items,
    targetCategoryId,
    setItemName,
    setSelectedCategory,
    setNewCategoryName,
    setError,
    keepOpen,
    showToast,
    inputRef,
    onSubmit
  );
  const handleSubmit = useCallback(async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      await submit();
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, [submit]);
  return (
    <DialogShell
      visible={visible}
      title={HOME_COPY.addItemPrompt}
      onClose={onCancel}
      onShow={() => inputRef.current?.focus()}
      actions={
        <DialogActions
          cancelLabel={HOME_COPY.cancel}
          confirmLabel={HOME_COPY.addItemConfirm}
          onCancel={onCancel}
          onConfirm={handleSubmit}
          disabled={submitting || itemName.trim().length === 0}
        />
      }
    >
      <AddItemFields
        state={state}
        inputRef={inputRef}
        categories={categories}
        categoryImages={categoryImages}
        items={items}
        submitting={submitting}
        onSubmit={handleSubmit}
        onBrowseKits={onBrowseKits}
      />
      {toast && <ToastMessage key={toast.id} toast={toast} onDone={dismiss} />}
    </DialogShell>
  );
};
