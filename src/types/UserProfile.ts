export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  personalSpaceId: string;
  spaceIds: string[];
  imageUrl?: string;
  hideImagePlaceholder?: boolean;
  wrapItemText?: boolean;
  addNewItemsOnTop?: boolean;
  pendingDeletion?: boolean;
}

export const getDisplayName = (profile: Pick<UserProfile, "email" | "firstName" | "lastName">): string => {
  const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ");
  return name || profile.email;
};
