const STORAGE_KEY = "selectedListId";
type Listener = (id: string) => void;

let currentSelectedId = "";
const listeners = new Set<Listener>();

export async function initSelection() {
  const id = localStorage.getItem(STORAGE_KEY);
  if (id) {
    currentSelectedId = id;
    notifyListeners();
  }
}

function notifyListeners() {
  for (const listener of listeners) listener(currentSelectedId);
}

export function getSelectedId() {
  return currentSelectedId;
}

export function setSelectedId(id: string) {
  currentSelectedId = id;
  localStorage.setItem(STORAGE_KEY, id);
  notifyListeners();
}

export function clearSelectedId() {
  currentSelectedId = "";
  localStorage.setItem(STORAGE_KEY, "");
  notifyListeners();
}

export function subscribeToSelection(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
