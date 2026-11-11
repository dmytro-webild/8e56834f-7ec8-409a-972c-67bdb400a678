const LAZY = 'img[data-webild-media][loading="lazy"]';
const AHEAD = "150% 0px";
const BATCH = 3;
const BATCH_WAIT = 8000;

const LAZY_VIDEO = 'video[data-webild-media][preload="none"]';
let observer: IntersectionObserver | null = null;
let videoObserver: IntersectionObserver | null = null;
let queued = false;
let sweeping = false;

const wake = (image: HTMLImageElement) => {
  observer?.unobserve(image);
  if (image.loading === "lazy") image.loading = "eager";
};

const idle = (run: () => void) => {
  if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(run, { timeout: 2000 });
  else setTimeout(run, 200);
};

const settle = (images: HTMLImageElement[]) =>
  Promise.race([Promise.allSettled(images.map((image) => image.decode())), new Promise((done) => window.setTimeout(done, BATCH_WAIT))]);

const sweep = () => {
  const next = Array.from(document.querySelectorAll<HTMLImageElement>(LAZY)).slice(0, BATCH);
  if (!next.length) {
    sweeping = false;
    return;
  }
  for (const image of next) {
    if (image.fetchPriority !== "high") image.fetchPriority = "low";
    wake(image);
  }
  settle(next).then(() => idle(sweep));
};

const startSweep = () => {
  if (sweeping) return;
  sweeping = true;
  const go = () => {
    const first = Array.from(document.querySelectorAll<HTMLImageElement>('img[fetchpriority="high"]')).filter((image) => !image.complete);
    settle(first).then(() => idle(sweep));
  };
  if (document.readyState === "complete") idle(go);
  else window.addEventListener("load", () => idle(go), { once: true });
};

const scan = () => {
  queued = false;
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) if (entry.isIntersecting) wake(entry.target as HTMLImageElement);
    },
    { rootMargin: AHEAD },
  );
  observer.disconnect();
  videoObserver ??= new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const video = entry.target as HTMLVideoElement;
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    }
  });
  videoObserver.disconnect();
  document.querySelectorAll<HTMLVideoElement>(LAZY_VIDEO).forEach((video) => videoObserver?.observe(video));
  const images = document.querySelectorAll<HTMLImageElement>(LAZY);
  images.forEach((image) => observer?.observe(image));
  if (images.length) startSweep();
};

export const queueEarlyImages = () => {
  if (queued || typeof IntersectionObserver === "undefined") return;
  queued = true;
  window.requestAnimationFrame(scan);
};
