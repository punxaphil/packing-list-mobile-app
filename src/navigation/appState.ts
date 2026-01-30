type AppState = {
  userId: string;
  email: string;
};

let appState: AppState | null = null;

export function setAppState(state: AppState) {
  appState = state;
}

export function getAppState(): AppState {
  if (!appState) throw new Error("AppState not initialized");
  return appState;
}
