import { KeyboardTypeOptions, Text, TextInput } from "react-native";
import { DialogActions, DialogShell } from "../shared/DialogShell.tsx";
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
  return (
    <DialogShell
      visible={visible}
      title={title}
      onClose={onCancel}
      actions={
        <DialogActions
          cancelLabel={HOME_COPY.cancel}
          confirmLabel={confirmLabel}
          onCancel={onCancel}
          onConfirm={onSubmit}
          disabled={disabled}
        />
      }
    >
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
    </DialogShell>
  );
};
