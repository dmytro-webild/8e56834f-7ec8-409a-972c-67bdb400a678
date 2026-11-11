import { useEffect, type ComponentProps } from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { isVideoSrc, localMediaSrc, srcSetFor } from "@/components/kit/mediaSrc";
import { queueEarlyImages } from "@/components/kit/earlyImages";
import "@/components/kit/videoPlayback";

const IMAGE_ONLY = ["alt", "onLoad", "srcSet", "sizes", "loading", "decoding", "fetchPriority"];

const toVideo = (props: { alt?: string; onLoad?: unknown }) => {
  const rest: Record<string, unknown> = { ...props };
  for (const key of IMAGE_ONLY) delete rest[key];
  return { ...rest, "aria-label": props.alt || undefined, onLoadedData: props.onLoad, autoPlay: true, muted: true, loop: true, playsInline: true };
};

const withSrcSet = <P extends { src?: string; srcSet?: string; sizes?: string }>(props: P): P => {
  if (props.srcSet) return props;
  const srcSet = srcSetFor(props.src);
  return srcSet ? { ...props, srcSet, sizes: props.sizes ?? "100vw" } : props;
};

export default function Media(original: ComponentProps<"img">) {
  useEffect(queueEarlyImages, []);
  const props = { ...original, src: localMediaSrc(original.src) };
  if (!isVideoSrc(props.src)) return <img data-webild-media="" {...withSrcSet(props)} />;
  return <video data-webild-media="" {...(toVideo(props) as ComponentProps<"video">)} />;
}

export function MotionMedia(original: HTMLMotionProps<"img">) {
  useEffect(queueEarlyImages, []);
  const props = { ...original, src: localMediaSrc(original.src) };
  if (!isVideoSrc(props.src)) return <motion.img data-webild-media="" {...withSrcSet(props)} />;
  return <motion.video data-webild-media="" {...(toVideo(props) as HTMLMotionProps<"video">)} />;
}
