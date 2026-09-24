import { HOME_COPY } from "./styles.ts";

export const confirmSignOut = (email: string, onConfirm: () => void) => {
  if (window.confirm(`${HOME_COPY.signOutTitle}\n${HOME_COPY.signOutMessage} ${email || HOME_COPY.unknownUser}?`)) {
    onConfirm();
  }
};
