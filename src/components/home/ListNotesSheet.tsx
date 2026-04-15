import { Platform, Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { canEditPackingListReminder, formatPackingListDueAt } from "~/services/packingListReminder.ts";
import { PageSheet } from "../shared/PageSheet.tsx";
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
  setNotes: (v: string) => void;
  setShowNotes: (v: boolean) => void;
};

export const ListNotesSheet = ({ state }: { state: ListNotesState }) => (
  <PageSheet visible={state.visible} title={listCopy.title} onClose={state.close} scrollable={false}>
    <View style={styles.content}>
      {Platform.OS === "ios" && canEditPackingListReminder ? (
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>{listCopy.dueDate}</Text>
          <Pressable style={styles.fieldButton} onPress={() => void state.pickDueAt()}>
            <Text style={state.dueAt ? styles.fieldValue : styles.fieldPlaceholder}>
              {state.dueAt ? formatPackingListDueAt(state.dueAt) : listCopy.dueDatePlaceholder}
            </Text>
          </Pressable>
          {state.dueAt ? (
            <Pressable hitSlop={8} onPress={state.clearDueAt}>
              <Text style={styles.clearButton}>{listCopy.clearDueDate}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>{listCopy.showNotes}</Text>
        <Switch value={state.showNotes} onValueChange={state.setShowNotes} />
      </View>
      <TextInput
        style={styles.textarea}
        value={state.notes}
        onChangeText={state.setNotes}
        placeholder={listCopy.notesPlaceholder}
        placeholderTextColor={homeColors.muted}
        multiline
        textAlignVertical="top"
        autoFocus
      />
    </View>
  </PageSheet>
);

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
