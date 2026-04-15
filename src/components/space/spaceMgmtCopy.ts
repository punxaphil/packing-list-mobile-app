import i18next from "i18next";

const t = (key: string) => i18next.t(`spaceMgmt.${key}`);

export const SPACE_MGMT_COPY = {
  get owner() {
    return t("owner");
  },
  get otherUsers() {
    return t("otherUsers");
  },
  get noOtherUsers() {
    return t("noOtherUsers");
  },
  get remove() {
    return t("remove");
  },
  get delete() {
    return t("delete");
  },
  get confirmDelete() {
    return t("confirmDelete");
  },
  get confirmRemove() {
    return t("confirmRemove");
  },
  get confirm() {
    return t("confirm");
  },
  get cancel() {
    return t("cancel");
  },
  get cannotDeleteHasUsers() {
    return t("cannotDeleteHasUsers");
  },
  get removedTitle() {
    return t("removedTitle");
  },
  removedMessage: (name: string) => i18next.t("spaceMgmt.removedMessage", { name }),
};
