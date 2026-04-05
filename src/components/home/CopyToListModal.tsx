import { useEffect, useRef } from "react";
import { Alert, Platform, Pressable, ScrollView, Text } from "react-native";
import { DialogShell, DialogSingleAction } from "../shared/DialogShell.tsx";
import { PageSheet } from "../shared/PageSheet.tsx";
import { PackingListSummary } from "./types.ts";

type CopyToListModalProps = {
  visible: boolean;
  lists: PackingListSummary[];
  currentListId: string;
  onClose: () => void;
  onSelect: (list: PackingListSummary) => Promise<void>;
};

export const CopyToListModal = (props: CopyToListModalProps) => {
  const { visible, lists, currentListId, onClose, onSelect } = props;
  const availableLists = lists.filter((l) => l.id !== currentListId);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible) setTimeout(() => scrollRef.current?.flashScrollIndicators(), 100);
  }, [visible]);

  const handleSelect = async (list: PackingListSummary) => {
    onClose();
    await onSelect(list);
    Alert.alert(COPY.confirmTitle, `${COPY.confirmMessage} "${list.name}"`);
  };

  if (availableLists.length === 0) return null;

  if (Platform.OS === "ios") {
    return (
      <PageSheet visible={visible} title={COPY.title} onClose={onClose} scrollable={false}>
        <ScrollView ref={scrollRef} style={STYLES.sheetList} contentContainerStyle={STYLES.sheetListContent}>
          {availableLists.map((list) => (
            <ListOption key={list.id} list={list} onSelect={handleSelect} iosSheet />
          ))}
        </ScrollView>
      </PageSheet>
    );
  }

  return (
    <DialogShell
      visible={visible}
      title={COPY.title}
      onClose={onClose}
      actions={<DialogSingleAction label={COPY.cancel} onPress={onClose} />}
    >
      <ScrollView ref={scrollRef} style={STYLES.list}>
        {availableLists.map((list) => (
          <ListOption key={list.id} list={list} onSelect={handleSelect} />
        ))}
      </ScrollView>
    </DialogShell>
  );
};

type ListOptionProps = {
  list: PackingListSummary;
  onSelect: (l: PackingListSummary) => void;
  iosSheet?: boolean;
};

const ListOption = ({ list, onSelect, iosSheet = false }: ListOptionProps) => {
  const count = list.itemCount ?? 0;
  const label = count === 1 ? "item" : "items";
  return (
    <Pressable style={[STYLES.option, iosSheet ? STYLES.sheetOption : null]} onPress={() => onSelect(list)}>
      <Text style={STYLES.optionText}>{list.name}</Text>
      <Text style={STYLES.countText}>
        {count} {label}
      </Text>
    </Pressable>
  );
};

const COPY = {
  title: "Copy to List",
  cancel: "Cancel",
  confirmTitle: "Copied",
  confirmMessage: "Item copied to",
};

const STYLES = {
  list: { maxHeight: 300, marginBottom: 12 },
  sheetList: { flex: 1, minHeight: 0 },
  sheetListContent: { paddingBottom: 8 },
  option: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  sheetOption: {
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.9)",
    marginBottom: 8,
    borderBottomWidth: 0,
  },
  optionText: { fontSize: 16, color: "#111827" },
  countText: { fontSize: 14, color: "#6b7280" },
};
