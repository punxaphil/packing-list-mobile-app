import { getAuth } from "firebase/auth";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const TRIAL_DAYS = 7;
const TRIAL_DURATION_MS = TRIAL_DAYS * DAY_IN_MS;

const getCreationTimeMs = () => {
  const value = getAuth().currentUser?.metadata.creationTime;
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : timestamp;
};

export const getAppAccessTrialEndsAt = () => {
  const createdAt = getCreationTimeMs();
  return createdAt ? createdAt + TRIAL_DURATION_MS : null;
};

export const hasActiveAppAccessTrial = (now = Date.now()) => {
  const createdAt = getCreationTimeMs();
  if (!createdAt) return false;
  return now - createdAt < TRIAL_DURATION_MS;
};
