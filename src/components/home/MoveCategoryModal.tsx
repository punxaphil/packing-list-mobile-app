import { useEffect, useRef } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { UNCATEGORIZED } from "~/services/utils.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { homeStyles } from "./styles.ts";

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
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={homeStyles.modalBackdrop} onPress={onClose}>
        <Pressable style={homeStyles.modalCard} onPress={(e) => e.stopPropagation()}>
          <Text style={homeStyles.modalTitle}>{COPY.title}</Text>
          <ScrollView ref={scrollRef} style={STYLES.list}>
            {allCategories.map((category) => (
              <CategoryOption key={getCategoryKey(category)} category={category} onSelect={handleSelect} />
            ))}
          </ScrollView>
          <CancelButton onPress={onClose} />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const buildCategoryList = (categories: NamedEntity[], currentCategoryId: string) => {
  const filtered = categories.filter((c) => c.id !== currentCategoryId);
  const uncategorized = currentCategoryId !== "" ? [UNCATEGORIZED] : [];
  return [...uncategorized, ...filtered].sort((a, b) => b.rank - a.rank);
};

const getCategoryKey = (c: NamedEntity) => c.id || "__uncategorized__";

type CategoryOptionProps = { category: NamedEntity; onSelect: (c: NamedEntity) => void };

const CategoryOption = ({ category, onSelect }: CategoryOptionProps) => (
  <Pressable style={STYLES.option} onPress={() => onSelect(category)}>
    <Text style={STYLES.optionText}>{category.name}</Text>
  </Pressable>
);

const CancelButton = ({ onPress }: { onPress: () => void }) => (
  <View style={homeStyles.modalActions}>
    <Pressable onPress={onPress}>
      <Text style={homeStyles.modalAction}>{COPY.cancel}</Text>
    </Pressable>
  </View>
);

const COPY = { title: "Change Category", cancel: "Cancel" };

const STYLES = {
  list: { maxHeight: 300, marginBottom: 12 },
  option: { paddingVertical: 14, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  optionText: { fontSize: 16, color: "#111827" },
};
