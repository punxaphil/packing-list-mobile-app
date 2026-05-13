import i18next from "i18next";
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

export const showNativeTextPrompt = ({
  title,
  confirmLabel,
  cancelLabel = i18next.t("common.cancel"),
  value = "",
  keyboardType,
  getError,
  onCancel,
  onSubmit,
}: NativeTextPromptOptions) => {
  if (Platform.OS !== "ios") return false;

  const openPrompt = (currentValue: string, errorMessage?: string) => {
    Alert.prompt(
      title,
      errorMessage,
      [
        { text: cancelLabel, style: "cancel", onPress: onCancel },
        {
          text: confirmLabel,
          onPress: (text?: string) => {
            const nextValue = text ?? "";
            const error = getError?.(nextValue);
            if (error) {
              openPrompt(nextValue, error);
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
