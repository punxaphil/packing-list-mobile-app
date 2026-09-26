import { CategoriesScreen as CategoriesScreenComponent } from "~/components/categories/CategoriesScreen";
import { AppProvider } from "~/providers/AppProvider";
import { getAppState } from "./appState";
import { pushProfile } from "./navigation";
import { ScreenFrame } from "./ScreenFrame.tsx";

export function CategoriesScreen() {
  const { userId, email } = getAppState();

  return (
    <ScreenFrame top>
      <AppProvider userId={userId} email={email}>
        <CategoriesScreenComponent email={email} onProfile={pushProfile} />
      </AppProvider>
    </ScreenFrame>
  );
}
