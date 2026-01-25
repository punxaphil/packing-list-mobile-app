import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { writeDb } from "~/services/database.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { homeColors } from "../home/theme.ts";
import { entityStyles } from "../shared/entityStyles.ts";
import { MOVE_COPY, moveStyles } from "./styles.ts";

type MoveCategoryItemsModalProps = {
  visible: boolean;
  sourceCategory: NamedEntity;
  categories: NamedEntity[];
  onClose: () => void;
  onMoved: () => void;
};

export const MoveCategoryItemsModal = ({ visible, sourceCategory, categories, onClose, onMoved }: MoveCategoryItemsModalProps) => {
  const [items, setItems] = useState<PackItem[]>([]);
  const [sortByAlpha, setSortByAlpha] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      writeDb.getPackItemsForAllPackingLists().then((all) => setItems(all.filter((i) => i.category === sourceCategory.id)));
      setSelectedId(null);
    }
  }, [visible, sourceCategory.id]);

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
    onMoved();
    onClose();
  };

  if (items.length === 0 && visible) {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <Pressable style={moveStyles.overlay} onPress={onClose}>
          <Pressable style={moveStyles.modal} onPress={(e) => e.stopPropagation()}>
            <Text style={moveStyles.title}>{MOVE_COPY.title}</Text>
            <Text style={moveStyles.empty}>{MOVE_COPY.noItems.replace("{name}", sourceCategory.name)}</Text>
            <Pressable style={moveStyles.closeButton} onPress={onClose}>
              <Text style={moveStyles.closeLabel}>{MOVE_COPY.close}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={moveStyles.overlay} onPress={onClose}>
        <Pressable style={moveStyles.modal} onPress={(e) => e.stopPropagation()}>
          <Text style={moveStyles.title}>{MOVE_COPY.title}</Text>
          <Text style={moveStyles.subtitle}>{MOVE_COPY.subtitle.replace("{name}", sourceCategory.name).replace("{count}", String(items.length))}</Text>
          <ItemsList items={items} />
          <SortToggle sortByAlpha={sortByAlpha} onToggle={() => setSortByAlpha(!sortByAlpha)} />
          <CategoryPicker targets={targets} selectedId={selectedId} onSelect={setSelectedId} />
          <ActionButtons selectedId={selectedId} targets={targets} onMove={handleMove} onClose={onClose} />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const ItemsList = ({ items }: { items: PackItem[] }) => (
  <ScrollView style={moveStyles.itemsList}>
    {items.map((item) => (
      <Text key={item.id} style={moveStyles.itemText}>• {item.name}</Text>
    ))}
  </ScrollView>
);

const SortToggle = ({ sortByAlpha, onToggle }: { sortByAlpha: boolean; onToggle: () => void }) => (
  <View style={moveStyles.sortRow}>
    <Text style={moveStyles.sortLabel}>{MOVE_COPY.selectTarget}</Text>
    <View style={entityStyles.sortToggle}>
      <Text style={entityStyles.sortLabel}>{sortByAlpha ? "A-Z" : "Rank"}</Text>
      <Switch value={sortByAlpha} onValueChange={onToggle} trackColor={{ true: homeColors.primary, false: homeColors.border }} />
    </View>
  </View>
);

const CategoryPicker = ({ targets, selectedId, onSelect }: { targets: NamedEntity[]; selectedId: string | null; onSelect: (id: string) => void }) => (
  <ScrollView style={moveStyles.categoryList}>
    {targets.map((cat) => (
      <Pressable key={cat.id} style={[moveStyles.categoryItem, selectedId === cat.id && moveStyles.categorySelected]} onPress={() => onSelect(cat.id)}>
        <Text style={moveStyles.categoryName}>{cat.name}</Text>
      </Pressable>
    ))}
    {targets.length === 0 && <Text style={moveStyles.empty}>{MOVE_COPY.noCategories}</Text>}
  </ScrollView>
);

const ActionButtons = ({ selectedId, targets, onMove, onClose }: { selectedId: string | null; targets: NamedEntity[]; onMove: () => void; onClose: () => void }) => {
  const targetName = targets.find((c) => c.id === selectedId)?.name;
  return (
    <View style={moveStyles.actions}>
      <Pressable style={moveStyles.cancelButton} onPress={onClose}>
        <Text style={moveStyles.cancelLabel}>{MOVE_COPY.cancel}</Text>
      </Pressable>
      <Pressable style={[moveStyles.moveButton, !selectedId && moveStyles.moveButtonDisabled]} onPress={onMove} disabled={!selectedId}>
        <Text style={moveStyles.moveLabel}>{selectedId ? MOVE_COPY.moveTo.replace("{name}", targetName ?? "") : MOVE_COPY.selectCategory}</Text>
      </Pressable>
    </View>
  );
};

const getBottomRank = (items: PackItem[], categoryId: string): number => {
  const inCategory = items.filter((i) => i.category === categoryId);
  return inCategory.length === 0 ? 0 : Math.min(...inCategory.map((i) => i.rank)) - 1;
};
