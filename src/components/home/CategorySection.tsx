import { useState } from "react";
import Checkbox from "expo-checkbox";
import { Pressable, Text, View } from "react-native";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { HOME_COPY, homeStyles } from "./styles.ts";
import { homeColors } from "./theme.ts";
import { SectionGroup } from "./itemsSectionHelpers.ts";
import { EditableText } from "./EditableText.tsx";

type CategorySectionProps = {
  section: SectionGroup;
  color: string;
  onToggle: (item: PackItem) => void;
  onRenameItem: (item: PackItem, name: string) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (category: NamedEntity) => Promise<PackItem>;
  onRenameCategory: (category: NamedEntity, name: string) => void;
  onToggleCategory: (items: PackItem[], checked: boolean) => void;
};

type CategoryEditing = {
  editingId: string | null;
  start: (id: string) => void;
  stop: (id: string) => void;
};

type CategoryStatus = {
  allChecked: boolean;
  indeterminate: boolean;
};

type CategoryHeaderProps = CategorySectionProps & {
  editing: CategoryEditing;
  onAdd: () => void;
};

type CategoryItemsProps = CategorySectionProps & {
  editing: CategoryEditing;
};

type CategoryItemRowProps = {
  item: PackItem;
  editing: CategoryEditing;
  onToggle: (item: PackItem) => void;
  onRenameItem: (item: PackItem, name: string) => void;
  onDeleteItem: (id: string) => void;
};

export const CategorySection = (props: CategorySectionProps) => {
  const editing = useCategoryEditing();
  const onAdd = async () => editing.start((await props.onAddItem(props.section.category)).id);
  return (
    <View style={[homeStyles.category, { backgroundColor: props.color }]}>
      <CategoryHeader {...props} editing={editing} onAdd={onAdd} />
      <CategoryItems {...props} editing={editing} />
    </View>
  );
};

const useCategoryEditing = (): CategoryEditing => {
  const [editingId, setEditingId] = useState<string | null>(null);
  return {
    editingId,
    start: setEditingId,
    stop: (id: string) => setEditingId((current) => (current === id ? null : current)),
  };
};

const getCategoryStatus = (items: PackItem[]): CategoryStatus => {
  const allChecked = items.every((item) => item.checked);
  return { allChecked, indeterminate: !allChecked && items.some((item) => item.checked) };
};

const CategoryHeader = ({ section, onToggleCategory, onRenameCategory, onAdd, editing }: CategoryHeaderProps) => {
  const status = getCategoryStatus(section.items);
  return (
    <View style={homeStyles.categoryHeader}>
      <CategoryCheckbox items={section.items} status={status} onToggleCategory={onToggleCategory} />
      <EditableText value={section.category.name} onSubmit={(name) => onRenameCategory(section.category, name)} textStyle={homeStyles.categoryTitle} inputStyle={homeStyles.categoryInput} containerStyle={homeStyles.editable} onStart={() => editing.start(section.category.id)} onEnd={() => editing.stop(section.category.id)} />
      <Pressable style={homeStyles.addButton} onPress={onAdd} accessibilityRole="button" accessibilityLabel={HOME_COPY.addItem}>
        <Text style={homeStyles.addLabel}>+</Text>
      </Pressable>
    </View>
  );
};

const CategoryCheckbox = ({ items, status, onToggleCategory }: { items: PackItem[]; status: CategoryStatus; onToggleCategory: (items: PackItem[], checked: boolean) => void }) => (
  <View style={homeStyles.categoryCheckboxWrapper}>
    <Checkbox value={status.allChecked} onValueChange={(checked) => onToggleCategory(items, checked)} style={homeStyles.checkbox} color={status.allChecked ? homeColors.primary : undefined} />
    {status.indeterminate && <View pointerEvents="none" style={homeStyles.categoryCheckboxIndicator} />}
  </View>
);

const CategoryItems = ({ section, editing, onToggle, onRenameItem, onDeleteItem }: CategoryItemsProps) => (
  <View style={homeStyles.categoryBody}>
    {section.items.map((item) => (
      <CategoryItemRow key={item.id} item={item} editing={editing} onToggle={onToggle} onRenameItem={onRenameItem} onDeleteItem={onDeleteItem} />
    ))}
  </View>
);

const CategoryItemRow = ({ item, editing, onToggle, onRenameItem, onDeleteItem }: CategoryItemRowProps) => (
  <View style={homeStyles.detailItem}>
    <Checkbox value={item.checked} onValueChange={() => onToggle(item)} color={item.checked ? homeColors.primary : undefined} style={homeStyles.checkbox} />
    <EditableText
      value={item.name}
      onSubmit={(name) => onRenameItem(item, name)}
      textStyle={[homeStyles.detailLabel, item.checked && homeStyles.detailLabelChecked]}
      inputStyle={homeStyles.itemInput}
      autoFocus={editing.editingId === item.id}
      onStart={() => editing.start(item.id)}
      onEnd={() => editing.stop(item.id)}
      containerStyle={homeStyles.editable}
    />
    <Pressable style={homeStyles.deleteButton} onPress={() => { onDeleteItem(item.id); editing.stop(item.id); }} accessibilityRole="button" accessibilityLabel={HOME_COPY.deleteItem}>
      <Text style={homeStyles.deleteLabel}>×</Text>
    </Pressable>
  </View>
);
