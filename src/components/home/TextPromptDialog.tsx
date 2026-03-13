import { Animated, Keyboard, KeyboardTypeOptions, Modal, Pressable, Text, TextInput, View } from "react-native";
import { useKeyboardOffset } from "~/hooks/useKeyboardOffset.ts";
import { HOME_COPY, homeStyles } from "./styles.ts";

type TextPromptDialogProps = {
  visible: boolean;
  title: string;
  confirmLabel: string;
  value: string;
  placeholder?: string;
  error?: string | null;
  disabled?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: KeyboardTypeOptions;
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
  error,
  disabled,
  autoCapitalize,
  keyboardType,
  onChange,
  onCancel,
  onSubmit,
}: TextPromptDialogProps) => {
  const inputStyle = error ? [homeStyles.modalInput, homeStyles.modalInputError] : homeStyles.modalInput;
  const keyboardOffset = useKeyboardOffset();
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <Pressable style={homeStyles.modalBackdrop} onPress={onCancel}>
        <Animated.View style={[homeStyles.modalCard, { transform: [{ translateY: keyboardOffset }] }]}>
          <Pressable style={homeStyles.modalCardContent} onPress={() => Keyboard.dismiss()}>
            <Text style={homeStyles.modalTitle}>{title}</Text>
            <TextInput
              value={value}
              onChangeText={onChange}
              onSubmitEditing={disabled ? undefined : onSubmit}
              placeholder={placeholder}
              style={inputStyle}
              autoFocus
              autoCapitalize={autoCapitalize}
              keyboardType={keyboardType}
              accessibilityLabel={title}
              editable={!disabled}
            />
            {error && <Text style={homeStyles.modalError}>{error}</Text>}
            <View style={homeStyles.modalActions}>
              <Pressable
                onPress={onCancel}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={HOME_COPY.cancel}
              >
                <Text style={[homeStyles.modalAction, disabled && { opacity: 0.5 }]}>{HOME_COPY.cancel}</Text>
              </Pressable>
              <Pressable
                onPress={onSubmit}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={confirmLabel}
              >
                <Text style={[homeStyles.modalAction, homeStyles.modalActionPrimary, disabled && { opacity: 0.5 }]}>
                  {confirmLabel}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};
