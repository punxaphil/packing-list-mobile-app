import { createContext, type MutableRefObject, useContext } from "react";
import type { WriteDb } from "~/services/database.ts";
import type { Space } from "~/types/Space.ts";
import type { UserProfile } from "~/types/UserProfile.ts";

export type SpaceContextValue = {
  spaceId: string;
  spaces: Space[];
  activeSpace: Space | undefined;
  profile: UserProfile | undefined;
  writeDb: WriteDb;
  switchSpace: (spaceId: string) => void;
  createNewSpace: (name: string) => Promise<Space>;
  suppressRemovalAlert: MutableRefObject<boolean>;
};

export const SpaceContext = createContext<SpaceContextValue | null>(null);

export function useSpace(): SpaceContextValue {
  const ctx = useContext(SpaceContext);
  if (!ctx) throw new Error("useSpace must be inside SpaceProvider");
  return ctx;
}
