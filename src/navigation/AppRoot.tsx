import { useEffect, useRef } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Login, useCurrentUser } from "~/components/auth/Auth";
import { HOME_COPY, homeStyles } from "~/components/home/styles";
import { homeColors } from "~/components/home/theme";
import { setAppState } from "./appState";
import { showMainTabs } from "./navigation";
import { getSelectedId } from "./selectionState";

export function AppRoot() {
  const { userId, email, loggingIn } = useCurrentUser();
  const prevHasSelection = useRef<boolean | null>(null);

  useEffect(() => {
    if (userId && email) {
      setAppState({ userId, email });
      const hasSelection = getSelectedId() !== "";
      if (prevHasSelection.current !== hasSelection) {
        prevHasSelection.current = hasSelection;
        showMainTabs(hasSelection);
      }
    }
  }, [userId, email]);

  if (loggingIn) {
    return (
      <View style={homeStyles.loading}>
        <ActivityIndicator size="large" color={homeColors.primary} />
        <Text style={homeStyles.loadingText}>{HOME_COPY.loading}</Text>
      </View>
    );
  }

  if (!userId) {
    return <Login />;
  }

  return (
    <View style={homeStyles.loading}>
      <ActivityIndicator size="large" color={homeColors.primary} />
    </View>
  );
}
