import { withPackItemMembers } from "~/services/packItemState.ts";
import type { PackItem } from "~/types/PackItem.ts";

export type TickChange = {
  id: string;
  checked?: boolean;
  members?: { id: string; checked: boolean }[];
};

const MAX_ACTIONS = 20;

export const readTickHistory = (key: string): TickChange[][] => {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
    if (!Array.isArray(value)) return [];
    return value
      .filter(
        (entry): entry is TickChange[] =>
          Array.isArray(entry) &&
          entry.every(
            (change) =>
              typeof change?.id === "string" &&
              (change.checked === undefined || typeof change.checked === "boolean") &&
              (change.members === undefined ||
                (Array.isArray(change.members) &&
                  change.members.every(
                    (member: { id?: unknown; checked?: unknown }) =>
                      typeof member?.id === "string" && typeof member.checked === "boolean"
                  )))
          )
      )
      .slice(-MAX_ACTIONS);
  } catch {
    return [];
  }
};

export const saveTickHistory = (key: string, actions: TickChange[][]) => {
  const history = actions.slice(-MAX_ACTIONS);
  try {
    localStorage.setItem(key, JSON.stringify(history));
  } catch {
    return history;
  }
  return history;
};

export const restoreTickChanges = (items: PackItem[], changes: TickChange[]) => {
  const byId = new Map(items.map((item) => [item.id, item]));
  return changes.flatMap((change) => {
    const item = byId.get(change.id);
    if (!item) return [];
    if (change.checked === undefined && !change.members?.some((entry) => item.members.some((m) => m.id === entry.id)))
      return [];
    const members = item.members.map((member) => {
      const previous = change.members?.find((entry) => entry.id === member.id);
      return previous ? { ...member, checked: previous.checked } : member;
    });
    if (change.checked !== undefined) return [{ ...item, checked: change.checked, members }];
    return [withPackItemMembers(item, members)];
  });
};

export const getUndoStep = (items: PackItem[], actions: TickChange[][]) => {
  for (let index = actions.length - 1; index >= 0; index--) {
    const restored = restoreTickChanges(items, actions[index]);
    if (restored.length) return { restored, remaining: actions.slice(0, index) };
  }
  return null;
};
