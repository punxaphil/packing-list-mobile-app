import { useRef } from "react";
import { type ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { PageSheet } from "../shared/PageSheet.tsx";
import { listCopy } from "./listCopy.ts";
import { homeColors, homeSpacing } from "./theme.ts";

export type ListNotesState = {
  visible: boolean;
  notes: string;
  showNotes: boolean;
  open: () => void;
  close: () => void;
  setNotes: (v: string) => void;
  setShowNotes: (v: boolean) => void;
};

export const ListNotesSheet = ({ state }: { state: ListNotesState }) => {
  const scrollRef = useRef<ScrollView>(null);
  const scrollToEnd = () => scrollRef.current?.scrollToEnd({ animated: true });
  return (
    <PageSheet visible={state.visible} title={listCopy.title} onClose={state.close} scrollViewRef={scrollRef}>
      <View style={styles.content}>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>{listCopy.showNotes}</Text>
          <Switch value={state.showNotes} onValueChange={state.setShowNotes} />
        </View>
        <Text style={styles.toggleLabel}>{listCopy.notesLabel}</Text>
        <TextInput
          style={styles.textarea}
          value={state.notes}
          onChangeText={state.setNotes}
          onContentSizeChange={scrollToEnd}
          accessibilityLabel={listCopy.notesLabel}
          multiline
          textAlignVertical="top"
          autoFocus
        />
      </View>
    </PageSheet>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: homeSpacing.md,
    paddingTop: homeSpacing.sm,
  },
  textarea: {
    minHeight: 200,
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
