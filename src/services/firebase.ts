import { initializeApp } from "firebase/app";
import { browserLocalPersistence, getAuth, initializeAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { isSigningOut } from "~/navigation/signOutState.ts";

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
    persistence: browserLocalPersistence,
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
  if (!userId) {
    if (isSigningOut()) return "";
    throw new Error("No user logged in");
  }
  return userId;
}
