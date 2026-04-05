import { useEffect, useRef } from "react";
import { KeyboardTypeOptions, Platform, Text, TextInput } from "react-native";
import { DialogActions, DialogShell } from "../shared/DialogShell.tsx";
import { showNativeTextPrompt } from "./showNativeTextPrompt.ts";
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
  placeholder,
  error,
  disabled,
  autoCapitalize,
  keyboardType,
  getError,
  onChange,
  onSubmitText,
  onCancel,
  onSubmit,
}: TextPromptDialogProps) => {
  const promptVisible = useRef(false);

  useEffect(() => {
    if (Platform.OS !== "ios") return;
    if (!visible) {
      promptVisible.current = false;
      return;
    }
    if (disabled) return;
    if (promptVisible.current) return;
    promptVisible.current = true;

    showNativeTextPrompt({
      title,
      confirmLabel,
      cancelLabel: HOME_COPY.cancel,
      value,
      keyboardType,
      getError,
      onCancel,
      onSubmit: (text) => {
        if (disabled) return;
        onChange(text);
        if (onSubmitText) {
          void onSubmitText(text);
          return;
        }
        onSubmit();
      },
    });

    return () => {
      promptVisible.current = false;
    };
  }, [
    visible,
    title,
    confirmLabel,
    value,
    keyboardType,
    getError,
    onChange,
    onSubmitText,
    onCancel,
    onSubmit,
    disabled,
  ]);

  if (Platform.OS === "ios") return null;

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
