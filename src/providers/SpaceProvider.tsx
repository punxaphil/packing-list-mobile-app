import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import { SPACE_MGMT_COPY } from "~/components/space/spaceMgmtCopy.ts";
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
  const suppressRemovalAlert = useRef(false);

  const spaceIdsKey = [...(profile?.spaceIds ?? [])].sort().join(",");
  useEffect(() => {
    const ids = spaceIdsKey.split(",").filter(Boolean);
    if (!ids.length) return;
    return subscribeToSpaces(ids, setSpaces);
  }, [spaceIdsKey]);

  const activeSpace = useMemo(() => spaces.find((s) => s.id === spaceId), [spaces, spaceId]);

  const handleRemoval = useCallback(
    (fallback: string, name?: string) => {
      switchSpace(fallback);
      if (suppressRemovalAlert.current) {
        suppressRemovalAlert.current = false;
      } else if (name) {
        Alert.alert(SPACE_MGMT_COPY.removedTitle, SPACE_MGMT_COPY.removedMessage(name));
      }
    },
    [switchSpace]
  );

  useEffect(() => {
    const prev = prevSpaceIdsRef.current;
    prevSpaceIdsRef.current = profile?.spaceIds;
    if (!prev?.includes(spaceId) || !profile?.spaceIds) return;
    if (profile.spaceIds.includes(spaceId)) return;
    const fallback = profile.spaceIds[0] ?? profile.personalSpaceId;
    handleRemoval(fallback, activeSpace?.name);
  }, [profile?.spaceIds, spaceId, profile?.personalSpaceId, handleRemoval, activeSpace?.name]);

  useEffect(() => {
    if (!activeSpace || activeSpace.members.includes(userId)) return;
    const fallback = profile?.spaceIds?.find((id) => id !== spaceId) ?? profile?.personalSpaceId ?? "";
    if (!fallback) return;
    handleRemoval(fallback, activeSpace.name);
  }, [activeSpace, userId, profile?.spaceIds, profile?.personalSpaceId, spaceId, handleRemoval]);

  useEffect(() => {
    if (!spaceId || !email) return;
    void ensureUserMemberId(spaceId, userId, email.trim().toLowerCase());
  }, [spaceId, userId, email]);

  useEffect(() => {
    if (spaceId || !spaces.length) return;
    switchSpace(spaces[0].id);
  }, [spaceId, spaces, switchSpace]);

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
