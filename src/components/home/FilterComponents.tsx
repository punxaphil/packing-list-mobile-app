import { type RefObject } from "react";
import {
  Pressable,
  Image as RNImage,
  ScrollView,
  Text,
  View,
} from "react-native";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { AppCheckbox } from "./AppCheckbox.tsx";
import { filterSheetStyles as styles } from "./filterSheetStyles.ts";

type MemberSectionProps = {
  members: NamedEntity[];
  selectedMembers: string[];
  onToggle: (id: string) => void;
};

export const sortSelectedFirst = (
  entities: NamedEntity[],
  selected: string[],
) => {
  const selectedSet = new Set(selected);
  return [...entities].sort((a, b) => {
    const aSelected = selectedSet.has(a.id);
    const bSelected = selectedSet.has(b.id);
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return 0;
  });
};

type CategorySectionProps = {
  categories: NamedEntity[];
  selectedCategories: string[];
  onToggle: (id: string) => void;
  scrollRef: RefObject<ScrollView | null>;
};

type EntitySectionProps = {
  title: string;
  emptyText: string;
  entities: NamedEntity[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  scrollRef: RefObject<ScrollView | null>;
  containerStyle: object;
};

export const CategorySection = ({
  categories,
  selectedCategories,
  onToggle,
  scrollRef,
}: CategorySectionProps) => (
  <EntitySection
    title="Categories"
    emptyText="No categories in list"
    entities={categories}
    selectedIds={selectedCategories}
    onToggle={onToggle}
    scrollRef={scrollRef}
    containerStyle={styles.categorySection}
  />
);

export const MemberSection = ({
  members,
  selectedMembers,
  onToggle,
  scrollRef,
}: MemberSectionProps & { scrollRef: RefObject<ScrollView | null> }) => (
  <EntitySection
    title="Members"
    emptyText="No members in list"
    entities={members}
    selectedIds={selectedMembers}
    onToggle={onToggle}
    scrollRef={scrollRef}
    containerStyle={styles.memberSection}
  />
);

const EntitySection = ({
  title,
  emptyText,
  entities,
  selectedIds,
  onToggle,
  scrollRef,
  containerStyle,
}: EntitySectionProps) => (
  <View style={[styles.section, containerStyle]}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <ScrollView
      ref={scrollRef}
      style={styles.sectionList}
      contentContainerStyle={styles.sectionListContent}
      nestedScrollEnabled
    >
      {entities.map((entity, index) => (
        <FilterRow
          key={entity.id}
          item={entity}
          selected={selectedIds.includes(entity.id)}
          onToggle={() => onToggle(entity.id)}
          isLast={index === entities.length - 1}
        />
      ))}
      {entities.length === 0 && <Text style={styles.empty}>{emptyText}</Text>}
    </ScrollView>
  </View>
);

type FilterRowProps = {
  item: NamedEntity;
  selected: boolean;
  onToggle: () => void;
  isLast?: boolean;
};

const FilterRow = ({
  item,
  selected,
  onToggle,
  isLast = false,
}: FilterRowProps) => (
  <Pressable
    style={[styles.row, isLast ? styles.rowLast : null]}
    onPress={onToggle}
  >
    <AppCheckbox checked={selected} onToggle={onToggle} size={16} />
    <Text style={styles.rowText}>{item.name}</Text>
    {item.image ? (
      <RNImage source={{ uri: item.image }} style={styles.rowAvatarImage} />
    ) : null}
  </Pressable>
);
