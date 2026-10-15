import { type WriteBatch, writeBatch } from "firebase/firestore";
import { firestore } from "./firebase.ts";

const BATCH_WRITE_LIMIT = 500;
const ITEM_AND_LOG_WRITE_COUNT = 2;
export type BulkWrite = { apply: (batch: WriteBatch) => void };
type WriteGroup = { writes: BulkWrite[]; completed: number };

export async function commitBulkWrites(groups: WriteGroup[], report: (completed: number) => void) {
  let completed = 0;
  for (const group of createBatches(groups)) {
    const batch = writeBatch(firestore);
    for (const write of group.writes) write.apply(batch);
    await batch.commit();
    completed += group.completed;
    report(completed);
  }
}

function createBatches(groups: WriteGroup[]) {
  return groups.flatMap(splitOversizedGroup).reduce(appendGroup, [] as WriteGroup[]);
}

function splitOversizedGroup(group: WriteGroup) {
  const batches: WriteGroup[] = [];
  const writes = [...group.writes];
  while (writes.length > BATCH_WRITE_LIMIT)
    batches.push({
      writes: writes.splice(0, Math.min(BATCH_WRITE_LIMIT, writes.length - ITEM_AND_LOG_WRITE_COUNT)),
      completed: 0,
    });
  return [...batches, { writes, completed: group.completed }];
}

function appendGroup(batches: WriteGroup[], group: WriteGroup) {
  const previous = batches[batches.length - 1];
  if (!previous || previous.writes.length + group.writes.length > BATCH_WRITE_LIMIT) return [...batches, group];
  return [
    ...batches.slice(0, -1),
    {
      writes: [...previous.writes, ...group.writes],
      completed: previous.completed + group.completed,
    },
  ];
}
