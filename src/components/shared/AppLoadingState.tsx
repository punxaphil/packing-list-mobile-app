import { useEffect, useRef, useState } from "react";
import { homeColors, homeSpacing } from "~/components/home/theme.ts";
import { getLoadingMessages } from "~/components/shared/loadingMessages.ts";
import { SquirrelLoader } from "~/components/shared/SquirrelLoader.tsx";
import "./appLoadingState.css";

type AppLoadingStateProps = {
  message?: string;
};

const MESSAGE_SWAP_MS = 1000;
export function AppLoadingState({ message }: AppLoadingStateProps) {
  const currentMessage = useLoadingMessage(message);

  return (
    <div className="app-loading-state" style={{ backgroundColor: homeColors.surface }}>
      <SquirrelLoader />
      <span className="app-loading-message" style={{ color: homeColors.muted, marginTop: homeSpacing.sm }}>
        {currentMessage}
      </span>
    </div>
  );
}

function shuffle<T>(array: readonly T[]): T[] {
  if (!array?.length) return [];
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function useLoadingMessage(message?: string) {
  const [index, setIndex] = useState(0);
  const shuffled = useRef(shuffle(getLoadingMessages()));
  useEffect(() => {
    if (message) return;
    const id = setInterval(() => setIndex((value) => (value + 1) % shuffled.current.length), MESSAGE_SWAP_MS);
    return () => clearInterval(id);
  }, [message]);
  return message ?? shuffled.current[index];
}
