"use client";

import { useEffect, useState, type RefObject } from "react";

export const usePreloadImages = (ref: RefObject<Element | null>, ahead = "150%") => {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        root.querySelectorAll("img").forEach((image) => {
          if (image.loading === "lazy") image.loading = "eager";
        });
        observer.disconnect();
      },
      { rootMargin: `${ahead} 0px` },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, [ref, ahead]);
};

export const useImageReady = (ref: RefObject<Element | null>, active = true, wait = 2500) => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!active || ready) return;
    const root = ref.current;
    const image = root instanceof HTMLImageElement ? root : root?.querySelector("img");
    if (!image || image.complete) {
      setReady(true);
      return;
    }
    if (image.loading === "lazy") image.setAttribute("loading", "eager");
    const done = () => setReady(true);
    image.addEventListener("load", done);
    image.addEventListener("error", done);
    const fallback = window.setTimeout(done, wait);
    return () => {
      image.removeEventListener("load", done);
      image.removeEventListener("error", done);
      window.clearTimeout(fallback);
    };
  }, [ref, active, ready, wait]);
  return ready;
};

export type KitMotion = {
  ease: [number, number, number, number];
  easeInOut: [number, number, number, number];
  fast: number;
  base: number;
  slow: number;
  distance: string;
};

const FALLBACK: KitMotion = {
  ease: [0.22, 1, 0.36, 1],
  easeInOut: [0.65, 0, 0.35, 1],
  fast: 0.3,
  base: 0.7,
  slow: 1.2,
  distance: "24px",
};

const parseBezier = (value: string, fallback: KitMotion["ease"]): KitMotion["ease"] => {
  const match = value.match(/cubic-bezier\(([^)]+)\)/);
  if (!match) return fallback;
  const parts = match[1].split(",").map((part) => Number(part.trim()));
  return parts.length === 4 && parts.every((part) => Number.isFinite(part)) ? (parts as KitMotion["ease"]) : fallback;
};

const parseSeconds = (value: string, fallback: number) => {
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  const number = parseFloat(trimmed);
  if (!Number.isFinite(number)) return fallback;
  return trimmed.endsWith("ms") ? number / 1000 : number;
};

export const readKitMotion = (element?: Element | null): KitMotion => {
  if (typeof window === "undefined") return FALLBACK;
  const style = getComputedStyle(element ?? document.documentElement);
  const read = (name: string) => style.getPropertyValue(name);
  return {
    ease: parseBezier(read("--ease-out"), FALLBACK.ease),
    easeInOut: parseBezier(read("--ease-in-out"), FALLBACK.easeInOut),
    fast: parseSeconds(read("--dur-fast"), FALLBACK.fast),
    base: parseSeconds(read("--dur-base"), FALLBACK.base),
    slow: parseSeconds(read("--dur-slow"), FALLBACK.slow),
    distance: read("--reveal-distance").trim() || FALLBACK.distance,
  };
};

export const useKitMotion = (): KitMotion => {
  const [motion, setMotion] = useState<KitMotion>(FALLBACK);
  useEffect(() => {
    setMotion(readKitMotion());
  }, []);
  return motion;
};

export const scrollRange = (from: number, to: number): [number, number] => {
  const end = Math.min(1, Math.max(0.001, to));
  return [Math.min(end - 0.001, Math.max(0, from)), end];
};
