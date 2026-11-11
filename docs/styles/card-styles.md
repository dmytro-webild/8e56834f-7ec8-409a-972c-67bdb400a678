# Card Styles

14 ways to treat a card surface. Pick one, paste it into your global CSS as `.card`, and use `className="card rounded-xl p-6"` instead of the default `bg-card border shadow-sm` trio.

One rule: use exactly one card treatment across a site. Mixing them is the fastest way to make a page look assembled rather than designed.

Every snippet reads shadcn tokens, so it adapts to whatever palette the project defines and works in light and dark mode unchanged.


## `solid`

Flat fill, no border or shadow. The quietest option.


```css
.card {
  background: var(--card);
}
```


## `outline`

Flat fill with a thin accent-tinted border. Good for dense grids.


```css
.card {
  background: var(--card);
  border: 1px solid var(--border);
}
```


## `gradient-mesh`

Four corner radial tints blended over the card fill.


```css
.card {
  background:
  radial-gradient(at 0% 0%, color-mix(in srgb, var(--accent) 15%, transparent) 0px, transparent 50%),
  radial-gradient(at 100% 0%, color-mix(in srgb, var(--accent) 10%, transparent) 0px, transparent 50%),
  radial-gradient(at 100% 100%, color-mix(in srgb, var(--accent) 20%, transparent) 0px, transparent 50%),
  radial-gradient(at 0% 100%, color-mix(in srgb, var(--accent) 12%, transparent) 0px, transparent 50%),
  var(--card);
}
```


## `gradient-radial`

Single soft radial tint from the center outward.


```css
.card {
  background: radial-gradient(circle at center, color-mix(in srgb, var(--card) 100%, var(--accent) 20%) 0%, var(--card) 90%);
}
```


## `inset`

Pressed-in look from inner shadows on two sides.


```css
.card {
  background: color-mix(in srgb, var(--card) 95%, var(--accent) 5%);
  box-shadow:
  inset 2px 2px 4px color-mix(in srgb, var(--foreground) 8%, transparent),
  inset -2px -2px 4px color-mix(in srgb, var(--background) 20%, transparent);
}
```


## `glass-elevated`

Frosted translucent fill with blur and a light border.


```css
.card {
  backdrop-filter: blur(8px);
  background: linear-gradient(to bottom right, color-mix(in srgb, var(--card) 80%, transparent), color-mix(in srgb, var(--card) 40%, transparent));
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  border: 1px solid var(--card);
}
```


## `glass-depth`

Frosted fill with a deeper layered shadow.


```css
.card {
  background: color-mix(in srgb, var(--card) 80%, transparent);
  backdrop-filter: blur(14px);
  box-shadow:
  inset 0 0 20px 0 color-mix(in srgb, var(--accent) 7.5%, transparent);
  border: 1px solid var(--border);
}
```


## `gradient-bordered`

Solid fill with a gradient border ring.


```css
.card {
  background: linear-gradient(180deg, color-mix(in srgb, var(--card) 100%, var(--accent) 5%) -35%, var(--card) 65%);
  box-shadow: 0px 0px 10px 4px color-mix(in srgb, var(--accent) 4%, transparent);
  border: 1px solid var(--border);
}
```


## `layered-gradient`

Directional gradient fill plus a stacked shadow.


```css
.card {
  background:
  linear-gradient(color-mix(in srgb, var(--accent) 6%, transparent) 0%, transparent 59.26%),
  linear-gradient(var(--card) 0%, var(--card) 100%),
  var(--card);
  box-shadow:
  20px 18px 7px color-mix(in srgb, var(--accent) 0%, transparent),
  2px 2px 2px color-mix(in srgb, var(--accent) 6.5%, transparent),
  1px 1px 2px color-mix(in srgb, var(--accent) 2%, transparent);
  border: 2px solid var(--secondary);
}
```


## `soft-shadow`

Solid fill with one wide, soft shadow. The safe default.


```css
.card {
  background: var(--card);
  box-shadow: color-mix(in srgb, var(--accent) 10%, transparent) 0px 0.706592px 0.706592px -0.666667px, color-mix(in srgb, var(--accent) 8%, transparent) 0px 1.80656px 1.80656px -1.33333px, color-mix(in srgb, var(--accent) 7%, transparent) 0px 3.62176px 3.62176px -2px, color-mix(in srgb, var(--accent) 7%, transparent) 0px 6.8656px 6.8656px -2.66667px, color-mix(in srgb, var(--accent) 5%, transparent) 0px 13.6468px 13.6468px -3.33333px, color-mix(in srgb, var(--accent) 2%, transparent) 0px 30px 30px -4px, var(--background) 0px 3px 1px 0px inset;
}
```


## `subtle-shadow`

Solid fill with a tight, low-contrast shadow.


```css
.card {
  background: var(--card);
  box-shadow: color-mix(in srgb, var(--foreground) 5%, transparent) 0px 4px 32px 0px;
}
```


## `elevated-border`

Border plus a lift shadow — reads crisp on busy backgrounds.


```css
.card {
  background: linear-gradient(180deg, color-mix(in srgb, var(--card) 100%, var(--foreground) 3%) 0%, var(--card) 100%);
  box-shadow: 0 1px 0 0 color-mix(in srgb, var(--foreground) 8%, transparent), 0 4px 6px -1px color-mix(in srgb, var(--foreground) 5%, transparent), 0 10px 15px -3px color-mix(in srgb, var(--foreground) 4%, transparent);
  border: 1px solid color-mix(in srgb, var(--foreground) 6%, transparent);
}
```


## `inner-glow`

Inset highlight along the top edge, like light catching a rim.


```css
.card {
  background: var(--card);
  box-shadow: inset 0 0 30px 0 color-mix(in srgb, var(--foreground) 4%, transparent), inset 0 1px 0 0 color-mix(in srgb, var(--foreground) 8%, transparent), 0 4px 12px -4px color-mix(in srgb, var(--foreground) 8%, transparent);
}
```


## `spotlight`

Bright top-center falloff, as if lit from above.


```css
.card {
  background:
  radial-gradient(ellipse at 0% 0%, color-mix(in srgb, var(--accent) 20%, transparent) 0%, transparent 50%),
  var(--card);
  box-shadow: inset 1px 1px 0 0 color-mix(in srgb, var(--foreground) 10%, transparent), 0 4px 16px -4px color-mix(in srgb, var(--foreground) 10%, transparent);
}
```
