import { ReactNode, useCallback, useState } from "react";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { PackingListSummary, SelectionState } from "./types.ts";
import { HOME_COPY, homeStyles, listCardPalette } from "./styles.ts";
import { HomeHeader } from "./HomeHeader.tsx";
import { ListCard } from "./ListCard.tsx";
import { ListActions, ListEditing, useListActions, useListEditing } from "./listSectionState.ts";

type ListSectionProps = {
  lists: PackingListSummary[];
  selection: SelectionState;
  email: string;
  onSignOut: () => void;
};

type ListScrollProps = {
  lists: PackingListSummary[];
  selection: SelectionState;
  editing: ListEditing;
  actions: ListActions;
};

export const ListSection = (props: ListSectionProps) => {
  const editing = useListEditing();
  const actions = useListActions(props.lists, props.selection, editing);
  const creation = useCreateListDialog(actions.onAdd);
  return (
    <View style={homeStyles.panel}>
      <HomeHeader title={HOME_COPY.listHeader} email={props.email} onSignOut={props.onSignOut} />
      <ListHeader onAdd={creation.open} />
      <ListScroll lists={props.lists} selection={props.selection} editing={editing} actions={actions} />
      <ListCreateDialog visible={creation.visible} value={creation.value} onChange={creation.setValue} onCancel={creation.close} onSubmit={creation.submit} />
    </View>
  );
};

const ListHeader = ({ onAdd }: { onAdd: () => void }) => (
  <View style={homeStyles.listActions}>
    <Pressable style={homeStyles.listActionButton} onPress={onAdd} accessibilityRole="button" accessibilityLabel={HOME_COPY.createList}>
      <Text style={homeStyles.listActionLabel}>{HOME_COPY.createList}</Text>
    </Pressable>
  </View>
);

const ListScroll = ({ lists, selection, editing, actions }: ListScrollProps) => (
  <ScrollView style={homeStyles.scroll} showsVerticalScrollIndicator={false}>
    <View style={homeStyles.list}>
      {lists.map((list, index) => (
        <ListCard key={list.id} list={list} selection={selection} editing={editing} actions={actions} color={getListColor(index)} />
      ))}
    </View>
  </ScrollView>
);

const ListCreateDialog = ({ visible, value, onChange, onCancel, onSubmit }: { visible: boolean; value: string; onChange: (text: string) => void; onCancel: () => void; onSubmit: () => void }) => (
  <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
    <DialogBackdrop>
      <ListCreateCard value={value} onChange={onChange} onCancel={onCancel} onSubmit={onSubmit} />
    </DialogBackdrop>
  </Modal>
);

const DialogBackdrop = ({ children }: { children: ReactNode }) => <View style={homeStyles.modalBackdrop}>{children}</View>;

const ListCreateCard = ({ value, onChange, onCancel, onSubmit }: { value: string; onChange: (text: string) => void; onCancel: () => void; onSubmit: () => void }) => (
  <View style={homeStyles.modalCard}>
    <Text style={homeStyles.modalTitle}>{HOME_COPY.createListPrompt}</Text>
    <TextInput value={value} onChangeText={onChange} onSubmitEditing={onSubmit} placeholder={HOME_COPY.createListPlaceholder} style={homeStyles.modalInput} autoFocus accessibilityLabel={HOME_COPY.createListPrompt} />
    <DialogActions onCancel={onCancel} onSubmit={onSubmit} />
  </View>
);

const DialogActions = ({ onCancel, onSubmit }: { onCancel: () => void; onSubmit: () => void }) => (
  <View style={homeStyles.modalActions}>
    <Pressable onPress={onCancel} accessibilityRole="button" accessibilityLabel={HOME_COPY.cancel}>
      <Text style={homeStyles.modalAction}>{HOME_COPY.cancel}</Text>
    </Pressable>
    <Pressable onPress={onSubmit} accessibilityRole="button" accessibilityLabel={HOME_COPY.createListConfirm}>
      <Text style={[homeStyles.modalAction, homeStyles.modalActionPrimary]}>{HOME_COPY.createListConfirm}</Text>
    </Pressable>
  </View>
);

const useCreateListDialog = (create: (name: string) => Promise<void>) => {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState("");
  const open = useCallback(() => { setValue(""); setVisible(true); }, []);
  const close = useCallback(() => setVisible(false), []);
  const submit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    void create(trimmed);
    close();
  }, [value, create, close]);
  return { visible, value, setValue, open, close, submit } as const;
};

const getListColor = (index: number) => listCardPalette[index % listCardPalette.length];
