import { Modal, Pressable, Text, TextInput, View } from "react-native";
import { HOME_COPY, homeStyles } from "./styles.ts";

type TextPromptDialogProps = {
  visible: boolean;
  title: string;
  confirmLabel: string;
  value: string;
  placeholder?: string;
  onChange: (text: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
};

export const TextPromptDialog = ({
  visible,
  title,
  confirmLabel,
  value,
  placeholder,
  onChange,
  onCancel,
  onSubmit,
}: TextPromptDialogProps) => (
  <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
    <Pressable style={homeStyles.modalBackdrop} onPress={onCancel}>
      <Pressable style={homeStyles.modalCard} onPress={(event) => event.stopPropagation()}>
        <Text style={homeStyles.modalTitle}>{title}</Text>
        <TextInput
          value={value}
          onChangeText={onChange}
          onSubmitEditing={onSubmit}
          placeholder={placeholder}
          style={homeStyles.modalInput}
          autoFocus
          accessibilityLabel={title}
        />
        <View style={homeStyles.modalActions}>
          <Pressable onPress={onCancel} accessibilityRole="button" accessibilityLabel={HOME_COPY.cancel}>
            <Text style={homeStyles.modalAction}>{HOME_COPY.cancel}</Text>
          </Pressable>
          <Pressable onPress={onSubmit} accessibilityRole="button" accessibilityLabel={confirmLabel}>
            <Text style={[homeStyles.modalAction, homeStyles.modalActionPrimary]}>{confirmLabel}</Text>
          </Pressable>
        </View>
      </Pressable>
    </Pressable>
  </Modal>
);
