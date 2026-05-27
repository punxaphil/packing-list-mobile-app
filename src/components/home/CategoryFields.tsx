import { useState } from "react";
import { Keyboard, Platform, Pressable, Image as RNImage, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { getEmojiValue } from "~/services/mediaValue.ts";
import { getCategoryKey, UNCATEGORIZED } from "~/services/utils.ts";
import { Image } from "~/types/Image.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { homeColors } from "./theme.ts";

const DROPDOWN_ROW_HEIGHT = 49;
const DROPDOWN_MAX_SCREEN_RATIO = 0.4;

export const CATEGORY_FIELD_COPY = {
  existingCategory: "Existing category",
  newCategory: "Or create new category",
  newCategoryPlaceholder: "New category name",
};

export const CategoryDropdown = ({
  categories,
  categoryImages,
  selected,
  onSelect,
  disabled,
  iosSheet = false,
  usedCategoryIds,
}: {
  categories: NamedEntity[];
  categoryImages: Image[];
  selected: NamedEntity;
  onSelect: (category: NamedEntity) => void;
  disabled: boolean;
  iosSheet?: boolean;
  usedCategoryIds?: string[];
}) => {
  const [open, setOpen] = useState(false);
  const { height } = useWindowDimensions();
  const usedIds = new Set(usedCategoryIds ?? []);
  const nonUncategorized = categories.filter((c) => c.id !== UNCATEGORIZED.id);
  const used = nonUncategorized.filter((c) => usedIds.has(c.id)).sort((a, b) => a.name.localeCompare(b.name));
  const unused = nonUncategorized.filter((c) => !usedIds.has(c.id)).sort((a, b) => a.name.localeCompare(b.name));
  const allCategories = [UNCATEGORIZED, ...used, ...unused];
  const dropdownMaxHeight = Math.min(
    allCategories.length * DROPDOWN_ROW_HEIGHT,
    Math.floor(height * DROPDOWN_MAX_SCREEN_RATIO)
  );
  const selectedImageUrl = getCategoryImageUrl(categoryImages, selected.id);
  const selectedEmoji = getEmojiValue(selectedImageUrl);

  const toggle = () => {
    if (disabled) return;
    Keyboard.dismiss();
    setOpen((value) => !value);
  };

  const handleSelect = (category: NamedEntity) => {
    onSelect(category);
    setOpen(false);
  };

  return (
    <View style={[CATEGORY_FIELD_STYLES.dropdownContainer, disabled ? CATEGORY_FIELD_STYLES.pickerDisabled : null]}>
      <Pressable
        style={iosSheet ? CATEGORY_FIELD_STYLES.sheetDropdownButton : CATEGORY_FIELD_STYLES.dropdownButton}
        onPress={toggle}
      >
        <View style={CATEGORY_FIELD_STYLES.dropdownValue}>
          <Text style={CATEGORY_FIELD_STYLES.dropdownText}>{selected.name}</Text>
          <View style={CATEGORY_FIELD_STYLES.dropdownMedia}>
            {selectedEmoji ? (
              <Text style={CATEGORY_FIELD_STYLES.dropdownEmoji}>{selectedEmoji}</Text>
            ) : selectedImageUrl ? (
              <RNImage source={{ uri: selectedImageUrl }} style={CATEGORY_FIELD_STYLES.dropdownImage} />
            ) : null}
          </View>
        </View>
        <Text style={CATEGORY_FIELD_STYLES.dropdownArrow}>{open ? "▲" : "▼"}</Text>
      </Pressable>
      {open && (
        <View
          style={[
            CATEGORY_FIELD_STYLES.dropdownList,
            iosSheet ? CATEGORY_FIELD_STYLES.sheetDropdownList : null,
            !iosSheet && Platform.OS === "android" ? CATEGORY_FIELD_STYLES.dropdownListInline : null,
          ]}
        >
          <ScrollView
            style={[CATEGORY_FIELD_STYLES.dropdownScroll, { maxHeight: dropdownMaxHeight }]}
            nestedScrollEnabled
          >
            {allCategories.map((category, index) => {
              const imageUrl = getCategoryImageUrl(categoryImages, category.id);
              const emoji = getEmojiValue(imageUrl);

              return (
                <Pressable
                  key={getCategoryKey(category)}
                  style={[
                    CATEGORY_FIELD_STYLES.dropdownItem,
                    index === allCategories.length - 1 ? CATEGORY_FIELD_STYLES.dropdownItemLast : null,
                  ]}
                  onPress={() => handleSelect(category)}
                >
                  <View style={CATEGORY_FIELD_STYLES.dropdownValue}>
                    <Text
                      style={[
                        CATEGORY_FIELD_STYLES.dropdownItemText,
                        getCategoryKey(category) === getCategoryKey(selected)
                          ? CATEGORY_FIELD_STYLES.dropdownItemSelected
                          : null,
                      ]}
                    >
                      {category.name}
                    </Text>
                    <View style={CATEGORY_FIELD_STYLES.dropdownMedia}>
                      {emoji ? (
                        <Text style={CATEGORY_FIELD_STYLES.dropdownEmoji}>{emoji}</Text>
                      ) : imageUrl ? (
                        <RNImage source={{ uri: imageUrl }} style={CATEGORY_FIELD_STYLES.dropdownImage} />
                      ) : null}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const getCategoryImageUrl = (categoryImages: Image[], categoryId: string) =>
  categoryImages.find((image) => image.typeId === categoryId)?.url;

export const CATEGORY_FIELD_STYLES = {
  dropdownContainer: { marginBottom: 12, zIndex: 10 },
  sheetLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: homeColors.muted,
  },
  sheetInput: {
    borderWidth: 1,
    borderColor: homeColors.border,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    color: homeColors.text,
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  dropdownButton: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: homeColors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: homeColors.surface,
  },
  sheetDropdownButton: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: homeColors.border,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  dropdownValue: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  dropdownText: { flex: 1, fontSize: 16, color: homeColors.text },
  dropdownMedia: {
    width: 24,
    alignItems: "flex-end" as const,
    justifyContent: "center" as const,
  },
  dropdownImage: { width: 24, height: 24, borderRadius: 6 },
  dropdownEmoji: { fontSize: 18, lineHeight: 22 },
  dropdownArrow: { fontSize: 12, color: homeColors.muted, marginLeft: 12 },
  dropdownList: {
    position: "absolute" as const,
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: homeColors.surface,
    borderWidth: 1,
    borderColor: homeColors.border,
    borderRadius: 8,
    zIndex: 20,
  },
  dropdownListInline: {
    position: "relative" as const,
    top: undefined,
    left: undefined,
    right: undefined,
    marginTop: 4,
  },
  sheetDropdownList: { borderRadius: 20 },
  dropdownScroll: {},
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: homeColors.border,
  },
  dropdownItemLast: { borderBottomWidth: 0 },
  dropdownItemText: { flex: 1, fontSize: 16, color: homeColors.text },
  dropdownItemSelected: {
    fontWeight: "600" as const,
    color: homeColors.text,
  },
  pickerDisabled: { opacity: 0.5 },
};
