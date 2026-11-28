import i18next from "i18next";
import { useState } from "react";
import { useSpace } from "~/providers/SpaceContext.ts";
import { parseItemUrl } from "~/services/itemUrl.ts";
import { Button } from "../shared/Button.tsx";
import { createItemRowMenu } from "./createItemRowMenu.ts";
import type { CategoryItemRowProps } from "./itemRowProps.ts";
import { TextPromptDialog } from "./TextPromptDialog.tsx";
import { useToast } from "./Toast.tsx";
import { homeColors } from "./theme.ts";

export const ItemRowMenu = (props: CategoryItemRowProps) => {
  const { writeDb } = useSpace();
  const { show: showToast } = useToast();
  const [draft, setDraft] = useState<string | null>(null);
  const url = parseItemUrl(draft);
  const invalid = !!draft?.trim() && !url;
  const saveUrl = (url: string | null) => {
    setDraft(null);
    if (url === (props.item.url ?? null)) return;
    void writeDb.updatePackItemUrl(props.item.id, url).catch(() => showToast(i18next.t("home.itemUrlSaveFailed")));
  };
  return (
    <>
      <button
        type="button"
        className="item-row-menu"
        onClick={createItemRowMenu(props, () => setDraft(props.item.url ?? ""))}
        style={{ color: homeColors.muted }}
        aria-label={i18next.t("home.itemMenu")}
        title={i18next.t("home.itemMenu")}
      >
        <span className="mdi mdi-dots-vertical" aria-hidden="true" />
      </button>
      {draft !== null && (
        <TextPromptDialog
          visible
          title={i18next.t(props.item.url ? "home.editItemUrl" : "home.addItemUrl")}
          confirmLabel={i18next.t("home.renameListConfirm")}
          value={draft}
          error={invalid ? i18next.t("home.invalidItemUrl") : null}
          disabled={invalid || (!url && !props.item.url)}
          autoCapitalize="none"
          keyboardType="url"
          onChange={setDraft}
          onCancel={() => setDraft(null)}
          onSubmit={() => {
            if (!invalid) saveUrl(url);
          }}
        >
          {props.item.url && (
            <Button label={i18next.t("home.removeItemUrl")} variant="danger" onPress={() => saveUrl(null)} />
          )}
        </TextPromptDialog>
      )}
    </>
  );
};
