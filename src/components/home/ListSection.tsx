import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { PackingListSummary, SelectionState } from "./types.ts";
import { HOME_COPY, homeStyles } from "./styles.ts";
import { HomeHeader } from "./HomeHeader.tsx";
import { ListCard } from "./ListCard.tsx";
import { ListActions, useListActions } from "./listSectionState.ts";
import { buildListColors } from "./listColors.ts";
import { TextPromptDialog } from "./TextPromptDialog.tsx";

type ListSectionProps = {
  lists: PackingListSummary[];
  selection: SelectionState;
  email: string;
  onSignOut: () => void;
};
export const ListSection = (props: ListSectionProps) => {
  const actions = useListActions(props.lists, props.selection);
  const creation = useCreateListDialog(actions.onAdd);
  return (
    <View style={homeStyles.panel}>
      <HomeHeader title={HOME_COPY.listHeader} email={props.email} onSignOut={props.onSignOut} />
      <ListHeader onAdd={creation.open} />
      <ListScroll lists={props.lists} selection={props.selection} actions={actions} />
      <TextPromptDialog
        visible={creation.visible}
        title={HOME_COPY.createListPrompt}
        confirmLabel={HOME_COPY.createListConfirm}
        value={creation.value}
        placeholder={HOME_COPY.createListPlaceholder}
        onChange={creation.setValue}
        onCancel={creation.close}
        onSubmit={creation.submit}
      />
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

const ListScroll = ({ lists, selection, actions }: { lists: PackingListSummary[]; selection: SelectionState; actions: ListActions }) => {
  const colors = buildListColors(lists);
  return (
    <ScrollView style={homeStyles.scroll} showsVerticalScrollIndicator={false}>
      <View style={homeStyles.list}>
        {lists.map((list) => (
          <ListCard key={list.id} list={list} selection={selection} actions={actions} color={colors[list.id]} />
        ))}
      </View>
    </ScrollView>
  );
};

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

