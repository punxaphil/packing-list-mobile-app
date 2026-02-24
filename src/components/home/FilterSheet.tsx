import { useEffect, useRef, useState } from "react";
import { LayoutAnimation, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { FilterRow, MemberSection, sortSelectedFirst } from "./FilterComponents.tsx";
import { filterSheetStyles as styles } from "./filterSheetStyles.ts";
import { StatusSection } from "./StatusSection.tsx";
import type { StatusFilter } from "./useFilterDialog.ts";

type FilterSheetProps = {
  visible: boolean;
  categories: NamedEntity[];
  selectedCategories: string[];
  onToggleCategory: (categoryId: string) => void;
  members: NamedEntity[];
  selectedMembers: string[];
  onToggleMember: (memberId: string) => void;
  statusFilter: StatusFilter;
  onSetStatus: (status: StatusFilter) => void;
  onClear: () => void;
  onClose: () => void;
};

const animateReorder = () => LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

export const FilterSheet = (props: FilterSheetProps) => {
  const [uiSelectedCategories, setUiSelectedCategories] = useState<string[]>(props.selectedCategories);
  const [uiSelectedMembers, setUiSelectedMembers] = useState<string[]>(props.selectedMembers);
  const [uiStatusFilter, setUiStatusFilter] = useState<StatusFilter>(props.statusFilter);
  const totalCount = uiSelectedCategories.length + uiSelectedMembers.length + (uiStatusFilter !== "all" ? 1 : 0);
  const scrollRef = useRef<ScrollView>(null);
  const sortedCategories = sortSelectedFirst(props.categories, uiSelectedCategories);
  const sortedMembers = sortSelectedFirst(props.members, uiSelectedMembers);

  const defer = (fn: () => void) => setTimeout(fn, 0);

  const handleToggleCategory = (id: string) => {
    animateReorder();
    setUiSelectedCategories((current) => (current.includes(id) ? current.filter((v) => v !== id) : [...current, id]));
    defer(() => props.onToggleCategory(id));
  };

  const handleToggleMember = (id: string) => {
    animateReorder();
    setUiSelectedMembers((current) => (current.includes(id) ? current.filter((v) => v !== id) : [...current, id]));
    defer(() => props.onToggleMember(id));
  };

  const handleSetStatus = (status: StatusFilter) => {
    setUiStatusFilter(status);
    defer(() => props.onSetStatus(status));
  };

  const handleClear = () => {
    animateReorder();
    setUiSelectedCategories([]);
    setUiSelectedMembers([]);
    setUiStatusFilter("all");
    defer(() => props.onClear());
  };

  useEffect(() => {
    if (props.visible) {
      setUiSelectedCategories(props.selectedCategories);
      setUiSelectedMembers(props.selectedMembers);
      setUiStatusFilter(props.statusFilter);
      setTimeout(() => scrollRef.current?.flashScrollIndicators(), 100);
    }
  }, [props.visible, props.selectedCategories, props.selectedMembers, props.statusFilter]);

  return (
    <Modal visible={props.visible} transparent animationType="fade" onRequestClose={props.onClose}>
      <Pressable style={styles.backdrop} onPress={props.onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <SheetHeader count={totalCount} onClear={handleClear} />
          <FilterContent
            {...props}
            scrollRef={scrollRef}
            sortedCategories={sortedCategories}
            sortedMembers={sortedMembers}
            onToggleCategory={handleToggleCategory}
            onToggleMember={handleToggleMember}
            selectedCategories={uiSelectedCategories}
            selectedMembers={uiSelectedMembers}
            statusFilter={uiStatusFilter}
            onSetStatus={handleSetStatus}
          />
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

type FilterContentProps = FilterSheetProps & {
  scrollRef: React.RefObject<ScrollView | null>;
  sortedCategories: NamedEntity[];
  sortedMembers: NamedEntity[];
};

const FilterContent = ({ scrollRef, sortedCategories, sortedMembers, ...props }: FilterContentProps) => (
  <ScrollView ref={scrollRef} style={styles.list}>
    <StatusSection statusFilter={props.statusFilter} onSetStatus={props.onSetStatus} />
    <CategorySection
      categories={sortedCategories}
      selectedCategories={props.selectedCategories}
      onToggle={props.onToggleCategory}
    />
    <MemberSection members={sortedMembers} selectedMembers={props.selectedMembers} onToggle={props.onToggleMember} />
  </ScrollView>
);

type CategorySectionProps = { categories: NamedEntity[]; selectedCategories: string[]; onToggle: (id: string) => void };

const CategorySection = ({ categories, selectedCategories, onToggle }: CategorySectionProps) => (
  <>
    <Text style={styles.sectionTitle}>Categories</Text>
    {categories.map((cat) => (
      <FilterRow
        key={cat.id}
        item={cat}
        selected={selectedCategories.includes(cat.id)}
        onToggle={() => onToggle(cat.id)}
      />
    ))}
    {categories.length === 0 && <Text style={styles.empty}>No categories in this list</Text>}
  </>
);

const DoneButton = ({ onPress }: { onPress: () => void }) => (
  <Pressable style={styles.doneButton} onPress={onPress}>
    <Text style={styles.doneText}>Done</Text>
  </Pressable>
);
