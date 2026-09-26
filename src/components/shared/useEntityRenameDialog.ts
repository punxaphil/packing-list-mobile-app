import i18next from "i18next";
import { useState } from "react";
import type { EntityCardProps } from "./entityCardTypes.ts";
import { hasDuplicateEntityName } from "./entityValidation.ts";

export const useEntityRenameDialog = ({ entity, entities, actions, copy }: EntityCardProps) => {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState("");
  const getError = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === entity.name) return null;
    return hasDuplicateEntityName(trimmed, entities, entity.id)
      ? i18next.t("common.duplicateEntityName", { type: copy.type })
      : null;
  };
  const close = () => {
    setVisible(false);
    setValue(entity.name);
  };
  return {
    visible,
    value,
    setValue,
    getError,
    open: () => {
      setValue(entity.name);
      setVisible(true);
    },
    close,
    submit: () => {
      const name = value.trim();
      if (name && name !== entity.name && !getError(name)) void actions.onRename(entity, name);
      close();
    },
  };
};
