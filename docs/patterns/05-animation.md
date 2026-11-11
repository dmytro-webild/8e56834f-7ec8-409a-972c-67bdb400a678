# 05 — Animation

Four layers. Reach for the next one only when the previous cannot do the job. Most sections need only the first two.

## Layer 1 — WordByWordReveal (headings)

All heading and description text animates through `WordByWordReveal`. The section's `textAnimation` prop passes straight through.

```tsx
<WordByWordReveal
  text={title}
  variant={textAnimation}
  tag="h2"
  className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-[1.15] text-center text-balance"
/>
```

Internals, for reference:

- Splits on spaces, wraps each word in `<motion.span className="inline-block">`
- Parent: `initial="hidden"`, `whileInView="visible"`, `viewport={{ once: true, margin: "-20%" }}`, `staggerChildren: 0.04`
- Per word: `duration: 0.6` with variant easing — `slide-up` `y: "50%" → 0` ease `[0.25, 0.46, 0.45, 0.94]`; `fade-blur` `blur(10px) → none` ease `[0.45, 0, 0.55, 1]`; `fade` opacity only
- `immediate` switches from scroll-triggered to play-on-mount, for above-the-fold heroes

## Layer 2 — AppearOnScroll (bodies)

One `AppearOnScroll` around the section body — the grid, carousel, form, or media.

```tsx
<AppearOnScroll variant="slide-up">
  <GridOrCarousel>…</GridOrCarousel>
</AppearOnScroll>
```

- Bodies use `variant="slide-up"`. The other variants exist for matching a section's text animation when that reads better.
- Internals: `viewport={{ once: true, margin: "-20%" }}`, `transition={{ duration: 0.6, delay, ease: "easeOut" }}`, `slide-up` = `{opacity: 0, y: 20}`
- It accepts `className`, so it often *is* the layout element: `<AppearOnScroll variant="slide-up" className="grid grid-cols-1 md:grid-cols-2 gap-5">`
- Delays: `0.1` for a second column, `0.2` for hero media. Per-row reveal comes from putting `AppearOnScroll` inside the `.map()` — no index arithmetic needed.
- Never wrap the header block: headings animate themselves, and `Button` carries its own entrance.

## Layer 3 — inline motion

**Accordion expand**

```tsx
<AnimatePresence initial={false}>
  {isOpen && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="overflow-hidden"
    >
```

**Auto-rotating crossfade**

```tsx
useEffect(() => {
  const id = setInterval(() => setIndex((i) => (i + 1) % items.length), 5000);
  return () => clearInterval(id);
}, [items.length]);

<AnimatePresence mode="wait">
  <motion.div
    key={index}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
  >
```

**Index stagger**: `transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}`, or variants with `staggerChildren: 0.05` on the parent.

**Hover is CSS, not motion**: `transition-transform duration-500 group-hover:scale-105`, `opacity-0 group-hover:opacity-100 transition-all duration-300`, `group-hover:rotate-45 transition-transform duration-300`.

## Scroll-driven effects

Same hook config throughout — progress runs 0→1 across the element's time on screen:

```tsx
const ref = useRef<HTMLDivElement>(null);
const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
```

| Effect | Recipe |
|---|---|
| **Background parallax** | `const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"])` on an `absolute inset-0` motion wrapper whose media child is `h-[120%]`. The extra height covers the ±10% travel so no gap ever shows. Parent needs `overflow-hidden`. |
| **Settle zoom** | `useTransform(scrollYProgress, [0, 0.6], [1.3, 1])` — finishes at 60% and holds. Target the media cell's ref, not the section's. |
| **Counter-moving plates** | Foreground `["120px", "-120px"]` (against scroll), background `["-60px", "60px"]` plus `scale [1, 1.15]` (with scroll, half rate). |
| **Word-by-word fill** | `offset: ["start 0.8", "start 0.2"]`, each word `useTransform(progress, [i/n, (i+1)/n], [0.15, 1])` driving opacity. |
| **Hero exit** | `offset: ["start start", "end start"]`, `y ["0px", "150px"]`, `scale [1, 1.1]`. |

## Layer 4 — GSAP

Only for scrubbed or pinned sequences that motion cannot express — scrubbing a video's `currentTime`, pinning a sticky card stack, timeline-sequenced entrances.

```tsx
gsap.registerPlugin(ScrollTrigger);   // module scope

useEffect(() => {
  const ctx = gsap.context(() => {
    // animations, scoped to the ref
  }, containerRef);
  return () => ctx.revert();
}, []);
```

Rules: register at module scope, scope everything to a `gsap.context()` with a ref, always `ctx.revert()` on cleanup, branch responsive behaviour with `gsap.matchMedia()` at the same 768px boundary as `md:`.

## Constants

- Viewport: `{ once: true, margin: "-20%" }` — reveals fire slightly before the element is fully visible, and never replay
- Durations: 0.6s reveals, 0.3s toggles and crossfades, 0.5s spot reveals; CSS hovers 300–500ms
- Stagger: 0.04 per word, 0.05–0.1 per item; 0.1 for the secondary button, 0.2 for hero media
- Everything scroll-triggered runs once. Marquees and auto-rotators are the only loops.
- Prefer transform and opacity. Animating `height` needs `overflow-hidden`; animating `width`, `top`, or `left` causes layout thrash.
