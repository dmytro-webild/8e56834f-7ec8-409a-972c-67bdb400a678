# 07 — Style Packs (Card & Button Looks)

Opt-in surface styles. The components ship with plain shadcn-style surfaces (`bg-card border shadow-sm`, `bg-primary`), which look correct in any project. A style pack upgrades that flat look into a designed one.

## How to apply a pack

Paste the pack's CSS into your global stylesheet, then use the class instead of the utility trio:

```diff
- <div className="bg-card text-card-foreground border shadow-sm rounded-xl p-6">
+ <div className="card rounded-xl p-6">
```

```diff
- <button className="bg-primary text-primary-foreground rounded-lg h-10 px-6">
+ <button className="btn-primary rounded-lg h-10 px-6">
```

The CSS below reads shadcn tokens (`--card`, `--primary`, `--background`, `--foreground`, `--secondary`, `--accent`), so a pack inherits whatever palette the project already defines and works in light and dark mode without edits. Set `--radius` to the pack's value to match its shape.

`color-mix(in srgb, X N%, transparent)` is how these packs tint shadows with the theme color instead of hardcoding black — that is what makes the depth read as designed rather than generic.

## Picking one

| Want | Pack |
|---|---|
| Clean, almost flat | `minimal`, `elevated` |
| Soft depth, friendly | `soft`, `shadow` |
| Frosted / translucent | `glass` |
| Rich color, saturated | `gradient`, `layered` |
| Premium, shiny | `metallic` |
| High contrast, punchy | `bold`, `neon` |
| Editorial, no radius | `elegant` |

Each pack also names the button component it was designed against (`ButtonExpand`, `ButtonMagnetic`, …) — pairing them is optional but the combinations were tuned together.

---

## Bold (`bold`)

Bold Style - Strong presence, confident design

- `--radius: 0.5rem` · font `"Montserrat", sans-serif` · pairs with the **default** button component


```css
.card {
  background: var(--card);
  box-shadow: color-mix(in srgb, var(--foreground) 5%, transparent) 0px 4px 32px 0px;
}
```


```css
.btn-primary {
  background: var(--primary);
  box-shadow: color-mix(in srgb, var(--background) 20%, transparent) 0px 3px 1px 0px inset, color-mix(in srgb, var(--primary) 13%, transparent) -1.26px 0.839802px 0.503881px -0.3125px, color-mix(in srgb, var(--primary) 13%, transparent) -3px 1.99048px 1.19429px -0.625px, color-mix(in srgb, var(--primary) 13%, transparent) -5.4px 3.63084px 2.1785px -0.9375px, color-mix(in srgb, var(--primary) 13%, transparent) -9px 6.03627px 3.62176px -1.25px, color-mix(in srgb, var(--primary) 13%, transparent) -14.6px 9.74808px 5.84885px -1.5625px, color-mix(in srgb, var(--primary) 13%, transparent) -24px 15.9566px 9.57398px -1.875px, color-mix(in srgb, var(--primary) 13%, transparent) -41px 27.4762px 16.4857px -2.1875px, color-mix(in srgb, var(--primary) 13%, transparent) -75px 50px 30px -2.5px;
}
```


```css
.btn-secondary {
  background: var(--secondary);
}
```

---

## Elegant (`elegant`)

Elegant Style - Timeless serif, refined luxury

- `--radius: 0` · font `"Inter", sans-serif` · pairs with the **default** button component


```css
.card {
  background: var(--card);
  border: 1px solid color-mix(in srgb, var(--foreground) 10%, transparent);
}
```


```css
.btn-primary {
  background: linear-gradient(180deg, color-mix(in srgb, var(--primary) 80%, var(--background)) 0%, var(--primary) 50%);
  box-shadow: inset 0 1px 0 0 color-mix(in srgb, var(--background) 25%, transparent);
}
```


```css
.btn-secondary {
  background: var(--secondary);
}
```

---

## Elevated (`elevated`)

Elevated Style - Stacked depth, dimensional design

- `--radius: 0.75rem` · font `"Figtree", sans-serif` · pairs with the **default** button component


```css
.card {
  background: var(--card);
}
```


```css
.btn-primary {
  background: var(--primary);
  box-shadow: 0 1px 2px color-mix(in srgb, var(--primary) 20%, transparent), 0 2px 4px color-mix(in srgb, var(--primary) 20%, transparent), 0 4px 8px color-mix(in srgb, var(--primary) 15%, transparent), 0 8px 16px color-mix(in srgb, var(--primary) 10%, transparent), 0 16px 32px color-mix(in srgb, var(--primary) 5%, transparent);
}
```


```css
.btn-secondary {
  background: var(--secondary);
}
```

---

## Glass (`glass`)

Glass Style - Soft, translucent, frosted effect

- `--radius: 1.5rem` · font `"Inter Tight", sans-serif` · pairs with the **expand** button component


```css
.card {
  backdrop-filter: blur(8px);
  background: linear-gradient(to bottom right, color-mix(in srgb, var(--card) 80%, transparent), color-mix(in srgb, var(--card) 40%, transparent));
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  border: 1px solid var(--card);
}
```


```css
.btn-primary {
  background: linear-gradient(165deg, color-mix(in srgb, var(--primary) 85%, var(--foreground)) 0%, var(--primary) 40%, color-mix(in srgb, var(--primary) 90%, var(--background)) 100%);
  box-shadow: inset 0 1px 1px 0 color-mix(in srgb, var(--foreground) 25%, transparent), inset 0 -1px 1px 0 color-mix(in srgb, var(--background) 15%, transparent), 0 4px 12px -2px color-mix(in srgb, var(--primary) 25%, transparent);
}
```


```css
.btn-secondary {
  backdrop-filter: blur(8px);
  background: linear-gradient(to bottom right, color-mix(in srgb, var(--secondary) 80%, transparent), var(--secondary));
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  border: 1px solid var(--secondary);
}
```

---

## Gradient (`gradient`)

Gradient Style - Colorful gradients, layered effects

- `--radius: 1.5rem` · font `"Poppins", sans-serif` · pairs with the **slide** button component


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


```css
.btn-primary {
  background: linear-gradient(to bottom, color-mix(in srgb, var(--primary) 75%, transparent), var(--primary));
  box-shadow: color-mix(in srgb, var(--background) 25%, transparent) 0px 1px 1px 0px inset, color-mix(in srgb, var(--primary) 15%, transparent) 3px 3px 3px 0px;
}
```


```css
.btn-secondary {
  background:
    linear-gradient(color-mix(in srgb, var(--accent) 5%, transparent) 0%, transparent 59.26%),
    linear-gradient(var(--secondary), var(--secondary)),
    linear-gradient(var(--secondary), var(--secondary)),
    linear-gradient(color-mix(in srgb, var(--accent) 5%, transparent) 0%, transparent 59.26%),
    linear-gradient(color-mix(in srgb, var(--secondary) 60%, transparent), color-mix(in srgb, var(--secondary) 60%, transparent)),
    var(--secondary);
  box-shadow: 2.10837px 3.16256px 9.48767px color-mix(in srgb, var(--primary) 10%, transparent);
  border: 1px solid var(--secondary);
}
```

---

## Layered (`layered`)

Layered Style - Gradient layers, dimensional depth

- `--radius: 1.5rem` · font `"Inter Tight", sans-serif` · pairs with the **expand** button component


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


```css
.btn-primary {
  background: linear-gradient(180deg, color-mix(in srgb, var(--primary) 65%, var(--background)) -35%, var(--primary) 65%);
  box-shadow: 0 10px 18px -7px color-mix(in srgb, var(--background) 50%, transparent), inset 0 1px 0 0 color-mix(in srgb, var(--foreground) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--foreground) 20%, transparent);
}
```


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
    2.10837px 3.16256px 9.48767px color-mix(in srgb, var(--primary) 10%, transparent);
  border: 1px solid var(--secondary);
}
```

---

## Metallic (`metallic`)

Metallic Style - Shiny, chrome-like, premium feel

- `--radius: 0.75rem` · font `"Inter Tight", sans-serif` · pairs with the **pill** button component


```css
.card {
  background: var(--card);
  box-shadow: inset 0 0 30px 0 color-mix(in srgb, var(--foreground) 4%, transparent), inset 0 1px 0 0 color-mix(in srgb, var(--foreground) 8%, transparent), 0 4px 12px -4px color-mix(in srgb, var(--foreground) 8%, transparent);
}
```


```css
.btn-primary {
  background: linear-gradient(135deg, color-mix(in srgb, var(--primary) 80%, var(--foreground)) 0%, var(--primary) 25%, color-mix(in srgb, var(--primary) 90%, var(--background)) 50%, var(--primary) 75%, color-mix(in srgb, var(--primary) 85%, var(--foreground)) 100%);
  box-shadow: inset 0 1px 0 0 color-mix(in srgb, var(--foreground) 30%, transparent), 0 3px 8px -2px color-mix(in srgb, var(--background) 50%, transparent);
}
```


```css
.btn-secondary {
  background: var(--secondary);
}
```

---

## Minimal (`minimal`)

Minimal Style - Clean, simple, outline-based

- `--radius: 0.5rem` · font `"Inter", sans-serif` · pairs with the **default** button component


```css
.card {
  background: var(--card);
  box-shadow: color-mix(in srgb, var(--primary) 5%, transparent) 0px 0.706592px 0.706592px -0.666667px, color-mix(in srgb, var(--primary) 3%, transparent) 0px 1.80656px 1.80656px -1.33333px, color-mix(in srgb, var(--primary) 2%, transparent) 0px 3.62176px 3.62176px -2px, color-mix(in srgb, var(--primary) 2%, transparent) 0px 6.8656px 6.8656px -2.66667px, color-mix(in srgb, var(--primary) 2%, transparent) 0px 13.6468px 13.6468px -3.33333px, color-mix(in srgb, var(--primary) 2%, transparent) 0px 30px 30px -4px;
}
```


```css
.btn-primary {
  background: var(--primary);
}
```


```css
.btn-secondary {
  background: var(--secondary);
}
```

---

## Neon (`neon`)

Neon Style - Glowing borders, cyberpunk aesthetic

- `--radius: 0.5rem` · font `"Montserrat", sans-serif` · pairs with the **magnetic** button component


```css
.card {
  background: var(--card);
  box-shadow: inset 0 0 30px 0 color-mix(in srgb, var(--foreground) 4%, transparent), inset 0 1px 0 0 color-mix(in srgb, var(--foreground) 8%, transparent), 0 4px 12px -4px color-mix(in srgb, var(--foreground) 8%, transparent);
}
```


```css
.btn-primary {
  background: var(--primary);
  box-shadow: 0 1px 2px color-mix(in srgb, var(--foreground) 10%, transparent), 0 3px 5px color-mix(in srgb, var(--primary) 50%, transparent), inset 0 1px 0 0 color-mix(in srgb, var(--background) 25%, transparent);
}
```


```css
.btn-secondary {
  background: var(--secondary);
}
```

---

## Shadow (`shadow`)

Shadow Style - Dramatic depth, layered shadows

- `--radius: 0.75rem` · font `"Plus Jakarta Sans", sans-serif` · pairs with the **bounce** button component


```css
.card {
  backdrop-filter: blur(8px);
  background: linear-gradient(to bottom right, color-mix(in srgb, var(--card) 80%, transparent), color-mix(in srgb, var(--card) 40%, transparent));
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  border: 1px solid var(--card);
}
```


```css
.btn-primary {
  background: var(--primary);
  box-shadow: color-mix(in srgb, var(--background) 20%, transparent) 0px 3px 1px 0px inset, color-mix(in srgb, var(--primary) 13%, transparent) 0px 0.839802px 0.503881px -0.3125px, color-mix(in srgb, var(--primary) 13%, transparent) 0px 1.99048px 1.19429px -0.625px, color-mix(in srgb, var(--primary) 13%, transparent) 0px 3.63084px 2.1785px -0.9375px, color-mix(in srgb, var(--primary) 13%, transparent) 0px 6.03627px 3.62176px -1.25px, color-mix(in srgb, var(--primary) 13%, transparent) 0px 9.74808px 5.84885px -1.5625px, color-mix(in srgb, var(--primary) 13%, transparent) 0px 15.9566px 9.57398px -1.875px, color-mix(in srgb, var(--primary) 13%, transparent) 0px 27.4762px 16.4857px -2.1875px, color-mix(in srgb, var(--primary) 13%, transparent) 0px 50px 30px -2.5px;
}
```


```css
.btn-secondary {
  background:
    linear-gradient(color-mix(in srgb, var(--accent) 5%, transparent) 0%, transparent 59.26%),
    linear-gradient(var(--secondary), var(--secondary)),
    linear-gradient(var(--secondary), var(--secondary)),
    linear-gradient(color-mix(in srgb, var(--accent) 5%, transparent) 0%, transparent 59.26%),
    linear-gradient(color-mix(in srgb, var(--secondary) 60%, transparent), color-mix(in srgb, var(--secondary) 60%, transparent)),
    var(--secondary);
  box-shadow: 2.10837px 3.16256px 9.48767px color-mix(in srgb, var(--primary) 10%, transparent);
  border: 1px solid var(--secondary);
}
```

---

## Soft (`soft`)

Soft Style - Subtle shadows, gentle depth

- `--radius: 1.5rem` · font `"DM Sans", sans-serif` · pairs with the **bounce** button component


```css
.card {
  background: var(--card);
  box-shadow: color-mix(in srgb, var(--primary) 5%, transparent) 0px 0.706592px 0.706592px -0.666667px, color-mix(in srgb, var(--primary) 3%, transparent) 0px 1.80656px 1.80656px -1.33333px, color-mix(in srgb, var(--primary) 2%, transparent) 0px 3.62176px 3.62176px -2px, color-mix(in srgb, var(--primary) 2%, transparent) 0px 6.8656px 6.8656px -2.66667px, color-mix(in srgb, var(--primary) 2%, transparent) 0px 13.6468px 13.6468px -3.33333px, color-mix(in srgb, var(--primary) 2%, transparent) 0px 30px 30px -4px;
}
```


```css
.btn-primary {
  background: linear-gradient(180deg, color-mix(in srgb, var(--primary) 95%, var(--foreground)) 0%, var(--primary) 50%, color-mix(in srgb, var(--primary) 95%, var(--background)) 100%);
  box-shadow: inset 0 2px 3px 0 color-mix(in srgb, var(--foreground) 20%, transparent), inset 0 -2px 3px 0 color-mix(in srgb, var(--background) 25%, transparent), 0 2px 4px -1px color-mix(in srgb, var(--background) 40%, transparent);
}
```


```css
.btn-secondary {
  background: var(--secondary);
}
```
