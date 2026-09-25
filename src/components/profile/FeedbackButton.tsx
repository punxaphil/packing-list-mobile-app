import { useState } from "react";
import { Alert } from "react-native";
import { submitFeedback, validateFeedback } from "~/services/feedbackDatabase.ts";
import { TextPromptDialog } from "../home/TextPromptDialog.tsx";
import { useToast } from "../home/Toast.tsx";
import { Button } from "../shared/Button.tsx";
import { profileCopy } from "./profileCopy.ts";

export const FeedbackButton = () => {
  const { show: showToast } = useToast();
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState("");

  const getError = (value: string) =>
    validateFeedback(value, profileCopy.feedbackRequired, profileCopy.feedbackTooLong);
  const error = getError(text);

  const send = async (value: string) => {
    if (getError(value)) return;
    try {
      await submitFeedback(value);
      setVisible(false);
      showToast(profileCopy.feedbackSentMessage);
    } catch {
      Alert.alert(profileCopy.feedbackErrorTitle, profileCopy.feedbackErrorMessage);
    }
  };

  const open = () => {
    setText("");
    setVisible(true);
  };

  const close = () => setVisible(false);

  return (
    <>
      <Button label={profileCopy.feedbackButton} onPress={open} variant="default" flex />
      <TextPromptDialog
        visible={visible}
        title={profileCopy.feedbackTitle}
        confirmLabel={profileCopy.feedbackConfirm}
        value={text}
        error={error}
        disabled={!!error}
        getError={getError}
        onChange={setText}
        onCancel={close}
        onSubmitText={(value) => void send(value)}
        onSubmit={() => void send(text)}
      />
    </>
  );
};
