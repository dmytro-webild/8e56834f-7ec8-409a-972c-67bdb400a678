# Building Sections with These Components

These are the composition rules behind the component library. The components in `src/components/ui/` are the parts; these guides are how to assemble them into sections that look designed rather than assembled.

Everything here is written against **standard Tailwind utilities and shadcn token names** (`bg-card`, `bg-primary`, `text-muted-foreground`, `border`, `--radius`). No custom spacing scale, no custom width tokens, no build-time config. If a project already has shadcn set up, all of this works as-is.

| Guide | Covers |
|---|---|
| [01-section-structure.md](./01-section-structure.md) | Section wrapper, content container, the header block, hero layouts |
| [02-props.md](./02-props.md) | Prop shapes and naming for section components |
| [03-styling.md](./03-styling.md) | Tokens, surfaces, the type scale, class-order grammar, what not to do |
| [04-responsiveness.md](./04-responsiveness.md) | Breakpoint strategy, the padding ladders, grid vs carousel |
| [05-animation.md](./05-animation.md) | The four animation layers and their exact values |
| [06-cards-and-blocks.md](./06-cards-and-blocks.md) | Card anatomies, icon chips, and the recurring sub-blocks |

For palettes, fonts, and card/button surface treatments, see the [style catalog](../styles/README.md).

## The short version

A section is one flat file: local types, one component, default export. It renders

```tsx
<section aria-label="Features section" className="py-16 md:py-24">
  <div className="w-full max-w-6xl mx-auto px-6 flex flex-col gap-10 md:gap-14">
    {/* header: tag pill → animated title → description → buttons */}
    {/* body: <AppearOnScroll><GridOrCarousel>…cards…</GridOrCarousel></AppearOnScroll> */}
  </div>
</section>
```

Content arrives as props. Styles are inline Tailwind — no styling props, no theme indirection, nothing hidden. Layout switches once at `md:`; larger breakpoints only adjust density and type size.

## The rules that matter most

1. **One content container**: `w-full max-w-6xl mx-auto px-6`. Not a custom token, not a bare `container`.
2. **Surfaces use tokens, never raw colors**: `bg-card`, `bg-primary text-primary-foreground`, `bg-muted`, `border`. Never `bg-white`, `bg-gray-100`, `text-neutral-500`.
3. **Type is explicitly responsive.** There is no fluid scale — `text-6xl` really is 60px on a phone. Always write the mobile size first: `text-3xl md:text-5xl`.
4. **Padding ladders, not arbitrary values**: `p-4 md:p-6`, `gap-4 md:gap-6`, `py-16 md:py-24`.
5. **Animate in layers**: `WordByWordReveal` for headings, `AppearOnScroll` for bodies, inline `motion` only for what neither covers.
