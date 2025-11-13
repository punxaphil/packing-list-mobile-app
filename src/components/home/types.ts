import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";

export type PackingListSummary = NamedEntity & {
  itemCount?: number;
  packedCount?: number;
};

export type HomeScreenProps = {
  email: string;
  lists: PackingListSummary[];
  loading: boolean;
  hasLists: boolean;
  userId: string;
  onSignOut: () => void;
};

export type SelectionState = {
  selectedId: string;
  selectedList: NamedEntity | null;
  hasSelection: boolean;
  select: (id: string) => void;
  clear: () => void;
};

export type ItemsState = {
  items: PackItem[];
  loading: boolean;
  hasItems: boolean;
};

export type CategoriesState = {
  categories: NamedEntity[];
  loading: boolean;
};

export type HomeLayoutProps = {
  email: string;
  hasLists: boolean;
  lists: PackingListSummary[];
  selection: SelectionState;
  categoriesState: CategoriesState;
  itemsState: ItemsState;
  onSignOut: () => void;
};

export type ItemsSectionProps = {
  selection: SelectionState;
  categoriesState: CategoriesState;
  itemsState: ItemsState;
  email: string;
  onSignOut: () => void;
};
