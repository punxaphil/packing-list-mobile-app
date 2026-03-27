import { useCallback, useEffect, useState } from "react";
import {
  Keyboard,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { getCategoryKey, UNCATEGORIZED } from "~/services/utils.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { DialogActions, DialogShell } from "../shared/DialogShell.tsx";
import { hasDuplicateName } from "./itemHandlers.ts";
import { HOME_COPY, homeStyles } from "./styles.ts";
import { homeColors } from "./theme.ts";

type AddItemDialogProps = {
  visible: boolean;
  initialCategory?: NamedEntity;
  categories: NamedEntity[];
  items: PackItem[];
  onCancel: () => void;
  onSubmit: (
    itemName: string,
    category: NamedEntity | null,
    newCategoryName: string | null,
  ) => void;
  onBrowseKits: () => void;
};

export const AddItemDialog = ({
  visible,
  initialCategory,
  categories,
  items,
  onCancel,
  onSubmit,
  onBrowseKits,
}: AddItemDialogProps) => {
  const state = useDialogState(visible, initialCategory);
  const {
    itemName,
    setItemName,
    selectedCategory,
    setSelectedCategory,
    newCategoryName,
    setNewCategoryName,
    error,
    setError,
  } = state;
  const hasNewCategory = newCategoryName.trim().length > 0;
  const targetCategoryId = hasNewCategory ? "" : selectedCategory.id;
  const handleSubmit = useSubmitHandler(
    itemName,
    selectedCategory,
    newCategoryName,
    hasNewCategory,
    items,
    targetCategoryId,
    setError,
    onSubmit,
  );
  const inputStyle = error
    ? [homeStyles.modalInput, homeStyles.modalInputError]
    : homeStyles.modalInput;
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
        />
      }
    >
      <TextInput
        value={itemName}
        onChangeText={(text) => {
          setItemName(text);
          setError(null);
        }}
        placeholder={HOME_COPY.addItemPlaceholder}
        style={inputStyle}
        autoFocus
      />
      {error && <Text style={homeStyles.modalError}>{error}</Text>}
      <Text style={homeStyles.modalLabel}>{COPY.existingCategory}</Text>
      <CategoryDropdown
        categories={categories}
        selected={selectedCategory}
        onSelect={(c) => {
          setSelectedCategory(c);
          setError(null);
        }}
        disabled={hasNewCategory}
      />
      <Text style={homeStyles.modalLabel}>{COPY.newCategory}</Text>
      <TextInput
        value={newCategoryName}
        onChangeText={(text) => {
          setNewCategoryName(text);
          setError(null);
        }}
        placeholder={COPY.newCategoryPlaceholder}
        style={homeStyles.modalInput}
      />
      <Pressable onPress={onBrowseKits}>
        <Text style={STYLES.browseKitsLink}>{COPY.browseKits}</Text>
      </Pressable>
    </DialogShell>
  );
};

const useDialogState = (visible: boolean, initialCategory?: NamedEntity) => {
  const [itemName, setItemName] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<NamedEntity>(UNCATEGORIZED);
  const [newCategoryName, setNewCategoryName] = useState("");
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
  setError: (error: string | null) => void,
  onSubmit: AddItemDialogProps["onSubmit"],
) =>
  useCallback(() => {
    const trimmedName = itemName.trim();
    if (!trimmedName) return;
    if (
      !hasNewCategory &&
      hasDuplicateName(trimmedName, targetCategoryId, items)
    ) {
      setError(COPY.duplicateError);
      return;
    }
    onSubmit(
      trimmedName,
      hasNewCategory ? null : selectedCategory,
      hasNewCategory ? newCategoryName.trim() : null,
    );
  }, [
    itemName,
    selectedCategory,
    newCategoryName,
    hasNewCategory,
    items,
    targetCategoryId,
    setError,
    onSubmit,
  ]);

const CategoryDropdown = ({
  categories,
  selected,
  onSelect,
  disabled,
}: {
  categories: NamedEntity[];
  selected: NamedEntity;
  onSelect: (c: NamedEntity) => void;
  disabled: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const allCategories = [
    UNCATEGORIZED,
    ...categories.filter((c) => c.id !== UNCATEGORIZED.id),
  ];
  const toggle = () => {
    if (disabled) return;
    Keyboard.dismiss();
    setOpen((v) => !v);
  };
  const handleSelect = (cat: NamedEntity) => {
    onSelect(cat);
    setOpen(false);
  };
  return (
    <View
      style={[
        STYLES.dropdownContainer,
        disabled ? STYLES.pickerDisabled : null,
      ]}
    >
      <Pressable style={STYLES.dropdownButton} onPress={toggle}>
        <Text style={STYLES.dropdownText}>{selected.name}</Text>
        <Text style={STYLES.dropdownArrow}>{open ? "▲" : "▼"}</Text>
      </Pressable>
      {open && (
        <View style={STYLES.dropdownList}>
          <ScrollView style={STYLES.dropdownScroll} nestedScrollEnabled>
            {allCategories.map((c) => (
              <Pressable
                key={getCategoryKey(c)}
                style={STYLES.dropdownItem}
                onPress={() => handleSelect(c)}
              >
                <Text
                  style={[
                    STYLES.dropdownItemText,
                    getCategoryKey(c) === getCategoryKey(selected)
                      ? STYLES.dropdownItemSelected
                      : null,
                  ]}
                >
                  {c.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const COPY = {
  existingCategory: "Existing category",
  newCategory: "Or create new category",
  newCategoryPlaceholder: "New category name",
  duplicateError: "An item with this name already exists in this category",
  browseKits: "Browse Packing Kits",
};
const STYLES = {
  dropdownContainer: { marginBottom: 12, zIndex: 10 },
  dropdownButton: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: homeColors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: homeColors.surface,
  },
  dropdownText: { fontSize: 16, color: homeColors.text },
  dropdownArrow: { fontSize: 12, color: homeColors.muted },
  dropdownList: {
    position: "absolute" as const,
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: homeColors.surface,
    borderWidth: 1,
    borderColor: homeColors.border,
    borderRadius: 8,
    maxHeight: 150,
    zIndex: 20,
  },
  dropdownScroll: { maxHeight: 150 },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: homeColors.border,
  },
  dropdownItemText: { fontSize: 16, color: homeColors.text },
  dropdownItemSelected: {
    fontWeight: "600" as const,
    color: homeColors.primary,
  },
  pickerDisabled: { opacity: 0.5 },
  browseKitsLink: {
    fontSize: 14,
    color: homeColors.primary,
    textAlign: "center" as const,
  },
};
