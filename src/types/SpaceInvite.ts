export type InviteStatus = "pending" | "accepted" | "declined";

export interface SpaceInvite {
  id: string;
  spaceId: string;
  spaceName: string;
  fromEmail: string;
  toEmail: string;
  status: InviteStatus;
  createdAt: number;
}
