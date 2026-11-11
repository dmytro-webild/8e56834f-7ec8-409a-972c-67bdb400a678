const BUCKET = "https://storage.googleapis.com/webild/default/models/";

export const localModelSrc = (src: string) =>
  import.meta.env.VITE_KITS_LOCAL_MODELS === "1" && src.startsWith(BUCKET) ? `/kits-work/_models/${src.slice(BUCKET.length)}` : src;
