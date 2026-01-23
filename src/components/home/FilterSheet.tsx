import { useEffect, useRef } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { filterSheetStyles as styles } from "./filterSheetStyles.ts";

type FilterSheetProps = {
  visible: boolean;
  categories: NamedEntity[];
  selectedCategories: string[];
  onToggleCategory: (categoryId: string) => void;
  members: NamedEntity[];
  selectedMembers: string[];
  onToggleMember: (memberId: string) => void;
  onClear: () => void;
  onClose: () => void;
};

export const FilterSheet = (props: FilterSheetProps) => {
  const totalCount = props.selectedCategories.length + props.selectedMembers.length;
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (props.visible) {
      setTimeout(() => scrollRef.current?.flashScrollIndicators(), 100);
    }
  }, [props.visible]);

  return (
    <Modal visible={props.visible} transparent animationType="fade" onRequestClose={props.onClose}>
      <Pressable style={styles.backdrop} onPress={props.onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <SheetHeader count={totalCount} onClear={props.onClear} />
          <FilterContent {...props} scrollRef={scrollRef} />
          <DoneButton onPress={props.onClose} />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const SheetHeader = ({ count, onClear }: { count: number; onClear: () => void }) => (
  <View style={styles.header}>
    <Text style={styles.title}>Filters</Text>
    {count > 0 && (
      <Pressable onPress={onClear} hitSlop={8}>
        <Text style={styles.clearText}>Clear ({count})</Text>
      </Pressable>
    )}
  </View>
);

type FilterContentProps = FilterSheetProps & { scrollRef: React.RefObject<ScrollView | null> };

const FilterContent = ({ scrollRef, ...props }: FilterContentProps) => (
  <ScrollView ref={scrollRef} style={styles.list}>
    <CategorySection categories={props.categories} selectedCategories={props.selectedCategories} onToggle={props.onToggleCategory} />
    <MemberSection members={props.members} selectedMembers={props.selectedMembers} onToggle={props.onToggleMember} />
  </ScrollView>
);

type CategorySectionProps = { categories: NamedEntity[]; selectedCategories: string[]; onToggle: (id: string) => void };

const CategorySection = ({ categories, selectedCategories, onToggle }: CategorySectionProps) => (
  <>
    <Text style={styles.sectionTitle}>Categories</Text>
    {categories.map((cat) => (
      <FilterRow key={cat.id} item={cat} selected={selectedCategories.includes(cat.id)} onToggle={() => onToggle(cat.id)} />
    ))}
    {categories.length === 0 && <Text style={styles.empty}>No categories in this list</Text>}
  </>
);

type MemberSectionProps = { members: NamedEntity[]; selectedMembers: string[]; onToggle: (id: string) => void };

const MemberSection = ({ members, selectedMembers, onToggle }: MemberSectionProps) => (
  <>
    <Text style={styles.sectionTitle}>Members</Text>
    {members.map((member) => (
      <FilterRow key={member.id} item={member} selected={selectedMembers.includes(member.id)} onToggle={() => onToggle(member.id)} />
    ))}
    {members.length === 0 && <Text style={styles.empty}>No members assigned in this list</Text>}
  </>
);

type FilterRowProps = { item: NamedEntity; selected: boolean; onToggle: () => void };

const FilterRow = ({ item, selected, onToggle }: FilterRowProps) => (
  <Pressable style={styles.row} onPress={onToggle}>
    <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
      {selected && <Text style={styles.checkmark}>✓</Text>}
    </View>
    <Text style={styles.rowText}>{item.name}</Text>
  </Pressable>
);

const DoneButton = ({ onPress }: { onPress: () => void }) => (
  <Pressable style={styles.doneButton} onPress={onPress}>
    <Text style={styles.doneText}>Done</Text>
  </Pressable>
);
