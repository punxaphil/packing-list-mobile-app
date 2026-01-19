import { useCallback, useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { HOME_COPY, homeStyles } from "./styles.ts";
import { UNCATEGORIZED } from "~/services/utils.ts";

type AddItemDialogProps = {
  visible: boolean;
  categories: NamedEntity[];
  onCancel: () => void;
  onSubmit: (itemName: string, category: NamedEntity | null, newCategoryName: string | null) => void;
};

export const AddItemDialog = ({ visible, categories, onCancel, onSubmit }: AddItemDialogProps) => {
  const { itemName, setItemName, selectedCategory, setSelectedCategory, newCategoryName, setNewCategoryName } = useDialogState(visible, categories);
  const hasNewCategory = newCategoryName.trim().length > 0;
  const handleSubmit = useSubmitHandler(itemName, selectedCategory, newCategoryName, hasNewCategory, onSubmit);
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <Pressable style={homeStyles.modalBackdrop} onPress={onCancel}>
        <Pressable style={homeStyles.modalCard} onPress={(e) => e.stopPropagation()}>
          <Text style={homeStyles.modalTitle}>{HOME_COPY.addItemPrompt}</Text>
          <TextInput value={itemName} onChangeText={setItemName} placeholder={HOME_COPY.addItemPlaceholder} style={homeStyles.modalInput} autoFocus />
          <Text style={homeStyles.modalLabel}>{COPY.existingCategory}</Text>
          <CategoryDropdown categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} disabled={hasNewCategory} />
          <Text style={homeStyles.modalLabel}>{COPY.newCategory}</Text>
          <TextInput value={newCategoryName} onChangeText={setNewCategoryName} placeholder={COPY.newCategoryPlaceholder} style={homeStyles.modalInput} />
          <DialogActions onCancel={onCancel} onSubmit={handleSubmit} />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const useDialogState = (visible: boolean, categories: NamedEntity[]) => {
  const [itemName, setItemName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<NamedEntity>(UNCATEGORIZED);
  const [newCategoryName, setNewCategoryName] = useState("");
  useEffect(() => { if (visible) { setItemName(""); setSelectedCategory(UNCATEGORIZED); setNewCategoryName(""); } }, [visible, categories]);
  return { itemName, setItemName, selectedCategory, setSelectedCategory, newCategoryName, setNewCategoryName };
};

const useSubmitHandler = (itemName: string, selectedCategory: NamedEntity, newCategoryName: string, hasNewCategory: boolean, onSubmit: AddItemDialogProps["onSubmit"]) =>
  useCallback(() => {
    const trimmedName = itemName.trim();
    if (!trimmedName) return;
    onSubmit(trimmedName, hasNewCategory ? null : selectedCategory, hasNewCategory ? newCategoryName.trim() : null);
  }, [itemName, selectedCategory, newCategoryName, hasNewCategory, onSubmit]);

const UNCATEGORIZED_KEY = "__uncategorized__";
const getCategoryKey = (c: NamedEntity) => c.id || UNCATEGORIZED_KEY;

const CategoryDropdown = ({ categories, selected, onSelect, disabled }: { categories: NamedEntity[]; selected: NamedEntity; onSelect: (c: NamedEntity) => void; disabled: boolean }) => {
  const [open, setOpen] = useState(false);
  const allCategories = [UNCATEGORIZED, ...categories.filter((c) => c.id !== UNCATEGORIZED.id)];
  const toggle = () => !disabled && setOpen((v) => !v);
  const handleSelect = (cat: NamedEntity) => { onSelect(cat); setOpen(false); };
  return (
    <View style={[STYLES.dropdownContainer, disabled && STYLES.pickerDisabled]}>
      <Pressable style={STYLES.dropdownButton} onPress={toggle}>
        <Text style={STYLES.dropdownText}>{selected.name}</Text>
        <Text style={STYLES.dropdownArrow}>{open ? "▲" : "▼"}</Text>
      </Pressable>
      {open && (
        <View style={STYLES.dropdownList}>
          <ScrollView style={STYLES.dropdownScroll} nestedScrollEnabled>
            {allCategories.map((c) => (
              <Pressable key={getCategoryKey(c)} style={STYLES.dropdownItem} onPress={() => handleSelect(c)}>
                <Text style={[STYLES.dropdownItemText, getCategoryKey(c) === getCategoryKey(selected) && STYLES.dropdownItemSelected]}>{c.name}</Text>
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
    <Pressable onPress={onCancel}><Text style={homeStyles.modalAction}>{HOME_COPY.cancel}</Text></Pressable>
    <Pressable onPress={onSubmit}><Text style={[homeStyles.modalAction, homeStyles.modalActionPrimary]}>{HOME_COPY.addItemConfirm}</Text></Pressable>
  </View>
);

const COPY = { existingCategory: "Existing category", newCategory: "Or create new category", newCategoryPlaceholder: "New category name" };
const STYLES = {
  dropdownContainer: { marginBottom: 12, zIndex: 10 },
  dropdownButton: { flexDirection: "row" as const, justifyContent: "space-between" as const, alignItems: "center" as const, borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 14, backgroundColor: "#fff" },
  dropdownText: { fontSize: 16, color: "#111827" },
  dropdownArrow: { fontSize: 12, color: "#6b7280" },
  dropdownList: { position: "absolute" as const, top: 52, left: 0, right: 0, backgroundColor: "#fff", borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, maxHeight: 150, zIndex: 20 },
  dropdownScroll: { maxHeight: 150 },
  dropdownItem: { paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  dropdownItemText: { fontSize: 16, color: "#111827" },
  dropdownItemSelected: { fontWeight: "600" as const, color: "#2563eb" },
  pickerDisabled: { opacity: 0.5 },
};
