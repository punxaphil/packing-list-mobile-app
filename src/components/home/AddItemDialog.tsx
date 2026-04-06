import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  Platform,
  Pressable,
  Image as RNImage,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { getCategoryKey, UNCATEGORIZED } from "~/services/utils.ts";
import { Image } from "~/types/Image.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { DialogActions, DialogShell } from "../shared/DialogShell.tsx";
import { PageSheet } from "../shared/PageSheet.tsx";
import { AppCheckbox } from "./AppCheckbox.tsx";
import { hasDuplicateName } from "./itemHandlers.ts";
import { HOME_COPY, homeStyles } from "./styles.ts";
import { homeColors } from "./theme.ts";

type AddItemDialogProps = {
  visible: boolean;
  initialCategory?: NamedEntity;
  categories: NamedEntity[];
  categoryImages: Image[];
  items: PackItem[];
  onCancel: () => void;
  onSubmit: (
    itemName: string,
    category: NamedEntity | null,
    newCategoryName: string | null,
    keepOpen: boolean,
  ) => Promise<NamedEntity>;
  onBrowseKits: () => void;
};

export const AddItemDialog = ({
  visible,
  initialCategory,
  categories,
  categoryImages,
  items,
  onCancel,
  onSubmit,
  onBrowseKits,
}: AddItemDialogProps) => {
  const state = useDialogState(visible, initialCategory);
  const {
    itemName,
    setItemName,
    selectedCategory,
    setSelectedCategory,
    newCategoryName,
    setNewCategoryName,
    keepOpen,
    setKeepOpen,
    addedMessage,
    setAddedMessage,
    error,
    setError,
  } = state;
  const inputRef = useRef<TextInput>(null);
  const addedAnim = useRef(new Animated.Value(0)).current;
  const submittingRef = useRef(false);
  const [visibleAddedMessage, setVisibleAddedMessage] = useState<string | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const isIosSheet = Platform.OS === "ios";
  const isSubmitDisabled = itemName.trim().length === 0;
  const hasNewCategory = newCategoryName.trim().length > 0;
  const targetCategoryId = hasNewCategory ? "" : selectedCategory.id;
  const toggleKeepOpen = useCallback(
    () => setKeepOpen((value) => !value),
    [setKeepOpen],
  );
  const submit = useSubmitHandler(
    itemName,
    selectedCategory,
    newCategoryName,
    hasNewCategory,
    items,
    targetCategoryId,
    setItemName,
    setSelectedCategory,
    setNewCategoryName,
    setError,
    keepOpen,
    setAddedMessage,
    inputRef,
    onSubmit,
  );
  const handleSubmit = useCallback(async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      await submit();
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, [submit]);
  const inputStyle = [
    isIosSheet ? STYLES.sheetInput : homeStyles.modalInput,
    error ? homeStyles.modalInputError : null,
  ];
  useEffect(() => {
    if (addedMessage) {
      setVisibleAddedMessage(addedMessage);
      addedAnim.setValue(0);
      Animated.spring(addedAnim, {
        toValue: 1,
        tension: 120,
        friction: 12,
        useNativeDriver: true,
      }).start();
      return;
    }
    if (!visibleAddedMessage) return;
    Animated.timing(addedAnim, {
      toValue: 0,
      duration: 160,
      useNativeDriver: true,
    }).start(() => setVisibleAddedMessage(null));
  }, [addedAnim, addedMessage, visibleAddedMessage]);
  const content = (
    <>
      <View style={STYLES.inputWrap}>
        <TextInput
          ref={inputRef}
          value={itemName}
          onChangeText={(text) => {
            setItemName(text);
            setAddedMessage(null);
            setError(null);
          }}
          placeholder={HOME_COPY.addItemPlaceholder}
          style={inputStyle}
          editable={!submitting}
          autoFocus
        />
        {visibleAddedMessage && (
          <Animated.View
            style={[
              STYLES.addedMessageWrap,
              {
                opacity: addedAnim,
                transform: [
                  {
                    translateY: addedAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-6, 0],
                    }),
                  },
                  {
                    scale: addedAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.96, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={STYLES.addedMessage}>{visibleAddedMessage}</Text>
          </Animated.View>
        )}
      </View>
      {error && <Text style={homeStyles.modalError}>{error}</Text>}
      <Text style={isIosSheet ? STYLES.sheetLabel : homeStyles.modalLabel}>
        {COPY.existingCategory}
      </Text>
      <CategoryDropdown
        categories={categories}
        categoryImages={categoryImages}
        selected={selectedCategory}
        onSelect={(c) => {
          setSelectedCategory(c);
          setError(null);
        }}
        disabled={submitting || hasNewCategory}
        iosSheet={isIosSheet}
      />
      <Text style={isIosSheet ? STYLES.sheetLabel : homeStyles.modalLabel}>
        {COPY.newCategory}
      </Text>
      <TextInput
        value={newCategoryName}
        onChangeText={(text) => {
          setNewCategoryName(text);
          setError(null);
        }}
        placeholder={COPY.newCategoryPlaceholder}
        style={isIosSheet ? STYLES.sheetInput : homeStyles.modalInput}
        editable={!submitting}
      />
      <Pressable
        style={STYLES.keepOpenRow}
        onPress={toggleKeepOpen}
        disabled={submitting}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: keepOpen }}
      >
        <View pointerEvents="none">
          <AppCheckbox checked={keepOpen} onToggle={toggleKeepOpen} size={16} />
        </View>
        <Text style={STYLES.keepOpenText}>{COPY.keepOpen}</Text>
      </Pressable>
      <Pressable
        onPress={onBrowseKits}
        style={isIosSheet ? STYLES.kitsButton : null}
        disabled={submitting}
      >
        <Text style={STYLES.browseKitsLink}>{COPY.browseKits}</Text>
      </Pressable>
    </>
  );
  if (isIosSheet) {
    return (
      <PageSheet
        visible={visible}
        title={HOME_COPY.addItemPrompt}
        onClose={onCancel}
        confirmLabel={HOME_COPY.addItemConfirm}
        onConfirm={handleSubmit}
        confirmDisabled={isSubmitDisabled || submitting}
        confirmVariant="text"
      >
        {content}
      </PageSheet>
    );
  }
  return (
    <DialogShell
      visible={visible}
      title={HOME_COPY.addItemPrompt}
      onClose={onCancel}
      actions={
        <DialogActions
          cancelLabel={HOME_COPY.cancel}
          confirmLabel={HOME_COPY.addItemConfirm}
          onCancel={onCancel}
          onConfirm={handleSubmit}
          disabled={submitting || isSubmitDisabled}
        />
      }
    >
      {content}
    </DialogShell>
  );
};

const useDialogState = (visible: boolean, initialCategory?: NamedEntity) => {
  const [itemName, setItemName] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<NamedEntity>(UNCATEGORIZED);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [keepOpen, setKeepOpen] = useState(false);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (visible) {
      setItemName("");
      setSelectedCategory(initialCategory ?? UNCATEGORIZED);
      setNewCategoryName("");
      setAddedMessage(null);
      setError(null);
    }
  }, [visible, initialCategory]);
  return {
    itemName,
    setItemName,
    selectedCategory,
    setSelectedCategory,
    newCategoryName,
    setNewCategoryName,
    keepOpen,
    setKeepOpen,
    addedMessage,
    setAddedMessage,
    error,
    setError,
  };
};

const useSubmitHandler = (
  itemName: string,
  selectedCategory: NamedEntity,
  newCategoryName: string,
  hasNewCategory: boolean,
  items: PackItem[],
  targetCategoryId: string,
  setItemName: (value: string) => void,
  setSelectedCategory: (category: NamedEntity) => void,
  setNewCategoryName: (value: string) => void,
  setError: (error: string | null) => void,
  keepOpen: boolean,
  setAddedMessage: (message: string | null) => void,
  inputRef: React.RefObject<TextInput | null>,
  onSubmit: AddItemDialogProps["onSubmit"],
) =>
  useCallback(async () => {
    const trimmedName = itemName.trim();
    if (!trimmedName) return;
    if (
      !hasNewCategory &&
      hasDuplicateName(trimmedName, targetCategoryId, items)
    ) {
      setError(COPY.duplicateError);
      return;
    }
    const nextCategory = await onSubmit(
      trimmedName,
      hasNewCategory ? null : selectedCategory,
      hasNewCategory ? newCategoryName.trim() : null,
      keepOpen,
    );
    if (!keepOpen) return;
    setItemName("");
    setSelectedCategory(nextCategory);
    setNewCategoryName("");
    setError(null);
    setAddedMessage(COPY.added.replace("{name}", trimmedName));
    inputRef.current?.focus();
  }, [
    itemName,
    selectedCategory,
    newCategoryName,
    hasNewCategory,
    items,
    targetCategoryId,
    setItemName,
    setSelectedCategory,
    setNewCategoryName,
    setError,
    keepOpen,
    setAddedMessage,
    inputRef,
    onSubmit,
  ]);

const getCategoryImageUrl = (categoryImages: Image[], categoryId: string) =>
  categoryImages.find((image) => image.typeId === categoryId)?.url;

const DROPDOWN_ROW_HEIGHT = 49;
const DROPDOWN_MAX_SCREEN_RATIO = 0.4;

const CategoryDropdown = ({
  categories,
  categoryImages,
  selected,
  onSelect,
  disabled,
  iosSheet = false,
}: {
  categories: NamedEntity[];
  categoryImages: Image[];
  selected: NamedEntity;
  onSelect: (c: NamedEntity) => void;
  disabled: boolean;
  iosSheet?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const { height } = useWindowDimensions();
  const sorted = [...categories.filter((c) => c.id !== UNCATEGORIZED.id)].sort(
    (a, b) => a.name.localeCompare(b.name),
  );
  const allCategories = [UNCATEGORIZED, ...sorted];
  const dropdownMaxHeight = Math.min(
    allCategories.length * DROPDOWN_ROW_HEIGHT,
    Math.floor(height * DROPDOWN_MAX_SCREEN_RATIO),
  );
  const toggle = () => {
    if (disabled) return;
    Keyboard.dismiss();
    setOpen((v) => !v);
  };
  const handleSelect = (cat: NamedEntity) => {
    onSelect(cat);
    setOpen(false);
  };
  const selectedImageUrl = getCategoryImageUrl(categoryImages, selected.id);
  return (
    <View
      style={[
        STYLES.dropdownContainer,
        disabled ? STYLES.pickerDisabled : null,
      ]}
    >
      <Pressable
        style={iosSheet ? STYLES.sheetDropdownButton : STYLES.dropdownButton}
        onPress={toggle}
      >
        <View style={STYLES.dropdownValue}>
          <Text style={STYLES.dropdownText}>{selected.name}</Text>
          <View style={STYLES.dropdownMedia}>
            {selectedImageUrl ? (
              <RNImage
                source={{ uri: selectedImageUrl }}
                style={STYLES.dropdownImage}
              />
            ) : null}
          </View>
        </View>
        <Text style={STYLES.dropdownArrow}>{open ? "▲" : "▼"}</Text>
      </Pressable>
      {open && (
        <View
          style={[
            STYLES.dropdownList,
            iosSheet ? STYLES.sheetDropdownList : null,
          ]}
        >
          <ScrollView
            style={[STYLES.dropdownScroll, { maxHeight: dropdownMaxHeight }]}
            nestedScrollEnabled
          >
            {allCategories.map((c, index) => (
              <Pressable
                key={getCategoryKey(c)}
                style={[
                  STYLES.dropdownItem,
                  index === allCategories.length - 1
                    ? STYLES.dropdownItemLast
                    : null,
                ]}
                onPress={() => handleSelect(c)}
              >
                <View style={STYLES.dropdownValue}>
                  <Text
                    style={[
                      STYLES.dropdownItemText,
                      getCategoryKey(c) === getCategoryKey(selected)
                        ? STYLES.dropdownItemSelected
                        : null,
                    ]}
                  >
                    {c.name}
                  </Text>
                  <View style={STYLES.dropdownMedia}>
                    {getCategoryImageUrl(categoryImages, c.id) ? (
                      <RNImage
                        source={{
                          uri: getCategoryImageUrl(categoryImages, c.id),
                        }}
                        style={STYLES.dropdownImage}
                      />
                    ) : null}
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const COPY = {
  existingCategory: "Existing category",
  newCategory: "Or create new category",
  newCategoryPlaceholder: "New category name",
  duplicateError: "An item with this name already exists in this category",
  added: 'Added "{name}"',
  keepOpen: "Keep open (to add multiple items)",
  browseKits: "Browse Packing Kits",
};
const STYLES = {
  inputWrap: {
    position: "relative" as const,
  },
  addedMessageWrap: {
    position: "absolute" as const,
    right: 12,
    top: 10,
    zIndex: 1,
  },
  addedMessage: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: homeColors.primaryLight,
    color: homeColors.muted,
    fontSize: 13,
    fontWeight: "600" as const,
    textAlign: "center" as const,
    overflow: "hidden" as const,
  },
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
  keepOpenRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    marginBottom: 12,
  },
  keepOpenText: { fontSize: 15, color: homeColors.text },
  kitsButton: {
    alignSelf: "center" as const,
    backgroundColor: "rgba(255,255,255,0.82)",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginTop: 4,
  },
  browseKitsLink: {
    fontSize: 14,
    color: homeColors.muted,
    textAlign: "center" as const,
    fontWeight: "600" as const,
  },
};
