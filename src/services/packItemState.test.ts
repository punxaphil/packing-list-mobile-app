import { describe, expect, it } from "vitest";
import { MemberPackItem } from "~/types/MemberPackItem.ts";
import { PackItem } from "~/types/PackItem.ts";
import { getPackItemChecked, withPackItemMembers } from "./packItemState.ts";

const createMember = (id: string, checked: boolean): MemberPackItem => ({
  id,
  checked,
});

const createItem = (checked: boolean, members: MemberPackItem[] = []): PackItem => ({
  id: "item-1",
  name: "Socks",
  checked,
  members,
  category: "cat-1",
  packingList: "list-1",
  rank: 1,
});

describe("packItemState", () => {
  it("becomes unchecked when adding members to an item without members", () => {
    const item = createItem(true);
    const nextItem = withPackItemMembers(item, [createMember("member-1", false)]);

    expect(nextItem.checked).toBe(false);
    expect(getPackItemChecked(nextItem)).toBe(false);
  });

  it("becomes unchecked when removing the last member", () => {
    const item = createItem(true, [createMember("member-1", true)]);
    const nextItem = withPackItemMembers(item, []);

    expect(nextItem.checked).toBe(false);
    expect(getPackItemChecked(nextItem)).toBe(false);
  });

  it("keeps existing member states and adds new members unchecked", () => {
    const item = createItem(true, [createMember("member-1", true)]);
    const nextItem = withPackItemMembers(item, [createMember("member-1", true), createMember("member-2", false)]);

    expect(nextItem.members).toEqual([createMember("member-1", true), createMember("member-2", false)]);
    expect(getPackItemChecked(nextItem)).toBe(false);
  });

  it("keeps remaining member states when removing a non-last member", () => {
    const item = createItem(false, [createMember("member-1", true), createMember("member-2", false)]);
    const nextItem = withPackItemMembers(item, [createMember("member-2", false)]);

    expect(nextItem.members).toEqual([createMember("member-2", false)]);
    expect(getPackItemChecked(nextItem)).toBe(false);
  });
});
