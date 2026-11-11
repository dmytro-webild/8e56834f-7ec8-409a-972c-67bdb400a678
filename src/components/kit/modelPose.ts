import { useSyncExternalStore } from "react";

export type ModelPoseFields = {
  x?: number;
  y?: number;
  z?: number;
  rx?: number;
  ry?: number;
  rz?: number;
  radius?: number;
  scale?: number;
  opacity?: number;
  dial?: number;
  explode?: number;
  spread?: number;
  tone?: number;
  free?: number;
};

export type ModelPose = ModelPoseFields & { at?: number; sm?: ModelPoseFields };

export type ModelChapter = ModelPose | ModelPose[] | false;

export type ModelPart = { name: string; part: string };

let liveParts: ModelPart[] | null = null;
const partListeners = new Set<() => void>();

export const setModelParts = (parts: ModelPart[] | null) => {
  liveParts = parts;
  partListeners.forEach((listen) => listen());
};

const subscribeParts = (listen: () => void) => {
  partListeners.add(listen);
  return () => {
    partListeners.delete(listen);
  };
};

export const useModelParts = () => useSyncExternalStore(subscribeParts, () => liveParts, () => null);

export const modelChapter =(chapter: ModelChapter | undefined) =>
  chapter ? { "data-model": JSON.stringify(Array.isArray(chapter) ? chapter : [chapter]) } : {};