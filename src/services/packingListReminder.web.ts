/**
 * Web implementation of packing list reminders.
 * On web, reminders are disabled—use browser notifications instead in the future.
 */

export const buildPackingListReminderContent = (listName: string) => ({
  body: `Your list ${listName} is due ✈️`,
  title: "FastPack reminder",
});

export const canEditPackingListReminder = false;

export const canEditDueDate = false;

export const formatPackingListDueAt = (dueAt: number) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(dueAt));

export const pickPackingListDueAt = async (): Promise<number | null | undefined> => undefined;

export const syncPackingListReminder = async (): Promise<void> => {
  // No-op on web
};

export const registerPackingListReminderHandler = () => () => {
  // No-op on web
};
