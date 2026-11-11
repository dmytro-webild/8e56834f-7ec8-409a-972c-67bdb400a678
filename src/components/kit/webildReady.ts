import { useCallback, useLayoutEffect, useRef, type RefObject } from "react";

type ReadyWindow = Window & { __webildPending?: number };

const noop = () => {};

export const holdWebildReady = () => {
  if (typeof window === "undefined") return noop;
  const w = window as ReadyWindow;
  w.__webildPending = (w.__webildPending ?? 0) + 1;
  let held = true;
  return () => {
    if (!held) return;
    held = false;
    w.__webildPending = Math.max(0, (w.__webildPending ?? 1) - 1);
  };
};

export function useWebildHold(ref?: RefObject<Element | null>, enabled = true) {
  const release = useRef(noop);
  useLayoutEffect(() => {
    if (!enabled) return;
    const r = ref?.current?.getBoundingClientRect();
    if (r && (r.bottom <= 0 || r.top >= window.innerHeight || r.width === 0 || r.height === 0)) return;
    const done = holdWebildReady();
    release.current = done;
    return done;
  }, [ref, enabled]);
  return useCallback(() => release.current(), []);
}
