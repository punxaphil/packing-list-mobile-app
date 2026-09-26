import i18next from "i18next";
import { type CSSProperties, useCallback, useId, useState } from "react";
import glyphs from "react-native-vector-icons/glyphmaps/MaterialCommunityIcons.json";
import { getTranslatedKits, PackingKit } from "~/data/packingKits.ts";
import { DialogActions, DialogShell } from "../shared/DialogShell.tsx";
import { AppCheckbox } from "./AppCheckbox.tsx";
import { commonCopy, homeCopy } from "./copy.ts";
import { homeColors, homeSpacing } from "./theme.ts";
import "./kitPickerModal.css";

type KitPickerModalProps = {
  visible: boolean;
  onClose: () => void;
  onAdd: (kits: PackingKit[]) => void;
};

const kitItemCount = (count: number) => i18next.t("home.kitPickerItemCount", { count });

export const KitPickerModal = ({ visible, onClose, onAdd }: KitPickerModalProps) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const kits = getTranslatedKits();

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleAdd = useCallback(() => {
    const selectedKits = kits.filter((kit) => selected.has(kit.id));
    if (selectedKits.length > 0) onAdd(selectedKits);
    setSelected(new Set());
    onClose();
  }, [kits, selected, onAdd, onClose]);

  const handleClose = useCallback(() => {
    setSelected(new Set());
    onClose();
  }, [onClose]);

  return (
    <DialogShell
      visible={visible}
      title={homeCopy.kitPickerTitle}
      onClose={handleClose}
      actions={
        <DialogActions
          cancelLabel={commonCopy.cancel}
          confirmLabel={homeCopy.kitPickerAdd}
          onCancel={handleClose}
          onConfirm={handleAdd}
          disabled={selected.size === 0}
        />
      }
    >
      <p className="kit-picker-subtitle" style={{ color: homeColors.muted, marginBottom: homeSpacing.md }}>
        {homeCopy.kitPickerSubtitle}
      </p>
      <div
        className="kit-picker-list"
        style={{ marginBottom: homeSpacing.md, "--kit-picker-gap": `${homeSpacing.sm}px` } as CSSProperties}
      >
        {kits.map((kit) => (
          <KitRow key={kit.id} kit={kit} checked={selected.has(kit.id)} onToggle={() => toggle(kit.id)} />
        ))}
      </div>
    </DialogShell>
  );
};

type KitRowProps = { kit: PackingKit; checked: boolean; onToggle: () => void };

const KitRow = ({ kit, checked, onToggle }: KitRowProps) => {
  const checkboxId = useId();
  return (
    <label className="kit-picker-row" htmlFor={checkboxId} style={{ borderColor: homeColors.border }}>
      <AppCheckbox id={checkboxId} checked={checked} label={kit.name} onToggle={onToggle} size={16} />
      <span
        className="web-button-icon kit-picker-icon"
        style={{ color: checked ? homeColors.primaryStrong : homeColors.muted }}
        aria-hidden="true"
      >
        {String.fromCodePoint(glyphs[kit.icon as keyof typeof glyphs])}
      </span>
      <span className="kit-picker-info">
        <span className="kit-picker-name" style={{ color: homeColors.text }}>
          {kit.name}
        </span>
        <span className="kit-picker-count" style={{ color: homeColors.muted }}>
          {kitItemCount(kit.items.length)}
        </span>
      </span>
    </label>
  );
};
