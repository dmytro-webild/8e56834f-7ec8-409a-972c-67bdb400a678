# Styling Options

The look-and-feel catalog. The components ship deliberately plain — flat `bg-card border shadow-sm` surfaces and flat `bg-primary` buttons — so they never fight a project's existing design. These docs are how you turn that neutral baseline into something that looks designed.

| Doc | What's in it |
|---|---|
| [color-themes.md](./color-themes.md) | 45 palettes (25 light, 20 dark) in shadcn token names |
| [font-themes.md](./font-themes.md) | 19 single fonts, 13 pairings, with CSS and `next/font` forms |
| [card-styles.md](./card-styles.md) | 14 card surface treatments |
| [button-styles.md](./button-styles.md) | 23 primary + 4 secondary button treatments |
| [style-packs.md](./style-packs.md) | 11 curated combinations — card + button + radius + font chosen together |

## Which to reach for

**Want it to look good fast?** Take a style pack. Each one is a card treatment, a primary and secondary button, a radius, and a font that were designed together.

**Have a brand already?** Take a color theme (or write your palette into the same token names), then pick a card and button style separately. The CSS never hardcodes a color, so the palette and the surface treatment are independent choices.

## How to apply anything here

Everything is plain CSS against shadcn tokens. Three steps, once per project:

```css
/* 1. palette */
:root {
  --background: #f5faff;
  --foreground: #001122;
  --primary: #15479c;
  /* …the rest of the palette block… */
  --radius: 0.625rem;
}

/* 2. font */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
@theme inline { --font-sans: "Inter", sans-serif; }

/* 3. surface treatments */
.card {
  background: var(--card);
  box-shadow: color-mix(in srgb, var(--foreground) 5%, transparent) 0px 4px 32px 0px;
}
.btn-primary {
  background: linear-gradient(to bottom, color-mix(in srgb, var(--primary) 75%, transparent), var(--primary));
}
```

Then swap the utility trio for the class:

```diff
- <div className="bg-card text-card-foreground border shadow-sm rounded-xl p-6">
+ <div className="card rounded-xl p-6">
```

`color-mix(in srgb, …)` is doing the real work throughout — it tints shadows and gradients with the theme's own colors instead of black, which is what makes the depth read as intentional. It also means a single palette swap re-tunes every surface at once, and dark mode needs no separate treatment.

## Three rules

1. **One card treatment per site.** Mixing card styles across sections is the most common reason a page looks assembled rather than designed.
2. **Radius is global.** Set `--radius` once. Cards `rounded-xl`, controls `rounded-lg`, pills `rounded-full` — all derive from it.
3. **A secondary button must lose.** If the primary and secondary compete for attention, neither reads as the call to action.
