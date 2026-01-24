import { useEffect, useRef } from "react";
import { Alert, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { PackingListSummary } from "./types.ts";
import { homeStyles } from "./styles.ts";

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

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={homeStyles.modalBackdrop} onPress={onClose}>
        <Pressable style={homeStyles.modalCard} onPress={(e) => e.stopPropagation()}>
          <Text style={homeStyles.modalTitle}>{COPY.title}</Text>
          <ScrollView ref={scrollRef} style={STYLES.list}>
            {availableLists.map((list) => (
              <ListOption key={list.id} list={list} onSelect={handleSelect} />
            ))}
          </ScrollView>
          <CancelButton onPress={onClose} />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

type ListOptionProps = { list: PackingListSummary; onSelect: (l: PackingListSummary) => void };

const ListOption = ({ list, onSelect }: ListOptionProps) => {
  const count = list.itemCount ?? 0;
  const label = count === 1 ? "item" : "items";
  return (
    <Pressable style={STYLES.option} onPress={() => onSelect(list)}>
      <Text style={STYLES.optionText}>{list.name}</Text>
      <Text style={STYLES.countText}>{count} {label}</Text>
    </Pressable>
  );
};

const CancelButton = ({ onPress }: { onPress: () => void }) => (
  <View style={homeStyles.modalActions}>
    <Pressable onPress={onPress}>
      <Text style={homeStyles.modalAction}>{COPY.cancel}</Text>
    </Pressable>
  </View>
);

const COPY = { title: "Copy to List", cancel: "Cancel", confirmTitle: "Copied", confirmMessage: "Item copied to" };

const STYLES = {
  list: { maxHeight: 300, marginBottom: 12 },
  option: { flexDirection: "row" as const, justifyContent: "space-between" as const, alignItems: "center" as const, paddingVertical: 14, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  optionText: { fontSize: 16, color: "#111827" },
  countText: { fontSize: 14, color: "#6b7280" },
};
