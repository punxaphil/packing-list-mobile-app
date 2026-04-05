import { Alert, KeyboardTypeOptions, Platform } from "react-native";

type NativeTextPromptOptions = {
  title: string;
  confirmLabel: string;
  cancelLabel?: string;
  value?: string;
  keyboardType?: KeyboardTypeOptions;
  getError?: (text: string) => string | null;
  onCancel?: () => void;
  onSubmit: (text: string) => void | Promise<void>;
};

const OK_LABEL = "OK";
const DEFAULT_CANCEL = "Cancel";

export const showNativeTextPrompt = ({
  title,
  confirmLabel,
  cancelLabel = DEFAULT_CANCEL,
  value = "",
  keyboardType,
  getError,
  onCancel,
  onSubmit,
}: NativeTextPromptOptions) => {
  if (Platform.OS !== "ios") return false;

  const openPrompt = (currentValue: string) => {
    Alert.prompt(
      title,
      undefined,
      [
        { text: cancelLabel, style: "cancel", onPress: onCancel },
        {
          text: confirmLabel,
          onPress: (text?: string) => {
            const nextValue = text ?? "";
            const error = getError?.(nextValue);
            if (error) {
              Alert.alert(title, error, [{ text: OK_LABEL, onPress: () => openPrompt(nextValue) }]);
              return;
            }
            void onSubmit(nextValue);
          },
        },
      ],
      "plain-text",
      currentValue,
      keyboardType
    );
  };

  openPrompt(value);
  return true;
};
