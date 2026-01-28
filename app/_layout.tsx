import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "~/services/database.ts";
import { Login, useCurrentUser } from "~/components/auth/Auth.tsx";
import { HOME_COPY, homeStyles } from "~/components/home/styles.ts";
import { ToastProvider } from "~/components/home/Toast.tsx";
import { homeColors } from "~/components/home/theme.ts";
import { AppProvider } from "~/providers/AppProvider.tsx";

const LoadingView = () => (
  <View style={homeStyles.loading}>
    <ActivityIndicator size="large" color={homeColors.primary} />
    <Text style={homeStyles.loadingText}>{HOME_COPY.loading}</Text>
  </View>
);

function RootLayoutInner() {
  const { userId, email, loggingIn } = useCurrentUser();

  if (loggingIn) return <LoadingView />;
  if (!userId) return <Login />;

  return (
    <AppProvider userId={userId} email={email}>
      <ToastProvider>
        <Slot />
      </ToastProvider>
    </AppProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={homeStyles.container}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <RootLayoutInner />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
