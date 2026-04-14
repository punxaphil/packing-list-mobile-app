export const SPACE_MGMT_COPY = {
  owner: "Owner",
  otherUsers: "Other Users",
  noOtherUsers: "No other users",
  remove: "Remove",
  delete: "Delete Space",
  confirmDelete: "Are you sure you want to delete this space?",
  confirmRemove: "Remove this user from the space?",
  confirm: "Confirm",
  cancel: "Cancel",
  cannotDeleteHasUsers: "Remove other users first.",
  removedTitle: "Removed from space",
  removedMessage: (name: string) => `You were removed from "${name}".`,
} as const;
