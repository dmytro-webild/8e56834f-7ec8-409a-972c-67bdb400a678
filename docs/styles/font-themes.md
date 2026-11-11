# Font Themes

19 single fonts and 13 pairings. Type does more for perceived quality than any other single choice — a default system stack reads as unfinished no matter how good the layout is.

## Applying one

Framework-agnostic (CSS import at the top of your global stylesheet):

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');

:root { --font-sans: "Inter", sans-serif; }

body { font-family: var(--font-sans); }
```

Tailwind v4 — expose it as a theme token so `font-sans` picks it up:

```css
@theme inline {
  --font-sans: "Inter", sans-serif;
}
```

Next.js — use `next/font` instead of a CSS import so the font is self-hosted and preloaded (no layout shift, no third-party request). Each entry below carries its `next/font` form.

## Pairing rules

- **Two families maximum.** One for headings, one for body. A third almost always reads as a mistake.
- **Contrast the roles, not the mood.** A geometric heading over a neutral body works; two neutral sans fonts just look like a bug.
- **Body font first.** Pick what is comfortable at 16px in a paragraph, then choose a heading font that complements it.
- **Same family, different weight** is a legitimate pairing — often the safest one.

---

# Pairings


## Inter + Open Sans

Neutral headings with friendly body. Clean and approachable.


```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@100..900&display=swap');

@theme inline {
  --font-sans: "Open Sans", sans-serif;
  --font-heading: "Inter", sans-serif;
}

body { font-family: var(--font-sans); }
h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading); }
```

<details><summary>next/font form</summary>

```tsx
import { Inter } from "next/font/google";
import { Open_Sans } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});
```

</details>


## DM Sans + Inter

Modern geometric headings with neutral body. Contemporary and clean.


```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@100..900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');

@theme inline {
  --font-sans: "Inter", sans-serif;
  --font-heading: "DM Sans", sans-serif;
}

body { font-family: var(--font-sans); }
h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading); }
```

<details><summary>next/font form</summary>

```tsx
import { DM_Sans } from "next/font/google";
import { Inter } from "next/font/google";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});
```

</details>


## Manrope + DM Sans

Geometric headings with clean body. Modern and professional.


```css
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@100..900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@100..900&display=swap');

@theme inline {
  --font-sans: "DM Sans", sans-serif;
  --font-heading: "Manrope", sans-serif;
}

body { font-family: var(--font-sans); }
h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading); }
```

<details><summary>next/font form</summary>

```tsx
import { Manrope } from "next/font/google";
import { DM_Sans } from "next/font/google";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});
```

</details>


## Public Sans + Inter

Government-inspired headings with neutral body. Professional and trustworthy.


```css
@import url('https://fonts.googleapis.com/css2?family=Public+Sans:wght@100..900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');

@theme inline {
  --font-sans: "Inter", sans-serif;
  --font-heading: "Public Sans", sans-serif;
}

body { font-family: var(--font-sans); }
h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading); }
```

<details><summary>next/font form</summary>

```tsx
import { Public_Sans } from "next/font/google";
import { Inter } from "next/font/google";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});
```

</details>


## Mulish + Inter

Minimal headings with neutral body. Clean and modern.


```css
@import url('https://fonts.googleapis.com/css2?family=Mulish:wght@100..900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');

@theme inline {
  --font-sans: "Inter", sans-serif;
  --font-heading: "Mulish", sans-serif;
}

body { font-family: var(--font-sans); }
h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading); }
```

<details><summary>next/font form</summary>

```tsx
import { Mulish } from "next/font/google";
import { Inter } from "next/font/google";

const mulish = Mulish({
  variable: "--font-mulish",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});
```

</details>


## Montserrat + Inter

Geometric sans-serif headings with neutral body. Popular and reliable.


```css
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@100..900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');

@theme inline {
  --font-sans: "Inter", sans-serif;
  --font-heading: "Montserrat", sans-serif;
}

body { font-family: var(--font-sans); }
h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading); }
```

<details><summary>next/font form</summary>

```tsx
import { Montserrat } from "next/font/google";
import { Inter } from "next/font/google";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});
```

</details>


## Libre Baskerville + Inter

Classic serif headings with neutral body. Elegant and readable.


```css
@import url('https://fonts.googleapis.com/css2?family=libreBaskerville:wght@100..900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');

@theme inline {
  --font-sans: "Inter", sans-serif;
  --font-heading: "libreBaskerville", sans-serif;
}

body { font-family: var(--font-sans); }
h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading); }
```

<details><summary>next/font form</summary>

```tsx
import { Libre_Baskerville } from "next/font/google";
import { Inter } from "next/font/google";

const libreBaskerville = Libre_Baskerville({
  variable: "--font-libre-baskerville",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});
```

</details>


## Inter Tight + Inter

Inter Tight headings with a neutral Inter body.


```css
@import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@100..900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');

@theme inline {
  --font-sans: "Inter", sans-serif;
  --font-heading: "Inter Tight", sans-serif;
}

body { font-family: var(--font-sans); }
h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading); }
```

<details><summary>next/font form</summary>

```tsx
import { Inter_Tight } from "next/font/google";
import { Inter } from "next/font/google";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});
```

</details>


## Poppins + Inter

Poppins headings with a neutral Inter body.


```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@100..900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');

@theme inline {
  --font-sans: "Inter", sans-serif;
  --font-heading: "Poppins", sans-serif;
}

body { font-family: var(--font-sans); }
h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading); }
```

<details><summary>next/font form</summary>

```tsx
import { Poppins } from "next/font/google";
import { Inter } from "next/font/google";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});
```

</details>


## Plus Jakarta Sans + Inter

Plus Jakarta Sans headings with a neutral Inter body.


```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@100..900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');

@theme inline {
  --font-sans: "Inter", sans-serif;
  --font-heading: "Plus Jakarta Sans", sans-serif;
}

body { font-family: var(--font-sans); }
h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading); }
```

<details><summary>next/font form</summary>

```tsx
import { Plus_Jakarta_Sans } from "next/font/google";
import { Inter } from "next/font/google";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});
```

</details>


## Playfair Display + Inter

Playfair Display headings with a neutral Inter body.


```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@100..900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');

@theme inline {
  --font-sans: "Inter", sans-serif;
  --font-heading: "Playfair Display", sans-serif;
}

body { font-family: var(--font-sans); }
h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading); }
```

<details><summary>next/font form</summary>

```tsx
import { Playfair_Display } from "next/font/google";
import { Inter } from "next/font/google";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});
```

</details>


## Archivo + Inter

Archivo headings with a neutral Inter body.


```css
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@100..900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');

@theme inline {
  --font-sans: "Inter", sans-serif;
  --font-heading: "Archivo", sans-serif;
}

body { font-family: var(--font-sans); }
h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading); }
```

<details><summary>next/font form</summary>

```tsx
import { Archivo } from "next/font/google";
import { Inter } from "next/font/google";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});
```

</details>


## Figtree + Inter

Figtree headings with a neutral Inter body.


```css
@import url('https://fonts.googleapis.com/css2?family=Figtree:wght@100..900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');

@theme inline {
  --font-sans: "Inter", sans-serif;
  --font-heading: "Figtree", sans-serif;
}

body { font-family: var(--font-sans); }
h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading); }
```

<details><summary>next/font form</summary>

```tsx
import { Figtree } from "next/font/google";
import { Inter } from "next/font/google";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});
```

</details>


---

# Single fonts

Use one family throughout, varying weight for hierarchy. Reliable, and impossible to get wrong.


## Inter Tight


```css
@import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@100..900&display=swap');

@theme inline { --font-sans: "Inter Tight", sans-serif; }
```


## Inter


```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');

@theme inline { --font-sans: "Inter", sans-serif; }
```


## Poppins


```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@100..900&display=swap');

@theme inline { --font-sans: "Poppins", sans-serif; }
```


## Montserrat


```css
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@100..900&display=swap');

@theme inline { --font-sans: "Montserrat", sans-serif; }
```


## Roboto


```css
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@100..900&display=swap');

@theme inline { --font-sans: "Roboto", sans-serif; }
```


## Open Sans


```css
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@100..900&display=swap');

@theme inline { --font-sans: "Open Sans", sans-serif; }
```


## Lato


```css
@import url('https://fonts.googleapis.com/css2?family=Lato:wght@100..900&display=swap');

@theme inline { --font-sans: "Lato", sans-serif; }
```


## DM Sans


```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@100..900&display=swap');

@theme inline { --font-sans: "DM Sans", sans-serif; }
```


## Manrope


```css
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@100..900&display=swap');

@theme inline { --font-sans: "Manrope", sans-serif; }
```


## Source Sans 3


```css
@import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@100..900&display=swap');

@theme inline { --font-sans: "Source Sans 3", sans-serif; }
```


## Public Sans


```css
@import url('https://fonts.googleapis.com/css2?family=Public+Sans:wght@100..900&display=swap');

@theme inline { --font-sans: "Public Sans", sans-serif; }
```


## Mulish


```css
@import url('https://fonts.googleapis.com/css2?family=Mulish:wght@100..900&display=swap');

@theme inline { --font-sans: "Mulish", sans-serif; }
```


## Nunito


```css
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@100..900&display=swap');

@theme inline { --font-sans: "Nunito", sans-serif; }
```


## Nunito Sans


```css
@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@100..900&display=swap');

@theme inline { --font-sans: "Nunito Sans", sans-serif; }
```


## Raleway


```css
@import url('https://fonts.googleapis.com/css2?family=Raleway:wght@100..900&display=swap');

@theme inline { --font-sans: "Raleway", sans-serif; }
```


## Archivo


```css
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@100..900&display=swap');

@theme inline { --font-sans: "Archivo", sans-serif; }
```


## Figtree


```css
@import url('https://fonts.googleapis.com/css2?family=Figtree:wght@100..900&display=swap');

@theme inline { --font-sans: "Figtree", sans-serif; }
```


## Plus Jakarta Sans


```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@100..900&display=swap');

@theme inline { --font-sans: "Plus Jakarta Sans", sans-serif; }
```


## Playfair Display


```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@100..900&display=swap');

@theme inline { --font-sans: "Playfair Display", sans-serif; }
```
