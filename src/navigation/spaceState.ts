const STORAGE_KEY = "activeSpaceId";
type Listener = (id: string) => void;

let currentSpaceId = "";
const listeners = new Set<Listener>();

function notifyListeners() {
  for (const listener of listeners) listener(currentSpaceId);
}

export async function initSpaceState(): Promise<string> {
  const id = localStorage.getItem(STORAGE_KEY);
  if (id) {
    currentSpaceId = id;
    notifyListeners();
  }
  return currentSpaceId;
}

export function getActiveSpaceId(): string {
  return currentSpaceId;
}

export function setActiveSpaceId(id: string) {
  currentSpaceId = id;
  localStorage.setItem(STORAGE_KEY, id);
  notifyListeners();
}

export async function clearSpaceState() {
  currentSpaceId = "";
  localStorage.removeItem(STORAGE_KEY);
  notifyListeners();
}

export function addSpaceListener(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
