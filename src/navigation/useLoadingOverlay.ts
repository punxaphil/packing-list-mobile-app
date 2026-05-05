import { useEffect, useRef } from "react";
import { Navigation } from "react-native-navigation";
import { SCREEN_IDS } from "./screenIds.ts";

const LOADER_DELAY_MS = 0;
const LOADER_HIDE_GRACE_MS = 400;
const OVERLAY_ID = SCREEN_IDS.LOADING_OVERLAY;

const activeTokens = new Set<symbol>();
let overlayVisible = false;
let pendingShow = false;
let timeoutId: ReturnType<typeof setTimeout> | null = null;

const clearScheduled = () => {
  if (timeoutId == null) return;
  clearTimeout(timeoutId);
  timeoutId = null;
};

const showOverlay = async () => {
  if (overlayVisible || pendingShow) return;
  pendingShow = true;
  try {
    await Navigation.showOverlay({
      component: {
        id: OVERLAY_ID,
        name: SCREEN_IDS.LOADING_OVERLAY,
        options: {
          layout: { componentBackgroundColor: "transparent" },
          overlay: { interceptTouchOutside: false },
        },
      },
    });
    overlayVisible = true;
  } catch (_error) {
    return;
  } finally {
    pendingShow = false;
    if (overlayVisible && activeTokens.size === 0) syncOverlay();
  }
};

const hideOverlay = async () => {
  if (!overlayVisible && !pendingShow) return;
  pendingShow = false;
  try {
    await Navigation.dismissOverlay(OVERLAY_ID);
  } catch (_error) {
  } finally {
    overlayVisible = false;
    if (activeTokens.size > 0) syncOverlay();
  }
};

const syncOverlay = () => {
  clearScheduled();
  if (activeTokens.size > 0) {
    if (overlayVisible) return;
    timeoutId = setTimeout(() => {
      timeoutId = null;
      if (activeTokens.size > 0) void showOverlay();
    }, LOADER_DELAY_MS);
    return;
  }
  if (!overlayVisible) return;
  timeoutId = setTimeout(() => {
    timeoutId = null;
    if (activeTokens.size === 0) void hideOverlay();
  }, LOADER_HIDE_GRACE_MS);
};

export function useLoadingOverlay(loading: boolean) {
  const token = useRef(Symbol("loading-overlay")).current;

  useEffect(() => {
    loading ? activeTokens.add(token) : activeTokens.delete(token);
    syncOverlay();
    return () => {
      activeTokens.delete(token);
      syncOverlay();
    };
  }, [loading, token]);
}
