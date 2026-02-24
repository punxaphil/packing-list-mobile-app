import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "activeSpaceId";
type Listener = (id: string) => void;

let currentSpaceId = "";
const listeners = new Set<Listener>();

function notifyListeners() {
  for (const listener of listeners) listener(currentSpaceId);
}

export async function initSpaceState(): Promise<string> {
  const id = await AsyncStorage.getItem(STORAGE_KEY);
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
  AsyncStorage.setItem(STORAGE_KEY, id);
  notifyListeners();
}

export async function clearSpaceState() {
  currentSpaceId = "";
  await AsyncStorage.removeItem(STORAGE_KEY);
  notifyListeners();
}

export function addSpaceListener(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
