import { describe, expect, it, vi } from "vitest";
import type { UserProfile } from "~/types/UserProfile.ts";

vi.mock("~/navigation/spaceState.ts", () => ({
  addSpaceListener: vi.fn(),
  getActiveSpaceId: vi.fn(() => ""),
  initSpaceState: vi.fn(),
  setActiveSpaceId: vi.fn(),
}));

vi.mock("~/services/spaceDatabase.ts", () => ({
  createSpace: vi.fn(),
  getUserProfile: vi.fn(),
  setUserProfile: vi.fn(),
  subscribeToUserProfile: vi.fn(),
}));

import { resolveValidSpaceId } from "./useSpaces.ts";

const createProfile = (personalSpaceId: string, spaceIds: string[]): UserProfile => ({
  id: "user-1",
  email: "test@example.com",
  personalSpaceId,
  spaceIds,
});

describe("resolveValidSpaceId", () => {
  it("returns stored ID when it exists in profile", () => {
    const profile = createProfile("p1", ["p1", "s2"]);
    expect(resolveValidSpaceId("s2", profile)).toBe("s2");
  });

  it("returns personalSpaceId when stored ID is not in profile", () => {
    const profile = createProfile("p1", ["p1", "s2"]);
    expect(resolveValidSpaceId("deleted-space", profile)).toBe("p1");
  });

  it("returns personalSpaceId when stored ID is empty", () => {
    const profile = createProfile("p1", ["p1"]);
    expect(resolveValidSpaceId("", profile)).toBe("p1");
  });

  it("returns personalSpaceId when stored space was removed", () => {
    const profile = createProfile("p1", ["p1"]);
    expect(resolveValidSpaceId("removed-space", profile)).toBe("p1");
  });

  it("returns stored ID when it matches personalSpaceId", () => {
    const profile = createProfile("p1", ["p1", "s2"]);
    expect(resolveValidSpaceId("p1", profile)).toBe("p1");
  });

  it("returns personalSpaceId for single-space profile", () => {
    const profile = createProfile("p1", ["p1"]);
    expect(resolveValidSpaceId("p1", profile)).toBe("p1");
  });
});
