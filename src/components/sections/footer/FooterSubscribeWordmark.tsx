import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useKitMotion } from "@/components/kit/kitMotion";

type Link = { text: string; href: string };
type Column = { title: string; links: Link[] };

type FooterSubscribeWordmarkProps = {
  brand?: string;
  description?: string;
  subscribe?: { placeholder?: string; button?: string };
  columns?: Column[];
  socials?: Link[];
  copyright?: string;
  className?: string;
};

const DEFAULT_COLUMNS: Column[] = [
  { title: "Product", links: [{ text: "Overview", href: "#" }, { text: "Insights", href: "#" }, { text: "Integrations", href: "#integrations" }, { text: "Pricing", href: "#pricing" }] },
  { title: "Company", links: [{ text: "About", href: "#" }, { text: "Customers", href: "#testimonial" }, { text: "Careers", href: "#" }, { text: "Contact", href: "#contact" }] },
  { title: "Resources", links: [{ text: "Guides", href: "#blog" }, { text: "Changelog", href: "#" }, { text: "Help center", href: "#faq" }, { text: "Status", href: "#" }] },
  { title: "Legal", links: [{ text: "Privacy", href: "#" }, { text: "Terms", href: "#" }, { text: "Security", href: "#" }] },
];

export default function FooterSubscribeWordmark({
  brand = "Veyra",
  description = "One calm view of your money, built for small teams.",
  subscribe = { placeholder: "you@company.com", button: "Subscribe" },
  columns = DEFAULT_COLUMNS,
  socials = [
    { text: "X / Twitter", href: "#" },
    { text: "LinkedIn", href: "#" },
    { text: "Dribbble", href: "#" },
  ],
  copyright = "© 2026 Veyra. All rights reserved.",
  className = "",
}: FooterSubscribeWordmarkProps) {
  const reduce = useReducedMotion();
  const { ease, base } = useKitMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const wordY = useTransform(scrollYProgress, [0, 1], ["30%", "22%"]);

  const rise = (i: number) => ({
    initial: reduce ? false : { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "0px 0px -8% 0px" },
    transition: { duration: base, ease, delay: i * 0.06 },
  });

  return (
    <section ref={ref} aria-label="Footer" className={`relative overflow-hidden pt-[var(--section-space)] ${className}`}>
      <div className="mx-auto w-[var(--container)]">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-16">
          <motion.div {...rise(0)} className="max-w-[26rem]">
            <a href="#" aria-label={brand} className="flex items-center gap-3 text-foreground">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-black">
                <svg aria-hidden="true" viewBox="0 0 20 20" className="size-5 fill-current">
                  <circle cx="10" cy="4.5" r="2" />
                  <circle cx="10" cy="15.5" r="2" />
                  <circle cx="4.5" cy="10" r="2" />
                  <circle cx="15.5" cy="10" r="2" />
                  <circle cx="10" cy="10" r="1.6" />
                </svg>
              </div>
              <p className="text-[length:var(--text-h3)] font-medium leading-none tracking-[-0.03em]">{brand}</p>
            </a>
            {description && <p className="mt-5 text-balance text-[length:var(--text-body)] leading-[1.55] text-muted-foreground">{description}</p>}
            <form onSubmit={(event) => event.preventDefault()} className="mt-6 flex h-11 w-full max-w-[22rem] overflow-hidden rounded-lg border border-border bg-card">
              <input
                type="email"
                required
                aria-label={subscribe.placeholder ?? "Email"}
                placeholder={subscribe.placeholder}
                className="min-w-0 flex-1 bg-transparent px-3 text-[length:var(--text-small)] text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button type="submit" className="shrink-0 whitespace-nowrap bg-primary px-4 text-[length:var(--text-small)] font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                {subscribe.button}
              </button>
            </form>
          </motion.div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            {columns.map((column, i) => (
              <motion.div key={`${column.title}-${i}`} {...rise(1 + i)}>
                <p className="text-[length:var(--text-small)] text-muted-foreground">{column.title}</p>
                <ul className="mt-4 flex flex-col gap-3">
                  {column.links.map((link, j) => (
                    <li key={`${link.text}-${j}`}>
                      <a href={link.href} className="text-[length:var(--text-body)] text-foreground/90 transition-colors hover:text-foreground">
                        {link.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={reduce ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: base, ease }}
          className="mt-[clamp(3rem,6vw,5rem)] h-px origin-left bg-border"
        />
        <motion.div {...rise(2)} className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[length:var(--text-small)] text-muted-foreground">{copyright}</p>
          {socials.length > 0 && (
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {socials.map((social, i) => (
                <li key={`${social.text}-${i}`}>
                  <a href={social.href} className="whitespace-nowrap text-[length:var(--text-small)] text-muted-foreground transition-colors hover:text-foreground">
                    {social.text}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </div>

      <div aria-hidden="true" className="relative mt-[clamp(1rem,3vw,3rem)] flex h-[18vw] justify-center overflow-hidden">
        <motion.p
          style={reduce ? { y: "22%" } : { y: wordY }}
          className="whitespace-nowrap text-[length:26vw] font-medium leading-[0.8] tracking-[-0.06em] text-foreground/[0.07] will-change-transform"
        >
          {brand}
        </motion.p>
      </div>
    </section>
  );
}
