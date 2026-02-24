import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { addSpaceListener, getActiveSpaceId, initSpaceState, setActiveSpaceId } from "~/navigation/spaceState.ts";
import { createSpace, getUserProfile, setUserProfile, subscribeToUserProfile } from "~/services/spaceDatabase.ts";
import type { Space } from "~/types/Space.ts";
import type { UserProfile } from "~/types/UserProfile.ts";

const subscribe = (cb: () => void) => addSpaceListener(cb);
const getSnapshot = () => getActiveSpaceId();

export function useActiveSpaceId() {
  return useSyncExternalStore(subscribe, getSnapshot);
}

async function bootstrapSpace(userId: string, email: string): Promise<string> {
  const existing = await getUserProfile(userId);
  if (existing) return existing.personalSpaceId;
  const space = await createSpace("Personal", email);
  await setUserProfile(userId, {
    email,
    personalSpaceId: space.id,
    spaceIds: [space.id],
  });
  return space.id;
}

export function useSpaceBootstrap(userId: string, email: string) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      const restored = await initSpaceState();
      if (!restored) {
        const spaceId = await bootstrapSpace(userId, email);
        setActiveSpaceId(spaceId);
      }
      setReady(true);
    };
    init();
  }, [userId, email]);

  return ready;
}

export function useUserProfile(userId: string) {
  const [profile, setProfile] = useState<UserProfile | undefined>();

  useEffect(() => {
    return subscribeToUserProfile(userId, setProfile);
  }, [userId]);

  return profile;
}

export function useSpaceActions() {
  const switchSpace = useCallback((spaceId: string) => {
    setActiveSpaceId(spaceId);
  }, []);

  const createNewSpace = useCallback(async (name: string, userId: string, email: string): Promise<Space> => {
    const space = await createSpace(name, email);
    const { addSpaceToProfile } = await import("~/services/spaceDatabase.ts");
    await addSpaceToProfile(userId, space.id);
    return space;
  }, []);

  return { switchSpace, createNewSpace };
}
