export const BUSY_INDICATOR_DELAY_MS = 500;

const listeners = new Set<() => void>();
type BusyDetails = { message: string; total?: number; completed?: number };
type PendingOperation = { details?: BusyDetails };
const pending = new Set<PendingOperation>();
let timer: ReturnType<typeof setTimeout> | undefined;
let state: { busy: boolean; showLoader: boolean; details?: BusyDetails } = { busy: false, showLoader: false };

function publish(busy: boolean, showLoader: boolean) {
  const entries = [...pending];
  const details = (
    entries.find((entry) => entry.details?.total !== undefined) ?? entries.find((entry) => entry.details)
  )?.details;
  state = { busy, showLoader, ...(details && { details }) };
  for (const listener of listeners) listener();
}

function start(entry: PendingOperation) {
  pending.add(entry);
  if (pending.size > 1) return publish(true, state.showLoader);
  publish(true, false);
  timer = setTimeout(() => publish(true, true), BUSY_INDICATOR_DELAY_MS);
}

function finish(entry: PendingOperation) {
  pending.delete(entry);
  if (pending.size) return publish(true, state.showLoader);
  clearTimeout(timer);
  publish(false, false);
}

export const busyOperation = {
  getSnapshot: () => state,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export async function runBusyOperation<Result>(
  operation: (report: (completed: number) => void) => Promise<Result>,
  details?: BusyDetails
): Promise<Result> {
  const entry = { details };
  start(entry);
  try {
    return await operation((completed) => reportProgress(entry, completed));
  } finally {
    finish(entry);
  }
}

function reportProgress(entry: PendingOperation, completed: number) {
  if (!pending.has(entry) || !entry.details) return;
  entry.details = { ...entry.details, completed };
  publish(true, state.showLoader);
}
