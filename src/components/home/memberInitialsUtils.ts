import { NamedEntity } from "~/types/NamedEntity.ts";

export type MemberInitialsMap = Map<string, string>;

export const computeMemberInitials = (members: NamedEntity[]): MemberInitialsMap => {
  const names = members.map((m) => m.name);
  const map = new Map<string, string>();
  for (let i = 0; i < members.length; i++) {
    map.set(members[i].id, findUniquePrefix(names[i], i, names));
  }
  return map;
};

const findUniquePrefix = (name: string, index: number, allNames: string[]): string => {
  const upperName = name.toUpperCase();
  const others = allNames.filter((_, j) => j !== index).map((n) => n.toUpperCase());
  for (let len = 1; len <= name.length; len++) {
    const prefix = upperName.slice(0, len);
    const isUnique = others.every((other) => other.slice(0, len) !== prefix);
    if (isUnique) return name.slice(0, len);
  }
  return name;
};
