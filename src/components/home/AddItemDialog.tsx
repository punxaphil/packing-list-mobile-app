import i18next from "i18next";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Animated, Platform, Pressable, Text, TextInput, View } from "react-native";
import { UNCATEGORIZED } from "~/services/utils.ts";
import { DuplicateNameError } from "~/types/DuplicateNameError.ts";
import type { Image } from "~/types/Image.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { Button } from "../shared/Button.tsx";
import { DialogActions, DialogShell } from "../shared/DialogShell.tsx";
import { PageSheet } from "../shared/PageSheet.tsx";
import { AppCheckbox } from "./AppCheckbox.tsx";
import { CATEGORY_FIELD_STYLES, CategoryDropdown } from "./CategoryFields.tsx";
import { hasDuplicateName } from "./itemHandlers.ts";
import { HOME_COPY, homeStyles } from "./styles.ts";
import { homeColors } from "./theme.ts";
import { animateToast, TOAST_STYLES } from "./toastUtils.ts";

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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;
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
  const isIosSheet = Platform.OS === "ios";
  const { t } = useTranslation();
  const isSubmitDisabled = itemName.trim().length === 0;
  const hasNewCategory = newCategoryName.trim().length > 0;
  const targetCategoryId = hasNewCategory ? "" : selectedCategory.id;
  const toggleKeepOpen = useCallback(() => setKeepOpen((value) => !value), [setKeepOpen]);
  const showToast = useCallback(
    (message: string) => {
      setToastMessage(message);
      toastOpacity.setValue(0);
      animateToast(toastOpacity, () => setToastMessage(null));
    },
    [toastOpacity]
  );
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
  const inputStyle = [
    isIosSheet ? STYLES.sheetInput : homeStyles.modalInput,
    error ? homeStyles.modalInputError : null,
  ];
  const content = (
    <>
      <TextInput
        ref={inputRef}
        value={itemName}
        onChangeText={(text) => {
          setItemName(text);
          setError(null);
        }}
        placeholder={HOME_COPY.addItemPlaceholder}
        style={inputStyle}
        editable={!submitting}
        autoFocus
      />
      {error && <Text style={homeStyles.modalError}>{error}</Text>}
      <Text style={isIosSheet ? STYLES.sheetLabel : homeStyles.modalLabel}>{t("addItem.existingCategory")}</Text>
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
        iosSheet={isIosSheet}
      />
      <Text style={isIosSheet ? STYLES.sheetLabel : homeStyles.modalLabel}>{t("addItem.newCategory")}</Text>
      <TextInput
        value={newCategoryName}
        onChangeText={(text) => {
          setNewCategoryName(text);
          setError(null);
        }}
        placeholder={t("addItem.newCategoryPlaceholder")}
        style={isIosSheet ? STYLES.sheetInput : homeStyles.modalInput}
        editable={!submitting}
      />
      <Pressable
        style={STYLES.keepOpenRow}
        onPress={toggleKeepOpen}
        disabled={submitting}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: keepOpen }}
      >
        <View pointerEvents="none">
          <AppCheckbox checked={keepOpen} onToggle={toggleKeepOpen} size={24} />
        </View>
        <Text style={STYLES.keepOpenText}>{t("addItem.keepOpen")}</Text>
      </Pressable>
      <Button label={t("addItem.browseKits")} onPress={onBrowseKits} disabled={submitting} />
    </>
  );
  if (isIosSheet) {
    return (
      <PageSheet
        visible={visible}
        title={HOME_COPY.addItemPrompt}
        onClose={onCancel}
        confirmLabel={HOME_COPY.addItemConfirm}
        onConfirm={handleSubmit}
        confirmDisabled={isSubmitDisabled || submitting}
      >
        {content}
        {toastMessage && (
          <Animated.View style={[TOAST_STYLES.container, { opacity: toastOpacity }]}>
            <Text style={TOAST_STYLES.text}>{toastMessage}</Text>
          </Animated.View>
        )}
      </PageSheet>
    );
  }
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
      {toastMessage && (
        <Animated.View style={[TOAST_STYLES.container, { opacity: toastOpacity }]}>
          <Text style={TOAST_STYLES.text}>{toastMessage}</Text>
        </Animated.View>
      )}
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
      setError(i18next.t("addItem.duplicateError"));
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
        setError(i18next.t("addItem.duplicateError"));
        return;
      }
      throw e;
    }
    if (!keepOpen) return;
    setItemName("");
    setSelectedCategory(nextCategory);
    setNewCategoryName("");
    setError(null);
    showToast(i18next.t("addItem.added", { name: trimmedName }));
    inputRef.current?.focus();
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

const STYLES = {
  ...CATEGORY_FIELD_STYLES,
  keepOpenRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    marginBottom: 12,
  },
  keepOpenText: { fontSize: 15, color: homeColors.text },
};
