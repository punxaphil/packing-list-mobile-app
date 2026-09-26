import { useEffect, useMemo, useState } from "react";
import { useSpace } from "~/providers/SpaceContext.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { DialogShell, DialogSingleAction } from "../shared/DialogShell.tsx";
import { MoveCategoryActions, MoveCategoryContent } from "./MoveCategoryItemsContent.tsx";
import { MOVE_COPY, moveTheme } from "./styles.ts";
import "./moveCategoryItems.css";

type MoveCategoryItemsModalProps = {
  visible: boolean;
  sourceCategory: NamedEntity;
  categories: NamedEntity[];
  onClose: () => void;
};

export const MoveCategoryItemsModal = ({
  visible,
  sourceCategory,
  categories,
  onClose,
}: MoveCategoryItemsModalProps) => {
  const { writeDb } = useSpace();
  const [items, setItems] = useState<PackItem[]>([]);
  const [sortByAlpha, setSortByAlpha] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      writeDb
        .getPackItemsForAllPackingLists()
        .then((all) => setItems(all.filter((i) => i.category === sourceCategory.id)));
      setSelectedId(null);
    }
  }, [visible, sourceCategory.id, writeDb]);

  const targets = useMemo(() => {
    const filtered = categories.filter((c) => c.id !== sourceCategory.id);
    return sortByAlpha ? [...filtered].sort((a, b) => a.name.localeCompare(b.name)) : filtered;
  }, [categories, sourceCategory.id, sortByAlpha]);

  const handleMove = async () => {
    if (!selectedId || items.length === 0) return;
    const targetItems = await writeDb.getPackItemsForAllPackingLists();
    const bottomRank = getBottomRank(targetItems, selectedId);
    const batch = writeDb.initBatch();
    let rank = bottomRank;
    for (const item of items) {
      writeDb.updatePackItemBatch({ ...item, category: selectedId, rank }, batch);
      rank--;
    }
    await batch.commit();
    onClose();
  };

  if (items.length === 0 && visible) {
    return (
      <DialogShell
        visible={visible}
        title={MOVE_COPY.title}
        onClose={onClose}
        actions={<DialogSingleAction label={MOVE_COPY.close} onPress={onClose} />}
      >
        <p className="move-category-empty" style={moveTheme}>
          {MOVE_COPY.noItems.replace("{name}", sourceCategory.name)}
        </p>
      </DialogShell>
    );
  }

  return (
    <DialogShell
      visible={visible}
      title={MOVE_COPY.title}
      onClose={onClose}
      actions={<MoveCategoryActions selectedId={selectedId} targets={targets} onMove={handleMove} onClose={onClose} />}
    >
      <div className="move-category-content" style={moveTheme}>
        <MoveCategoryContent
          sourceName={sourceCategory.name}
          items={items}
          targets={targets}
          selectedId={selectedId}
          sortByAlpha={sortByAlpha}
          onSort={() => setSortByAlpha(!sortByAlpha)}
          onSelect={setSelectedId}
        />
      </div>
    </DialogShell>
  );
};

const getBottomRank = (items: PackItem[], categoryId: string): number => {
  const inCategory = items.filter((i) => i.category === categoryId);
  return inCategory.length === 0 ? 0 : Math.min(...inCategory.map((i) => i.rank)) - 1;
};
