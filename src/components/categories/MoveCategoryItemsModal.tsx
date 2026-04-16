import { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { useSpace } from "~/providers/SpaceContext.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { homeColors } from "../home/theme.ts";
import { DialogActions, DialogShell, DialogSingleAction } from "../shared/DialogShell.tsx";
import { entityStyles } from "../shared/entityStyles.ts";
import { PageSheet } from "../shared/PageSheet.tsx";
import { MOVE_COPY, moveStyles } from "./styles.ts";

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
    if (Platform.OS === "ios") {
      return (
        <PageSheet visible={visible} title={MOVE_COPY.title} onClose={onClose}>
          <Text style={moveStyles.empty}>{MOVE_COPY.noItems.replace("{name}", sourceCategory.name)}</Text>
        </PageSheet>
      );
    }
    return (
      <DialogShell
        visible={visible}
        title={MOVE_COPY.title}
        onClose={onClose}
        actions={<DialogSingleAction label={MOVE_COPY.close} onPress={onClose} />}
      >
        <Text style={moveStyles.empty}>{MOVE_COPY.noItems.replace("{name}", sourceCategory.name)}</Text>
      </DialogShell>
    );
  }

  if (Platform.OS === "ios") {
    const targetName = targets.find((c) => c.id === selectedId)?.name;
    const confirmLabel = selectedId ? MOVE_COPY.moveTo.replace("{name}", targetName ?? "") : MOVE_COPY.selectCategory;
    return (
      <PageSheet
        visible={visible}
        title={MOVE_COPY.title}
        onClose={onClose}
        confirmLabel={confirmLabel}
        onConfirm={handleMove}
        confirmDisabled={!selectedId}
      >
        <Text style={moveStyles.subtitle}>
          {MOVE_COPY.subtitle.replace("{name}", sourceCategory.name).replace("{count}", String(items.length))}
        </Text>
        <ItemsList items={items} />
        <SortToggle sortByAlpha={sortByAlpha} onToggle={() => setSortByAlpha(!sortByAlpha)} />
        <CategoryPicker targets={targets} selectedId={selectedId} onSelect={setSelectedId} iosSheet />
      </PageSheet>
    );
  }

  return (
    <DialogShell
      visible={visible}
      title={MOVE_COPY.title}
      onClose={onClose}
      actions={<ActionButtons selectedId={selectedId} targets={targets} onMove={handleMove} onClose={onClose} />}
    >
      <Text style={moveStyles.subtitle}>
        {MOVE_COPY.subtitle.replace("{name}", sourceCategory.name).replace("{count}", String(items.length))}
      </Text>
      <ItemsList items={items} />
      <SortToggle sortByAlpha={sortByAlpha} onToggle={() => setSortByAlpha(!sortByAlpha)} />
      <CategoryPicker targets={targets} selectedId={selectedId} onSelect={setSelectedId} />
    </DialogShell>
  );
};

const ItemsList = ({ items }: { items: PackItem[] }) => (
  <ScrollView style={moveStyles.itemsList}>
    {items.map((item) => (
      <Text key={item.id} style={moveStyles.itemText}>
        • {item.name}
      </Text>
    ))}
  </ScrollView>
);

const SortToggle = ({ sortByAlpha, onToggle }: { sortByAlpha: boolean; onToggle: () => void }) => (
  <View style={moveStyles.sortRow}>
    <Text style={moveStyles.sortLabel}>{MOVE_COPY.selectTarget}</Text>
    <View style={entityStyles.sortToggle}>
      <Text style={entityStyles.sortLabel}>{sortByAlpha ? "A-Z" : "Rank"}</Text>
      <Switch
        value={sortByAlpha}
        onValueChange={onToggle}
        trackColor={{ true: homeColors.primary, false: homeColors.border }}
      />
    </View>
  </View>
);

const CategoryPicker = ({
  targets,
  selectedId,
  onSelect,
  iosSheet = false,
}: {
  targets: NamedEntity[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  iosSheet?: boolean;
}) => (
  <ScrollView style={moveStyles.categoryList}>
    {targets.map((cat) => (
      <Pressable
        key={cat.id}
        style={[
          moveStyles.categoryItem,
          iosSheet ? moveStyles.sheetCategoryItem : null,
          selectedId === cat.id && moveStyles.categorySelected,
        ]}
        onPress={() => onSelect(cat.id)}
      >
        <Text style={moveStyles.categoryName}>{cat.name}</Text>
      </Pressable>
    ))}
    {targets.length === 0 && <Text style={moveStyles.empty}>{MOVE_COPY.noCategories}</Text>}
  </ScrollView>
);

const ActionButtons = ({
  selectedId,
  targets,
  onMove,
  onClose,
}: {
  selectedId: string | null;
  targets: NamedEntity[];
  onMove: () => void;
  onClose: () => void;
}) => {
  const targetName = targets.find((c) => c.id === selectedId)?.name;
  const confirmLabel = selectedId ? MOVE_COPY.moveTo.replace("{name}", targetName ?? "") : MOVE_COPY.selectCategory;
  return (
    <DialogActions
      cancelLabel={MOVE_COPY.cancel}
      confirmLabel={confirmLabel}
      onCancel={onClose}
      onConfirm={onMove}
      disabled={!selectedId}
    />
  );
};

const getBottomRank = (items: PackItem[], categoryId: string): number => {
  const inCategory = items.filter((i) => i.category === categoryId);
  return inCategory.length === 0 ? 0 : Math.min(...inCategory.map((i) => i.rank)) - 1;
};
