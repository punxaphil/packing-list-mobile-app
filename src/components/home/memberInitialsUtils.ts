import { NamedEntity } from "~/types/NamedEntity.ts";

export type MemberInitialsMap = Map<string, string>;

export const computeMemberInitials = (members: NamedEntity[]): MemberInitialsMap => {
  const upper = members.map((m) => m.name.toUpperCase());
  const initials = upper.map((name, i) => {
    for (let len = 1; len <= 2; len++) {
      const prefix = name.slice(0, len);
      const isUnique = upper.every((other, j) => j === i || other.slice(0, len) !== prefix);
      if (isUnique) return prefix;
    }
    return findThirdChar(name, i, upper);
  });
  const map = new Map<string, string>();
  for (let i = 0; i < members.length; i++) {
    map.set(members[i].id, initials[i]);
  }
  return map;
};

const findThirdChar = (name: string, i: number, upper: string[]): string => {
  const conflicts = upper.filter((other, j) => j !== i && other.slice(0, 2) === name.slice(0, 2));
  let maxDiffIndex = 2;
  for (const other of conflicts) {
    let idx = 2;
    const minLen = Math.min(name.length, other.length);
    while (idx < minLen && name[idx] === other[idx]) idx++;
    maxDiffIndex = Math.max(maxDiffIndex, idx);
  }
  return name.slice(0, 2) + (name[maxDiffIndex] ?? "");
};
