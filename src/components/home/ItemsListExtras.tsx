import i18next from "i18next";
import { useState } from "react";
import { getTranslatedKits, type PackingKit } from "~/data/packingKits.ts";
import { filterCopy, homeCopy } from "./copy.ts";
import { addItemCopy } from "./listCopy.ts";
import "./itemsListExtras.css";

export const EmptyItems = ({
  onBrowseKits,
  onAddKit,
}: {
  onBrowseKits: () => void;
  onAddKit: (kits: PackingKit[]) => Promise<void>;
}) => {
  const [addingKitId, setAddingKitId] = useState<string | null>(null);
  const handleAddKit = async (kit: PackingKit) => {
    if (addingKitId) return;
    setAddingKitId(kit.id);
    try {
      await onAddKit([kit]);
    } finally {
      setAddingKitId(null);
    }
  };
  return (
    <div className="items-empty">
      <span className="items-empty-message">{homeCopy.emptyItems}</span>
      <div className="items-kits">
        <span className="items-kits-title">{homeCopy.quickStart}</span>
        <div className="items-kits-list">
          {getTranslatedKits().map((kit) => (
            <button
              className="items-kit"
              type="button"
              key={kit.id}
              onClick={() => void handleAddKit(kit)}
              disabled={addingKitId !== null}
            >
              <span className={`mdi mdi-${kit.icon}`} aria-hidden="true" />
              <span className="items-kit-content">
                <span>{kit.name}</span>
                <small>{i18next.t("home.kitPickerItemCount", { count: kit.items.length })}</small>
              </span>
            </button>
          ))}
        </div>
        <button className="items-kits-browse" type="button" onClick={onBrowseKits} disabled={addingKitId !== null}>
          {addItemCopy.browseKits}
        </button>
      </div>
    </div>
  );
};

export const FilteredEmpty = () => <div className="items-empty items-empty-message">{filterCopy.noMatch}</div>;

export const NotesBanner = ({ notes, onPress }: { notes: string; onPress?: () => void }) => (
  <button className="items-notes" type="button" onClick={onPress} disabled={!onPress}>
    {notes}
  </button>
);
