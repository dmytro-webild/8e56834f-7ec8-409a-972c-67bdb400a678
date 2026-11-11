"use client";

import { useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { useKitMotion } from "@/components/kit/kitMotion";
import useMenuDialog from "@/components/kit/useMenuDialog";

type NavItem = { name: string; href: string };
type Button = { text: string; href: string };

type NavbarLoginTabProps = {
  brand?: string;
  navItems?: NavItem[];
  primaryButton?: Button;
  secondaryButton?: Button;
  menuText?: string;
  closeText?: string;
};

const DEFAULT_ITEMS: NavItem[] = [
  { name: "Features", href: "#process" },
  { name: "Use cases", href: "#services" },
  { name: "Pricing", href: "#pricing" },
  { name: "Demo", href: "#contact" },
  { name: "Blog", href: "#blog" },
];

export default function NavbarLoginTab({
  brand = "Veyra",
  navItems = DEFAULT_ITEMS,
  primaryButton = { text: "Start for free", href: "#pricing" },
  secondaryButton = { text: "Log in", href: "#" },
  menuText = "Menu",
  closeText = "Close",
}: NavbarLoginTabProps) {
  const reduce = useReducedMotion();
  const { ease, base } = useKitMotion();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const hidden = useRef(false);
  const y = useMotionValue("0%");
  const { scrollY } = useScroll();
  useMenuDialog(open, panelRef, () => setOpen(false));

  useMotionValueEvent(scrollY, "change", (now) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (plateRef.current) plateRef.current.dataset.solid = now > 40 ? "true" : "false";
    const hide = now > 120 && now > prev;
    if (hide === hidden.current || reduce) return;
    hidden.current = hide;
    animate(y, hide ? "-100%" : "0%", { duration: base * 0.7, ease });
  });

  const mark = (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="size-[1.125rem] shrink-0 fill-current">
      <rect x="1" y="1" width="7.5" height="7.5" rx="1.5" />
      <rect x="1" y="11.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="11.5" y="11.5" width="7.5" height="7.5" rx="1.5" />
    </svg>
  );

  return (
    <>
      <motion.nav aria-label="Main" style={{ y }} className="fixed inset-x-0 top-0 z-50">
        <div
          ref={plateRef}
          data-solid="false"
          className="border-b border-transparent transition-[background-color,border-color] duration-500 data-[solid=true]:border-border data-[solid=true]:bg-background/80 data-[solid=true]:backdrop-blur-md"
        >
          <motion.div
            initial={reduce ? false : { opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: base, ease, delay: 0.15 }}
            className="mx-auto flex h-[4.5rem] w-[var(--container)] items-center gap-[clamp(1rem,2.4vw,2.25rem)]"
          >
            <a href="#" aria-label={brand} className="flex shrink-0 items-center gap-2 text-foreground">
              {mark}
              <p className="text-[length:var(--text-h3)] font-medium leading-none tracking-[-0.03em]">{brand}</p>
            </a>
            <div className="ml-auto flex shrink-0 items-center gap-2">
              {secondaryButton && (
                <a href={secondaryButton.href} className="btn-secondary hidden lg:inline-flex">
                  <p>{secondaryButton.text}</p>
                </a>
              )}
              {primaryButton && (
                <a href={primaryButton.href} className="btn-primary hidden lg:inline-flex">
                  <p>{primaryButton.text}</p>
                </a>
              )}
              <button
                type="button"
                aria-expanded={open}
                aria-label={open ? closeText : menuText}
                onClick={() => setOpen((value) => !value)}
                className="flex size-11 flex-col items-center justify-center gap-[0.3rem] rounded-lg border border-border bg-card text-foreground lg:hidden"
              >
                <div aria-hidden="true" className={`h-px w-4 bg-current transition-transform duration-300 ${open ? "translate-y-[0.19rem] rotate-45" : ""}`} />
                <div aria-hidden="true" className={`h-px w-4 bg-current transition-transform duration-300 ${open ? "-translate-y-[0.19rem] -rotate-45" : ""}`} />
              </button>
            </div>
          </motion.div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            key="sheet"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={menuText}
            initial={reduce ? { opacity: 0 } : { y: "-100%" }}
            animate={reduce ? { opacity: 1 } : { y: "0%" }}
            exit={reduce ? { opacity: 0 } : { y: "-100%" }}
            transition={{ duration: base, ease }}
            className="fixed inset-x-0 top-0 z-[45] flex max-h-svh flex-col overflow-y-auto border-b border-border bg-background px-[var(--gutter)] pb-6 pt-[6rem] lg:hidden"
          >
            <ul className="flex flex-col">
              {navItems.map((item, i) => (
                <li key={`${i}-${item.href}`} className="overflow-hidden pb-[0.15em] -mb-[0.15em]">
                  <motion.a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    initial={reduce ? false : { y: "110%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: base, ease, delay: 0.15 + i * 0.05 }}
                    className="block py-2 text-[length:var(--text-h2)] font-medium leading-[1.15] tracking-[-0.03em] text-foreground [overflow-wrap:anywhere]"
                  >
                    {item.name}
                  </motion.a>
                </li>
              ))}
            </ul>
            {(primaryButton || secondaryButton) && (
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: base, ease, delay: 0.25 + navItems.length * 0.05 }}
                className="mt-8 grid gap-2"
              >
                {primaryButton && (
                  <a href={primaryButton.href} onClick={() => setOpen(false)} className="btn-primary w-full">
                    <p>{primaryButton.text}</p>
                  </a>
                )}
                {secondaryButton && (
                  <a href={secondaryButton.href} onClick={() => setOpen(false)} className="btn-secondary w-full">
                    <p>{secondaryButton.text}</p>
                  </a>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
