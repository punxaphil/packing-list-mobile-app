import { useCallback, useEffect, useRef, useState } from "react";
import { DefaultQuickAddRow } from "./DefaultQuickAddRow.tsx";
import type { AddItemDialogState } from "./ItemsPanel.tsx";
import { SearchRow } from "./SearchRow.tsx";
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
  const inputRef = useRef<HTMLInputElement>(null);

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
    <DefaultQuickAddRow
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
