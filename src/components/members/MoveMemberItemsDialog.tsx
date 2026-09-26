import i18next from "i18next";
import type { CSSProperties } from "react";
import { getEmojiValue } from "~/services/mediaValue.ts";
import { Image } from "~/types/Image.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { MOVE_COPY } from "../categories/styles.ts";
import { commonCopy } from "../home/copy.ts";
import { homeColors, homeSpacing } from "../home/theme.ts";
import { DialogShell, DialogSingleAction } from "../shared/DialogShell.tsx";
import "./moveMemberItemsDialog.css";

const theme = {
  "--move-member-text": homeColors.text,
  "--move-member-border": homeColors.border,
  "--move-member-gap": `${homeSpacing.sm}px`,
} as CSSProperties;

type MoveMemberItemsDialogProps = {
  visible: boolean;
  source: NamedEntity | null;
  targets: NamedEntity[];
  memberImages: Image[];
  onClose: () => void;
  onSubmit: (target: NamedEntity) => Promise<void>;
};

export const MoveMemberItemsDialog = ({
  visible,
  source,
  targets,
  memberImages,
  onClose,
  onSubmit,
}: MoveMemberItemsDialogProps) => {
  return (
    <DialogShell
      visible={visible}
      title={MOVE_COPY.title}
      onClose={onClose}
      actions={<DialogSingleAction label={commonCopy.cancel} onPress={onClose} />}
    >
      <div className="move-member-content" style={theme}>
        <p className="move-member-description">{i18next.t("move.subtitleAll", { name: source?.name })}</p>
        <div className="move-member-list">
          {targets.map((target) => (
            <button type="button" key={target.id} className="move-member-row" onClick={() => void onSubmit(target)}>
              <span className="move-member-name">{target.name}</span>
              <MemberAvatar imageUrl={memberImages.find((image) => image.typeId === target.id)?.url} />
            </button>
          ))}
        </div>
      </div>
    </DialogShell>
  );
};

const MemberAvatar = ({ imageUrl }: { imageUrl?: string }) => {
  const emoji = getEmojiValue(imageUrl);
  if (emoji)
    return (
      <span className="move-member-emoji" aria-hidden="true">
        {emoji}
      </span>
    );
  if (imageUrl) return <img className="move-member-avatar" src={imageUrl} alt="" />;
  return null;
};
