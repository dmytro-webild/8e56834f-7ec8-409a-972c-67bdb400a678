# 02 — Props

## Canonical shape for a section component

```tsx
type FeaturesMediaCardsProps = {
  tag: string;
  title: string;
  description: string;
  primaryButton?: { text: string; href: string };
  secondaryButton?: { text: string; href: string };
  items: FeatureItem[];
  textAnimation: "slide-up" | "fade-blur" | "fade";
};
```

- **Order is fixed**: `tag`, `title`, `description`, buttons, item array, `textAnimation` last.
- **`textAnimation` is required** and written as the inline literal union. Omit it only in sections that render no animated text.
- **Button objects are the inline literal `{ text: string; href: string }`** — no named `ButtonConfig`, no `variant` field. Position decides the variant: first is primary, second is secondary.
- **Naming**: `title` (never `heading`), `description` (never `subtitle` or `copy`), `text` only for a button label.
- **Required vs optional**: content that defines the section (`title`, item array) is required; embellishments (`tag`, buttons) are optional. In a hero the buttons are usually required, since a hero without a CTA is incomplete.

## Item types

Singular name, declared in the file, not exported:

```tsx
type FeatureItem = {
  title: string;
  description: string;
  icon: LucideIcon;
  imageSrc: string;
};
```

Name the array for its domain: `items`, `features`, `testimonials`, `members`, `plans`, `metrics`, `columns`, `steps`.

## Media props

One media slot, image **or** video, as a discriminated union:

```tsx
type FeatureItem = {
  title: string;
  description: string;
} & ({ imageSrc: string; videoSrc?: never } | { videoSrc: string; imageSrc?: never });
```

Pass both keys straight through and let the primitive branch:

```tsx
<ImageOrVideo imageSrc={item.imageSrc} videoSrc={item.videoSrc} />
```

Two media slots chain two unions with prefixed keys (`frontImageSrc`/`frontVideoSrc`, `backImageSrc`/`backVideoSrc`). Sections that only ever show images use a plain `imageSrc: string`.

## Icons

Icons are passed as **components**, not strings:

```tsx
import type { LucideIcon } from "lucide-react";

type FeatureItem = { icon: LucideIcon; title: string };

// consumer
import { Zap, Shield } from "lucide-react";
<FeaturesIconCards items={[{ icon: Zap, title: "Fast" }, { icon: Shield, title: "Secure" }]} />

// render
const Icon = item.icon;
<Icon className="size-4" strokeWidth={1.5} />
```

Never accept an icon name string and look it up at runtime — that forces a full `import * as Icons from "lucide-react"` barrel import, which no bundler can tree-shake and which drags the entire icon set into the bundle.

## Fixed-length tuples

When the layout hard-codes per-position styling (bento spans, a three-card fan, a six-image collage), encode the count in the type so a wrong-length array fails at compile time:

```tsx
items: [FeatureItem, FeatureItem, FeatureItem];
imagesSrc: [string, string, string, string, string, string];
```

The component then zips items against a module-level config array of positions or spans.

## Click handling

```tsx
type NavItem = { name: string; href: string };
type CardItem = { title: string; href?: string; onClick?: () => void };
```

Components take plain `href` and `onClick` and do nothing clever with them — no router coupling, no smooth-scroll library. That keeps them usable in Next.js, React Router, Remix, or a plain SPA. If a project wants router-aware navigation, it wraps the component or passes an `onClick` that calls its own navigate.

Handlers that carry data are named for the action and always optional:

```tsx
onSubmit?: (data: Record<string, string>) => void;
onAddToCart?: (quantity: number) => void;
onValueChange: (value: string) => void;   // controlled inputs: required
```

Call them with optional chaining: `onSubmit?.(formData)`.

## className

Every component takes an optional `className` merged last, so consumers can adjust spacing and width without forking:

```tsx
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

const Card = ({ children, className = "" }: CardProps) => (
  <div className={cn("p-6 md:p-8 bg-card text-card-foreground border shadow-sm rounded-xl", className)}>
    {children}
  </div>
);
```

`twMerge` is what lets a passed `className` actually win — with plain string concatenation, `p-4` and `p-8` would both be emitted and the winner would depend on stylesheet order. One `className` prop only; no `containerClassName`, `titleClassName`, or per-element escape hatches.

## Local state

Sections are stateless unless the interaction requires otherwise. The sanctioned patterns:

```tsx
const [activeIndex, setActiveIndex] = useState<number | null>(null);   // accordion, tabs, carousel
const [quantities, setQuantities] = useState<Record<string, number>>({}); // per-item counters
const [formData, setFormData] = useState<Record<string, string>>(initial);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

No stores, no context, no data fetching inside a presentational component — data arrives as props.
