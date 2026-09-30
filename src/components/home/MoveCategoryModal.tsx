import { useEffect, useRef, useState } from "react";
import { UNCATEGORIZED } from "~/services/utils.ts";
import { DuplicateNameError } from "~/types/DuplicateNameError.ts";
import type { Image } from "~/types/Image.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { DialogActions, DialogShell } from "../shared/DialogShell.tsx";
import { commonCopy, homeCopy } from "./copy.ts";
import { moveCategoryCopy } from "./listCopy.ts";
import { MoveCategoryFields } from "./MoveCategoryFields.tsx";

type MoveCategoryModalProps = {
  visible: boolean;
  categories: NamedEntity[];
  usedCategoryIds: string[];
  categoryImages: Image[];
  currentCategoryId: string;
  onClose: () => void;
  onSubmit: (category: NamedEntity | null, newCategoryName: string | null) => Promise<void>;
};

export const MoveCategoryModal = (props: MoveCategoryModalProps) => {
  const { visible, categories, usedCategoryIds, categoryImages, currentCategoryId, onClose, onSubmit } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<NamedEntity>(UNCATEGORIZED);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const hasNewCategory = newCategoryName.trim().length > 0;
  const trimmedName = newCategoryName.trim();
  const existingCategory = categories.find((category) => category.name.toLowerCase() === trimmedName.toLowerCase());
  const targetCategoryId = existingCategory?.id ?? (trimmedName ? null : selectedCategory.id);
  const isSubmitDisabled = submitting || targetCategoryId === currentCategoryId;

  useEffect(() => {
    if (!visible) return;
    setSelectedCategory(categories.find((category) => category.id === currentCategoryId) ?? UNCATEGORIZED);
    setNewCategoryName("");
    setError(null);
  }, [categories, currentCategoryId, visible]);

  const submitCategory = async (category: NamedEntity | null, name: string | null) => {
    if (submitting || (!name && category?.id === currentCategoryId)) return;
    setSubmitting(true);
    try {
      await onSubmit(category, name);
      onClose();
    } catch (cause) {
      if (cause instanceof DuplicateNameError) {
        setError(homeCopy.duplicateCategoryName);
        inputRef.current?.focus();
        return;
      }
      throw cause;
    } finally {
      setSubmitting(false);
    }
  };
  const handleSubmit = () =>
    submitCategory(
      existingCategory ?? (trimmedName ? null : selectedCategory),
      trimmedName && !existingCategory ? trimmedName : null
    );

  return (
    <DialogShell
      visible={visible}
      title={moveCategoryCopy.title}
      onClose={onClose}
      onShow={() => {
        if (categories.every((category) => category.id === currentCategoryId)) inputRef.current?.focus();
      }}
      actions={
        <DialogActions
          cancelLabel={commonCopy.cancel}
          confirmLabel={homeCopy.renameListConfirm}
          onCancel={onClose}
          onConfirm={handleSubmit}
          disabled={isSubmitDisabled}
        />
      }
    >
      <MoveCategoryFields
        categories={categories}
        usedCategoryIds={usedCategoryIds}
        categoryImages={categoryImages}
        selected={selectedCategory}
        disabled={submitting || hasNewCategory}
        submitting={submitting}
        name={newCategoryName}
        error={error}
        inputRef={inputRef}
        onSelect={(category) => {
          setSelectedCategory(category);
          setError(null);
          void submitCategory(category, null);
        }}
        onNameChange={(name) => {
          setNewCategoryName(name);
          setError(null);
        }}
      />
    </DialogShell>
  );
};
