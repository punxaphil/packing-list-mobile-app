import React, { PropsWithChildren, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { getAuth } from "firebase/auth";
import "./services/database.ts";
import { Login, useCurrentUser } from "./components/auth/Auth.tsx";
import { HomeScreen } from "./components/home/HomeScreen.tsx";
import { HOME_COPY, homeStyles } from "./components/home/styles.ts";
import { ProfileScreen } from "./components/profile/ProfileScreen.tsx";
import { usePackingLists } from "./hooks/usePackingLists.ts";
import { NamedEntity } from "./types/NamedEntity.ts";
import { APP_VERSION } from "./version.ts";

type Screen = "home" | "profile";

const PRIMARY_COLOR = "#2563eb";
const versionStyles = StyleSheet.create({ footer: { alignItems: "center", paddingVertical: 4 }, text: { fontSize: 10, color: "#9ca3af" } });
const VersionFooter = () => <View style={versionStyles.footer}><Text style={versionStyles.text}>v{APP_VERSION}</Text></View>;

const Layout = ({ children }: PropsWithChildren) => (
  <GestureHandlerRootView style={homeStyles.container}>
    <SafeAreaProvider>
      <SafeAreaView edges={["top", "bottom"]} style={homeStyles.container}>
        <StatusBar style="auto" />
        <View style={homeStyles.content}>{children}</View>
        <VersionFooter />
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
    return <ProfileScreen email={params.email} onSignOut={signOut} onBack={() => params.onNavigate("home")} />;
  }
  return <HomeScreen email={params.email} lists={params.lists} loading={params.loading} hasLists={params.hasLists} userId={params.userId} onSignOut={signOut} onProfile={() => params.onNavigate("profile")} />;
}

export default function App() {
  const { userId, email, loggingIn } = useCurrentUser();
  const { packingLists, loading, hasLists } = usePackingLists(userId);
  const [screen, setScreen] = useState<Screen>("home");
  const view = buildView({ loggingIn, userId, email, lists: packingLists, loading, hasLists, screen, onNavigate: setScreen });
  return withLayout(view);
}
