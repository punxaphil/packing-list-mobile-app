type DialogActionsProps = {
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  disabled?: boolean;
};

export const DialogActions = ({ cancelLabel, confirmLabel, onCancel, onConfirm, disabled }: DialogActionsProps) => (
  <div className="web-dialog-actions">
    <button type="button" className="web-dialog-action" onClick={onCancel}>
      {cancelLabel}
    </button>
    <button
      type="button"
      className="web-dialog-action web-dialog-action-primary"
      onClick={onConfirm}
      disabled={disabled}
    >
      {confirmLabel}
    </button>
  </div>
);

type SingleActionProps = { label: string; onPress: () => void };

export const DialogSingleAction = ({ label, onPress }: SingleActionProps) => (
  <div className="web-dialog-actions">
    <button type="button" className="web-dialog-action" onClick={onPress}>
      {label}
    </button>
  </div>
);
