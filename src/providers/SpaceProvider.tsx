import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useActiveSpaceId, useSpaceActions, useUserProfile } from "~/hooks/useSpaces.ts";
import { createWriteDb } from "~/services/database.ts";
import { ensureUserMemberId, subscribeToSpaces } from "~/services/spaceDatabase.ts";
import type { Space } from "~/types/Space.ts";
import { SpaceContext } from "./SpaceContext.ts";

type Props = { userId: string; email: string; children: ReactNode };

export function SpaceProvider({ userId, email, children }: Props) {
  const spaceId = useActiveSpaceId();
  const profile = useUserProfile(userId);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const { switchSpace, createNewSpace } = useSpaceActions();

  useEffect(() => {
    if (!profile?.spaceIds?.length) return;
    return subscribeToSpaces(profile.spaceIds, setSpaces);
  }, [profile?.spaceIds]);

  useEffect(() => {
    if (!spaceId || !email) return;
    void ensureUserMemberId(spaceId, userId, email.trim().toLowerCase());
  }, [spaceId, userId, email]);

  const activeSpace = useMemo(() => spaces.find((s) => s.id === spaceId), [spaces, spaceId]);
  const writeDb = useMemo(() => createWriteDb(spaceId), [spaceId]);

  const handleCreate = useCallback(
    (name: string) => createNewSpace(name, userId, email),
    [createNewSpace, userId, email]
  );

  const value = useMemo(
    () => ({ spaceId, spaces, activeSpace, profile, writeDb, switchSpace, createNewSpace: handleCreate }),
    [spaceId, spaces, activeSpace, profile, writeDb, switchSpace, handleCreate]
  );

  if (!spaceId) return null;

  return <SpaceContext.Provider value={value}>{children}</SpaceContext.Provider>;
}
