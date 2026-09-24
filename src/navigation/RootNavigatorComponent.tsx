import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import i18next from "i18next";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { homeSpacing } from "~/components/home/theme.ts";
import { CategoriesScreen } from "./CategoriesScreen";
import { ItemsScreen } from "./ItemsScreen";
import { ListChangesScreen } from "./ListChangesScreen";
import { ListsScreen } from "./ListsScreen";
import { MembersScreen } from "./MembersScreen";
import { ProfileScreen } from "./ProfileScreen";
import type {
  CategoriesStackParamList,
  ItemsStackParamList,
  ListsStackParamList,
  MainTabsParamList,
  MembersStackParamList,
  RootStackParamList,
} from "./RootNavigator";
import { getSelectedId } from "./selectionState";
import { TAB_SELECTED_TEXT_COLOR, type TabIconName } from "./tabIcons";

const RootStack = createNativeStackNavigator<RootStackParamList>();
const MainTabs = createBottomTabNavigator<MainTabsParamList>();
const ItemsStack = createNativeStackNavigator<ItemsStackParamList>();
const ListsStack = createNativeStackNavigator<ListsStackParamList>();
const CategoriesStack = createNativeStackNavigator<CategoriesStackParamList>();
const MembersStack = createNativeStackNavigator<MembersStackParamList>();

const MUTED_COLOR = "#6b7280";
const WEB_TAB_INSET = 26;
const TAB_ICON_SIZE = 24;

function ItemsStackNavigator() {
  return (
    <ItemsStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <ItemsStack.Screen name="Items" component={ItemsScreen} />
    </ItemsStack.Navigator>
  );
}

function ListsStackNavigator() {
  return (
    <ListsStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <ListsStack.Screen name="Lists" component={ListsScreen} />
    </ListsStack.Navigator>
  );
}

function CategoriesStackNavigator() {
  return (
    <CategoriesStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <CategoriesStack.Screen name="Categories" component={CategoriesScreen} />
    </CategoriesStack.Navigator>
  );
}

function MembersStackNavigator() {
  return (
    <MembersStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <MembersStack.Screen name="Members" component={MembersScreen} />
    </MembersStack.Navigator>
  );
}

function MainTabsNavigator() {
  return (
    <MainTabs.Navigator
      initialRouteName={getSelectedId() ? "ItemsStack" : "ListsStack"}
      safeAreaInsets={{ bottom: WEB_TAB_INSET }}
      screenOptions={({ route }) => {
        const labels: Record<keyof MainTabsParamList, string> = {
          ItemsStack: i18next.t("navigation.items"),
          ListsStack: i18next.t("navigation.lists"),
          CategoriesStack: i18next.t("navigation.categories"),
          MembersStack: i18next.t("navigation.members"),
        };

        const icons: Record<keyof MainTabsParamList, TabIconName> = {
          ItemsStack: "checkbox-marked-outline",
          ListsStack: "format-list-bulleted",
          CategoriesStack: "view-grid-outline",
          MembersStack: "heart-outline",
        };

        const label = labels[route.name as keyof MainTabsParamList];
        const icon = icons[route.name as keyof MainTabsParamList];
        return {
          title: label,
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <MaterialCommunityIcons
              name={icon}
              size={TAB_ICON_SIZE}
              color={focused ? TAB_SELECTED_TEXT_COLOR : MUTED_COLOR}
            />
          ),
          tabBarLabel: label,
          tabBarActiveTintColor: TAB_SELECTED_TEXT_COLOR,
          tabBarInactiveTintColor: MUTED_COLOR,
          tabBarLabelStyle: { fontSize: 10 },
          tabBarIconStyle: { flexGrow: 0, flexShrink: 0, flexBasis: TAB_ICON_SIZE },
          tabBarItemStyle: { justifyContent: "center" },
          tabBarStyle: {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: homeSpacing.md,
            paddingTop: homeSpacing.md - homeSpacing.xs / 2,
            paddingBottom: homeSpacing.md + homeSpacing.xs / 2,
          },
        };
      }}
    >
      <MainTabs.Screen
        name="ItemsStack"
        component={ItemsStackNavigator}
        options={{
          headerShown: false,
        }}
      />
      <MainTabs.Screen
        name="ListsStack"
        component={ListsStackNavigator}
        options={{
          headerShown: false,
        }}
      />
      <MainTabs.Screen
        name="CategoriesStack"
        component={CategoriesStackNavigator}
        options={{
          headerShown: false,
        }}
      />
      <MainTabs.Screen
        name="MembersStack"
        component={MembersStackNavigator}
        options={{
          headerShown: false,
        }}
      />
    </MainTabs.Navigator>
  );
}

export function RootNavigator() {
  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <RootStack.Screen name="MainTabs" component={MainTabsNavigator} />
      <RootStack.Group screenOptions={{ presentation: "card", headerShown: false }}>
        <RootStack.Screen name="ProfileScreen" component={ProfileScreen} />
        <RootStack.Screen name="ListChanges" component={ListChangesScreen} />
      </RootStack.Group>
    </RootStack.Navigator>
  );
}
