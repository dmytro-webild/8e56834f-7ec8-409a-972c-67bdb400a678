const TRIES = 20;

const mute = (video: HTMLVideoElement) => {
  video.defaultMuted = true;
  video.muted = true;
};

const attempt = (video: HTMLVideoElement, done: () => void, left = TRIES) => {
  if (!video.isConnected) return;
  video.play().then(done, () => {
    if (left > 1) window.setTimeout(() => attempt(video, done, left - 1), 600);
  });
};

const start = (video: HTMLVideoElement) => {
  if (!video.autoplay || !video.paused || video.dataset.webildPlaying !== undefined) return;
  video.dataset.webildPlaying = "";
  attempt(video, () => {});
};

const ready = (video: HTMLVideoElement) => {
  if (video.dataset.webildVideo !== undefined) return;
  video.dataset.webildVideo = "";
  if (video.muted || video.hasAttribute("muted") || video.autoplay) mute(video);
  video.setAttribute("playsinline", "");
  start(video);
};

const scan = (root: ParentNode) => {
  if (root instanceof HTMLVideoElement) ready(root);
  root.querySelectorAll?.("video").forEach(ready);
};

const restart = () =>
  document.querySelectorAll<HTMLVideoElement>("video").forEach((video) => {
    delete video.dataset.webildPlaying;
    start(video);
  });

let started = false;

export const watchVideos = () => {
  if (started || typeof document === "undefined" || typeof MutationObserver === "undefined") return;
  started = true;
  scan(document);
  new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === "attributes") {
        if (!(record.target instanceof HTMLVideoElement)) continue;
        delete record.target.dataset.webildVideo;
        delete record.target.dataset.webildPlaying;
        ready(record.target);
      } else record.addedNodes.forEach((node) => node instanceof Element && scan(node.tagName === "SOURCE" && node.parentElement ? node.parentElement : node));
    }
  }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["src", "autoplay"] });
  document.addEventListener("touchstart", restart, { once: true, passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") restart();
  });
};

export const primeVideo = (video: HTMLVideoElement) => {
  if (!video.paused || video.readyState >= 2) return;
  mute(video);
  video.setAttribute("playsinline", "");
  attempt(video, () => video.pause());
};

watchVideos();
