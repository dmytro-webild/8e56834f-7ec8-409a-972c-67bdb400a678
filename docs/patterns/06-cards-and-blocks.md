# 06 — Cards & Blocks

Copy-paste anatomies for the blocks that recur across sections.

## Media-led card

The text block gets its own padding inside an already-padded card, so copy sits inset from the media edge.

```tsx
<div className="h-full flex flex-col gap-4 p-4 md:p-6 bg-card text-card-foreground border shadow-sm rounded-xl">
  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
    <ImageOrVideo imageSrc={item.imageSrc} videoSrc={item.videoSrc} />
  </div>
  <div className="flex flex-col gap-2">
    <h3 className="text-xl md:text-2xl font-semibold leading-snug">{item.title}</h3>
    <p className="text-sm md:text-base text-muted-foreground leading-snug">{item.description}</p>
  </div>
</div>
```

`h-full` is required (carousel stretch — see 04). Add `group` to the root whenever anything inside reacts to hover. Make the whole card clickable with a `<button className="text-left …">` root rather than nesting a button inside a click handler.

## Text-led card

```tsx
<div className="h-full flex flex-col justify-between gap-6 p-6 md:p-8 bg-card text-card-foreground border shadow-sm rounded-xl">
```

`justify-between` pins the footer block (author, price, CTA) to the bottom so cards in a row line up. Inside a taller card, `mt-auto` on the final block does the same job.

## Hover reveal on media

```tsx
<div className="relative aspect-[4/3] rounded-lg overflow-hidden">
  <ImageOrVideo
    imageSrc={item.imageSrc}
    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
  />
  <div className="absolute inset-0 flex items-center justify-center bg-background/0 group-hover:bg-background/20 transition-colors duration-300">
    <div className="flex items-center justify-center size-12 bg-primary text-primary-foreground rounded-full opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300">
      <ArrowUpRight className="size-5" strokeWidth={2} />
    </div>
  </div>
</div>
```

## Overlay panel on media

```tsx
<div className="relative aspect-[4/5] rounded-xl overflow-hidden">
  <ImageOrVideo imageSrc={imageSrc} />
  <div className="absolute inset-x-4 bottom-4 flex flex-col gap-1 p-4 bg-card/80 backdrop-blur-md border rounded-lg">
    <h3 className="text-lg md:text-xl font-semibold leading-snug truncate">{name}</h3>
    <p className="text-sm text-muted-foreground leading-snug truncate">{role}</p>
  </div>
</div>
```

Glass alternative — no panel, blurred strip plus text directly on the image:

```tsx
<div
  className="absolute inset-x-0 bottom-0 h-1/3 backdrop-blur-xl"
  style={{ maskImage: "linear-gradient(to bottom, transparent, black 60%)" }}
  aria-hidden="true"
/>
<div className="absolute inset-x-6 bottom-6 flex flex-col text-white">…</div>
```

## Icon chip

```tsx
<div className="flex items-center justify-center shrink-0 size-9 bg-primary text-primary-foreground rounded-lg">
  <Icon className="size-4" strokeWidth={1.5} />
</div>
```

| Chip | Icon | Use |
|---|---|---|
| `size-6` | `size-3`, `strokeWidth={2}` | Check rows in feature lists |
| `size-9` | `size-4` | Metric icons, step numbers, social links, steppers |
| `size-12` | `size-5` | Hover CTA, prominent feature icon |
| `size-12 md:size-14` | `size-5 md:size-6` | Card hero icons |

`strokeWidth={1.5}` is the default; `{2}` for check, close, plus, and arrow glyphs. `shrink-0` on every chip that sits in a flex row.

## Check row

```tsx
<div className="flex flex-col gap-3">
  {features.map((feature) => (
    <div key={feature} className="flex items-start gap-3">
      <div className="flex items-center justify-center shrink-0 size-6 bg-primary text-primary-foreground rounded-lg">
        <Check className="size-3" strokeWidth={2} />
      </div>
      <span className="text-sm md:text-base leading-snug">{feature}</span>
    </div>
  ))}
</div>
```

`items-start`, not `items-center` — multi-line features should hang from the chip. Negative rows swap to `bg-muted text-muted-foreground` with an `X`.

## Price block

```tsx
<div className="flex flex-col gap-1">
  <span className="text-4xl md:text-5xl font-semibold leading-none">{plan.price}</span>
  <span className="text-sm text-muted-foreground">{plan.description}</span>
</div>
```

Inline period variant: `flex items-baseline gap-1` with the period at `text-xl font-medium text-muted-foreground`.

Highlighted plan — ribbon above the card, with an invisible placeholder on the others so the card tops stay aligned:

```tsx
<div className="flex flex-col h-full">
  <div className={cn("px-5 py-2 text-sm text-center", plan.highlight
    ? "bg-primary text-primary-foreground rounded-t-xl"
    : "invisible")}>
    {plan.highlight || "placeholder"}
  </div>
  <div className={cn("flex-1 flex flex-col gap-6 p-6 md:p-8 bg-card border shadow-sm",
    plan.highlight ? "rounded-b-xl" : "rounded-xl")}>
```

## Author block

```tsx
<div className="flex items-center gap-3">
  <ImageOrVideo imageSrc={avatarSrc} className="size-10 md:size-11 rounded-full object-cover shrink-0" />
  <div className="flex flex-col min-w-0">
    <span className="text-sm md:text-base font-semibold leading-snug truncate">{name}</span>
    <span className="text-sm text-muted-foreground leading-snug truncate">{role}</span>
  </div>
</div>
```

`min-w-0` on the text column is what makes `truncate` work inside a flex row.

## Avatar stack

```tsx
{visible.map((src, i) => (
  <div
    key={i}
    className={cn("relative size-10 md:size-12 rounded-full overflow-hidden border-2 border-background", i > 0 && "-ml-3")}
    style={{ zIndex: visible.length - i }}
  >
    <ImageOrVideo imageSrc={src} />
  </div>
))}
{remaining > 0 && (
  <div className="flex items-center justify-center size-10 md:size-12 -ml-3 rounded-full border-2 border-background bg-secondary text-secondary-foreground" style={{ zIndex: 0 }}>
    <span className="text-sm font-semibold">+{remaining}</span>
  </div>
)}
```

`border-background` is what carves the gap between overlapping avatars — it has to match the surface behind them.

## Accordion item

```tsx
<div
  onClick={() => setActive(active === index ? null : index)}
  className="p-4 md:p-6 bg-card text-card-foreground border rounded-xl cursor-pointer select-none"
>
  <div className="flex items-center justify-between gap-4">
    <h3 className="text-base md:text-lg font-medium leading-snug">{item.question}</h3>
    <div className="flex items-center justify-center shrink-0 size-8 bg-primary text-primary-foreground rounded-lg">
      <Plus className={cn("size-4 transition-transform duration-300", active === index && "rotate-45")} strokeWidth={2} />
    </div>
  </div>
  <AnimatePresence initial={false}>
    {active === index && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="overflow-hidden"
      >
        <p className="pt-3 text-sm md:text-base text-muted-foreground leading-snug">{item.answer}</p>
      </motion.div>
    )}
  </AnimatePresence>
</div>
```

The plus rotating 45° into a cross is CSS, not motion. List wrapper is `flex flex-col gap-3`. State is `useState<number | null>(null)` with toggle-to-null so clicking the open row closes it.

Or just use the `Accordion` component, which packages exactly this.

## Form fields

```tsx
<form onSubmit={handleSubmit} className="flex flex-col gap-4">
  <div className="flex flex-col gap-2">
    <Label htmlFor="email">Email</Label>
    <Input id="email" type="email" required placeholder="you@company.com" />
  </div>
  <Textarea rows={5} placeholder="Message" className="resize-none" />
  <button
    type="submit"
    disabled={isLoading}
    className="flex items-center justify-center w-full h-10 px-6 text-sm bg-primary text-primary-foreground rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {isLoading ? "Sending…" : buttonText}
  </button>
  {error && <p className="text-sm text-destructive">{error}</p>}
</form>
```

Validation is native (`type="email"`, `required`) unless the form genuinely needs more. Always pair an input with a `Label` and `htmlFor`; when the design has no visible label, keep an `aria-label` on the input instead. Disabled submit buttons always carry `disabled:opacity-50 disabled:cursor-not-allowed`.

Handler shape:

```tsx
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setIsLoading(true);
  setError(null);
  try {
    await onSubmit?.(formData);
    setFormData(emptyState);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
  } finally {
    setIsLoading(false);
  }
};
```

## Dividers

```tsx
<div className="w-full h-px bg-border" />        {/* structural rule */}
<Separator />                                     {/* same thing, as a component */}
<div className="border-t border-border pt-8" />   {/* rule attached to a following block */}
```

Use `md:hidden` on a divider that only exists to separate stacked mobile content.
