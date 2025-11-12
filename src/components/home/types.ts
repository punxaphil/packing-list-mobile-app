import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";

export type HomeScreenProps = {
  email: string;
  lists: NamedEntity[];
  loading: boolean;
  hasLists: boolean;
  userId: string;
  onSignOut: () => void;
};

export type SelectionState = {
  selectedId: string;
  selectedList: NamedEntity | null;
  select: (id: string) => void;
};

export type ItemsState = {
  items: PackItem[];
  loading: boolean;
  hasItems: boolean;
};

export type HomeLayoutProps = {
  email: string;
  hasLists: boolean;
  lists: NamedEntity[];
  selection: SelectionState;
  itemsState: ItemsState;
  onSignOut: () => void;
};

export type ItemsSectionProps = {
  selection: SelectionState;
  itemsState: ItemsState;
};
