import { MemberPackItem } from "./MemberPackItem.ts";

export interface PackItem {
  id: string;
  name: string;
  url?: string;
  checked: boolean;
  members: MemberPackItem[];
  category: string;
  packingList: string;
  rank: number;
}
