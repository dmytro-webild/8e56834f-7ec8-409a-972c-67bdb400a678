# 04 — Responsiveness

## Strategy

Mobile-first with **one real layout switch at `md:` (768px)**. Above that, breakpoints only adjust density and type size — they never rearrange the page a second time.

| Breakpoint | Role |
|---|---|
| base | Single column. `flex-col`, full-width media, centered text, smallest type. |
| `sm:` | Type only — the intermediate heading step (`text-3xl sm:text-4xl`) |
| `md:` | **The layout switch.** `flex-col → flex-row`, `grid-cols-1 → 2/3`, width fractions apply, aspect ratios change, order swaps, padding and type step up |
| `lg:` | Optional third column in dense grids; occasional width refinement |
| `xl:` / `2xl:` | Rare. Only for very wide layouts (a 4-up grid) or the top of a type scale |

Two consequences worth internalising:

1. **Type must carry its mobile size.** There is no fluid scale, so `text-5xl` alone is 48px on a 375px phone. Always `text-3xl md:text-5xl`.
2. **Padding barely needs breakpoints.** `p-6` is 24px everywhere and reads correctly on both. A single `md:` step is enough: `p-4 md:p-6`.

## Ladders

Use these; don't invent new ones.

| Ladder | Where |
|---|---|
| `py-16 md:py-24` | Section vertical rhythm |
| `gap-10 md:gap-14` | Header → body |
| `gap-5` / `gap-6` | Card grids |
| `p-4 md:p-6` | Media-led cards, rows, accordion items |
| `p-6 md:p-8` | Text-led cards (pricing, testimonials, metrics) |
| `gap-2` / `gap-3` / `gap-4 md:gap-6` | Tight label stack / header items / card sections |

## Widths

Percentages as arbitrary values, or plain fractions:

```
w-full md:w-1/2                    even split
w-full md:w-3/5 lg:w-1/2           hero overlay copy column
w-full md:w-2/5 / md:w-3/5         asymmetric split (must sum to 100)
max-w-[80%] / max-w-[70%]          header title / description caps
w-1/2 md:w-auto                    footer columns — 2-up on mobile, natural on desktop
```

Media that needs a floor on mobile uses a fixed height that releases at `md`: `h-72 md:h-auto` inside a stretch row.

## GridOrCarousel

The default body layout for a card collection. It takes no props and picks its own layout from child count:

```tsx
<AppearOnScroll variant="slide-up">
  <GridOrCarousel>
    {items.map((item) => (
      <div key={item.title} className="h-full bg-card border rounded-xl p-4 md:p-6">…</div>
    ))}
  </GridOrCarousel>
</AppearOnScroll>
```

- **1–3 children** → static grid, `grid-cols-1` stepping to `md:grid-cols-2` / `md:grid-cols-3`
- **4 children** → grid at `2xl`, drag carousel below it
- **5+ children** → always a carousel, with a progress bar and prev/next controls

**Cards must carry `h-full`** — the carousel track is `items-stretch`, and without it cards in a row end up different heights.

Reach for a manual grid only when the layout is genuinely non-uniform:

```tsx
// bento — per-item spans
<div className="grid grid-cols-1 md:grid-cols-12 gap-5">
  <div className="md:col-span-5">…</div>
  <div className="md:col-span-7">…</div>
</div>

// asymmetric split
<div className="grid grid-cols-1 md:grid-cols-5 gap-5">
  <div className="md:col-span-3">…</div>
  <div className="md:col-span-2">…</div>
</div>

// dense uniform grid
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
```

## Marquees

CSS animation, no JavaScript. The keyframes translate exactly `-50%`, so the item array is duplicated to make the loop seamless:

```tsx
<div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)]">
  <div className="flex w-max animate-marquee-horizontal" style={{ animationDuration: "45s" }}>
    {[...items, ...items].map((item, i) => (
      <div key={i} className="shrink-0 mr-5">…</div>
    ))}
  </div>
</div>
```

- Items use `shrink-0` and margin (`mr-5`), not `gap` — gap breaks the exact 50% wrap.
- Always override duration inline; the CSS default is a placeholder.
- Edge fade comes from an arbitrary `[mask-image:…]`, so no extra CSS file is needed.
- Vertical variants (`animate-marquee-vertical`) need a fixed-height `overflow-hidden` parent.
- The prebuilt marquee components (`IconTextMarquee`, `ChatMarquee`, `InfoCardMarquee`) ship their own keyframes.

## Mobile behaviour of interactive flourishes

Hover states do not exist on touch. Give the mobile user the resolved state and gate the hover behaviour behind `md:`:

```tsx
// panel visible on mobile; slides up on hover from md upward
className="translate-y-0 opacity-100 md:translate-y-full md:opacity-0 transition-all duration-300 md:group-hover:translate-y-0 md:group-hover:opacity-100"
```

Cursor-following and magnetic effects should early-return under 768px rather than run and do nothing useful. Decorative elements that would crowd a small screen get `hidden md:block`.
