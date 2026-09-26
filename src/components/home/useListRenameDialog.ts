import { useState } from "react";
import { hasDuplicateEntityName } from "../shared/entityValidation.ts";
import { homeCopy } from "./copy.ts";
import type { PackingListSummary } from "./types.ts";

export const useListRenameDialog = (
  list: PackingListSummary,
  lists: PackingListSummary[],
  onRename: (list: PackingListSummary, name: string) => Promise<void>
) => {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const open = () => {
    setValue(list.name);
    setError(null);
    setVisible(true);
  };
  const close = () => setVisible(false);
  const getError = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return homeCopy.nameRequired;
    const isDuplicate = trimmed !== list.name && hasDuplicateEntityName(trimmed, lists, list.id);
    return isDuplicate ? homeCopy.duplicateListName : null;
  };
  const onChange = (text: string) => {
    setValue(text);
    setError(getError(text));
  };
  const submitText = (text: string) => {
    const trimmed = text.trim();
    const nextError = getError(text);
    if (!trimmed || trimmed === list.name || nextError) {
      setError(nextError);
      if (!nextError) close();
      return;
    }
    void onRename(list, trimmed);
    close();
  };
  return {
    visible,
    value,
    error,
    getError,
    setValue: onChange,
    open,
    close,
    submitText,
    submit: () => submitText(value),
  };
};
