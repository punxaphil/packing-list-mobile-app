import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
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
  const prevSpaceIdsRef = useRef<string[] | undefined>(undefined);
  const spacesRef = useRef<Space[]>([]);
  const suppressRemovalAlert = useRef(false);

  const spaceIdsKey = [...(profile?.spaceIds ?? [])].sort().join(",");
  useEffect(() => {
    const ids = spaceIdsKey.split(",").filter(Boolean);
    if (!ids.length) return;
    return subscribeToSpaces(ids, setSpaces);
  }, [spaceIdsKey]);

  useEffect(() => {
    spacesRef.current = spaces;
  }, [spaces]);

  useEffect(() => {
    const prev = prevSpaceIdsRef.current;
    prevSpaceIdsRef.current = profile?.spaceIds;
    if (!prev?.includes(spaceId) || !profile?.spaceIds) return;
    if (profile.spaceIds.includes(spaceId)) return;
    const name = spacesRef.current.find((s) => s.id === spaceId)?.name;
    const fallback = profile.spaceIds[0] ?? profile.personalSpaceId;
    switchSpace(fallback);
    if (suppressRemovalAlert.current) {
      suppressRemovalAlert.current = false;
    } else {
      Alert.alert("Removed from space", `You were removed from "${name}".`);
    }
  }, [profile?.spaceIds, spaceId, switchSpace, profile?.personalSpaceId]);

  useEffect(() => {
    if (!spaceId || !email) return;
    void ensureUserMemberId(spaceId, userId, email.trim().toLowerCase());
  }, [spaceId, userId, email]);

  const activeSpace = useMemo(() => spaces.find((s) => s.id === spaceId), [spaces, spaceId]);

  useEffect(() => {
    if (activeSpace || !spaces.length) return;
    switchSpace(spaces[0].id);
  }, [activeSpace, spaces, switchSpace]);

  const writeDb = useMemo(() => createWriteDb(spaceId), [spaceId]);

  const handleCreate = useCallback(
    (name: string) => createNewSpace(name, userId, email),
    [createNewSpace, userId, email]
  );

  const value = useMemo(
    () => ({
      spaceId,
      spaces,
      activeSpace,
      profile,
      writeDb,
      switchSpace,
      createNewSpace: handleCreate,
      suppressRemovalAlert,
    }),
    [spaceId, spaces, activeSpace, profile, writeDb, switchSpace, handleCreate]
  );

  if (!spaceId) return null;

  return <SpaceContext.Provider value={value}>{children}</SpaceContext.Provider>;
}
