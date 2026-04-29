import type { MemberPackItem } from "~/types/MemberPackItem.ts";
import type { PackItem } from "~/types/PackItem.ts";

type LegacyMemberObject = { id?: string; memberId?: string; checked?: boolean };

const isLegacyMemberObject = (member: unknown): member is LegacyMemberObject =>
  typeof member === "object" && member !== null;

const getMemberId = (member: unknown) => {
  if (typeof member === "string") return member;
  if (!isLegacyMemberObject(member)) return undefined;
  return member.id ?? member.memberId;
};

export const areAllMembersChecked = (members: MemberPackItem[]) =>
  members.length > 0 && members.every((member) => member.checked);

const normalizePackItemMembers = (members: unknown[] | undefined, checked: boolean): MemberPackItem[] =>
  (members ?? []).flatMap((member) => {
    const id = getMemberId(member);
    if (!id) return [];
    return [{ id, checked: typeof member === "string" ? checked : isLegacyMemberObject(member) && !!member.checked }];
  });

export const withPackItemMembers = <T extends Pick<PackItem, "checked" | "members">>(
  item: T,
  members: MemberPackItem[]
) => ({
  ...item,
  members,
  checked: areAllMembersChecked(members),
});

export const normalizePackItem = <T extends Pick<PackItem, "checked" | "members">>(item: T): T => {
  if (!Array.isArray(item.members) || item.members.length === 0) return item;
  const members = normalizePackItemMembers(item.members, item.checked);
  return { ...item, members, checked: areAllMembersChecked(members) } as T;
};

export const getPackItemChecked = (item: Pick<PackItem, "checked" | "members">) =>
  item.members.length > 0 ? areAllMembersChecked(item.members) : item.checked;
