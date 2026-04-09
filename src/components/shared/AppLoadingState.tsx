import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { homeColors, homeSpacing } from "~/components/home/theme.ts";
import { loadingMessages } from "~/components/shared/loadingMessages.ts";
import { SquirrelLoader } from "~/components/shared/SquirrelLoader.tsx";

type AppLoadingStateProps = {
  message?: string;
};

const MESSAGE_SWAP_MS = 1000;
const LOADER_DELAY_MS = 400;
const LOADER_MIN_VISIBLE_MS = 3000;

export function AppLoadingState({ message }: AppLoadingStateProps) {
  const { height } = useWindowDimensions();
  const currentMessage = useLoadingMessage(message);

  return (
    <View style={styles.host}>
      <View style={[styles.container, { height }]}>
        <SquirrelLoader />
        <Text style={styles.label}>{currentMessage}</Text>
      </View>
    </View>
  );
}

export function useDelayedLoading(loading: boolean) {
  const [visible, setVisible] = useState(false);
  const shownAt = useRef<number | null>(null);

  useEffect(() => {
    const now = Date.now();
    if (loading && visible) {
      shownAt.current ??= now;
      return;
    }

    const delay = loading
      ? LOADER_DELAY_MS
      : Math.max(0, LOADER_MIN_VISIBLE_MS - (shownAt.current == null ? 0 : now - shownAt.current));
    const id = setTimeout(() => {
      if (loading) shownAt.current = Date.now();
      if (!loading) shownAt.current = null;
      setVisible(loading);
    }, delay);

    return () => clearTimeout(id);
  }, [loading, visible]);

  return visible;
}

function shuffle<T>(array: readonly T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function useLoadingMessage(message?: string) {
  const [index, setIndex] = useState(0);
  const shuffled = useRef(shuffle(loadingMessages));
  useEffect(() => {
    if (message) return;
    const id = setInterval(() => setIndex((value) => (value + 1) % shuffled.current.length), MESSAGE_SWAP_MS);
    return () => clearInterval(id);
  }, [message]);
  return message ?? shuffled.current[index];
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
  },
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    minHeight: 24,
    marginTop: homeSpacing.sm,
    fontSize: 16,
    fontWeight: "500",
    color: homeColors.muted,
  },
});
