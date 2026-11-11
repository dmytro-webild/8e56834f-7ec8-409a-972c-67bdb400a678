# 03 — Styling

Standard Tailwind against shadcn token names. Nothing here needs a config file or a custom plugin.

## Color tokens

| Token | Use |
|---|---|
| `bg-background` / `text-foreground` | Page surface and default text |
| `bg-card` / `text-card-foreground` | Raised surfaces — cards, panels, pills |
| `bg-primary` / `text-primary-foreground` | Primary CTA and filled accents (icon chips, badges) |
| `bg-secondary` / `text-secondary-foreground` | Secondary buttons, quieter filled surfaces |
| `bg-muted` / `text-muted-foreground` | Recessed fills and de-emphasised text |
| `bg-accent` / `text-accent-foreground` | Highlights — stars, active states, thin rules |
| `border` / `border-input` / `ring` | Hairlines, field borders, focus rings |
| `bg-destructive` | Errors and destructive actions |

**Pairing rule**: a `-foreground` token is only correct on its own surface. `text-primary-foreground` belongs on `bg-primary`, nowhere else. Body copy on the page background is `text-foreground`; secondary copy is `text-muted-foreground`.

**Never use raw colors.** No `bg-white`, `bg-gray-50`, `text-neutral-500`, no hex. The only sanctioned exceptions are overlays on top of imagery, where the scrim is genuinely black or white regardless of theme: `bg-black/40`, `text-white`, `border-white/20`.

Opacity modifiers cover everything between the tokens: `text-foreground/70`, `bg-primary/10`, `border-foreground/10`.

## Surfaces

The default card is the shadcn trio:

```tsx
<div className="bg-card text-card-foreground border shadow-sm rounded-xl p-6">
```

Filled surfaces skip the border:

```tsx
<div className="bg-primary text-primary-foreground rounded-lg">    {/* icon chip, badge, CTA */}
<div className="bg-secondary text-secondary-foreground rounded-lg"> {/* quieter control */}
<div className="bg-muted rounded-full">                             {/* track, progress rail */}
```

Every section button also carries a `btn-primary` / `btn-secondary` class next to its `bg-*` fill. Without CSS the classes do nothing; define them (see [button styles](../styles/button-styles.md)) and every button in every section picks up the surface at once.

To upgrade the flat default into a designed look (layered shadows, gradient buttons, glass), apply a style pack — see [the style catalog](../styles/README.md). Packs are opt-in CSS; the components work without them.

## Radius

`--radius` drives the scale. Use the named steps, not arbitrary values:

- `rounded-xl` — cards and panels
- `rounded-lg` — buttons, inputs, icon chips, media wells
- `rounded-full` — pills, avatars, circular buttons, progress rails
- `rounded-none` — explicit opt-out for full-bleed media

Setting `--radius` reshapes the whole library at once, so pick radius at the theme level rather than per component.

## Type scale

There is **no fluid type scale**. `text-6xl` is 60px on a phone as much as on a desktop. Every heading needs an explicit mobile size.

| Role | Class |
|---|---|
| Hero title (h1) | `text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.15] text-balance` |
| Section title (h2) | `text-3xl sm:text-4xl md:text-5xl font-semibold leading-[1.15] text-balance` |
| Card title (h3) | `text-xl md:text-2xl font-semibold leading-snug` |
| Sub-label (h4) | `text-base md:text-lg font-medium` |
| Section description | `text-base md:text-lg text-muted-foreground leading-snug text-balance` |
| Body / card copy | `text-sm md:text-base text-muted-foreground leading-snug` |
| Pills, captions, meta | `text-sm` |
| Display numbers (metrics) | `text-5xl md:text-6xl font-semibold leading-none` |

Supporting rules: `leading-[1.15]` on display headings, `leading-snug` on body, `leading-none` on big numbers, `leading-relaxed` for long-form prose. `text-balance` on headings and short descriptions. `truncate` with `min-w-0` on anything single-line holding user data (names, values, labels) — without `min-w-0` a flex child refuses to shrink and `truncate` silently does nothing.

## Spacing

Section rhythm `py-16 md:py-24`. Header→body gap `gap-10 md:gap-14`. Grid gap `gap-5`, or `gap-6` for roomy card grids.

Card padding uses one of two ladders — pick by density, don't invent a third:

- `p-4 md:p-6` — media-led cards, list rows, accordion items
- `p-6 md:p-8` — text-led cards (pricing, testimonials, metrics)

Internal stacks use `gap-2` (tight label groups), `gap-3` (header items, icon rows), or `gap-4 md:gap-6` (card sections).

## Class order

Write classes in this order so diffs stay readable and duplicates are obvious:

```
[position] [display/flex/grid] [gap] [padding/margin] [size] [typography] [color] [surface + radius] [effects/transitions] [state variants]
```

Example: `relative flex flex-col gap-3 p-4 md:p-6 w-full text-sm text-muted-foreground bg-card border rounded-xl transition-colors hover:bg-muted`.

## Do not

- Raw colors or hex — tokens only (`bg-black/40` and `text-white` over imagery excepted)
- `h-screen` — use `min-h-svh` / `h-svh`
- Unprefixed display type (`text-6xl` with no mobile step)
- Custom width tokens or bare `container` — the column is `w-full max-w-6xl mx-auto px-6`
- Arbitrary radius values — use `rounded-lg` / `rounded-xl` / `rounded-full`
- A content container without `px-6`
