import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { MultiEditButton } from "../shared/MultiEditButton.tsx";
import { commonCopy, homeCopy } from "./copy.ts";
import type { AddItemDialogState } from "./ItemsPanel.tsx";
import { listCopy } from "./listCopy.ts";
import { HOME_COPY, homeStyles } from "./styles.ts";
import { homeColors, homeSpacing } from "./theme.ts";
import type { FilterDialogState } from "./useFilterDialog.ts";
import type { SearchState } from "./useSearch.ts";

type Props = {
  addDialog: AddItemDialogState;
  filterDialog: FilterDialogState;
  search: SearchState;
  onNotes: () => void;
  hasNotes: boolean;
  onBulkEdit: () => void;
  bulkEditing: boolean;
  onUndo: () => void;
  canUndo: boolean;
};

export const QuickAddRow = ({
  addDialog,
  filterDialog,
  search,
  onNotes,
  hasNotes,
  onBulkEdit,
  bulkEditing,
  onUndo,
  canUndo,
}: Props) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [localText, setLocalText] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    []
  );

  const onToggleSearch = useCallback(() => {
    if (searchOpen) {
      search.onClear();
      setLocalText("");
    }
    setSearchOpen(!searchOpen);
  }, [searchOpen, search]);

  const onTextChange = useCallback(
    (text: string) => {
      setLocalText(text);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => search.onSearchChange(text), 300);
    },
    [search]
  );

  const onClearSearch = useCallback(() => {
    setLocalText("");
    search.onClear();
    inputRef.current?.focus();
  }, [search]);
  const onSubmitSearch = useCallback(() => {
    search.onNext();
    inputRef.current?.focus();
  }, [search]);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  if (searchOpen)
    return (
      <SearchRow
        localText={localText}
        search={search}
        inputRef={inputRef}
        onTextChange={onTextChange}
        onClearSearch={onClearSearch}
        onSubmitSearch={onSubmitSearch}
        onClose={onToggleSearch}
        onUndo={onUndo}
        canUndo={canUndo}
      />
    );
  return (
    <DefaultRow
      addDialog={addDialog}
      filterDialog={filterDialog}
      onSearch={onToggleSearch}
      onNotes={onNotes}
      hasNotes={hasNotes}
      onBulkEdit={onBulkEdit}
      bulkEditing={bulkEditing}
      onUndo={onUndo}
      canUndo={canUndo}
    />
  );
};

type SearchRowProps = {
  localText: string;
  search: SearchState;
  inputRef: React.RefObject<TextInput | null>;
  onTextChange: (text: string) => void;
  onClearSearch: () => void;
  onSubmitSearch: () => void;
  onClose: () => void;
  onUndo: () => void;
  canUndo: boolean;
};

const SearchRow = ({
  localText,
  search,
  inputRef,
  onTextChange,
  onClearSearch,
  onSubmitSearch,
  onClose,
  onUndo,
  canUndo,
}: SearchRowProps) => {
  const { t } = useTranslation();
  const hasText = localText.length > 0;
  const searchSettled = localText === search.searchText;
  const hasMatches = search.totalMatches > 0;
  return (
    <View style={styles.row}>
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color={homeColors.muted} style={styles.searchIcon} />
        <TextInput
          ref={inputRef}
          style={styles.searchInput}
          value={localText}
          onChangeText={onTextChange}
          accessibilityLabel={t("search.placeholder")}
          autoFocus
          returnKeyType="search"
          blurOnSubmit={false}
          onSubmitEditing={onSubmitSearch}
        />
        {hasText && searchSettled && !hasMatches && <Text style={styles.noMatch}>{t("search.noMatches")}</Text>}
        {hasMatches && (
          <Text style={styles.matchCount}>
            {search.currentIndex + 1}/{search.totalMatches}
          </Text>
        )}
        {hasText && hasMatches && search.totalMatches > 1 && (
          <NavButtons onPrev={search.onPrev} onNext={search.onNext} />
        )}
        {hasText && (
          <Pressable onPress={onClearSearch} hitSlop={12} style={styles.navButton}>
            <MaterialCommunityIcons name="close-circle" size={22} color={homeColors.muted} />
          </Pressable>
        )}
      </View>
      <UndoButton onPress={onUndo} disabled={!canUndo} />
      <Pressable style={styles.filterButton} onPress={onClose} hitSlop={8}>
        <MaterialCommunityIcons name="close" size={20} color={homeColors.muted} />
      </Pressable>
    </View>
  );
};

const NavButtons = ({ onPrev, onNext }: { onPrev: () => void; onNext: () => void }) => (
  <>
    <Pressable onPress={onPrev} hitSlop={12} style={styles.navButton}>
      <MaterialCommunityIcons name="chevron-up" size={26} color={homeColors.text} />
    </Pressable>
    <Pressable onPress={onNext} hitSlop={12} style={styles.navButton}>
      <MaterialCommunityIcons name="chevron-down" size={26} color={homeColors.text} />
    </Pressable>
  </>
);

type DefaultRowProps = {
  addDialog: AddItemDialogState;
  filterDialog: FilterDialogState;
  onSearch: () => void;
  onNotes: () => void;
  hasNotes: boolean;
  onBulkEdit: () => void;
  bulkEditing: boolean;
  onUndo: () => void;
  canUndo: boolean;
};

const DefaultRow = ({
  addDialog,
  filterDialog,
  onSearch,
  onNotes,
  hasNotes,
  onBulkEdit,
  bulkEditing,
  onUndo,
  canUndo,
}: DefaultRowProps) => (
  <View style={styles.row}>
    <Pressable
      style={homeStyles.quickAdd}
      onPress={() => addDialog.open()}
      accessibilityRole="button"
      accessibilityLabel={HOME_COPY.addItemQuick}
      hitSlop={8}
    >
      <Text style={homeStyles.quickAddLabel}>{HOME_COPY.addItemQuick}</Text>
    </Pressable>
    <View style={styles.iconRow}>
      <UndoButton onPress={onUndo} disabled={!canUndo} />
      <Pressable style={styles.filterButton} onPress={onNotes} hitSlop={8} accessibilityLabel={listCopy.title}>
        <MaterialCommunityIcons
          name="note-text-outline"
          size={20}
          color={hasNotes ? homeColors.primaryStrong : homeColors.muted}
        />
      </Pressable>
      <Pressable style={styles.filterButton} onPress={onSearch} hitSlop={8}>
        <MaterialCommunityIcons name="magnify" size={20} color={homeColors.muted} />
      </Pressable>
      <MultiEditButton label={homeCopy.bulkEdit} onPress={onBulkEdit} disabled={bulkEditing} />
      <Pressable style={styles.filterButton} onPress={filterDialog.open} hitSlop={8}>
        <MaterialCommunityIcons
          name="filter-variant"
          size={20}
          color={filterDialog.hasActiveFilter ? homeColors.primaryStrong : homeColors.muted}
        />
      </Pressable>
    </View>
  </View>
);

const UndoButton = ({ onPress, disabled }: { onPress: () => void; disabled: boolean }) => (
  <Pressable
    style={[styles.filterButton, disabled && styles.disabledButton]}
    onPress={onPress}
    disabled={disabled}
    hitSlop={8}
    accessibilityRole="button"
    accessibilityLabel={commonCopy.undo}
  >
    <MaterialCommunityIcons name="undo" size={20} color={homeColors.muted} />
  </Pressable>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconRow: { flexDirection: "row", alignItems: "center", gap: homeSpacing.xs },
  filterButton: { padding: homeSpacing.xs },
  disabledButton: { opacity: 0.45 },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: homeColors.background,
    borderRadius: 8,
    paddingHorizontal: homeSpacing.sm,
    marginRight: homeSpacing.sm,
  },
  searchIcon: { marginRight: homeSpacing.xs },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: homeColors.text,
    paddingVertical: homeSpacing.sm,
    paddingHorizontal: homeSpacing.sm,
  },
  matchCount: {
    fontSize: 12,
    color: homeColors.muted,
    marginLeft: homeSpacing.sm,
    marginRight: homeSpacing.xs,
  },
  noMatch: { fontSize: 12, color: "#ef4444", marginRight: homeSpacing.xs },
  navButton: { padding: homeSpacing.xs },
});
