import { useCallback } from "react";
import { NativeModules, Platform } from "react-native";
import { useSpace } from "~/providers/SpaceContext.ts";
import { getPackItemChecked, withPackItemMembers } from "~/services/packItemState.ts";
import { MemberPackItem } from "~/types/MemberPackItem.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { animateLayout } from "./layoutAnimation.ts";

const getDeviceLocale = (): string => {
  if (Platform.OS === "ios") {
    const constants = NativeModules.SettingsManager?.getConstants?.();
    const settings = constants?.settings;
    const locale = settings?.AppleLocale || settings?.AppleLanguages?.[0] || "en";
    return locale.replace("_", "-");
  }
  const i18n = NativeModules.I18nManager?.getConstants?.();
  return i18n?.localeIdentifier?.replace("_", "-") || "en";
};

export const useItemRename = () => {
  const { writeDb } = useSpace();
  return useCallback(
    (item: PackItem, name: string) => {
      const trimmed = name.trim();
      if (!trimmed || trimmed === item.name) return;
      void writeDb.updatePackItem({ ...item, name: trimmed });
    },
    [writeDb]
  );
};

export const useItemDelete = () => {
  const { writeDb } = useSpace();
  return useCallback(
    (id: string) => {
      animateLayout();
      void writeDb.deletePackItem(id);
    },
    [writeDb]
  );
};

export const useCategoryRename = () => {
  const { writeDb } = useSpace();
  return useCallback(
    (category: NamedEntity, name: string) => {
      const trimmed = name.trim();
      if (!trimmed || trimmed === category.name) return;
      void writeDb.updateCategories({ ...category, name: trimmed });
    },
    [writeDb]
  );
};

export const useAssignMembers = () => {
  const { writeDb } = useSpace();
  return useCallback(
    async (item: PackItem, members: MemberPackItem[]) => {
      await writeDb.updatePackItem(withPackItemMembers(item, members));
    },
    [writeDb]
  );
};

export const useToggleMemberPacked = () => {
  const { writeDb } = useSpace();
  return useCallback(
    (item: PackItem, memberId: string) => {
      const members = item.members.map((m) => (m.id === memberId ? { ...m, checked: !m.checked } : m));
      const nextItem = withPackItemMembers(item, members);
      const checked = nextItem.checked;
      if (checked !== getPackItemChecked(item)) animateLayout();
      void writeDb.updatePackItem(nextItem);
    },
    [writeDb]
  );
};

export const useToggleAllMembers = () => {
  const { writeDb } = useSpace();
  return useCallback(
    (item: PackItem, checked: boolean) => {
      if (checked !== getPackItemChecked(item)) animateLayout();
      void writeDb.updatePackItem(
        withPackItemMembers(
          item,
          item.members.map((m) => ({ ...m, checked }))
        )
      );
    },
    [writeDb]
  );
};

export const useListRenamer = () => {
  const { writeDb } = useSpace();
  return useCallback(
    (list: NamedEntity, name: string) => {
      const trimmed = name.trim();
      if (!trimmed || trimmed === list.name) return;
      void writeDb.updatePackingList({ ...list, name: trimmed });
    },
    [writeDb]
  );
};

export const useMoveCategory = () => {
  const { writeDb } = useSpace();
  return useCallback(
    (item: PackItem, categoryId: string) => {
      void writeDb.updatePackItem({ ...item, category: categoryId });
    },
    [writeDb]
  );
};

export const useCopyToList = () => {
  const { writeDb } = useSpace();
  return useCallback(
    async (item: PackItem, listId: string) => {
      await writeDb.addPackItem(item.name, item.members, item.category, listId, item.rank);
    },
    [writeDb]
  );
};

export const useSortCategoryAlpha = () => {
  const { writeDb } = useSpace();
  return useCallback(
    async (items: PackItem[]) => {
      const locale = getDeviceLocale();
      const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name, locale));
      const updates = sorted.map((item, index) => ({ ...item, rank: sorted.length - index }));
      await writeDb.updatePackItemsBatched(updates);
    },
    [writeDb]
  );
};

export const hasDuplicateName = (name: string, categoryId: string, items: PackItem[], excludeId?: string) => {
  const trimmed = name.trim().toLowerCase();
  return items.some(
    (item) => item.category === categoryId && item.name.toLowerCase() === trimmed && item.id !== excludeId
  );
};
