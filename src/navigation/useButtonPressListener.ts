import { useEffect } from "react";
import { Navigation, NavigationButtonPressedEvent } from "react-native-navigation";
import { BUTTON_IDS } from "./navigation";

type ButtonHandlers = {
  onProfile?: () => void;
  onFilter?: () => void;
  onSort?: () => void;
  onArchived?: () => void;
};

export function useButtonPressListener(componentId: string, handlers: ButtonHandlers) {
  const { onProfile, onFilter, onSort, onArchived } = handlers;

  useEffect(() => {
    const subscription = Navigation.events().registerNavigationButtonPressedListener(
      (event: NavigationButtonPressedEvent) => {
        if (event.componentId !== componentId) return;
        switch (event.buttonId) {
          case BUTTON_IDS.PROFILE:
            onProfile?.();
            break;
          case BUTTON_IDS.FILTER:
            onFilter?.();
            break;
          case BUTTON_IDS.SORT:
            onSort?.();
            break;
          case BUTTON_IDS.ARCHIVED:
            onArchived?.();
            break;
        }
      }
    );
    return () => subscription.remove();
  }, [componentId, onProfile, onFilter, onSort, onArchived]);
}
