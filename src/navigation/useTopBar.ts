import { useEffect } from "react";
import { updateTopBar } from "./navigation";
import { UseTopBarParams } from "./topBarTypes";
import { useButtonPressListener } from "./useButtonPressListener";

export function useTopBar(params: UseTopBarParams) {
  const {
    componentId,
    title,
    profileImageUrl,
    onProfile,
    showFilter,
    filterActive,
    onFilter,
    showSort,
    sortByAlpha,
    onSort,
    showArchived,
    archivedActive,
    onArchived,
  } = params;

  useEffect(() => {
    updateTopBar(componentId, title, {
      profileImageUrl,
      showFilter,
      filterActive,
      showSort,
      sortByAlpha,
      showArchived,
      archivedActive,
    });
  }, [
    componentId,
    title,
    profileImageUrl,
    showFilter,
    filterActive,
    showSort,
    sortByAlpha,
    showArchived,
    archivedActive,
  ]);

  useButtonPressListener(componentId, {
    onProfile,
    onFilter,
    onSort,
    onArchived,
  });
}
