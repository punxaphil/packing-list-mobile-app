export type UseTopBarParams = {
  componentId: string;
  title: string;
  profileImageUrl?: string;
  onProfile?: () => void;
  showFilter?: boolean;
  filterActive?: boolean;
  onFilter?: () => void;
  showSort?: boolean;
  sortByAlpha?: boolean;
  onSort?: () => void;
  showArchived?: boolean;
  archivedActive?: boolean;
  onArchived?: () => void;
};
