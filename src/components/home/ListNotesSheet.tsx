import { StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { PageSheet } from "../shared/PageSheet.tsx";
import { homeColors, homeSpacing } from "./theme.ts";

const COPY = {
  title: "List notes",
  placeholder: "Add description or notes to your packing list...",
  showNotesInItemsView: "Show notes in items view",
};

export type ListNotesState = {
  visible: boolean;
  notes: string;
  showNotes: boolean;
  open: () => void;
  close: () => void;
  setNotes: (v: string) => void;
  setShowNotes: (v: boolean) => void;
};

export const ListNotesSheet = ({ state }: { state: ListNotesState }) => (
  <PageSheet visible={state.visible} title={COPY.title} onClose={state.close} scrollable={false}>
    <View style={styles.content}>
      <TextInput
        style={styles.textarea}
        value={state.notes}
        onChangeText={state.setNotes}
        placeholder={COPY.placeholder}
        placeholderTextColor={homeColors.muted}
        multiline
        textAlignVertical="top"
      />
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>{COPY.showNotesInItemsView}</Text>
        <Switch value={state.showNotes} onValueChange={state.setShowNotes} />
      </View>
    </View>
  </PageSheet>
);

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: homeSpacing.md,
    paddingTop: homeSpacing.sm,
  },
  textarea: {
    flex: 1,
    borderWidth: 1,
    borderColor: homeColors.border,
    borderRadius: 10,
    padding: homeSpacing.md,
    fontSize: 15,
    color: homeColors.text,
    backgroundColor: homeColors.background,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: homeSpacing.xs,
  },
  toggleLabel: {
    fontSize: 15,
    color: homeColors.text,
  },
});
