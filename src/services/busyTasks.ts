import { runBusyOperation } from "./busyOperation.ts";

export function runBusyTasks<Item>(
  items: Item[],
  action: (item: Item) => Promise<unknown>,
  message: string,
  weight: (item: Item) => number = () => 1
) {
  const total = items.reduce((sum, item) => sum + weight(item), 0);
  return runBusyOperation((report) => completeTasks(items, action, weight, report), { message, total, completed: 0 });
}

async function completeTasks<Item>(
  items: Item[],
  action: (item: Item) => Promise<unknown>,
  weight: (item: Item) => number,
  report: (completed: number) => void
) {
  let completed = 0;
  for (const item of items) {
    const count = weight(item);
    await action(item);
    completed += count;
    report(completed);
  }
}
