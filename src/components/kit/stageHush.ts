export const stageHush = (selector: string) => {
  const mid = innerHeight / 2;
  const band = innerHeight * 0.35;
  let hush = 0;
  document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
    const r = el.getBoundingClientRect();
    const d = mid < r.top ? r.top - mid : mid > r.bottom ? mid - r.bottom : 0;
    const t = 1 - Math.min(1, d / band);
    hush = Math.max(hush, t * t * (3 - 2 * t));
  });
  return 1 - hush;
};
