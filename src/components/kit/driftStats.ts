import { useSyncExternalStore } from "react";

export type DriftStats = { count: number; frameMs: number; firstFrame: number; fps: number };

export const driftCount = () => (matchMedia("(min-width: 880px)").matches ? 64000 : 26000);

let stats: DriftStats = { count: 0, frameMs: 0, firstFrame: 0, fps: 0 };
const listeners = new Set<() => void>();

export const publishDriftStats = (next: Partial<DriftStats>) => {
  stats = { ...stats, ...next };
  listeners.forEach((l) => l());
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
const read = () => stats;

export const useDriftStats = () => useSyncExternalStore(subscribe, read, read);
