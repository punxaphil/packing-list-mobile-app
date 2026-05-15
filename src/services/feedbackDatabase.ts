import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { firestore, getUserId } from "./firebase.ts";

const FEEDBACK_KEY = "feedback";
const FEEDBACK_MAX_LENGTH = 500;

export const validateFeedback = (text: string, requiredMessage: string, tooLongMessage: string) => {
  const trimmed = text.trim();
  if (!trimmed) return requiredMessage;
  return trimmed.length > FEEDBACK_MAX_LENGTH ? tooLongMessage : null;
};

export const submitFeedback = async (text: string) => {
  await addDoc(collection(firestore, FEEDBACK_KEY), {
    userId: getUserId(),
    text: text.trim(),
    createdAt: serverTimestamp(),
  });
};
