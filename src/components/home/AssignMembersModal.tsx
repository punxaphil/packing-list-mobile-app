import { type CSSProperties, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { switchToMembersTab } from "~/navigation/navigation.ts";
import { Image } from "~/types/Image.ts";
import { MemberPackItem } from "~/types/MemberPackItem.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { DialogActions, DialogShell } from "../shared/DialogShell.tsx";
import { MemberList } from "./AssignMembersList.tsx";
import { homeColors, homeSpacing } from "./theme.ts";
import "./assignMembersModal.css";

type AssignMembersModalProps = {
  visible: boolean;
  item: PackItem | null;
  members: NamedEntity[];
  memberImages: Image[];
  onClose: () => void;
  onSave: (item: PackItem, members: MemberPackItem[]) => Promise<void>;
};

const theme = {
  "--assign-text": homeColors.text,
  "--assign-muted": homeColors.muted,
  "--assign-border": homeColors.border,
  "--assign-space": `${homeSpacing.md}px`,
  "--assign-gap": `${homeSpacing.sm}px`,
} as CSSProperties;

export const AssignMembersModal = ({
  visible,
  item,
  members,
  memberImages,
  onClose,
  onSave,
}: AssignMembersModalProps) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { t } = useTranslation();

  useEffect(() => {
    if (visible && item) {
      setSelected(new Set(item.members.map((m) => m.id)));
    }
  }, [visible, item]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    if (!item) return;
    const memberItems: MemberPackItem[] = Array.from(selected).map((id) => {
      const existing = item.members.find((m) => m.id === id);
      return existing ?? { id, checked: false };
    });
    await onSave(item, memberItems);
    onClose();
  };

  const handleManageMembers = () => {
    onClose();
    switchToMembersTab();
  };

  if (!item) return null;

  return (
    <DialogShell
      visible={visible}
      title={t("assignMembers.title")}
      onClose={onClose}
      actions={
        <DialogActions
          cancelLabel={t("assignMembers.cancel")}
          confirmLabel={t("assignMembers.save")}
          onCancel={onClose}
          onConfirm={handleSave}
        />
      }
    >
      <div className="assign-members-content" style={theme}>
        <p className="assign-members-subtitle">{item.name}</p>
        <MemberList members={members} memberImages={memberImages} selected={selected} onToggle={toggle} />
        <button type="button" className="assign-members-manage" onClick={handleManageMembers}>
          {t("assignMembers.manageMembers")}
        </button>
      </div>
    </DialogShell>
  );
};
