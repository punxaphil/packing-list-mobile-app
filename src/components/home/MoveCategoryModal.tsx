import { useRef } from "react";
import { Platform, Pressable, Image as RNImage, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { getCategoryKey, UNCATEGORIZED } from "~/services/utils.ts";
import { Image } from "~/types/Image.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { DialogShell, DialogSingleAction } from "../shared/DialogShell.tsx";
import { PageSheet } from "../shared/PageSheet.tsx";
import { homeColors } from "./theme.ts";

type MoveCategoryModalProps = {
  visible: boolean;
  itemName: string;
  categories: NamedEntity[];
  categoryImages: Image[];
  currentCategoryId: string;
  onClose: () => void;
  onSelect: (category: NamedEntity) => void;
};

export const MoveCategoryModal = (props: MoveCategoryModalProps) => {
  const { visible, itemName, categories, categoryImages, currentCategoryId, onClose, onSelect } = props;
  const allCategories = buildCategoryList(categories, currentCategoryId);
  const currentCategoryName = getCurrentCategoryName(categories, currentCategoryId);
  const scrollRef = useRef<ScrollView>(null);
  const { height } = useWindowDimensions();
  const listMaxHeight = Math.min(
    allCategories.length * ROW_HEIGHT + LIST_BOTTOM_PADDING,
    Math.floor(height * (Platform.OS === "ios" ? 0.68 : 0.5))
  );

  const handleSelect = (category: NamedEntity) => {
    onSelect(category);
    onClose();
  };
  if (Platform.OS === "ios") {
    return (
      <PageSheet visible={visible} title={COPY.title} onClose={onClose}>
        <MoveCategorySummary itemName={itemName} currentCategoryName={currentCategoryName} />
        <ScrollView
          ref={scrollRef}
          style={[STYLES.sheetList, { maxHeight: listMaxHeight }]}
          contentContainerStyle={STYLES.sheetListContent}
        >
          {allCategories.map((category, index) => (
            <CategoryOption
              key={getCategoryKey(category)}
              category={category}
              imageUrl={getCategoryImageUrl(categoryImages, category.id)}
              onSelect={handleSelect}
              iosSheet
              isLast={index === allCategories.length - 1}
            />
          ))}
        </ScrollView>
      </PageSheet>
    );
  }
  return (
    <DialogShell
      visible={visible}
      title={COPY.title}
      onClose={onClose}
      actions={<DialogSingleAction label={COPY.cancel} onPress={onClose} />}
    >
      <MoveCategorySummary itemName={itemName} currentCategoryName={currentCategoryName} />
      <ScrollView ref={scrollRef} style={[STYLES.list, { maxHeight: listMaxHeight }]}>
        {allCategories.map((category, index) => (
          <CategoryOption
            key={getCategoryKey(category)}
            category={category}
            imageUrl={getCategoryImageUrl(categoryImages, category.id)}
            onSelect={handleSelect}
            isLast={index === allCategories.length - 1}
          />
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

const getCurrentCategoryName = (categories: NamedEntity[], currentCategoryId: string) => {
  if (currentCategoryId === "") return UNCATEGORIZED.name;
  return categories.find((category) => category.id === currentCategoryId)?.name ?? UNCATEGORIZED.name;
};

const getCategoryImageUrl = (categoryImages: Image[], categoryId: string) =>
  categoryImages.find((image) => image.typeId === categoryId)?.url;

const MoveCategorySummary = ({ itemName, currentCategoryName }: { itemName: string; currentCategoryName: string }) => (
  <>
    <Text style={STYLES.itemName}>{itemName}</Text>
    <Text style={STYLES.currentCategory}>Current category: {currentCategoryName}</Text>
  </>
);

type CategoryOptionProps = {
  category: NamedEntity;
  imageUrl?: string;
  onSelect: (c: NamedEntity) => void;
  iosSheet?: boolean;
  isLast?: boolean;
};

const CategoryOption = ({ category, imageUrl, onSelect, iosSheet = false, isLast = false }: CategoryOptionProps) => (
  <Pressable
    style={({ pressed }) => [
      STYLES.option,
      isLast ? STYLES.optionLast : null,
      pressed ? (iosSheet ? STYLES.sheetOptionPressed : STYLES.optionPressed) : null,
    ]}
    onPress={() => onSelect(category)}
  >
    <View style={STYLES.optionRow}>
      <Text style={[STYLES.optionText, iosSheet ? STYLES.sheetOptionText : null]}>{category.name}</Text>
      <View style={STYLES.optionRowSpacer} />
      {imageUrl ? <RNImage source={{ uri: imageUrl }} style={STYLES.optionImage} /> : null}
    </View>
  </Pressable>
);

const COPY = { title: "Change Category", cancel: "Cancel" };
const ROW_HEIGHT = 58;
const LIST_BOTTOM_PADDING = 8;

const STYLES = {
  list: { marginBottom: 12 },
  sheetList: {},
  sheetListContent: { paddingBottom: LIST_BOTTOM_PADDING },
  itemName: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: homeColors.text,
    marginBottom: 4,
  },
  currentCategory: {
    fontSize: 14,
    color: homeColors.muted,
    marginBottom: 12,
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: homeColors.border,
  },
  optionLast: { borderBottomWidth: 0 },
  optionRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  optionRowSpacer: { flex: 1 },
  optionImage: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  optionPressed: { opacity: 0.6 },
  sheetOptionPressed: {
    backgroundColor: "rgba(59,130,246,0.08)",
  },
  optionText: { fontSize: 16, color: "#111827" },
  sheetOptionText: { fontWeight: "500" as const },
};
