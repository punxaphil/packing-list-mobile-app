import { useEffect, useRef } from "react";
import { Pressable, ScrollView, Text } from "react-native";
import { getCategoryKey, UNCATEGORIZED } from "~/services/utils.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { DialogShell, DialogSingleAction } from "../shared/DialogShell.tsx";

type MoveCategoryModalProps = {
  visible: boolean;
  categories: NamedEntity[];
  currentCategoryId: string;
  onClose: () => void;
  onSelect: (category: NamedEntity) => void;
};

export const MoveCategoryModal = (props: MoveCategoryModalProps) => {
  const { visible, categories, currentCategoryId, onClose, onSelect } = props;
  const allCategories = buildCategoryList(categories, currentCategoryId);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible) setTimeout(() => scrollRef.current?.flashScrollIndicators(), 100);
  }, [visible]);

  const handleSelect = (category: NamedEntity) => {
    onSelect(category);
    onClose();
  };
  return (
    <DialogShell
      visible={visible}
      title={COPY.title}
      onClose={onClose}
      actions={<DialogSingleAction label={COPY.cancel} onPress={onClose} />}
    >
      <ScrollView ref={scrollRef} style={STYLES.list}>
        {allCategories.map((category) => (
          <CategoryOption key={getCategoryKey(category)} category={category} onSelect={handleSelect} />
        ))}
      </ScrollView>
    </DialogShell>
  );
};

const buildCategoryList = (categories: NamedEntity[], currentCategoryId: string) => {
  const filtered = categories.filter((c) => c.id !== currentCategoryId);
  const uncategorized = currentCategoryId !== "" ? [UNCATEGORIZED] : [];
  return [...uncategorized, ...filtered].sort((a, b) => b.rank - a.rank);
};

type CategoryOptionProps = {
  category: NamedEntity;
  onSelect: (c: NamedEntity) => void;
};

const CategoryOption = ({ category, onSelect }: CategoryOptionProps) => (
  <Pressable style={STYLES.option} onPress={() => onSelect(category)}>
    <Text style={STYLES.optionText}>{category.name}</Text>
  </Pressable>
);

const COPY = { title: "Change Category", cancel: "Cancel" };

const STYLES = {
  list: { maxHeight: 300, marginBottom: 12 },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  optionText: { fontSize: 16, color: "#111827" },
};
