export const BUSY_INDICATOR_DELAY_MS = 500;

const listeners = new Set<() => void>();
let pending = 0;
let timer: ReturnType<typeof setTimeout> | undefined;
let state = { busy: false, showLoader: false };

function publish(busy: boolean, showLoader: boolean) {
  state = { busy, showLoader };
  for (const listener of listeners) listener();
}

function start() {
  if (pending++ > 0) return;
  publish(true, false);
  timer = setTimeout(() => publish(true, true), BUSY_INDICATOR_DELAY_MS);
}

function finish() {
  if (--pending > 0) return;
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

export async function runBusyOperation<Result>(operation: () => Promise<Result>): Promise<Result> {
  start();
  try {
    return await operation();
  } finally {
    finish();
  }
}
