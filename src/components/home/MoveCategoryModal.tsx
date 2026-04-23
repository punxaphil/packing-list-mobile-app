import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, Text, TextInput } from "react-native";
import { UNCATEGORIZED } from "~/services/utils.ts";
import { DuplicateNameError } from "~/types/DuplicateNameError.ts";
import type { Image } from "~/types/Image.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { DialogActions, DialogShell } from "../shared/DialogShell.tsx";
import { PageSheet } from "../shared/PageSheet.tsx";
import { CATEGORY_FIELD_COPY, CATEGORY_FIELD_STYLES, CategoryDropdown } from "./CategoryFields.tsx";
import { HOME_COPY, homeStyles } from "./styles.ts";

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
        setError(COPY.duplicateCategory);
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
        {CATEGORY_FIELD_COPY.existingCategory}
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
        {CATEGORY_FIELD_COPY.newCategory}
      </Text>
      <TextInput
        ref={inputRef}
        value={newCategoryName}
        onChangeText={(text) => {
          setNewCategoryName(text);
          setError(null);
        }}
        placeholder={CATEGORY_FIELD_COPY.newCategoryPlaceholder}
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
        title={COPY.title}
        onClose={onClose}
        confirmLabel={COPY.confirm}
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
      title={COPY.title}
      onClose={onClose}
      actions={
        <DialogActions
          cancelLabel={COPY.cancel}
          confirmLabel={COPY.confirm}
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

const COPY = {
  title: "Change Category",
  cancel: HOME_COPY.cancel,
  confirm: HOME_COPY.renameListConfirm,
  duplicateCategory: HOME_COPY.duplicateCategoryName,
};
