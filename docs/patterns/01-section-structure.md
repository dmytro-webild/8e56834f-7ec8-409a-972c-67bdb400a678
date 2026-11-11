# 01 — Section Structure

## File anatomy

One section = one flat file. No wrapper components, no styling props, no theme indirection — every class is visible in the file so it can be read and edited directly.

```tsx
import WordByWordReveal from "@/components/animation/WordByWordReveal";
import AppearOnScroll from "@/components/animation/AppearOnScroll";
import GridOrCarousel from "@/components/carousels/GridOrCarousel";
import ImageOrVideo from "@/components/media/ImageOrVideo";
import Button from "@/components/buttons/Button";

type FeatureItem = {
  title: string;
  description: string;
  imageSrc: string;
};

type FeaturesMediaCardsProps = {
  tag: string;
  title: string;
  description: string;
  primaryButton?: { text: string; href: string };
  items: FeatureItem[];
  textAnimation: "slide-up" | "fade-blur" | "fade";
};

const FeaturesMediaCards = ({ tag, title, description, primaryButton, items, textAnimation }: FeaturesMediaCardsProps) => (
  <section aria-label="Features section" className="py-16 md:py-24">
    {/* … */}
  </section>
);

export default FeaturesMediaCards;
```

Hoist a sub-component above the main one only when each item needs its own hook (a click handler, a scroll transform). Never define a component inside the render body — it gets a new identity every render.

## Section wrapper

```tsx
<section aria-label="Features section" className="py-16 md:py-24">
```

- `<section>` for content blocks, `<footer>` for footers, `<article>` for standalone posts.
- `aria-label` reads `"<Domain> section"` — capital first word only: `"Hero section"`, `"Features section"`, `"Pricing section"`, `"Testimonials section"`, `"Contact section"`, `"Site footer"`.
- `py-16 md:py-24` is the standard rhythm. Use `pt-16 pb-8` when a marquee or carousel bleeds past the bottom edge, and drop padding entirely for full-viewport sections (they use `min-h-svh` and their own internal spacing).
- Add `relative` only when the section contains absolutely-positioned children or carries a scroll `ref`.

## Content container

```tsx
<div className="w-full max-w-6xl mx-auto px-6 flex flex-col gap-10 md:gap-14">
```

`w-full max-w-6xl mx-auto px-6` is the content column — one string, used everywhere. `px-6` is what keeps content off the edge on phones; never omit it. `gap-10 md:gap-14` is the header→body gap.

When the body must bleed past the column (a full-width carousel or marquee), leave the outer wrapper unconstrained and apply the container to the header and the body separately:

```tsx
<section aria-label="Testimonials section" className="py-16 md:py-24">
  <div className="flex flex-col gap-10 md:gap-14">
    <div className="w-full max-w-6xl mx-auto px-6 flex flex-col items-center gap-3">
      {/* header */}
    </div>
    <div className="overflow-hidden">{/* full-bleed marquee */}</div>
  </div>
</section>
```

## The header block

Tag pill → title → description → buttons. In that order, every time.

```tsx
<div className="w-full max-w-6xl mx-auto px-6 flex flex-col items-center gap-3">
  <div className="w-fit px-3 py-1 text-sm bg-card text-card-foreground border rounded-full">
    {tag}
  </div>

  <WordByWordReveal
    text={title}
    variant={textAnimation}
    tag="h2"
    className="max-w-[80%] text-3xl sm:text-4xl md:text-5xl font-semibold leading-[1.15] text-center text-balance"
  />

  <WordByWordReveal
    text={description}
    variant={textAnimation}
    tag="p"
    className="max-w-[70%] text-base md:text-lg text-muted-foreground leading-snug text-center text-balance"
  />

  {(primaryButton || secondaryButton) && (
    <div className="flex flex-wrap justify-center gap-3 mt-3">
      {primaryButton && <Button text={primaryButton.text} href={primaryButton.href} variant="primary" />}
      {secondaryButton && <Button text={secondaryButton.text} href={secondaryButton.href} variant="secondary" animationDelay={0.1} />}
    </div>
  )}
</div>
```

The rules behind it:

| Rule | Detail |
|---|---|
| Heading tag | `h1` in a hero, `h2` for a section, `h3` for card titles, `h4` for sub-card labels |
| Title size | Section `text-3xl sm:text-4xl md:text-5xl`; hero `text-4xl sm:text-5xl md:text-6xl lg:text-7xl`. Always write the mobile size first. |
| Description | `text-base md:text-lg text-muted-foreground` — one step smaller than in a hero, and always muted |
| Max widths | Title `max-w-[80%]`, description `max-w-[70%]`. The description is always narrower than the title. Drop both when the parent already constrains width. |
| `leading-[1.15]` | On every title. `WordByWordReveal` injects `leading-[1.2]`, so this overrides it. |
| `text-balance` | On titles and descriptions, so line breaks fall evenly |
| Buttons | Row is `flex flex-wrap justify-center gap-3 mt-3`, guarded by `(primaryButton \|\| secondaryButton) &&` with each button guarded individually. Secondary gets `animationDelay={0.1}`; primary never gets a delay. |
| `variant={textAnimation}` | Always passed through from props — never hard-coded on header text |

**Left-aligned variant** (split layouts): drop `items-center`, drop `text-center` from both text classes, drop `justify-center` from the button row.

**On-media variant** (hero overlays): drop the max-widths, add `text-white`, and put the pill on a translucent surface (`bg-white/10 backdrop-blur border-white/20 text-white`).

## Hero layouts

A hero differs from a section in four ways: `h1` instead of `h2`, one size step larger type, `gap-4` instead of `gap-3` in the header, and top padding that clears a fixed navbar.

```tsx
// Centered — copy stacked above the media
<section aria-label="Hero section" className="relative pt-28 pb-16 md:pt-36 md:pb-24">

// Split — copy left, media right
<section aria-label="Hero section" className="relative flex items-center pt-28 pb-16 md:py-0 md:min-h-svh">
  <div className="w-full max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center gap-10 md:gap-16">
    <div className="w-full md:w-1/2 flex flex-col items-center md:items-start gap-4 text-center md:text-left">…</div>
    <div className="w-full md:w-1/2">…</div>
  </div>
</section>

// Overlay — full-bleed media behind the copy
<section aria-label="Hero section" className="relative w-full min-h-svh overflow-hidden flex flex-col justify-end pb-16 md:pb-24">
  <ImageOrVideo imageSrc={imageSrc} className="absolute inset-0 w-full h-full object-cover rounded-none" />
  <div className="absolute inset-0 bg-black/40" />
  <div className="relative z-10 w-full max-w-6xl mx-auto px-6">
    <div className="w-full md:w-3/5 lg:w-1/2 flex flex-col gap-4 text-white">…</div>
  </div>
</section>
```

Use `min-h-svh`, never `h-screen` — `svh` accounts for mobile browser chrome. Overlay heroes always need a scrim (`bg-black/40`) or a backdrop blur behind the text; white text on an arbitrary photo is not legible on its own.

## Loading and empty states

For sections fed by an API:

```tsx
if (isLoading && !items) {
  return (
    <section aria-label="Blog section" className="py-16 md:py-24">
      <div className="w-full max-w-6xl mx-auto px-6 flex justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" strokeWidth={1.5} />
      </div>
    </section>
  );
}

if (!items || items.length === 0) return null;
```

A section with nothing to show renders nothing — never an empty bordered box.
