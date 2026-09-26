import { useCallback, useEffect, useRef, useState } from "react";
import { Text, TextInput } from "react-native";
import { UNCATEGORIZED } from "~/services/utils.ts";
import { DuplicateNameError } from "~/types/DuplicateNameError.ts";
import type { Image } from "~/types/Image.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { Button } from "../shared/Button.tsx";
import { DialogActions, DialogShell } from "../shared/DialogShell.tsx";
import { AppCheckbox } from "./AppCheckbox.tsx";
import { CategoryDropdown } from "./CategoryFields.tsx";
import { hasDuplicateName } from "./itemHandlers.ts";
import { addItemCopy } from "./listCopy.ts";
import { HOME_COPY, homeStyles } from "./styles.ts";
import { useToastMessage } from "./Toast.tsx";
import { ToastMessage } from "./ToastMessage.tsx";
import { homeColors } from "./theme.ts";
import "./addItemDialog.css";

type AddItemDialogProps = {
  visible: boolean;
  initialCategory?: NamedEntity;
  categories: NamedEntity[];
  categoryImages: Image[];
  items: PackItem[];
  onCancel: () => void;
  onSubmit: (
    itemName: string,
    category: NamedEntity | null,
    newCategoryName: string | null,
    keepOpen: boolean
  ) => Promise<NamedEntity>;
  onBrowseKits: () => void;
};

export const AddItemDialog = ({
  visible,
  initialCategory,
  categories,
  categoryImages,
  items,
  onCancel,
  onSubmit,
  onBrowseKits,
}: AddItemDialogProps) => {
  const { toast, show: showToast, dismiss } = useToastMessage();
  const state = useDialogState(visible, initialCategory);
  const {
    itemName,
    setItemName,
    selectedCategory,
    setSelectedCategory,
    newCategoryName,
    setNewCategoryName,
    keepOpen,
    setKeepOpen,
    error,
    setError,
  } = state;
  const inputRef = useRef<TextInput>(null);
  const submittingRef = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const isSubmitDisabled = itemName.trim().length === 0;
  const hasNewCategory = newCategoryName.trim().length > 0;
  const targetCategoryId = hasNewCategory ? "" : selectedCategory.id;
  const toggleKeepOpen = useCallback(() => setKeepOpen((value) => !value), [setKeepOpen]);
  const submit = useSubmitHandler(
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
  const inputStyle = [homeStyles.modalInput, error ? homeStyles.modalInputError : null];
  const content = (
    <>
      <Text style={homeStyles.modalLabel}>{HOME_COPY.newItem}</Text>
      <TextInput
        ref={inputRef}
        value={itemName}
        onChangeText={(text) => {
          setItemName(text);
          setError(null);
        }}
        onSubmitEditing={isSubmitDisabled || submitting ? undefined : () => void handleSubmit()}
        accessibilityLabel={HOME_COPY.newItem}
        style={inputStyle}
        editable={!submitting}
        autoFocus
      />
      {error && <Text style={homeStyles.modalError}>{error}</Text>}
      <Text style={homeStyles.modalLabel}>{COPY.existingCategory}</Text>
      <CategoryDropdown
        categories={categories}
        categoryImages={categoryImages}
        usedCategoryIds={items.map((i) => i.category).filter(Boolean)}
        selected={selectedCategory}
        onSelect={(c) => {
          setSelectedCategory(c);
          setError(null);
        }}
        disabled={submitting || hasNewCategory}
      />
      <Text style={homeStyles.modalLabel}>{COPY.newCategory}</Text>
      <TextInput
        value={newCategoryName}
        accessibilityLabel={COPY.newCategory}
        onChangeText={(text) => {
          setNewCategoryName(text);
          setError(null);
        }}
        style={homeStyles.modalInput}
        editable={!submitting}
      />
      <label className="add-item-keep-open" htmlFor="add-item-keep-open" style={{ color: homeColors.text }}>
        <AppCheckbox
          id="add-item-keep-open"
          checked={keepOpen}
          label={COPY.keepOpen}
          onToggle={toggleKeepOpen}
          size={24}
          disabled={submitting}
        />
        <span>{COPY.keepOpen}</span>
      </label>
      <Button label={COPY.browseKits} onPress={onBrowseKits} disabled={submitting} />
    </>
  );
  return (
    <DialogShell
      visible={visible}
      title={HOME_COPY.addItemPrompt}
      onClose={onCancel}
      actions={
        <DialogActions
          cancelLabel={HOME_COPY.cancel}
          confirmLabel={HOME_COPY.addItemConfirm}
          onCancel={onCancel}
          onConfirm={handleSubmit}
          disabled={submitting || isSubmitDisabled}
        />
      }
    >
      {content}
      {toast && <ToastMessage key={toast.id} toast={toast} onDone={dismiss} />}
    </DialogShell>
  );
};

const useDialogState = (visible: boolean, initialCategory?: NamedEntity) => {
  const [itemName, setItemName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<NamedEntity>(UNCATEGORIZED);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [keepOpen, setKeepOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (visible) {
      setItemName("");
      setSelectedCategory(initialCategory ?? UNCATEGORIZED);
      setNewCategoryName("");
      setError(null);
    }
  }, [visible, initialCategory]);
  return {
    itemName,
    setItemName,
    selectedCategory,
    setSelectedCategory,
    newCategoryName,
    setNewCategoryName,
    keepOpen,
    setKeepOpen,
    error,
    setError,
  };
};

const useSubmitHandler = (
  itemName: string,
  selectedCategory: NamedEntity,
  newCategoryName: string,
  hasNewCategory: boolean,
  items: PackItem[],
  targetCategoryId: string,
  setItemName: (value: string) => void,
  setSelectedCategory: (category: NamedEntity) => void,
  setNewCategoryName: (value: string) => void,
  setError: (error: string | null) => void,
  keepOpen: boolean,
  showToast: (message: string) => void,
  inputRef: React.RefObject<TextInput | null>,
  onSubmit: AddItemDialogProps["onSubmit"]
) =>
  useCallback(async () => {
    const trimmedName = itemName.trim();
    if (!trimmedName) return;
    if (!hasNewCategory && hasDuplicateName(trimmedName, targetCategoryId, items)) {
      setError(COPY.duplicateError);
      return;
    }
    let nextCategory: NamedEntity;
    try {
      nextCategory = await onSubmit(
        trimmedName,
        hasNewCategory ? null : selectedCategory,
        hasNewCategory ? newCategoryName.trim() : null,
        keepOpen
      );
    } catch (e) {
      if (e instanceof DuplicateNameError) {
        setError(COPY.duplicateError);
        return;
      }
      throw e;
    }
    if (!keepOpen) return;
    setItemName("");
    setSelectedCategory(nextCategory);
    setNewCategoryName("");
    setError(null);
    showToast(COPY.added.replace("{name}", trimmedName));
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [
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
    onSubmit,
  ]);

const COPY = addItemCopy;
