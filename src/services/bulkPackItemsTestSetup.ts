import { beforeEach, vi } from "vitest";
import type { PackItem } from "~/types/PackItem.ts";

export const mocks = {
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  writeBatch: vi.fn(),
  batches: [] as {
    delete: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
    commit: ReturnType<typeof vi.fn>;
  }[],
};

export const firestoreMock = {
  collection: (_db: unknown, ...parts: string[]) => parts.join("/"),
  doc: (...parts: unknown[]) => parts.filter((part) => typeof part === "string").join("/") || "change",
  documentId: () => "__name__",
  where: (field: string, operator: string, values: string[]) => ({ field, operator, values }),
  query: (path: string, filter: unknown) => ({ path, filter }),
  getDocs: mocks.getDocs,
  getDoc: mocks.getDoc,
  writeBatch: mocks.writeBatch,
};

export const item: PackItem = {
  id: "item",
  name: "Socks",
  members: [{ id: "member", checked: true }],
  checked: false,
  category: "category",
  packingList: "list",
  rank: 1,
};
export const actor = { id: "user", name: "User" };
const document = (data: object & { id: string }, sub = "packItems") => ({
  id: data.id,
  ref: `spaces/space/${sub}/${data.id}`,
  data: () => data,
});
export const readItems = (items: PackItem[], images: { id: string; typeId: string; type: string }[] = []) => {
  mocks.getDocs.mockImplementation(async ({ path, filter }) => ({
    docs: (path.endsWith("/images") ? images : items)
      .filter((data) => filter.values.includes(filter.field === "typeId" && "typeId" in data ? data.typeId : data.id))
      .map((data) => document(data, path.endsWith("/images") ? "images" : "packItems")),
  }));
};

beforeEach(() => {
  vi.resetAllMocks();
  mocks.batches.length = 0;
  mocks.getDoc.mockResolvedValue({ exists: () => true });
  mocks.writeBatch.mockImplementation(() => {
    const batch = { delete: vi.fn(), update: vi.fn(), set: vi.fn(), commit: vi.fn().mockResolvedValue(undefined) };
    mocks.batches.push(batch);
    return batch;
  });
});
