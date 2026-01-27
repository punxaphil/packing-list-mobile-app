import { useCallback } from "react";
import { writeDb } from "~/services/database.ts";
import { MemberPackItem } from "~/types/MemberPackItem.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { animateLayout } from "./layoutAnimation.ts";

export const useItemRename = () =>
  useCallback((item: PackItem, name: string) => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === item.name) return;
    void writeDb.updatePackItem({ ...item, name: trimmed });
  }, []);

export const useItemDelete = () =>
  useCallback((id: string) => {
    animateLayout();
    void writeDb.deletePackItem(id);
  }, []);

export const useCategoryRename = () =>
  useCallback((category: NamedEntity, name: string) => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === category.name) return;
    void writeDb.updateCategories({ ...category, name: trimmed });
  }, []);

export const useAssignMembers = () =>
  useCallback(async (item: PackItem, members: MemberPackItem[]) => {
    await writeDb.updatePackItem({ ...item, members });
  }, []);

export const useToggleMemberPacked = () =>
  useCallback((item: PackItem, memberId: string) => {
    const members = item.members.map((m) => (m.id === memberId ? { ...m, checked: !m.checked } : m));
    const checked = members.every((m) => m.checked);
    if (checked !== item.checked) animateLayout();
    void writeDb.updatePackItem({ ...item, members, checked });
  }, []);

export const useToggleAllMembers = () =>
  useCallback((item: PackItem, checked: boolean) => {
    if (checked !== item.checked) animateLayout();
    const members = item.members.map((m) => ({ ...m, checked }));
    void writeDb.updatePackItem({ ...item, members, checked });
  }, []);

export const useListRenamer = () =>
  useCallback((list: NamedEntity, name: string) => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === list.name) return;
    void writeDb.updatePackingList({ ...list, name: trimmed });
  }, []);

export const useMoveCategory = () =>
  useCallback((item: PackItem, categoryId: string) => {
    void writeDb.updatePackItem({ ...item, category: categoryId });
  }, []);

export const useCopyToList = () =>
  useCallback(async (item: PackItem, listId: string) => {
    await writeDb.addPackItem(item.name, item.members, item.category, listId, item.rank);
  }, []);
