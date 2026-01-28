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
  const submit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (hasDuplicateEntityName(trimmed, entities)) {
      setError(`${typeName} with this name already exists`);
      return;
    }
    void create(trimmed);
    close();
  }, [value, entities, typeName, create, close]);
  const onChange = useCallback((text: string) => {
    setValue(text);
    setError(null);
  }, []);
  return { visible, value, setValue: onChange, error, open, close, submit } as const;
};
