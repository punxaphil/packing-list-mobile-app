import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, type Persistence } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

type PersistenceLayer = Persistence & {
  _isAvailable(): Promise<boolean>;
  _set(key: string, value: unknown): Promise<void>;
  _get<T>(key: string): Promise<T | null>;
  _remove(key: string): Promise<void>;
  _addListener(key: string, listener: unknown): void;
  _removeListener(key: string, listener: unknown): void;
};

type PersistenceConstructor = new () => PersistenceLayer;

const STORAGE_KEY = "__auth_storage_available__";

const createPersistence = (storage: typeof AsyncStorage): PersistenceConstructor => {
  return class implements PersistenceLayer {
    static type = "LOCAL" as const;
    type = "LOCAL" as const;

    async _isAvailable() {
      if (!storage) return false;
      try {
        await storage.setItem(STORAGE_KEY, "1");
        await storage.removeItem(STORAGE_KEY);
        return true;
      } catch {
        return false;
      }
    }

    async _set(key: string, value: unknown) {
      await storage.setItem(key, JSON.stringify(value));
    }

    async _get<T>(key: string) {
      const json = await storage.getItem(key);
      return json ? (JSON.parse(json) as T) : null;
    }

    async _remove(key: string) {
      await storage.removeItem(key);
    }

    _addListener(_key: string, _listener: unknown) {}

    _removeListener(_key: string, _listener: unknown) {}
  };
};

const firebaseConfig = {
  apiKey: "AIzaSyBB37kGiEQ2NBhHf9voJ6ugGRkUIyaOYAE",
  authDomain: "packing-list-448814.firebaseapp.com",
  projectId: "packing-list-448814",
  storageBucket: "packing-list-448814.firebasestorage.app",
  messagingSenderId: "831855277007",
  appId: "1:831855277007:web:a09c7bd0ed58b51ea8d8ba",
};

const app = initializeApp(firebaseConfig);

try {
  initializeAuth(app, {
    persistence: createPersistence(AsyncStorage) as unknown as Persistence,
  });
} catch (error) {
  const msg = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  const isReinit = msg.toLowerCase().includes("already") && msg.toLowerCase().includes("auth");
  if (!isReinit) throw error;
}

export const firestore = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

export function getUserId(): string {
  const userId = getAuth().currentUser?.uid;
  if (!userId) throw new Error("No user logged in");
  return userId;
}
