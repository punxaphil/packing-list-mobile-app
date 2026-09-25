import { useCallback, useRef } from "react";
import { KeyboardTypeOptions, Text, TextInput } from "react-native";
import { DialogActions, DialogShell } from "../shared/DialogShell.tsx";
import { HOME_COPY, homeStyles } from "./styles.ts";

type TextPromptDialogProps = {
  visible: boolean;
  title: string;
  confirmLabel: string;
  value: string;
  error?: string | null;
  disabled?: boolean;
  editable?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: KeyboardTypeOptions;
  getError?: (text: string) => string | null;
  onChange: (text: string) => void;
  onSubmitText?: (text: string) => void | Promise<void>;
  onCancel: () => void;
  onSubmit: () => void;
};

export const TextPromptDialog = ({
  visible,
  title,
  confirmLabel,
  value,
  error,
  disabled,
  editable = true,
  autoCapitalize,
  keyboardType,
  onChange,
  onCancel,
  onSubmit,
}: TextPromptDialogProps) => {
  const inputRef = useRef<TextInput>(null);
  const attachInput = useCallback((input: TextInput | null) => {
    inputRef.current = input;
    input?.focus();
  }, []);

  const focusInput = useCallback(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const inputStyle = error ? [homeStyles.modalInput, homeStyles.modalInputError] : homeStyles.modalInput;

  return (
    <DialogShell
      visible={visible}
      title={title}
      onClose={onCancel}
      onShow={focusInput}
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
        ref={attachInput}
        value={value}
        onChangeText={onChange}
        onSubmitEditing={disabled ? undefined : onSubmit}
        style={inputStyle}
        autoFocus
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        accessibilityLabel={title}
        editable={editable}
      />
      {error && <Text style={homeStyles.modalError}>{error}</Text>}
    </DialogShell>
  );
};
