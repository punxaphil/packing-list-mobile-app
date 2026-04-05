import { useCallback, useState } from "react";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { hasDuplicateEntityName } from "./entityValidation.ts";

export const useCreateEntityDialog = (
  create: (name: string) => Promise<void>,
  entities: NamedEntity[],
  typeName: string
) => {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const open = useCallback(() => {
    setValue("");
    setError(null);
    setVisible(true);
  }, []);
  const close = useCallback(() => setVisible(false), []);
  const getError = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      return trimmed && hasDuplicateEntityName(trimmed, entities) ? `${typeName} with this name already exists` : null;
    },
    [entities, typeName]
  );
  const submitText = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      const nextError = getError(text);
      if (!trimmed || nextError) {
        setError(nextError);
        return;
      }
      void create(trimmed);
      close();
    },
    [create, close, getError]
  );
  const submit = useCallback(() => {
    submitText(value);
  }, [submitText, value]);
  const onChange = useCallback((text: string) => {
    setValue(text);
    setError(null);
  }, []);
  return {
    visible,
    value,
    setValue: onChange,
    error,
    getError,
    open,
    close,
    submit,
    submitText,
  } as const;
};
