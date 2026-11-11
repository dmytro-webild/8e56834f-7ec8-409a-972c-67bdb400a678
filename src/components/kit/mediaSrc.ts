export const isVideoSrc = (src?: string | null) => !!src && /\.(?:mp4|webm|mov|m4v|ogv|ogg)(?:$|[?#&])/i.test(src.trim());

const TEMPLATES_BUCKET = "https://storage.googleapis.com/webild/default/templates/";

export const localMediaSrc = <T extends string | undefined | null>(src: T): T =>
  import.meta.env.VITE_KITS_LOCAL_MODELS === "1" && src?.startsWith(TEMPLATES_BUCKET) && /^[^/]+\/(?:[^/]+-(?:1600|800|poster)\.webp|[^/]+\.glb|(?:person-(?:diffuse|depth|alpha|normal)|noise)\.webp|helmet-mask\.png|[^/]+\.hdr)$/.test(src.slice(TEMPLATES_BUCKET.length)) ?(`/kits-work/_media/templates/${src.slice(TEMPLATES_BUCKET.length)}` as T) : src;

export const srcSetFor =(src?: string | null) => {
  const base = src?.trim().match(/^(.+)-(?:1600|800)\.webp$/)?.[1];
  return base ? `${base}-800.webp 800w, ${base}-1600.webp 1600w` : undefined;
};
