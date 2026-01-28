import { useCallback, useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { UNCATEGORIZED } from "~/services/utils.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { hasDuplicateName } from "./itemHandlers.ts";
import { HOME_COPY, homeStyles } from "./styles.ts";

type AddItemDialogProps = {
  visible: boolean;
  categories: NamedEntity[];
  items: PackItem[];
  onCancel: () => void;
  onSubmit: (itemName: string, category: NamedEntity | null, newCategoryName: string | null) => void;
};

export const AddItemDialog = ({ visible, categories, items, onCancel, onSubmit }: AddItemDialogProps) => {
  const state = useDialogState(visible);
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
    onSubmit
  );
  const inputStyle = error ? [homeStyles.modalInput, homeStyles.modalInputError] : homeStyles.modalInput;
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <Pressable style={homeStyles.modalBackdrop} onPress={onCancel}>
        <Pressable style={homeStyles.modalCard} onPress={(e) => e.stopPropagation()}>
          <Text style={homeStyles.modalTitle}>{HOME_COPY.addItemPrompt}</Text>
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
          <DialogActions onCancel={onCancel} onSubmit={handleSubmit} />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const useDialogState = (visible: boolean) => {
  const [itemName, setItemName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<NamedEntity>(UNCATEGORIZED);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (visible) {
      setItemName("");
      setSelectedCategory(UNCATEGORIZED);
      setNewCategoryName("");
      setError(null);
    }
  }, [visible]);
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
  onSubmit: AddItemDialogProps["onSubmit"]
) =>
  useCallback(() => {
    const trimmedName = itemName.trim();
    if (!trimmedName) return;
    if (!hasNewCategory && hasDuplicateName(trimmedName, targetCategoryId, items)) {
      setError(COPY.duplicateError);
      return;
    }
    onSubmit(trimmedName, hasNewCategory ? null : selectedCategory, hasNewCategory ? newCategoryName.trim() : null);
  }, [itemName, selectedCategory, newCategoryName, hasNewCategory, items, targetCategoryId, setError, onSubmit]);

const UNCATEGORIZED_KEY = "__uncategorized__";
const getCategoryKey = (c: NamedEntity) => c.id || UNCATEGORIZED_KEY;

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
  const allCategories = [UNCATEGORIZED, ...categories.filter((c) => c.id !== UNCATEGORIZED.id)];
  const toggle = () => !disabled && setOpen((v) => !v);
  const handleSelect = (cat: NamedEntity) => {
    onSelect(cat);
    setOpen(false);
  };
  return (
    <View style={[STYLES.dropdownContainer, disabled ? STYLES.pickerDisabled : null]}>
      <Pressable style={STYLES.dropdownButton} onPress={toggle}>
        <Text style={STYLES.dropdownText}>{selected.name}</Text>
        <Text style={STYLES.dropdownArrow}>{open ? "▲" : "▼"}</Text>
      </Pressable>
      {open && (
        <View style={STYLES.dropdownList}>
          <ScrollView style={STYLES.dropdownScroll} nestedScrollEnabled>
            {allCategories.map((c) => (
              <Pressable key={getCategoryKey(c)} style={STYLES.dropdownItem} onPress={() => handleSelect(c)}>
                <Text
                  style={[
                    STYLES.dropdownItemText,
                    getCategoryKey(c) === getCategoryKey(selected) ? STYLES.dropdownItemSelected : null,
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

const DialogActions = ({ onCancel, onSubmit }: { onCancel: () => void; onSubmit: () => void }) => (
  <View style={homeStyles.modalActions}>
    <Pressable onPress={onCancel}>
      <Text style={homeStyles.modalAction}>{HOME_COPY.cancel}</Text>
    </Pressable>
    <Pressable onPress={onSubmit}>
      <Text style={[homeStyles.modalAction, homeStyles.modalActionPrimary]}>{HOME_COPY.addItemConfirm}</Text>
    </Pressable>
  </View>
);

const COPY = {
  existingCategory: "Existing category",
  newCategory: "Or create new category",
  newCategoryPlaceholder: "New category name",
  duplicateError: "An item with this name already exists in this category",
};
const STYLES = {
  dropdownContainer: { marginBottom: 12, zIndex: 10 },
  dropdownButton: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: "#fff",
  },
  dropdownText: { fontSize: 16, color: "#111827" },
  dropdownArrow: { fontSize: 12, color: "#6b7280" },
  dropdownList: {
    position: "absolute" as const,
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    maxHeight: 150,
    zIndex: 20,
  },
  dropdownScroll: { maxHeight: 150 },
  dropdownItem: { paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  dropdownItemText: { fontSize: 16, color: "#111827" },
  dropdownItemSelected: { fontWeight: "600" as const, color: "#2563eb" },
  pickerDisabled: { opacity: 0.5 },
};
