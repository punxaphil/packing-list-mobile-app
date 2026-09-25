import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Pressable, ScrollView, Text } from "react-native";
import { DialogShell, DialogSingleAction } from "../shared/DialogShell.tsx";
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
  const { t } = useTranslation();
  const availableLists = lists.filter((list) => list.id !== currentListId && !list.archived);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible) setTimeout(() => scrollRef.current?.flashScrollIndicators(), 100);
  }, [visible]);

  const handleSelect = async (list: PackingListSummary) => {
    onClose();
    await onSelect(list);
    Alert.alert(t("copyToList.confirmTitle"), `${t("copyToList.confirmMessage")} "${list.name}"`);
  };

  if (availableLists.length === 0) return null;

  return (
    <DialogShell
      visible={visible}
      title={t("copyToList.title")}
      onClose={onClose}
      actions={<DialogSingleAction label={t("copyToList.cancel")} onPress={onClose} />}
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
};

const ListOption = ({ list, onSelect }: ListOptionProps) => {
  const { t } = useTranslation();
  const count = list.itemCount ?? 0;
  const label = count === 1 ? t("copyToList.item") : t("copyToList.items");
  return (
    <Pressable style={STYLES.option} onPress={() => onSelect(list)}>
      <Text style={STYLES.optionText}>{list.name}</Text>
      <Text style={STYLES.countText}>
        {count} {label}
      </Text>
    </Pressable>
  );
};

const STYLES = {
  list: { maxHeight: 300, marginBottom: 12 },
  option: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  optionText: { fontSize: 16, color: "#111827" },
  countText: { fontSize: 14, color: "#6b7280" },
};
