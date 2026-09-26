import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { CategoriesScreen } from "./CategoriesScreen.tsx";
import { ItemsScreen } from "./ItemsScreen.tsx";
import { ListChangesScreen } from "./ListChangesScreen.tsx";
import { ListsScreen } from "./ListsScreen.tsx";
import { MainTabs } from "./MainTabs.tsx";
import { MembersScreen } from "./MembersScreen.tsx";
import { registerNavigator } from "./navigation.ts";
import { ProfileScreen } from "./ProfileScreen.tsx";
import { getSelectedId } from "./selectionState.ts";

const initialTab = () => (getSelectedId() ? "/MainTabs/ItemsStack" : "/MainTabs/ListsStack");
const InitialTabRedirect = () => <Navigate to={initialTab()} replace />;

const router = createBrowserRouter([
  { path: "/", element: <InitialTabRedirect /> },
  {
    path: "/MainTabs",
    element: <MainTabs />,
    children: [
      { index: true, element: <InitialTabRedirect /> },
      { path: "ItemsStack", element: <ItemsScreen /> },
      { path: "ListsStack", element: <ListsScreen /> },
      { path: "CategoriesStack", element: <CategoriesScreen /> },
      { path: "MembersStack", element: <MembersScreen /> },
    ],
  },
  { path: "/ProfileScreen", element: <ProfileScreen /> },
  { path: "/ListChanges/:packingListId", element: <ListChangesScreen /> },
]);

registerNavigator(router);

export const RootNavigator = () => <RouterProvider router={router} />;
