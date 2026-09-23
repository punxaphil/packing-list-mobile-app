export type RootStackParamList = {
  MainTabs: { screen?: keyof MainTabsParamList };
  ProfileScreen: undefined;
  ListChanges: { packingListId: string };
};

export type MainTabsParamList = {
  ItemsStack: undefined;
  ListsStack: undefined;
  CategoriesStack: undefined;
  MembersStack: undefined;
};

export type ItemsStackParamList = {
  Items: undefined;
};

export type ListsStackParamList = {
  Lists: undefined;
};

export type CategoriesStackParamList = {
  Categories: undefined;
};

export type MembersStackParamList = {
  Members: undefined;
};
