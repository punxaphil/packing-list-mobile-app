import { createContext, useContext } from "react";
import type { SpaceInvite } from "~/types/SpaceInvite.ts";

type InviteContextValue = {
  pendingInvites: SpaceInvite[];
  acceptInvite: (invite: SpaceInvite) => Promise<void>;
  declineInvite: (invite: SpaceInvite) => Promise<void>;
  sendInvite: (toEmail: string) => Promise<void>;
};

export const InviteContext = createContext<InviteContextValue | null>(null);

export function useInvites(): InviteContextValue {
  const ctx = useContext(InviteContext);
  if (!ctx) throw new Error("useInvites must be inside InviteProvider");
  return ctx;
}
