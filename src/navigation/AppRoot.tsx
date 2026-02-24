import { useEffect, useRef } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Login, useCurrentUser } from "~/components/auth/Auth";
import { HOME_COPY, homeStyles } from "~/components/home/styles";
import { homeColors } from "~/components/home/theme";
import { useSpaceBootstrap } from "~/hooks/useSpaces.ts";
import { setAppState } from "./appState";
import { showMainTabs } from "./navigation";
import { getSelectedId } from "./selectionState";

function BootstrapAndLaunch({ userId, email }: { userId: string; email: string }) {
  const ready = useSpaceBootstrap(userId, email);
  const prevHasSelection = useRef<boolean | null>(null);

  useEffect(() => {
    if (!ready) return;
    setAppState({ userId, email });
    const hasSelection = getSelectedId() !== "";
    if (prevHasSelection.current !== hasSelection) {
      prevHasSelection.current = hasSelection;
      showMainTabs(hasSelection);
    }
  }, [ready, userId, email]);

  return (
    <View style={homeStyles.loading}>
      <ActivityIndicator size="large" color={homeColors.primary} />
    </View>
  );
}

export function AppRoot() {
  const { userId, email, loggingIn } = useCurrentUser();

  if (loggingIn) {
    return (
      <View style={homeStyles.loading}>
        <ActivityIndicator size="large" color={homeColors.primary} />
        <Text style={homeStyles.loadingText}>{HOME_COPY.loading}</Text>
      </View>
    );
  }

  if (!userId) return <Login />;

  return <BootstrapAndLaunch userId={userId} email={email} />;
}
