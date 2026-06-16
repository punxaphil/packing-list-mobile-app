import { useRef, useState } from "react";
import { Platform, Pressable, type ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { canEditDueDate, formatPackingListDueAt } from "~/services/packingListReminder.ts";
import { PageSheet } from "../shared/PageSheet.tsx";
import { AndroidDateTimePicker } from "./AndroidDateTimePicker.tsx";
import { listCopy } from "./listCopy.ts";
import { homeColors, homeSpacing } from "./theme.ts";

export type ListNotesState = {
  visible: boolean;
  dueAt: number | null;
  notes: string;
  showNotes: boolean;
  open: () => void;
  close: () => void;
  clearDueAt: () => void;
  pickDueAt: () => void;
  setDueAt: (v: number | null) => void;
  setNotes: (v: string) => void;
  setShowNotes: (v: boolean) => void;
};

export const ListNotesSheet = ({ state }: { state: ListNotesState }) => {
  const scrollRef = useRef<ScrollView>(null);
  const scrollToEnd = () => scrollRef.current?.scrollToEnd({ animated: true });
  return (
    <PageSheet visible={state.visible} title={listCopy.title} onClose={state.close} scrollViewRef={scrollRef}>
      <View style={styles.content}>
        {canEditDueDate ? <DueDateField state={state} /> : null}
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>{listCopy.showNotes}</Text>
          <Switch value={state.showNotes} onValueChange={state.setShowNotes} />
        </View>
        <TextInput
          style={styles.textarea}
          value={state.notes}
          onChangeText={state.setNotes}
          onContentSizeChange={scrollToEnd}
          placeholder={listCopy.notesPlaceholder}
          placeholderTextColor={homeColors.muted}
          multiline
          textAlignVertical="top"
          autoFocus
        />
      </View>
    </PageSheet>
  );
};

const DueDateField = ({ state }: { state: ListNotesState }) => {
  const [showPicker, setShowPicker] = useState(false);
  const handlePress = () => {
    if (Platform.OS === "android") {
      setShowPicker(true);
    } else {
      void state.pickDueAt();
    }
  };
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{listCopy.dueDate}</Text>
      <Pressable style={styles.fieldButton} onPress={handlePress}>
        <Text style={state.dueAt ? styles.fieldValue : styles.fieldPlaceholder}>
          {state.dueAt ? formatPackingListDueAt(state.dueAt) : listCopy.dueDatePlaceholder}
        </Text>
      </Pressable>
      {state.dueAt ? (
        <Pressable hitSlop={8} onPress={state.clearDueAt}>
          <Text style={styles.clearButton}>{listCopy.clearDueDate}</Text>
        </Pressable>
      ) : null}
      {showPicker && (
        <AndroidDateTimePicker
          initialTimestamp={state.dueAt}
          onPicked={state.setDueAt}
          onDismiss={() => setShowPicker(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: homeSpacing.md,
    paddingTop: homeSpacing.sm,
  },
  clearButton: {
    color: homeColors.danger,
    fontSize: 14,
    fontWeight: "600",
  },
  fieldButton: {
    backgroundColor: homeColors.background,
    borderColor: homeColors.border,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: homeSpacing.md,
  },
  fieldGroup: { gap: homeSpacing.xs },
  fieldLabel: {
    fontSize: 15,
    color: homeColors.text,
  },
  fieldPlaceholder: {
    color: homeColors.muted,
    fontSize: 15,
  },
  fieldValue: {
    color: homeColors.text,
    fontSize: 15,
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
