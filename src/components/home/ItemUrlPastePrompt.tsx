import i18next from "i18next";
import { type ClipboardEventHandler, useEffect, useState } from "react";
import { DialogActions, DialogShell } from "../shared/DialogShell.tsx";
import { getItemUrlPaste } from "./itemUrlPaste.ts";

export const useItemUrlPaste = (
  active: boolean,
  onUseUrl: (url: string) => void,
  onUseText: (text: string) => void
) => {
  const [paste, setPaste] = useState<ReturnType<typeof getItemUrlPaste>>(null);
  useEffect(() => {
    if (!active) setPaste(null);
  }, [active]);
  const close = () => setPaste(null);
  const onPaste: ClipboardEventHandler<HTMLInputElement> = (event) => {
    const candidate = getItemUrlPaste(event.clipboardData.getData("text/plain"), event.currentTarget);
    if (!candidate) return;
    event.preventDefault();
    setPaste(candidate);
  };
  const prompt = active && (
    <DialogShell
      visible={!!paste}
      title={i18next.t("home.itemUrlPasteQuestion")}
      onClose={close}
      actions={
        <DialogActions
          cancelLabel={i18next.t("home.itemUrlPasteAsText")}
          confirmLabel={i18next.t("home.itemUrlPasteAsLink")}
          onCancel={() => {
            close();
            if (paste) onUseText(paste.text);
          }}
          onConfirm={() => {
            close();
            if (paste) onUseUrl(paste.url);
          }}
        />
      }
    >
      <p style={{ overflowWrap: "anywhere" }}>{paste?.url}</p>
    </DialogShell>
  );
  return { onPaste, prompt };
};
