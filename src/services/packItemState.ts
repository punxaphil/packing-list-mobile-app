import { MemberPackItem } from "~/types/MemberPackItem.ts";
import { PackItem } from "~/types/PackItem.ts";

export const areAllMembersChecked = (members: MemberPackItem[]) =>
  members.length > 0 && members.every((member) => member.checked);

export const withPackItemMembers = <T extends Pick<PackItem, "checked" | "members">>(
  item: T,
  members: MemberPackItem[]
) => ({
  ...item,
  members,
  checked: areAllMembersChecked(members),
});

export const getPackItemChecked = (item: Pick<PackItem, "checked" | "members">) =>
  item.members.length > 0 ? areAllMembersChecked(item.members) : item.checked;
