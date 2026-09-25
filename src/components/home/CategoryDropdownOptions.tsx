import { Pressable, Image as RNImage, ScrollView, Text, View } from "react-native";
import { getEmojiValue } from "~/services/mediaValue.ts";
import { getCategoryKey, UNCATEGORIZED } from "~/services/utils.ts";
import type { Image } from "~/types/Image.ts";
import type { NamedEntity } from "~/types/NamedEntity.ts";
import { CATEGORY_FIELD_STYLES as styles } from "./CategoryFieldStyles.ts";

export const getCategoryImageUrl = (images: Image[], categoryId: string) =>
  images.find((image) => image.typeId === categoryId)?.url;

export const orderCategories = (categories: NamedEntity[], usedCategoryIds: string[] = []) => {
  const usedIds = new Set(usedCategoryIds);
  const remaining = categories.filter((category) => category.id !== UNCATEGORIZED.id);
  const sorted = remaining.sort((first, second) => first.name.localeCompare(second.name));
  return [
    UNCATEGORIZED,
    ...sorted.filter((category) => usedIds.has(category.id)),
    ...sorted.filter((category) => !usedIds.has(category.id)),
  ];
};

export const CategoryDropdownOptions = ({
  categories,
  categoryImages,
  selected,
  onSelect,
  maxHeight,
}: {
  categories: NamedEntity[];
  categoryImages: Image[];
  selected: NamedEntity;
  onSelect: (category: NamedEntity) => void;
  maxHeight: number;
}) => (
  <ScrollView style={{ maxHeight }} nestedScrollEnabled>
    {categories.map((category, index) => {
      const imageUrl = getCategoryImageUrl(categoryImages, category.id);
      const emoji = getEmojiValue(imageUrl);
      return (
        <Pressable
          key={getCategoryKey(category)}
          style={[styles.dropdownItem, index === categories.length - 1 && styles.dropdownItemLast]}
          onPress={() => onSelect(category)}
        >
          <View style={styles.dropdownValue}>
            <Text
              style={[
                styles.dropdownItemText,
                getCategoryKey(category) === getCategoryKey(selected) && styles.dropdownItemSelected,
              ]}
            >
              {category.name}
            </Text>
            <View style={styles.dropdownMedia}>
              {emoji ? (
                <Text style={styles.dropdownEmoji}>{emoji}</Text>
              ) : imageUrl ? (
                <RNImage source={{ uri: imageUrl }} style={styles.dropdownImage} />
              ) : null}
            </View>
          </View>
        </Pressable>
      );
    })}
  </ScrollView>
);
