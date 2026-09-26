import { useRef } from "react";
import { DialogActions, DialogShell } from "../shared/DialogShell.tsx";
import { HOME_COPY } from "./styles.ts";
import "./textPromptDialog.css";

type TextPromptDialogProps = {
  visible: boolean;
  title: string;
  confirmLabel: string;
  value: string;
  error?: string | null;
  disabled?: boolean;
  editable?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "email-address" | "default";
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
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <DialogShell
      visible={visible}
      title={title}
      onClose={onCancel}
      onShow={() => inputRef.current?.focus()}
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
      <input
        ref={inputRef}
        className={`text-prompt-input${error ? " text-prompt-input-error" : ""}`}
        type={keyboardType === "email-address" ? "email" : "text"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !disabled && editable) {
            event.preventDefault();
            onSubmit();
          }
        }}
        autoCapitalize={autoCapitalize}
        aria-label={title}
        readOnly={!editable}
      />
      {error && (
        <span className="text-prompt-error" role="alert">
          {error}
        </span>
      )}
    </DialogShell>
  );
};
