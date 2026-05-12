import { NativeEventEmitter, NativeModules, Platform } from "react-native";
import { switchToItemsTab } from "~/navigation/navigation.ts";
import { setSelectedId } from "~/navigation/selectionState.ts";
import { setActiveSpaceId } from "~/navigation/spaceState.ts";

const DEFAULT_REMINDER_TITLE = "FastPack reminder";
const REMINDER_OPEN_EVENT = "PackingListReminderOpen";

const buildPackingListReminderBody = (listName: string) => `Your list ${listName} is due ✈️`;

export const buildPackingListReminderContent = (listName: string) => ({
  body: buildPackingListReminderBody(listName),
  title: DEFAULT_REMINDER_TITLE,
});

type ReminderPickerResponse = {
  action?: "cancel" | "clear" | "set";
  timestamp?: number;
};

type ReminderOpenEvent = {
  listId?: string;
  spaceId?: string;
};

type ReminderModule = {
  addListener: (eventName: string) => void;
  removeListeners: (count: number) => void;
  showDatePicker: (options: { timestamp: number | null }) => Promise<ReminderPickerResponse>;
  schedule: (options: {
    listId: string;
    spaceId: string;
    timestamp: number;
    title: string;
    body: string;
  }) => Promise<void>;
  cancel: (options: { listId: string; spaceId: string }) => Promise<void>;
};

const reminderModule = NativeModules.PackingListReminderModule as ReminderModule | undefined;
const reminderEvents = reminderModule ? new NativeEventEmitter(reminderModule) : null;

export const canEditPackingListReminder = Platform.OS === "ios" && !!reminderModule?.showDatePicker;

export const formatPackingListDueAt = (dueAt: number) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(dueAt));

export const pickPackingListDueAt = async (timestamp: number | null): Promise<number | null | undefined> => {
  if (!canEditPackingListReminder || !reminderModule) return undefined;
  const result = await reminderModule.showDatePicker({ timestamp });
  if (result.action === "clear") return null;
  if (result.action === "set" && typeof result.timestamp === "number") return result.timestamp;
  return undefined;
};

export const syncPackingListReminder = async ({
  body,
  dueAt,
  id,
  spaceId,
  title,
}: {
  body: string;
  dueAt: number | null;
  id: string;
  spaceId: string;
  title: string;
}) => {
  if (Platform.OS !== "ios" || !reminderModule) return;
  if (!dueAt || dueAt <= Date.now()) {
    await reminderModule.cancel({ listId: id, spaceId });
    return;
  }
  await reminderModule.schedule({ body, listId: id, spaceId, timestamp: dueAt, title });
};

const openReminderList = ({ listId, spaceId }: { listId: string; spaceId?: string }) => {
  if (spaceId) setActiveSpaceId(spaceId);
  setSelectedId(listId);
  switchToItemsTab();
};

export const registerPackingListReminderHandler = () => {
  if (Platform.OS !== "ios" || !reminderEvents) return () => undefined;
  const subscription = reminderEvents.addListener(REMINDER_OPEN_EVENT, (event: ReminderOpenEvent) => {
    if (!event.listId) return;
    openReminderList({ listId: event.listId, spaceId: event.spaceId });
  });
  return () => subscription.remove();
};
