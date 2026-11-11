# Primary Button Styles

23 primary-button treatments. Paste one as `.btn-primary` into your global CSS. Section components already put `btn-primary` / `btn-secondary` on their buttons, so they pick it up with no markup changes; in your own markup use `className="btn-primary h-10 px-6 rounded-lg"`.

These are surface styles only — they compose with any of the animated button components, which handle motion and leave the fill to CSS.

Every snippet reads shadcn tokens, so it adapts to whatever palette the project defines and works in light and dark mode unchanged.


## `gradient`


```css
.btn-primary {
  background: linear-gradient(to bottom, color-mix(in srgb, var(--primary) 75%, transparent), var(--primary));
  box-shadow: color-mix(in srgb, var(--background) 25%, transparent) 0px 1px 1px 0px inset, color-mix(in srgb, var(--primary) 15%, transparent) 3px 3px 3px 0px;
}
```


## `shadow`


```css
.btn-primary {
  background: var(--primary);
  box-shadow: 2.10837px 3.16256px 9.48767px color-mix(in srgb, var(--primary) 40%, transparent);
}
```


## `flat`


```css
.btn-primary {
  background: var(--primary);
}
```


## `radial-glow`


```css
.btn-primary {
  background:
  radial-gradient(circle at 0% 0%, color-mix(in srgb, var(--background) 32.5%, transparent) 0%, transparent 45%),
  radial-gradient(circle at 100% 100%, color-mix(in srgb, var(--background) 32.5%, transparent) 0%, transparent 45%),
  var(--primary);
  box-shadow: 2.10837px 3.16256px 9.48767px color-mix(in srgb, var(--accent) 30%, transparent);
}
```


## `diagonal-gradient`


```css
.btn-primary {
  background: linear-gradient(to bottom right, color-mix(in srgb, var(--primary) 80%, transparent), var(--foreground));
  box-shadow: 2.10837px 3.16256px 9.48767px color-mix(in srgb, var(--accent) 30%, transparent);
}
```


## `double-inset`


```css
.btn-primary {
  background: var(--primary);
  box-shadow: color-mix(in srgb, var(--background) 15%, transparent) 0px 4px 10px 0px inset, color-mix(in srgb, var(--background) 15%, transparent) 0px -4px 8px 0px inset;
}
```


## `primary-glow`


```css
.btn-primary {
  background: var(--primary);
  box-shadow: color-mix(in srgb, var(--background) 20%, transparent) 0px 3px 1px 0px inset, color-mix(in srgb, var(--primary) 13%, transparent) 0px 0.839802px 0.503881px -0.3125px, color-mix(in srgb, var(--primary) 13%, transparent) 0px 1.99048px 1.19429px -0.625px, color-mix(in srgb, var(--primary) 13%, transparent) 0px 3.63084px 2.1785px -0.9375px, color-mix(in srgb, var(--primary) 13%, transparent) 0px 6.03627px 3.62176px -1.25px, color-mix(in srgb, var(--primary) 13%, transparent) 0px 9.74808px 5.84885px -1.5625px, color-mix(in srgb, var(--primary) 13%, transparent) 0px 15.9566px 9.57398px -1.875px, color-mix(in srgb, var(--primary) 13%, transparent) 0px 27.4762px 16.4857px -2.1875px, color-mix(in srgb, var(--primary) 13%, transparent) 0px 50px 30px -2.5px;
}
```


## `inset-glow`


```css
.btn-primary {
  background: linear-gradient(180deg, color-mix(in srgb, var(--primary) 65%, var(--background)) -35%, var(--primary) 65%);
  box-shadow: 0 10px 18px -7px color-mix(in srgb, var(--background) 50%, transparent), inset 0 1px 0 0 color-mix(in srgb, var(--foreground) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--foreground) 20%, transparent);
}
```


## `soft-glow`


```css
.btn-primary {
  background: radial-gradient(ellipse at 50% -20%, color-mix(in srgb, var(--primary) 70%, var(--foreground)) 0%, var(--primary) 70%);
  box-shadow: 0 8px 24px -6px color-mix(in srgb, var(--primary) 35%, transparent), inset 0 1px 0 0 color-mix(in srgb, var(--foreground) 20%, transparent);
}
```


## `glass-shimmer`


```css
.btn-primary {
  background: linear-gradient(165deg, color-mix(in srgb, var(--primary) 85%, var(--foreground)) 0%, var(--primary) 40%, color-mix(in srgb, var(--primary) 90%, var(--background)) 100%);
  box-shadow: inset 0 1px 1px 0 color-mix(in srgb, var(--foreground) 25%, transparent), inset 0 -1px 1px 0 color-mix(in srgb, var(--background) 15%, transparent), 0 4px 12px -2px color-mix(in srgb, var(--primary) 25%, transparent);
}
```


## `neon-outline`


```css
.btn-primary {
  background: var(--primary);
  box-shadow: 0 0 5px color-mix(in srgb, var(--accent) 50%, transparent), 0 0 15px color-mix(in srgb, var(--accent) 30%, transparent), 0 0 30px color-mix(in srgb, var(--accent) 15%, transparent), inset 0 0 8px color-mix(in srgb, var(--accent) 10%, transparent);
}
```


## `lifted`


```css
.btn-primary {
  background: linear-gradient(180deg, color-mix(in srgb, var(--primary) 95%, var(--foreground)) 0%, var(--primary) 50%, color-mix(in srgb, var(--primary) 95%, var(--background)) 100%);
  box-shadow: inset 0 2px 3px 0 color-mix(in srgb, var(--foreground) 20%, transparent), inset 0 -2px 3px 0 color-mix(in srgb, var(--background) 25%, transparent), 0 2px 4px -1px color-mix(in srgb, var(--background) 40%, transparent);
}
```


## `depth-layers`


```css
.btn-primary {
  background: var(--primary);
  box-shadow: 0 1px 2px color-mix(in srgb, var(--primary) 20%, transparent), 0 2px 4px color-mix(in srgb, var(--primary) 20%, transparent), 0 4px 8px color-mix(in srgb, var(--primary) 15%, transparent), 0 8px 16px color-mix(in srgb, var(--primary) 10%, transparent), 0 16px 32px color-mix(in srgb, var(--primary) 5%, transparent);
}
```


## `accent-edge`


```css
.btn-primary {
  background: linear-gradient(180deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 90%, var(--background)) 100%);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent) 60%, transparent), 0 4px 12px -2px color-mix(in srgb, var(--accent) 35%, transparent), inset 0 1px 0 0 color-mix(in srgb, var(--foreground) 20%, transparent);
}
```


## `metallic`


```css
.btn-primary {
  background: linear-gradient(135deg, color-mix(in srgb, var(--primary) 80%, var(--foreground)) 0%, var(--primary) 25%, color-mix(in srgb, var(--primary) 90%, var(--background)) 50%, var(--primary) 75%, color-mix(in srgb, var(--primary) 85%, var(--foreground)) 100%);
  box-shadow: inset 0 1px 0 0 color-mix(in srgb, var(--foreground) 30%, transparent), 0 3px 8px -2px color-mix(in srgb, var(--background) 50%, transparent);
}
```


## `glow-highlight`


```css
.btn-primary {
  background: var(--primary);
  box-shadow: 0 1px 2px color-mix(in srgb, var(--foreground) 10%, transparent), 0 3px 5px color-mix(in srgb, var(--primary) 50%, transparent), inset 0 1px 0 0 color-mix(in srgb, var(--background) 25%, transparent);
}
```


## `top-highlight`


```css
.btn-primary {
  background: linear-gradient(180deg, color-mix(in srgb, var(--primary) 80%, var(--background)) 0%, var(--primary) 50%);
  box-shadow: inset 0 1px 0 0 color-mix(in srgb, var(--background) 25%, transparent);
}
```


## `primary-glow-left`


```css
.btn-primary {
  background: var(--primary);
  box-shadow: color-mix(in srgb, var(--background) 20%, transparent) 0px 3px 1px 0px inset, color-mix(in srgb, var(--primary) 13%, transparent) -1.26px 0.839802px 0.503881px -0.3125px, color-mix(in srgb, var(--primary) 13%, transparent) -3px 1.99048px 1.19429px -0.625px, color-mix(in srgb, var(--primary) 13%, transparent) -5.4px 3.63084px 2.1785px -0.9375px, color-mix(in srgb, var(--primary) 13%, transparent) -9px 6.03627px 3.62176px -1.25px, color-mix(in srgb, var(--primary) 13%, transparent) -14.6px 9.74808px 5.84885px -1.5625px, color-mix(in srgb, var(--primary) 13%, transparent) -24px 15.9566px 9.57398px -1.875px, color-mix(in srgb, var(--primary) 13%, transparent) -41px 27.4762px 16.4857px -2.1875px, color-mix(in srgb, var(--primary) 13%, transparent) -75px 50px 30px -2.5px;
}
```


## `edge-highlight`


```css
.btn-primary {
  background: var(--primary);
  box-shadow: inset 0px 1px 0px 0px color-mix(in srgb, var(--foreground) 25%, transparent), inset 0px -1px 0px 0px color-mix(in srgb, var(--foreground) 25%, transparent);
}
```


## `inset-border`


```css
.btn-primary {
  background: var(--primary);
  box-shadow: inset 0px 1px 0px 0px var(--primary), inset 0px -1px 0px 0px var(--primary), inset 0px 2px 0px 0px color-mix(in srgb, var(--background) 25%, transparent), inset 0px -2px 0px 0px color-mix(in srgb, var(--background) 25%, transparent);
}
```


## `inset-border-sharp`


```css
.btn-primary {
  background: var(--primary);
  box-shadow: inset 0px 0px 0px 1px var(--primary), inset 0px 0px 0px 2px color-mix(in srgb, var(--background) 25%, transparent);
}
```


## `primary-glow-flat`


```css
.btn-primary {
  background: var(--primary);
  box-shadow: color-mix(in srgb, var(--primary) 13%, transparent) 0px 0.839802px 0.503881px -0.3125px, color-mix(in srgb, var(--primary) 13%, transparent) 0px 1.99048px 1.19429px -0.625px, color-mix(in srgb, var(--primary) 13%, transparent) 0px 3.63084px 2.1785px -0.9375px, color-mix(in srgb, var(--primary) 13%, transparent) 0px 6.03627px 3.62176px -1.25px, color-mix(in srgb, var(--primary) 13%, transparent) 0px 9.74808px 5.84885px -1.5625px, color-mix(in srgb, var(--primary) 13%, transparent) 0px 15.9566px 9.57398px -1.875px, color-mix(in srgb, var(--primary) 13%, transparent) 0px 27.4762px 16.4857px -2.1875px, color-mix(in srgb, var(--primary) 13%, transparent) 0px 50px 30px -2.5px;
}
```


## `primary-glow-flat-left`


```css
.btn-primary {
  background: var(--primary);
  box-shadow: color-mix(in srgb, var(--primary) 13%, transparent) -1.26px 0.839802px 0.503881px -0.3125px, color-mix(in srgb, var(--primary) 13%, transparent) -3px 1.99048px 1.19429px -0.625px, color-mix(in srgb, var(--primary) 13%, transparent) -5.4px 3.63084px 2.1785px -0.9375px, color-mix(in srgb, var(--primary) 13%, transparent) -9px 6.03627px 3.62176px -1.25px, color-mix(in srgb, var(--primary) 13%, transparent) -14.6px 9.74808px 5.84885px -1.5625px, color-mix(in srgb, var(--primary) 13%, transparent) -24px 15.9566px 9.57398px -1.875px, color-mix(in srgb, var(--primary) 13%, transparent) -41px 27.4762px 16.4857px -2.1875px, color-mix(in srgb, var(--primary) 13%, transparent) -75px 50px 30px -2.5px;
}
```


---

# Secondary Button Styles

The quieter counterpart. A secondary button should read as clearly subordinate to the primary — if both compete, neither is a call to action.


## `glass`


```css
.btn-secondary {
  backdrop-filter: blur(8px);
  background: linear-gradient(to bottom right, color-mix(in srgb, var(--secondary) 80%, transparent), var(--secondary));
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  border: 1px solid var(--secondary);
}
```


## `solid`

Flat fill, no border or shadow. The quietest option.


```css
.btn-secondary {
  background: var(--secondary);
}
```


## `layered`


```css
.btn-secondary {
  background:
  linear-gradient(color-mix(in srgb, var(--accent) 5%, transparent) 0%, transparent 59.26%),
  linear-gradient(var(--secondary), var(--secondary)),
  linear-gradient(var(--secondary), var(--secondary)),
  linear-gradient(color-mix(in srgb, var(--accent) 5%, transparent) 0%, transparent 59.26%),
  linear-gradient(color-mix(in srgb, var(--secondary) 60%, transparent), color-mix(in srgb, var(--secondary) 60%, transparent)),
  var(--secondary);
  box-shadow:
  2.10837px 3.16256px 9.48767px color-mix(in srgb, var(--accent) 10%, transparent);
  border: 1px solid var(--secondary);
}
```


## `radial-glow`


```css
.btn-secondary {
  background:
  radial-gradient(circle at 0% 0%, color-mix(in srgb, var(--accent) 15%, transparent) 0%, transparent 40%),
  radial-gradient(circle at 100% 100%, color-mix(in srgb, var(--accent) 15%, transparent) 0%, transparent 40%),
  var(--secondary);
  box-shadow: 2.10837px 3.16256px 9.48767px color-mix(in srgb, var(--accent) 10%, transparent);
}
```
