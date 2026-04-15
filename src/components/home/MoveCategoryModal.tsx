import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, Text, TextInput } from "react-native";
import { UNCATEGORIZED } from "~/services/utils.ts";
import { DuplicateNameError } from "~/types/DuplicateNameError.ts";
import type { Image } from "~/types/Image.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { DialogActions, DialogShell } from "../shared/DialogShell.tsx";
import { PageSheet } from "../shared/PageSheet.tsx";
import { CATEGORY_FIELD_STYLES, CategoryDropdown } from "./CategoryFields.tsx";
import { commonCopy, homeCopy } from "./copy.ts";
import { addItemCopy, moveCategoryCopy } from "./listCopy.ts";
import { homeStyles } from "./styles.ts";

type MoveCategoryModalProps = {
  visible: boolean;
  categories: NamedEntity[];
  categoryImages: Image[];
  currentCategoryId: string;
  onClose: () => void;
  onSubmit: (category: NamedEntity | null, newCategoryName: string | null) => Promise<void>;
};

export const MoveCategoryModal = ({
  visible,
  categories,
  categoryImages,
  currentCategoryId,
  onClose,
  onSubmit,
}: MoveCategoryModalProps) => {
  const inputRef = useRef<TextInput>(null);
  const [selectedCategory, setSelectedCategory] = useState<NamedEntity>(UNCATEGORIZED);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isIosSheet = Platform.OS === "ios";
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

  const handleSubmit = useCallback(async () => {
    if (isSubmitDisabled) return;
    setSubmitting(true);
    try {
      await onSubmit(
        existingCategory ?? (trimmedName ? null : selectedCategory),
        trimmedName && !existingCategory ? trimmedName : null
      );
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
  }, [existingCategory, isSubmitDisabled, onClose, onSubmit, selectedCategory, trimmedName]);

  const content = (
    <>
      <Text style={isIosSheet ? CATEGORY_FIELD_STYLES.sheetLabel : homeStyles.modalLabel}>
        {addItemCopy.existingCategory}
      </Text>
      <CategoryDropdown
        categories={categories}
        categoryImages={categoryImages}
        selected={selectedCategory}
        onSelect={(category) => {
          setSelectedCategory(category);
          setError(null);
        }}
        disabled={submitting || hasNewCategory}
        iosSheet={isIosSheet}
      />
      <Text style={isIosSheet ? CATEGORY_FIELD_STYLES.sheetLabel : homeStyles.modalLabel}>
        {addItemCopy.newCategory}
      </Text>
      <TextInput
        ref={inputRef}
        value={newCategoryName}
        onChangeText={(text) => {
          setNewCategoryName(text);
          setError(null);
        }}
        placeholder={addItemCopy.newCategoryPlaceholder}
        style={isIosSheet ? CATEGORY_FIELD_STYLES.sheetInput : homeStyles.modalInput}
        editable={!submitting}
      />
      {error && <Text style={homeStyles.modalError}>{error}</Text>}
    </>
  );

  if (isIosSheet) {
    return (
      <PageSheet
        visible={visible}
        title={moveCategoryCopy.title}
        onClose={onClose}
        confirmLabel={homeCopy.renameListConfirm}
        onConfirm={handleSubmit}
        confirmDisabled={isSubmitDisabled}
      >
        {content}
      </PageSheet>
    );
  }

  return (
    <DialogShell
      visible={visible}
      title={moveCategoryCopy.title}
      onClose={onClose}
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
      {content}
    </DialogShell>
  );
};
