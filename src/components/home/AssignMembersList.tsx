import { useId } from "react";
import { useTranslation } from "react-i18next";
import { getEmojiValue } from "~/services/mediaValue.ts";
import type { Image } from "~/types/Image.ts";
import type { NamedEntity } from "~/types/NamedEntity.ts";
import { AppCheckbox } from "./AppCheckbox.tsx";

type MemberListProps = {
  members: NamedEntity[];
  memberImages: Image[];
  selected: Set<string>;
  onToggle: (id: string) => void;
};

export const MemberList = ({ members, memberImages, selected, onToggle }: MemberListProps) => {
  const { t } = useTranslation();

  return (
    <div className="assign-members-list">
      {members.length === 0 && <p className="assign-members-empty">{t("assignMembers.noMembers")}</p>}
      {members.map((member) => (
        <MemberRow
          key={member.id}
          member={member}
          imageUrl={memberImages.find((image) => image.typeId === member.id)?.url}
          checked={selected.has(member.id)}
          onToggle={() => onToggle(member.id)}
        />
      ))}
    </div>
  );
};

type MemberRowProps = {
  member: NamedEntity;
  imageUrl?: string;
  checked: boolean;
  onToggle: () => void;
};

const MemberRow = ({ member, imageUrl, checked, onToggle }: MemberRowProps) => {
  const inputId = useId();
  const emoji = getEmojiValue(imageUrl);

  return (
    <label className="assign-members-row" htmlFor={inputId}>
      <AppCheckbox id={inputId} checked={checked} label={member.name} onToggle={onToggle} size={16} />
      <span className="assign-members-name">{member.name}</span>
      {emoji ? (
        <span className="assign-members-emoji" aria-hidden="true">
          {emoji}
        </span>
      ) : imageUrl ? (
        <img className="assign-members-avatar" src={imageUrl} alt="" />
      ) : null}
    </label>
  );
};
