import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { AddItemDialogState } from "./ItemsPanel.tsx";
import { HOME_COPY, homeStyles } from "./styles.ts";
import { homeColors, homeSpacing } from "./theme.ts";
import type { FilterDialogState } from "./useFilterDialog.ts";
import type { SearchState } from "./useSearch.ts";

type Props = { addDialog: AddItemDialogState; filterDialog: FilterDialogState; search: SearchState };

export const QuickAddRow = ({ addDialog, filterDialog, search }: Props) => {
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
      />
    );
  return <DefaultRow addDialog={addDialog} filterDialog={filterDialog} onSearch={onToggleSearch} />;
};

type SearchRowProps = {
  localText: string;
  search: SearchState;
  inputRef: React.RefObject<TextInput | null>;
  onTextChange: (text: string) => void;
  onClearSearch: () => void;
  onSubmitSearch: () => void;
  onClose: () => void;
};

const SearchRow = ({
  localText,
  search,
  inputRef,
  onTextChange,
  onClearSearch,
  onSubmitSearch,
  onClose,
}: SearchRowProps) => {
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
          placeholder="Search items by name..."
          placeholderTextColor={homeColors.muted}
          autoFocus
          returnKeyType="search"
          blurOnSubmit={false}
          onSubmitEditing={onSubmitSearch}
        />
        {hasText && searchSettled && !hasMatches && <Text style={styles.noMatch}>No matches</Text>}
        {hasMatches && (
          <Text style={styles.matchCount}>
            {search.currentIndex + 1}/{search.totalMatches}
          </Text>
        )}
        {hasText && hasMatches && search.totalMatches > 1 && (
          <NavButtons onPrev={search.onPrev} onNext={search.onNext} />
        )}
        {hasText && (
          <Pressable onPress={onClearSearch} hitSlop={8}>
            <MaterialCommunityIcons name="close-circle" size={18} color={homeColors.muted} />
          </Pressable>
        )}
      </View>
      <Pressable style={styles.filterButton} onPress={onClose} hitSlop={8}>
        <MaterialCommunityIcons name="close" size={20} color={homeColors.muted} />
      </Pressable>
    </View>
  );
};

const NavButtons = ({ onPrev, onNext }: { onPrev: () => void; onNext: () => void }) => (
  <>
    <Pressable onPress={onPrev} hitSlop={8} style={styles.navButton}>
      <MaterialCommunityIcons name="chevron-up" size={22} color={homeColors.text} />
    </Pressable>
    <Pressable onPress={onNext} hitSlop={8} style={styles.navButton}>
      <MaterialCommunityIcons name="chevron-down" size={22} color={homeColors.text} />
    </Pressable>
  </>
);

type DefaultRowProps = { addDialog: AddItemDialogState; filterDialog: FilterDialogState; onSearch: () => void };

const DefaultRow = ({ addDialog, filterDialog, onSearch }: DefaultRowProps) => (
  <View style={styles.row}>
    <Pressable
      style={homeStyles.quickAdd}
      onPress={addDialog.open}
      accessibilityRole="button"
      accessibilityLabel={HOME_COPY.addItemQuick}
      hitSlop={8}
    >
      <Text style={homeStyles.quickAddLabel}>{HOME_COPY.addItemQuick}</Text>
    </Pressable>
    <View style={styles.iconRow}>
      <Pressable style={styles.filterButton} onPress={onSearch} hitSlop={8}>
        <MaterialCommunityIcons name="magnify" size={20} color={homeColors.muted} />
      </Pressable>
      <Pressable style={styles.filterButton} onPress={filterDialog.open} hitSlop={8}>
        <MaterialCommunityIcons
          name="filter-variant"
          size={20}
          color={filterDialog.hasActiveFilter ? homeColors.primary : homeColors.muted}
        />
      </Pressable>
    </View>
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconRow: { flexDirection: "row", alignItems: "center", gap: homeSpacing.xs },
  filterButton: { padding: homeSpacing.xs },
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
  searchInput: { flex: 1, fontSize: 14, color: homeColors.text, paddingVertical: homeSpacing.sm },
  matchCount: { fontSize: 12, color: homeColors.muted, marginRight: homeSpacing.xs },
  noMatch: { fontSize: 12, color: "#ef4444", marginRight: homeSpacing.xs },
  navButton: { paddingHorizontal: 2 },
});
