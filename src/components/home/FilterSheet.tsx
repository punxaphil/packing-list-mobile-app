import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { filterSheetStyles as styles } from "./filterSheetStyles.ts";

type FilterSheetProps = {
  visible: boolean;
  categories: NamedEntity[];
  selectedCategories: string[];
  onToggle: (categoryId: string) => void;
  onClear: () => void;
  onClose: () => void;
};

export const FilterSheet = (props: FilterSheetProps) => (
  <Modal visible={props.visible} transparent animationType="fade" onRequestClose={props.onClose}>
    <Pressable style={styles.backdrop} onPress={props.onClose}>
      <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
        <SheetHeader count={props.selectedCategories.length} onClear={props.onClear} />
        <CategoryList {...props} />
        <DoneButton onPress={props.onClose} />
      </Pressable>
    </Pressable>
  </Modal>
);

const SheetHeader = ({ count, onClear }: { count: number; onClear: () => void }) => (
  <View style={styles.header}>
    <Text style={styles.title}>Filter by Category</Text>
    {count > 0 && (
      <Pressable onPress={onClear} hitSlop={8}>
        <Text style={styles.clearText}>Clear ({count})</Text>
      </Pressable>
    )}
  </View>
);

const CategoryList = ({ categories, selectedCategories, onToggle }: FilterSheetProps) => (
  <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
    {categories.map((cat) => (
      <CategoryRow key={cat.id} category={cat} selected={selectedCategories.includes(cat.id)} onToggle={() => onToggle(cat.id)} />
    ))}
    {categories.length === 0 && <Text style={styles.empty}>No categories in this list</Text>}
  </ScrollView>
);

type CategoryRowProps = { category: NamedEntity; selected: boolean; onToggle: () => void };

const CategoryRow = ({ category, selected, onToggle }: CategoryRowProps) => (
  <Pressable style={styles.row} onPress={onToggle}>
    <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
      {selected && <Text style={styles.checkmark}>✓</Text>}
    </View>
    <Text style={styles.rowText}>{category.name}</Text>
  </Pressable>
);

const DoneButton = ({ onPress }: { onPress: () => void }) => (
  <Pressable style={styles.doneButton} onPress={onPress}>
    <Text style={styles.doneText}>Done</Text>
  </Pressable>
);
