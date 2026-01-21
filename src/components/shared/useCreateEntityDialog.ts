import { useCallback, useState } from "react";

export const useCreateEntityDialog = (create: (name: string) => Promise<void>) => {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState("");
  const open = useCallback(() => { setValue(""); setVisible(true); }, []);
  const close = useCallback(() => setVisible(false), []);
  const submit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    void create(trimmed);
    close();
  }, [value, create, close]);
  return { visible, value, setValue, open, close, submit } as const;
};
