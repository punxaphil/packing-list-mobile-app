import type { ReactNode } from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import { Animated } from "react-native";
import {
  LongPressGestureHandler,
  LongPressGestureHandlerStateChangeEvent,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  PanGestureHandlerStateChangeEvent,
  State,
} from "react-native-gesture-handler";

export type DragOffset = { x: number; y: number };

type DragCallbacks = {
  onStart?: () => void;
  onMove?: (offset: DragOffset) => void;
  onEnd?: () => void;
};

type DragOptions = {
  applyTranslation?: boolean;
};

export const useDraggableRow = (callbacks: DragCallbacks = {}, options: DragOptions = {}) => {
  const position = useRef(new Animated.ValueXY()).current;
  const [active, setActive] = useState(false);
  const dragStarted = useRef(false);
  const longPressRef = useRef<LongPressGestureHandler>(null);
  const panRef = useRef<PanGestureHandler>(null);

  const reset = useCallback(() => {
    if (!dragStarted.current) return;
    dragStarted.current = false;
    setActive(false);
    callbacks.onEnd?.();
    Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
  }, [position, callbacks]);

  const handleLongPressChange = useCallback(
    ({ nativeEvent }: LongPressGestureHandlerStateChangeEvent) => {
      if (nativeEvent.state === State.ACTIVE) {
        dragStarted.current = true;
        setActive(true);
        callbacks.onStart?.();
      }
    },
    [callbacks]
  );

  const handlePanChange = useCallback(
    ({ nativeEvent }: PanGestureHandlerStateChangeEvent) => {
      const { state } = nativeEvent;
      if (state === State.END || state === State.CANCELLED || state === State.FAILED) {
        reset();
      }
    },
    [reset]
  );

  const handlePanMove = useCallback(
    (event: PanGestureHandlerGestureEvent) => {
      if (!dragStarted.current) return;
      const { translationX, translationY } = event.nativeEvent;
      position.setValue({ x: translationX, y: translationY });
      callbacks.onMove?.({ x: translationX, y: translationY });
    },
    [position, callbacks]
  );

  const applyTranslation = options.applyTranslation ?? true;
  const style = useMemo(
    () => (applyTranslation ? [{ transform: position.getTranslateTransform() }] : undefined),
    [applyTranslation, position]
  );

  const wrap = useCallback(
    (node: ReactNode) => (
      <LongPressGestureHandler
        ref={longPressRef}
        simultaneousHandlers={panRef}
        minDurationMs={250}
        maxDist={Number.MAX_SAFE_INTEGER}
        shouldCancelWhenOutside={false}
        onHandlerStateChange={handleLongPressChange}
      >
        <Animated.View>
          <PanGestureHandler
            ref={panRef}
            simultaneousHandlers={longPressRef}
            activeOffsetY={[-5, 5]}
            failOffsetX={[-20, 20]}
            onGestureEvent={handlePanMove}
            onHandlerStateChange={handlePanChange}
          >
            <Animated.View style={style}>{node}</Animated.View>
          </PanGestureHandler>
        </Animated.View>
      </LongPressGestureHandler>
    ),
    [handleLongPressChange, handlePanChange, handlePanMove, style]
  );

  return { wrap, dragging: active } as const;
};
