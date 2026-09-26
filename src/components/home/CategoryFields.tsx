import { useRef, useState } from "react";
import { Keyboard, Modal, Pressable, Image as RNImage, Text, useWindowDimensions, View } from "react-native";
import { getEmojiValue } from "~/services/mediaValue.ts";
import type { Image } from "~/types/Image.ts";
import type { NamedEntity } from "~/types/NamedEntity.ts";
import { CategoryDropdownOptions, getCategoryImageUrl, orderCategories } from "./CategoryDropdownOptions.tsx";
import { CATEGORY_FIELD_STYLES } from "./CategoryFieldStyles.ts";

const DROPDOWN_ROW_HEIGHT = 49;
const DROPDOWN_MAX_SCREEN_RATIO = 0.4;
const DROPDOWN_MARGIN = 8;

export const CategoryDropdown = ({
  categories,
  categoryImages,
  selected,
  onSelect,
  disabled,
  usedCategoryIds,
}: {
  categories: NamedEntity[];
  categoryImages: Image[];
  selected: NamedEntity;
  onSelect: (category: NamedEntity) => void;
  disabled: boolean;
  usedCategoryIds?: string[];
}) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, maxHeight: 0 });
  const dropdownRef = useRef<View>(null);
  const { height } = useWindowDimensions();
  const allCategories = orderCategories(categories, usedCategoryIds);
  const dropdownMaxHeight = Math.min(
    allCategories.length * DROPDOWN_ROW_HEIGHT,
    Math.floor(height * DROPDOWN_MAX_SCREEN_RATIO)
  );
  const selectedImageUrl = getCategoryImageUrl(categoryImages, selected.id);
  const selectedEmoji = getEmojiValue(selectedImageUrl);

  const toggle = () => {
    if (disabled) return;
    Keyboard.dismiss();
    if (open) return setOpen(false);
    dropdownRef.current?.measureInWindow((left, top, width, buttonHeight) => {
      const below = height - top - buttonHeight - DROPDOWN_MARGIN;
      const above = top - DROPDOWN_MARGIN;
      const showAbove = below < dropdownMaxHeight && above > below;
      setPosition({
        top: showAbove ? top - Math.min(dropdownMaxHeight, above) : top + buttonHeight,
        left,
        width,
        maxHeight: Math.min(dropdownMaxHeight, showAbove ? above : below),
      });
      setOpen(true);
    });
  };

  const handleSelect = (category: NamedEntity) => {
    onSelect(category);
    setOpen(false);
  };

  return (
    <View
      ref={dropdownRef}
      style={[CATEGORY_FIELD_STYLES.dropdownContainer, disabled ? CATEGORY_FIELD_STYLES.pickerDisabled : null]}
    >
      <Pressable style={CATEGORY_FIELD_STYLES.dropdownButton} onPress={toggle}>
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
        <Modal transparent visible onRequestClose={() => setOpen(false)} animationType="none">
          <Pressable style={{ flex: 1 }} onPress={() => setOpen(false)} />
          <View style={[CATEGORY_FIELD_STYLES.dropdownList, position]}>
            <CategoryDropdownOptions
              categories={allCategories}
              categoryImages={categoryImages}
              selected={selected}
              onSelect={handleSelect}
              maxHeight={position.maxHeight}
            />
          </View>
        </Modal>
      )}
    </View>
  );
};
