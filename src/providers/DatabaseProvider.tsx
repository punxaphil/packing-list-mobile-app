import { getAuth } from "firebase/auth";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { readDb } from "~/services/database.ts";
import { groupByCategories, sortAll } from "~/services/utils.ts";
import { ColumnList } from "~/types/Column.ts";
import { GroupedPackItem } from "~/types/GroupedPackItem.ts";
import { Image } from "~/types/Image.ts";
import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackItem } from "~/types/PackItem.ts";
import { DatabaseContext } from "./DatabaseContext.ts";
import { usePackingList } from "./PackingListContext.ts";
import {
  createColumns,
  flattenGroupedPackItems,
} from "~/services/packingListUtils.ts";
export const CHECKED_FILTER_STATE = "☑ Checked";
export const UNCHECKED_FILTER_STATE = "☐ Unchecked";
export const WITHOUT_MEMBERS_ID = "__WITHOUT_MEMBERS__";

type FilterState = {
  showTheseCategories: string[];
  showTheseMembers: string[];
  showTheseStates: string[];
  searchText?: string;
};

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<NamedEntity[]>();
  const [categories, setCategories] = useState<NamedEntity[]>();
  const [packItems, setPackItems] = useState<PackItem[]>();
  const [images, setImages] = useState<Image[]>();
  const [packingLists, setPackingLists] = useState<NamedEntity[]>();
  const { packingList } = usePackingList();

  const [currentFilterState, setCurrentFilterState] =
    useState<FilterState | null>(null);
  const currentFilterStateRef = useRef(currentFilterState);

  // Keep ref in sync with state
  useEffect(() => {
    currentFilterStateRef.current = currentFilterState;
  }, [currentFilterState]);

  useEffect(() => {
    (async () => {
      const initialFilters = await getInitialFilterState();
      currentFilterStateRef.current = initialFilters;
      setCurrentFilterState(initialFilters);
    })().catch(console.error);
  }, []);

  const nbrOfColumns: 1 | 2 | 3 = 1;

  async function getInitialFilterState(): Promise<FilterState | null> {
    try {
      const [savedCategories, savedMembers, savedStates] = await Promise.all([
        AsyncStorage.getItem("filteredCategories"),
        AsyncStorage.getItem("filteredMembers"),
        AsyncStorage.getItem("filteredPackItemState"),
      ]);

      if (savedCategories || savedMembers || savedStates) {
        return {
          showTheseCategories: savedCategories
            ? JSON.parse(savedCategories)
            : [],
          showTheseMembers: savedMembers ? JSON.parse(savedMembers) : [],
          showTheseStates: savedStates ? JSON.parse(savedStates) : [],
          searchText: "",
        };
      }
    } catch (error) {
      console.error(error);
    }
    return null;
  }

  async function persistFiltersToLocalStorage(filters: FilterState) {
    try {
      await AsyncStorage.multiSet([
        ["filteredCategories", JSON.stringify(filters.showTheseCategories)],
        ["filteredMembers", JSON.stringify(filters.showTheseMembers)],
        ["filteredPackItemState", JSON.stringify(filters.showTheseStates)],
      ]);
    } catch (error) {
      console.error(error);
    }
  }

  const persistFiltersCallback = useCallback((filters: FilterState) => {
    void persistFiltersToLocalStorage(filters);
  }, []);

  function filterByCategories(
    packItems: PackItem[],
    categoryIds: string[],
  ): PackItem[] {
    if (!categoryIds.length) {
      return packItems;
    }
    return packItems.filter((item) => categoryIds.includes(item.category));
  }

  function filterByMembers(
    packItems: PackItem[],
    memberIds: string[],
  ): PackItem[] {
    if (!memberIds.length) {
      return packItems;
    }

    return packItems.filter((item) => {
      const hasNoMembers = item.members.length === 0;
      const withoutMembersSelected = memberIds.includes(WITHOUT_MEMBERS_ID);

      // If "Without members" is selected and item has no members, include it
      if (withoutMembersSelected && hasNoMembers) {
        return true;
      }

      // If item has members, check if any member matches the selected filters
      // But exclude "Without members" from this check
      if (item.members.length > 0) {
        const nonEmptyMemberIds = memberIds.filter(
          (id) => id !== WITHOUT_MEMBERS_ID,
        );
        if (nonEmptyMemberIds.length === 0) {
          // Only "Without members" is selected, so exclude items with members
          return false;
        }
        const hasMatchingMember = item.members.some((m) =>
          nonEmptyMemberIds.includes(m.id),
        );
        return hasMatchingMember;
      }

      return false;
    });
  }

  function filterByStates(packItems: PackItem[], states: string[]): PackItem[] {
    if (!states.length) {
      return packItems;
    }
    return packItems.filter(
      (item) =>
        (states.includes(CHECKED_FILTER_STATE) && item.checked) ||
        (states.includes(UNCHECKED_FILTER_STATE) && !item.checked),
    );
  }

  function filterBySearchText(
    packItems: PackItem[],
    searchText: string,
  ): PackItem[] {
    if (!searchText || !searchText.trim()) {
      return packItems;
    }
    const lowerSearchText = searchText.toLowerCase().trim();
    return packItems.filter((item) =>
      item.name.toLowerCase().includes(lowerSearchText),
    );
  }

  function applyAllFilters(
    packItems: PackItem[],
    filterState: FilterState | null,
  ): PackItem[] {
    if (!filterState || !packItems) {
      return packItems;
    }

    const {
      showTheseCategories,
      showTheseMembers,
      showTheseStates,
      searchText,
    } = filterState;

    let filtered = filterByCategories(packItems, showTheseCategories);
    filtered = filterByMembers(filtered, showTheseMembers);
    filtered = filterByStates(filtered, showTheseStates);
    filtered = filterBySearchText(filtered, searchText || "");

    return filtered;
  }

  function getCategoriesInPackingList(
    categories: NamedEntity[],
    packItems: PackItem[],
  ): NamedEntity[] {
    return categories.filter((c) => packItems.some((p) => p.category === c.id));
  }

  function getMembersInPackingList(
    members: NamedEntity[],
    packItems: PackItem[],
  ): NamedEntity[] {
    return members.filter((m) =>
      packItems.some((p) => p.members.some((t) => t.id === m.id)),
    );
  }

  function updateAndPersistFilters(newFilters: FilterState) {
    currentFilterStateRef.current = newFilters;
    setCurrentFilterState(newFilters);
    persistFiltersCallback(newFilters);
  }

  useEffect(() => {
    (async () => {
      const userId = getAuth().currentUser?.uid;
      if (!userId) {
        throw new Error("No user logged in");
      }
      if (packingList) {
        await readDb.getUserCollectionsAndSubscribe(
          setMembers,
          setCategories,
          setPackItems,
          setImages,
          setPackingLists,
          packingList.id,
        );
      }
    })().catch(console.error);
  }, [packingList]);

  const resetSearchTextIfNeeded = useCallback(() => {
    const filterState = currentFilterStateRef.current;
    if (filterState?.searchText) {
      const newFilters = {
        ...filterState,
        searchText: "",
      };
      currentFilterStateRef.current = newFilters;
      setCurrentFilterState(newFilters);
      persistFiltersCallback(newFilters);
    }
  }, [persistFiltersCallback]);

  // Reset search text when switching between packing lists
  useEffect(() => {
    if (packingList) {
      resetSearchTextIfNeeded();
    }
  }, [packingList, resetSearchTextIfNeeded]);

  let groupedPackItems: GroupedPackItem[] = [];
  let columns: ColumnList[] = [];
  let categoriesInPackingList: NamedEntity[] = [];
  let membersInPackingList: NamedEntity[] = [];
  const isInitialized =
    members && categories && packItems && images && packingLists && packingList;
  if (isInitialized) {
    // Create copies to avoid mutating the original arrays on every render
    const membersCopy = [...members];
    const categoriesCopy = [...categories];
    const packItemsCopy = [...packItems];
    const packingListsCopy = [...packingLists];

    sortAll(membersCopy, categoriesCopy, packItemsCopy, packingListsCopy);
    const filtered = applyAllFilters(packItemsCopy, currentFilterState);
    groupedPackItems = groupByCategories(filtered, categoriesCopy);
    const flattened = flattenGroupedPackItems(groupedPackItems);
    columns = createColumns(flattened, nbrOfColumns);
    categoriesInPackingList = getCategoriesInPackingList(
      categoriesCopy,
      packItemsCopy,
    );
    membersInPackingList = getMembersInPackingList(membersCopy, packItemsCopy);
  }

  if (!isInitialized) {
    return null;
  }

  return (
    <DatabaseContext.Provider
      value={{
        members,
        categories,
        packItems,
        images,
        packingLists,
        groupedPackItems,
        columns,
        nbrOfColumns,
        categoriesInPackingList,
        membersInPackingList,
        filter: currentFilterState,
        setFilter: updateAndPersistFilters,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
}
