# Color Themes

45 ready palettes in shadcn token names — 25 light, 20 dark. Drop one into `:root` (or `.dark`) and every component in the library re-themes, because they all read the same tokens and never hardcode a color.

## Applying one

```css
:root {
  --background: #f5f5f5;
  --foreground: #1c1c1c;
  /* …the rest of the block… */
  --radius: 0.625rem;
}
```

If the project uses Tailwind v4, expose them once via `@theme inline`:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  /* …and so on for each token… */
}
```

## How these are built

`background` / `card` / `foreground` / `primary` / `secondary` / `accent` are designed values. The rest are derived so they stay in tune with them:

- `muted` — the card color pulled a few percent toward the foreground; for recessed fills, tracks, and skeletons
- `muted-foreground` — foreground at roughly 60% toward the background; for secondary copy
- `border` / `input` — foreground at 14%, the lightest line that stays visible on both surfaces
- `ring` — the primary color, so focus states match the brand
- `*-foreground` — chosen for contrast against its own surface, never reused elsewhere

Adjusting a palette means editing the designed six and re-deriving; hand-tuning `muted` alone tends to drift out of tune with the rest.



---

# Light themes


## `darkBlue`

background · card · primary · accent — `#f5faff` `#ffffff` `#15479c` `#a8cce8`


```css
:root {
  --background: #f5faff;
  --foreground: #001122;
  --card: #ffffff;
  --card-foreground: #001122;
  --popover: #ffffff;
  --popover-foreground: #001122;
  --primary: #15479c;
  --primary-foreground: #f5faff;
  --secondary: #ffffff;
  --secondary-foreground: #001122;
  --muted: #f0f1f2;
  --muted-foreground: #5d6a76;
  --accent: #a8cce8;
  --accent-foreground: #001122;
  --destructive: #dc2626;
  --destructive-foreground: #ffffff;
  --border: #d3d9e0;
  --input: #d3d9e0;
  --ring: #15479c;
}
```


## `darkGreen`

background · card · primary · accent — `#fafffb` `#ffffff` `#0a705f` `#a8d9be`


```css
:root {
  --background: #fafffb;
  --foreground: #001a0a;
  --card: #ffffff;
  --card-foreground: #001a0a;
  --popover: #ffffff;
  --popover-foreground: #001a0a;
  --primary: #0a705f;
  --primary-foreground: #fafffb;
  --secondary: #ffffff;
  --secondary-foreground: #001a0a;
  --muted: #f0f1f0;
  --muted-foreground: #5f7166;
  --accent: #a8d9be;
  --accent-foreground: #001a0a;
  --destructive: #dc2626;
  --destructive-foreground: #ffffff;
  --border: #d7dfd9;
  --input: #d7dfd9;
  --ring: #0a705f;
}
```


## `lightRed`

background · card · primary · accent — `#fffafa` `#ffffff` `#e63946` `#f5c4c7`


```css
:root {
  --background: #fffafa;
  --foreground: #1a0000;
  --card: #ffffff;
  --card-foreground: #1a0000;
  --popover: #ffffff;
  --popover-foreground: #1a0000;
  --primary: #e63946;
  --primary-foreground: #fffafa;
  --secondary: #ffffff;
  --secondary-foreground: #1a0000;
  --muted: #f1f0f0;
  --muted-foreground: #715f5f;
  --accent: #f5c4c7;
  --accent-foreground: #1a0000;
  --destructive: #dc2626;
  --destructive-foreground: #ffffff;
  --border: #dfd7d7;
  --input: #dfd7d7;
  --ring: #e63946;
}
```


## `lightPurple`

background · card · primary · accent — `#fbfaff` `#ffffff` `#8b5cf6` `#d8cef5`


```css
:root {
  --background: #fbfaff;
  --foreground: #0f0022;
  --card: #ffffff;
  --card-foreground: #0f0022;
  --popover: #ffffff;
  --popover-foreground: #0f0022;
  --primary: #8b5cf6;
  --primary-foreground: #fbfaff;
  --secondary: #ffffff;
  --secondary-foreground: #0f0022;
  --muted: #f1f0f2;
  --muted-foreground: #695f76;
  --accent: #d8cef5;
  --accent-foreground: #0f0022;
  --destructive: #dc2626;
  --destructive-foreground: #ffffff;
  --border: #dad7e0;
  --input: #dad7e0;
  --ring: #8b5cf6;
}
```


## `warmCream`

background · card · primary · accent — `#f6f0e9` `#efe7dd` `#2b180a` `#94877c`


```css
:root {
  --background: #f6f0e9;
  --foreground: #2b180a;
  --card: #efe7dd;
  --card-foreground: #2b180a;
  --popover: #efe7dd;
  --popover-foreground: #2b180a;
  --primary: #2b180a;
  --primary-foreground: #f6f0e9;
  --secondary: #efe7dd;
  --secondary-foreground: #2b180a;
  --muted: #e3dbd0;
  --muted-foreground: #786a5f;
  --accent: #94877c;
  --accent-foreground: #2b180a;
  --destructive: #dc2626;
  --destructive-foreground: #ffffff;
  --border: #dad2ca;
  --input: #dad2ca;
  --ring: #2b180a;
}
```


## `grayBlueAccent`

background · card · primary · accent — `#f5f5f5` `#ffffff` `#1c1c1c` `#15479c`


```css
:root {
  --background: #f5f5f5;
  --foreground: #1c1c1c;
  --card: #ffffff;
  --card-foreground: #1c1c1c;
  --popover: #ffffff;
  --popover-foreground: #1c1c1c;
  --primary: #1c1c1c;
  --primary-foreground: #f5f5f5;
  --secondary: #ffffff;
  --secondary-foreground: #1c1c1c;
  --muted: #f1f1f1;
  --muted-foreground: #6e6e6e;
  --accent: #15479c;
  --accent-foreground: #ffffff;
  --destructive: #dc2626;
  --destructive-foreground: #ffffff;
  --border: #d7d7d7;
  --input: #d7d7d7;
  --ring: #1c1c1c;
}
```


## `grayGreenAccent`

background · card · primary · accent — `#f5f5f5` `#ffffff` `#1c1c1c` `#159c49`


```css
:root {
  --background: #f5f5f5;
  --foreground: #1c1c1c;
  --card: #ffffff;
  --card-foreground: #1c1c1c;
  --popover: #ffffff;
  --popover-foreground: #1c1c1c;
  --primary: #1c1c1c;
  --primary-foreground: #f5f5f5;
  --secondary: #ffffff;
  --secondary-foreground: #1c1c1c;
  --muted: #f1f1f1;
  --muted-foreground: #6e6e6e;
  --accent: #159c49;
  --accent-foreground: #ffffff;
  --destructive: #dc2626;
  --destructive-foreground: #ffffff;
  --border: #d7d7d7;
  --input: #d7d7d7;
  --ring: #1c1c1c;
}
```


## `grayRedAccent`

background · card · primary · accent — `#f5f5f5` `#ffffff` `#1c1c1c` `#e63946`


```css
:root {
  --background: #f5f5f5;
  --foreground: #1c1c1c;
  --card: #ffffff;
  --card-foreground: #1c1c1c;
  --popover: #ffffff;
  --popover-foreground: #1c1c1c;
  --primary: #1c1c1c;
  --primary-foreground: #f5f5f5;
  --secondary: #ffffff;
  --secondary-foreground: #1c1c1c;
  --muted: #f1f1f1;
  --muted-foreground: #6e6e6e;
  --accent: #e63946;
  --accent-foreground: #ffffff;
  --destructive: #dc2626;
  --destructive-foreground: #ffffff;
  --border: #d7d7d7;
  --input: #d7d7d7;
  --ring: #1c1c1c;
}
```


## `grayPurpleAccent`

background · card · primary · accent — `#f5f5f5` `#ffffff` `#1c1c1c` `#6139e6`


```css
:root {
  --background: #f5f5f5;
  --foreground: #1c1c1c;
  --card: #ffffff;
  --card-foreground: #1c1c1c;
  --popover: #ffffff;
  --popover-foreground: #1c1c1c;
  --primary: #1c1c1c;
  --primary-foreground: #f5f5f5;
  --secondary: #ffffff;
  --secondary-foreground: #1c1c1c;
  --muted: #f1f1f1;
  --muted-foreground: #6e6e6e;
  --accent: #6139e6;
  --accent-foreground: #ffffff;
  --destructive: #dc2626;
  --destructive-foreground: #ffffff;
  --border: #d7d7d7;
  --input: #d7d7d7;
  --ring: #1c1c1c;
}
```


## `warmBeige`

background · card · primary · accent — `#efebe5` `#f7f2ea` `#000000` `#ffffff`


```css
:root {
  --background: #efebe5;
  --foreground: #000000;
  --card: #f7f2ea;
  --card-foreground: #000000;
  --popover: #f7f2ea;
  --popover-foreground: #000000;
  --primary: #000000;
  --primary-foreground: #efebe5;
  --secondary: #ffffff;
  --secondary-foreground: #000000;
  --muted: #e8e3dc;
  --muted-foreground: #5b5957;
  --accent: #ffffff;
  --accent-foreground: #000000;
  --destructive: #dc2626;
  --destructive-foreground: #ffffff;
  --border: #cecac5;
  --input: #cecac5;
  --ring: #000000;
}
```


## `grayTealGreen`

background · card · primary · accent — `#f5f5f5` `#ffffff` `#1f514c` `#159c49`


```css
:root {
  --background: #f5f5f5;
  --foreground: #1c1c1c;
  --card: #ffffff;
  --card-foreground: #1c1c1c;
  --popover: #ffffff;
  --popover-foreground: #1c1c1c;
  --primary: #1f514c;
  --primary-foreground: #f5f5f5;
  --secondary: #ffffff;
  --secondary-foreground: #1c1c1c;
  --muted: #f1f1f1;
  --muted-foreground: #6e6e6e;
  --accent: #159c49;
  --accent-foreground: #ffffff;
  --destructive: #dc2626;
  --destructive-foreground: #ffffff;
  --border: #d7d7d7;
  --input: #d7d7d7;
  --ring: #1f514c;
}
```


## `grayNavyBlue`

background · card · primary · accent — `#f5f5f5` `#ffffff` `#1f3251` `#15479c`


```css
:root {
  --background: #f5f5f5;
  --foreground: #1c1c1c;
  --card: #ffffff;
  --card-foreground: #1c1c1c;
  --popover: #ffffff;
  --popover-foreground: #1c1c1c;
  --primary: #1f3251;
  --primary-foreground: #f5f5f5;
  --secondary: #ffffff;
  --secondary-foreground: #1c1c1c;
  --muted: #f1f1f1;
  --muted-foreground: #6e6e6e;
  --accent: #15479c;
  --accent-foreground: #ffffff;
  --destructive: #dc2626;
  --destructive-foreground: #ffffff;
  --border: #d7d7d7;
  --input: #d7d7d7;
  --ring: #1f3251;
}
```


## `grayBurgundyRed`

background · card · primary · accent — `#f5f5f5` `#ffffff` `#511f1f` `#e63946`


```css
:root {
  --background: #f5f5f5;
  --foreground: #1c1c1c;
  --card: #ffffff;
  --card-foreground: #1c1c1c;
  --popover: #ffffff;
  --popover-foreground: #1c1c1c;
  --primary: #511f1f;
  --primary-foreground: #f5f5f5;
  --secondary: #ffffff;
  --secondary-foreground: #1c1c1c;
  --muted: #f1f1f1;
  --muted-foreground: #6e6e6e;
  --accent: #e63946;
  --accent-foreground: #ffffff;
  --destructive: #dc2626;
  --destructive-foreground: #ffffff;
  --border: #d7d7d7;
  --input: #d7d7d7;
  --ring: #511f1f;
}
```


## `grayIndigoPurple`

background · card · primary · accent — `#f5f5f5` `#ffffff` `#341f51` `#6139e6`


```css
:root {
  --background: #f5f5f5;
  --foreground: #1c1c1c;
  --card: #ffffff;
  --card-foreground: #1c1c1c;
  --popover: #ffffff;
  --popover-foreground: #1c1c1c;
  --primary: #341f51;
  --primary-foreground: #f5f5f5;
  --secondary: #ffffff;
  --secondary-foreground: #1c1c1c;
  --muted: #f1f1f1;
  --muted-foreground: #6e6e6e;
  --accent: #6139e6;
  --accent-foreground: #ffffff;
  --destructive: #dc2626;
  --destructive-foreground: #ffffff;
  --border: #d7d7d7;
  --input: #d7d7d7;
  --ring: #341f51;
}
```


## `warmgrayPink`

background · card · primary · accent — `#f7f6f7` `#ffffff` `#1b0c25` `#ff93e4`


```css
:root {
  --background: #f7f6f7;
  --foreground: #1b0c25;
  --card: #ffffff;
  --card-foreground: #1b0c25;
  --popover: #ffffff;
  --popover-foreground: #1b0c25;
  --primary: #1b0c25;
  --primary-foreground: #f7f6f7;
  --secondary: #ffffff;
  --secondary-foreground: #1b0c25;
  --muted: #f1f0f2;
  --muted-foreground: #6f6575;
  --accent: #ff93e4;
  --accent-foreground: #1b0c25;
  --destructive: #dc2626;
  --destructive-foreground: #ffffff;
  --border: #d8d5da;
  --input: #d8d5da;
  --ring: #1b0c25;
}
```


## `warmgrayOrange`

background · card · primary · accent — `#f7f6f7` `#ffffff` `#ff6207` `#ffce93`


```css
:root {
  --background: #f7f6f7;
  --foreground: #25190c;
  --card: #ffffff;
  --card-foreground: #25190c;
  --popover: #ffffff;
  --popover-foreground: #25190c;
  --primary: #ff6207;
  --primary-foreground: #f7f6f7;
  --secondary: #ffffff;
  --secondary-foreground: #25190c;
  --muted: #f2f1f0;
  --muted-foreground: #756d65;
  --accent: #ffce93;
  --accent-foreground: #25190c;
  --destructive: #dc2626;
  --destructive-foreground: #ffffff;
  --border: #dad7d6;
  --input: #dad7d6;
  --ring: #ff6207;
}
```


## `warmgrayBlue`

background · card · primary · accent — `#f7f6f7` `#ffffff` `#0798ff` `#93c7ff`


```css
:root {
  --background: #f7f6f7;
  --foreground: #0c1325;
  --card: #ffffff;
  --card-foreground: #0c1325;
  --popover: #ffffff;
  --popover-foreground: #0c1325;
  --primary: #0798ff;
  --primary-foreground: #f7f6f7;
  --secondary: #ffffff;
  --secondary-foreground: #0c1325;
  --muted: #f0f1f2;
  --muted-foreground: #656975;
  --accent: #93c7ff;
  --accent-foreground: #0c1325;
  --destructive: #dc2626;
  --destructive-foreground: #ffffff;
  --border: #d6d6da;
  --input: #d6d6da;
  --ring: #0798ff;
}
```


## `lavenderPeach`

background · card · primary · accent — `#e3deea` `#ffffff` `#27231f` `#c68a62`


```css
:root {
  --background: #e3deea;
  --foreground: #27231f;
  --card: #ffffff;
  --card-foreground: #27231f;
  --popover: #ffffff;
  --popover-foreground: #27231f;
  --primary: #27231f;
  --primary-foreground: #e3deea;
  --secondary: #ffffff;
  --secondary-foreground: #27231f;
  --muted: #f2f2f2;
  --muted-foreground: #6e6a6c;
  --accent: #c68a62;
  --accent-foreground: #27231f;
  --destructive: #dc2626;
  --destructive-foreground: #ffffff;
  --border: #c9c4ce;
  --input: #c9c4ce;
  --ring: #27231f;
}
```


## `lavenderBlue`

background · card · primary · accent — `#e3deea` `#ffffff` `#1f2027` `#627dc6`


```css
:root {
  --background: #e3deea;
  --foreground: #1f2027;
  --card: #ffffff;
  --card-foreground: #1f2027;
  --popover: #ffffff;
  --popover-foreground: #1f2027;
  --primary: #1f2027;
  --primary-foreground: #e3deea;
  --secondary: #ffffff;
  --secondary-foreground: #1f2027;
  --muted: #f2f2f2;
  --muted-foreground: #696871;
  --accent: #627dc6;
  --accent-foreground: #ffffff;
  --destructive: #dc2626;
  --destructive-foreground: #ffffff;
  --border: #c8c3cf;
  --input: #c8c3cf;
  --ring: #1f2027;
}
```


## `warmStone`

background · card · primary · accent — `#f5f4ef` `#dad6cd` `#2a2928` `#ffffff`


```css
:root {
  --background: #f5f4ef;
  --foreground: #2a2928;
  --card: #dad6cd;
  --card-foreground: #2a2928;
  --popover: #dad6cd;
  --popover-foreground: #2a2928;
  --primary: #2a2928;
  --primary-foreground: #f5f4ef;
  --secondary: #ecebea;
  --secondary-foreground: #2a2928;
  --muted: #cfccc3;
  --muted-foreground: #777674;
  --accent: #ffffff;
  --accent-foreground: #2a2928;
  --destructive: #dc2626;
  --destructive-foreground: #ffffff;
  --border: #d9d8d3;
  --input: #d9d8d3;
  --ring: #2a2928;
}
```


## `warmStoneGray`

background · card · primary · accent — `#f5f4f0` `#ffffff` `#2c2c2c` `#8a8a8a`


```css
:root {
  --background: #f5f4f0;
  --foreground: #1a1a1a;
  --card: #ffffff;
  --card-foreground: #1a1a1a;
  --popover: #ffffff;
  --popover-foreground: #1a1a1a;
  --primary: #2c2c2c;
  --primary-foreground: #f5f4f0;
  --secondary: #f5f4f0;
  --secondary-foreground: #1a1a1a;
  --muted: #f1f1f1;
  --muted-foreground: #6d6d6b;
  --accent: #8a8a8a;
  --accent-foreground: #1a1a1a;
  --destructive: #dc2626;
  --destructive-foreground: #ffffff;
  --border: #d6d5d2;
  --input: #d6d5d2;
  --ring: #2c2c2c;
}
```


## `warmGreen`

background · card · primary · accent — `#f6f7f4` `#fffefe` `#0e3a29` `#35c18b`


```css
:root {
  --background: #f6f7f4;
  --foreground: #080908;
  --card: #fffefe;
  --card-foreground: #080908;
  --popover: #fffefe;
  --popover-foreground: #080908;
  --primary: #0e3a29;
  --primary-foreground: #fffefe;
  --secondary: #ebeee0;
  --secondary-foreground: #080908;
  --muted: #f0efef;
  --muted-foreground: #626362;
  --accent: #35c18b;
  --accent-foreground: #080908;
  --destructive: #dc2626;
  --destructive-foreground: #ffffff;
  --border: #d5d6d3;
  --input: #d5d6d3;
  --ring: #0e3a29;
}
```


## `warmSand`

background · card · primary · accent — `#fcf6ec` `#f3ede2` `#2e2521` `#b2a28b`


```css
:root {
  --background: #fcf6ec;
  --foreground: #2e2521;
  --card: #f3ede2;
  --card-foreground: #2e2521;
  --popover: #f3ede2;
  --popover-foreground: #2e2521;
  --primary: #2e2521;
  --primary-foreground: #fcf6ec;
  --secondary: #ffffff;
  --secondary-foreground: #2e2521;
  --muted: #e7e1d6;
  --muted-foreground: #7c746e;
  --accent: #b2a28b;
  --accent-foreground: #2e2521;
  --destructive: #dc2626;
  --destructive-foreground: #ffffff;
  --border: #dfd9d0;
  --input: #dfd9d0;
  --ring: #2e2521;
}
```


## `warmgrayRed`

background · card · primary · accent — `#f7f6f7` `#ffffff` `#b82b40` `#b90941`


```css
:root {
  --background: #f7f6f7;
  --foreground: #250c0d;
  --card: #ffffff;
  --card-foreground: #250c0d;
  --popover: #ffffff;
  --popover-foreground: #250c0d;
  --primary: #b82b40;
  --primary-foreground: #f7f6f7;
  --secondary: #ffffff;
  --secondary-foreground: #250c0d;
  --muted: #f2f0f0;
  --muted-foreground: #756566;
  --accent: #b90941;
  --accent-foreground: #ffffff;
  --destructive: #dc2626;
  --destructive-foreground: #ffffff;
  --border: #dad5d6;
  --input: #dad5d6;
  --ring: #b82b40;
}
```


## `grayBurgundyCoral`

background · card · primary · accent — `#f5f5f5` `#ffffff` `#511f1f` `#8f3838`


```css
:root {
  --background: #f5f5f5;
  --foreground: #1c1c1c;
  --card: #ffffff;
  --card-foreground: #1c1c1c;
  --popover: #ffffff;
  --popover-foreground: #1c1c1c;
  --primary: #511f1f;
  --primary-foreground: #f5f5f5;
  --secondary: #ffffff;
  --secondary-foreground: #1c1c1c;
  --muted: #f1f1f1;
  --muted-foreground: #6e6e6e;
  --accent: #8f3838;
  --accent-foreground: #ffffff;
  --destructive: #dc2626;
  --destructive-foreground: #ffffff;
  --border: #d7d7d7;
  --input: #d7d7d7;
  --ring: #511f1f;
}
```


---

# Dark themes


## `minimal`

background · card · primary · accent — `#0a0a0a` `#1a1a1a` `#e6e6e6` `#737373`


```css
.dark {
  --background: #0a0a0a;
  --foreground: #ffffff;
  --card: #1a1a1a;
  --card-foreground: #ffffff;
  --popover: #1a1a1a;
  --popover-foreground: #ffffff;
  --primary: #e6e6e6;
  --primary-foreground: #0a0a0a;
  --secondary: #1a1a1a;
  --secondary-foreground: #ffffffe6;
  --muted: #313131;
  --muted-foreground: #a2a2a2;
  --accent: #737373;
  --accent-foreground: #ffffff;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --border: #2c2c2c;
  --input: #2c2c2c;
  --ring: #e6e6e6;
}
```


## `minimalLightBlue`

background · card · primary · accent — `#0a0a0a` `#1a1a1a` `#cee7ff` `#737373`


```css
.dark {
  --background: #0a0a0a;
  --foreground: #f0f8ff;
  --card: #1a1a1a;
  --card-foreground: #f0f8ff;
  --popover: #1a1a1a;
  --popover-foreground: #f0f8ff;
  --primary: #cee7ff;
  --primary-foreground: #0a0a0a;
  --secondary: #1a1a1a;
  --secondary-foreground: #f0f8ffe6;
  --muted: #2f3031;
  --muted-foreground: #999ea2;
  --accent: #737373;
  --accent-foreground: #ffffff;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --border: #2a2b2c;
  --input: #2a2b2c;
  --ring: #cee7ff;
}
```


## `minimalLightGreen`

background · card · primary · accent — `#0a0a0a` `#1a1a1a` `#80da9b` `#737373`


```css
.dark {
  --background: #0a0a0a;
  --foreground: #f5fffa;
  --card: #1a1a1a;
  --card-foreground: #f5fffa;
  --popover: #1a1a1a;
  --popover-foreground: #f5fffa;
  --primary: #80da9b;
  --primary-foreground: #0a0a0a;
  --secondary: #1a1a1a;
  --secondary-foreground: #f5fffae6;
  --muted: #303130;
  --muted-foreground: #9ca29f;
  --accent: #737373;
  --accent-foreground: #ffffff;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --border: #2b2c2c;
  --input: #2b2c2c;
  --ring: #80da9b;
}
```


## `minimalLightRed`

background · card · primary · accent — `#0a0a0a` `#1a1a1a` `#ff7a7a` `#737373`


```css
.dark {
  --background: #0a0a0a;
  --foreground: #fff5f5;
  --card: #1a1a1a;
  --card-foreground: #fff5f5;
  --popover: #1a1a1a;
  --popover-foreground: #fff5f5;
  --primary: #ff7a7a;
  --primary-foreground: #0a0a0a;
  --secondary: #1a1a1a;
  --secondary-foreground: #fff5f5e6;
  --muted: #313030;
  --muted-foreground: #a29c9c;
  --accent: #737373;
  --accent-foreground: #ffffff;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --border: #2c2b2b;
  --input: #2c2b2b;
  --ring: #ff7a7a;
}
```


## `minimalLightPurple`

background · card · primary · accent — `#0a0a0a` `#1a1a1a` `#c89bff` `#737373`


```css
.dark {
  --background: #0a0a0a;
  --foreground: #f8f5ff;
  --card: #1a1a1a;
  --card-foreground: #f8f5ff;
  --popover: #1a1a1a;
  --popover-foreground: #f8f5ff;
  --primary: #c89bff;
  --primary-foreground: #0a0a0a;
  --secondary: #1a1a1a;
  --secondary-foreground: #f8f5ffe6;
  --muted: #303031;
  --muted-foreground: #9e9ca2;
  --accent: #737373;
  --accent-foreground: #ffffff;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --border: #2b2b2c;
  --input: #2b2b2c;
  --ring: #c89bff;
}
```


## `lime`

background · card · primary · accent — `#0a0a0a` `#1a1a1a` `#dfff1c` `#8b9a1b`


```css
.dark {
  --background: #0a0a0a;
  --foreground: #f5f5f5;
  --card: #1a1a1a;
  --card-foreground: #f5f5f5;
  --popover: #1a1a1a;
  --popover-foreground: #f5f5f5;
  --primary: #dfff1c;
  --primary-foreground: #0a0a0a;
  --secondary: #1a1a1a;
  --secondary-foreground: #ffffff;
  --muted: #303030;
  --muted-foreground: #9c9c9c;
  --accent: #8b9a1b;
  --accent-foreground: #f5f5f5;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --border: #2b2b2b;
  --input: #2b2b2b;
  --ring: #dfff1c;
}
```


## `gold`

background · card · primary · accent — `#0a0a0a` `#1a1a1a` `#ffdf7d` `#b8860b`


```css
.dark {
  --background: #0a0a0a;
  --foreground: #f5f5f5;
  --card: #1a1a1a;
  --card-foreground: #f5f5f5;
  --popover: #1a1a1a;
  --popover-foreground: #f5f5f5;
  --primary: #ffdf7d;
  --primary-foreground: #0a0a0a;
  --secondary: #1a1a1a;
  --secondary-foreground: #ffffff;
  --muted: #303030;
  --muted-foreground: #9c9c9c;
  --accent: #b8860b;
  --accent-foreground: #f5f5f5;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --border: #2b2b2b;
  --input: #2b2b2b;
  --ring: #ffdf7d;
}
```


## `midnightBlue`

background · card · primary · accent — `#000000` `#0c0c0c` `#106EFB` `#535353`


```css
.dark {
  --background: #000000;
  --foreground: #ffffff;
  --card: #0c0c0c;
  --card-foreground: #ffffff;
  --popover: #0c0c0c;
  --popover-foreground: #ffffff;
  --primary: #106EFB;
  --primary-foreground: #ffffff;
  --secondary: #000000;
  --secondary-foreground: #ffffff;
  --muted: #242424;
  --muted-foreground: #9e9e9e;
  --accent: #535353;
  --accent-foreground: #ffffff;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --border: #242424;
  --input: #242424;
  --ring: #106EFB;
}
```


## `blueOrangeAccent`

background · card · primary · accent — `#0a0a0a` `#1a1a1a` `#1f7cff` `#1f7cff`


```css
.dark {
  --background: #0a0a0a;
  --foreground: #ffffff;
  --card: #1a1a1a;
  --card-foreground: #ffffff;
  --popover: #1a1a1a;
  --popover-foreground: #ffffff;
  --primary: #1f7cff;
  --primary-foreground: #ffffff;
  --secondary: #010101;
  --secondary-foreground: #ffffff;
  --muted: #313131;
  --muted-foreground: #a2a2a2;
  --accent: #1f7cff;
  --accent-foreground: #ffffff;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --border: #2c2c2c;
  --input: #2c2c2c;
  --ring: #1f7cff;
}
```


## `minimalBrightOrange`

background · card · primary · accent — `#0a0a0a` `#1a1a1a` `#e34400` `#737373`


```css
.dark {
  --background: #0a0a0a;
  --foreground: #ffffff;
  --card: #1a1a1a;
  --card-foreground: #ffffff;
  --popover: #1a1a1a;
  --popover-foreground: #ffffff;
  --primary: #e34400;
  --primary-foreground: #ffffff;
  --secondary: #010101;
  --secondary-foreground: #ffffff;
  --muted: #313131;
  --muted-foreground: #a2a2a2;
  --accent: #737373;
  --accent-foreground: #ffffff;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --border: #2c2c2c;
  --input: #2c2c2c;
  --ring: #e34400;
}
```


## `lightBlue`

background · card · primary · accent — `#010912` `#152840` `#cee7ff` `#3f5c79`


```css
.dark {
  --background: #010912;
  --foreground: #e6f0ff;
  --card: #152840;
  --card-foreground: #e6f0ff;
  --popover: #152840;
  --popover-foreground: #e6f0ff;
  --primary: #cee7ff;
  --primary-foreground: #010912;
  --secondary: #0e1a29;
  --secondary-foreground: #e6f0ff;
  --muted: #2a3c53;
  --muted-foreground: #8f98a5;
  --accent: #3f5c79;
  --accent-foreground: #ffffff;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --border: #212933;
  --input: #212933;
  --ring: #cee7ff;
}
```


## `lightGreen`

background · card · primary · accent — `#000802` `#0b1a0b` `#80da9b` `#38714a`


```css
.dark {
  --background: #000802;
  --foreground: #e6ffe6;
  --card: #0b1a0b;
  --card-foreground: #e6ffe6;
  --popover: #0b1a0b;
  --popover-foreground: #e6ffe6;
  --primary: #80da9b;
  --primary-foreground: #000802;
  --secondary: #07170b;
  --secondary-foreground: #e6ffe6;
  --muted: #213121;
  --muted-foreground: #8fa18f;
  --accent: #38714a;
  --accent-foreground: #ffffff;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --border: #202b22;
  --input: #202b22;
  --ring: #80da9b;
}
```


## `lightRed`

background · card · primary · accent — `#080000` `#1e0d0d` `#ff7a7a` `#7b4242`


```css
.dark {
  --background: #080000;
  --foreground: #ffe6e6;
  --card: #1e0d0d;
  --card-foreground: #ffe6e6;
  --popover: #1e0d0d;
  --popover-foreground: #ffe6e6;
  --primary: #ff7a7a;
  --primary-foreground: #080000;
  --secondary: #1e0909;
  --secondary-foreground: #ffe6e6;
  --muted: #342323;
  --muted-foreground: #a18f8f;
  --accent: #7b4242;
  --accent-foreground: #ffffff;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --border: #2b2020;
  --input: #2b2020;
  --ring: #ff7a7a;
}
```


## `darkRed`

background · card · primary · accent — `#060000` `#1d0d0d` `#ff3d4a` `#7b2d2d`


```css
.dark {
  --background: #060000;
  --foreground: #ffe6e6;
  --card: #1d0d0d;
  --card-foreground: #ffe6e6;
  --popover: #1d0d0d;
  --popover-foreground: #ffe6e6;
  --primary: #ff3d4a;
  --primary-foreground: #ffffff;
  --secondary: #1f0a0a;
  --secondary-foreground: #ffe6e6;
  --muted: #342323;
  --muted-foreground: #a08f8f;
  --accent: #7b2d2d;
  --accent-foreground: #ffffff;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --border: #292020;
  --input: #292020;
  --ring: #ff3d4a;
}
```


## `lightPurple`

background · card · primary · accent — `#050012` `#040121` `#c89bff` `#684f7b`


```css
.dark {
  --background: #050012;
  --foreground: #f0e6ff;
  --card: #040121;
  --card-foreground: #f0e6ff;
  --popover: #040121;
  --popover-foreground: #f0e6ff;
  --primary: #c89bff;
  --primary-foreground: #050012;
  --secondary: #1d123b;
  --secondary-foreground: #f0e6ff;
  --muted: #1c1837;
  --muted-foreground: #978fa5;
  --accent: #684f7b;
  --accent-foreground: #ffffff;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --border: #262033;
  --input: #262033;
  --ring: #c89bff;
}
```


## `lightOrange`

background · card · primary · accent — `#080200` `#1a0d0b` `#ffaa70` `#7b5e4a`


```css
.dark {
  --background: #080200;
  --foreground: #ffe6d5;
  --card: #1a0d0b;
  --card-foreground: #ffe6d5;
  --popover: #1a0d0b;
  --popover-foreground: #ffe6d5;
  --primary: #ffaa70;
  --primary-foreground: #080200;
  --secondary: #170b07;
  --secondary-foreground: #ffe6d5;
  --muted: #31231f;
  --muted-foreground: #a18f84;
  --accent: #7b5e4a;
  --accent-foreground: #ffffff;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --border: #2b221e;
  --input: #2b221e;
  --ring: #ffaa70;
}
```


## `deepBlue`

background · card · primary · accent — `#020617` `#0f172a` `#c4d8f9` `#2d30f3`


```css
.dark {
  --background: #020617;
  --foreground: #e2e8f0;
  --card: #0f172a;
  --card-foreground: #e2e8f0;
  --popover: #0f172a;
  --popover-foreground: #e2e8f0;
  --primary: #c4d8f9;
  --primary-foreground: #020617;
  --secondary: #041633;
  --secondary-foreground: #e2e8f0;
  --muted: #242c3e;
  --muted-foreground: #8d929e;
  --accent: #2d30f3;
  --accent-foreground: #ffffff;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --border: #212635;
  --input: #212635;
  --ring: #c4d8f9;
}
```


## `violet`

background · card · primary · accent — `#030128` `#241f48` `#ffffff` `#44358a`


```css
.dark {
  --background: #030128;
  --foreground: #ffffff;
  --card: #241f48;
  --card-foreground: #ffffff;
  --popover: #241f48;
  --popover-foreground: #ffffff;
  --primary: #ffffff;
  --primary-foreground: #030128;
  --secondary: #131136;
  --secondary-foreground: #d5d4f6;
  --muted: #3a355a;
  --muted-foreground: #9f9ead;
  --accent: #44358a;
  --accent-foreground: #ffffff;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --border: #262546;
  --input: #262546;
  --ring: #ffffff;
}
```


## `ruby`

background · card · primary · accent — `#000000` `#481f1f` `#ffffff` `#51000b`


```css
.dark {
  --background: #000000;
  --foreground: #ffffff;
  --card: #481f1f;
  --card-foreground: #ffffff;
  --popover: #481f1f;
  --popover-foreground: #ffffff;
  --primary: #ffffff;
  --primary-foreground: #280101;
  --secondary: #361311;
  --secondary-foreground: #f6d4d4;
  --muted: #5a3535;
  --muted-foreground: #9e9e9e;
  --accent: #51000b;
  --accent-foreground: #ffffff;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --border: #242424;
  --input: #242424;
  --ring: #ffffff;
}
```


## `emerald`

background · card · primary · accent — `#000000` `#1f4035` `#ffffff` `#0d5238`


```css
.dark {
  --background: #000000;
  --foreground: #ffffff;
  --card: #1f4035;
  --card-foreground: #ffffff;
  --popover: #1f4035;
  --popover-foreground: #ffffff;
  --primary: #ffffff;
  --primary-foreground: #051a12;
  --secondary: #0d2b1f;
  --secondary-foreground: #d4f6e8;
  --muted: #355349;
  --muted-foreground: #9e9e9e;
  --accent: #0d5238;
  --accent-foreground: #ffffff;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --border: #242424;
  --input: #242424;
  --ring: #ffffff;
}
```
