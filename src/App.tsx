import React, { PropsWithChildren, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { getAuth } from "firebase/auth";
import "./services/database.ts";
import { Login, useCurrentUser } from "./components/auth/Auth.tsx";
import { CategoriesScreen } from "./components/categories/CategoriesScreen.tsx";
import { HomeScreen } from "./components/home/HomeScreen.tsx";
import { HOME_COPY, homeStyles } from "./components/home/styles.ts";
import { MembersScreen } from "./components/members/MembersScreen.tsx";
import { FooterNav, Tab } from "./components/navigation/FooterNav.tsx";
import { ProfileScreen } from "./components/profile/ProfileScreen.tsx";
import { usePackingLists } from "./hooks/usePackingLists.ts";
import { NamedEntity } from "./types/NamedEntity.ts";

type Screen = "main" | "profile";

const PRIMARY_COLOR = "#2563eb";
const BUILD_TIMESTAMP = "2026-01-20 13:53:16";
const timestampStyles = StyleSheet.create({ footer: { alignItems: "center", paddingVertical: 4 }, text: { fontSize: 10, color: "#9ca3af" } });
const DevTimestamp = () => __DEV__ ? <View style={timestampStyles.footer}><Text style={timestampStyles.text}>{BUILD_TIMESTAMP}</Text></View> : null;

const Layout = ({ children }: PropsWithChildren) => (
  <GestureHandlerRootView style={homeStyles.container}>
    <SafeAreaProvider>
      <SafeAreaView edges={["top", "bottom"]} style={homeStyles.container}>
        <StatusBar style="auto" />
        <View style={homeStyles.content}>{children}</View>
        <DevTimestamp />
      </SafeAreaView>
    </SafeAreaProvider>
  </GestureHandlerRootView>
);

const LoadingView = () => (
  <View style={homeStyles.loading}>
    <ActivityIndicator size="large" color={PRIMARY_COLOR} />
    <Text style={homeStyles.loadingText}>{HOME_COPY.loading}</Text>
  </View>
);

const withLayout = (node: React.ReactNode) => <Layout>{node}</Layout>;

const signOut = () => getAuth().signOut().catch(console.error);

type MainScreenProps = {
  userId: string;
  email: string;
  lists: NamedEntity[];
  loading: boolean;
  hasLists: boolean;
  onProfile: () => void;
};

const MainScreen = ({ userId, email, lists, loading, hasLists, onProfile }: MainScreenProps) => {
  const [tab, setTab] = useState<Tab>("items");
  const [visited, setVisited] = useState<Set<Tab>>(new Set(["items"]));

  const handleSelect = (newTab: Tab) => {
    setTab(newTab);
    setVisited((prev) => new Set(prev).add(newTab));
  };

  return (
    <View style={homeStyles.container}>
      <View style={{ flex: 1, display: tab === "items" ? "flex" : "none" }}>
        <HomeScreen email={email} lists={lists} loading={loading} hasLists={hasLists} userId={userId} onProfile={onProfile} />
      </View>
      {visited.has("lists") && (
        <View style={{ flex: 1, display: tab === "lists" ? "flex" : "none", justifyContent: "center", alignItems: "center" }}>
          <Text>Lists - coming soon</Text>
        </View>
      )}
      {visited.has("categories") && (
        <View style={{ flex: 1, display: tab === "categories" ? "flex" : "none" }}>
          <CategoriesScreen userId={userId} email={email} onProfile={onProfile} />
        </View>
      )}
      {visited.has("members") && (
        <View style={{ flex: 1, display: tab === "members" ? "flex" : "none" }}>
          <MembersScreen userId={userId} email={email} onProfile={onProfile} />
        </View>
      )}
      <FooterNav active={tab} onSelect={handleSelect} />
    </View>
  );
};

type ViewParams = {
  loggingIn: boolean;
  userId: string;
  email: string;
  lists: NamedEntity[];
  loading: boolean;
  hasLists: boolean;
  screen: Screen;
  onNavigate: (screen: Screen) => void;
};

function buildView(params: ViewParams) {
  if (params.loggingIn) return <LoadingView />;
  if (!params.userId) return <Login />;
  if (params.screen === "profile") {
    return <ProfileScreen email={params.email} userId={params.userId} onSignOut={signOut} onBack={() => params.onNavigate("main")} />;
  }
  return <MainScreen userId={params.userId} email={params.email} lists={params.lists} loading={params.loading} hasLists={params.hasLists} onProfile={() => params.onNavigate("profile")} />;
}

export default function App() {
  const { userId, email, loggingIn } = useCurrentUser();
  const { packingLists, loading, hasLists } = usePackingLists(userId);
  const [screen, setScreen] = useState<Screen>("main");
  const view = buildView({ loggingIn, userId, email, lists: packingLists, loading, hasLists, screen, onNavigate: setScreen });
  return withLayout(view);
}
