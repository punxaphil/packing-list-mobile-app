export interface UserProfile {
  id: string;
  email: string;
  personalSpaceId: string;
  spaceIds: string[];
  imageUrl?: string;
  hideImagePlaceholder?: boolean;
  wrapItemText?: boolean;
}
