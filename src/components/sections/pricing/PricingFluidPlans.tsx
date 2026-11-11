import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check, Sparkle } from "lucide-react";
import FluidPanel from "@/components/kit/FluidPanel";
import MutedAccentTitle from "@/components/kit/MutedAccentTitle";
import { useKitMotion } from "@/components/kit/kitMotion";

type Plan = {
  name: string;
  price: string;
  period?: string;
  description?: string;
  features?: string[];
  button?: { text: string; href: string };
  imageSrc?: string;
  imageAlt?: string;
};

type PricingFluidPlansProps = {
  label?: string;
  title?: string;
  mutedTitle?: string;
  description?: string;
  button?: { text: string; href: string };
  items?: Plan[];
  className?: string;
};

const DEFAULT_ITEMS: Plan[] = [
  {
    name: "Starter",
    price: "$19",
    period: "/month",
    description: "For freelancers getting their money in order.",
    features: ["One business account", "Unlimited invoices", "Payment reminders", "Monthly reports"],
    button: { text: "Start free trial", href: "#" },
  },
  {
    name: "Growth",
    price: "$49",
    period: "/month",
    description: "For small teams with bills, cards and payroll.",
    features: ["Up to 10 team members", "Bill pay and approvals", "Cash flow forecast", "Accounting sync", "Priority support"],
    button: { text: "Start free trial", href: "#" },
  },
  {
    name: "Scale",
    price: "$129",
    period: "/month",
    description: "For finance teams closing the books every month.",
    features: ["Unlimited team members", "Multi entity reporting", "Custom approval rules", "Month end checklist", "Audit trail", "Dedicated manager"],
    button: { text: "Talk to sales", href: "#" },
  },
];

const columns = (count: number) => {
  if (count <= 1) return "mx-auto max-w-[28rem] grid-cols-1";
  if (count === 2) return "grid-cols-1 lg:grid-cols-2";
  if (count === 4) return "grid-cols-1 lg:grid-cols-2 xl:grid-cols-4";
  return "grid-cols-1 lg:grid-cols-3";
};

export default function PricingFluidPlans({
  label = "Pricing",
  title = "Simple plans that grow with you.",
  mutedTitle = "grow with you.",
  description = "Start small and add people, accounts and automations as you need them. Every plan includes a 14 day free trial.",
  button,
  items = DEFAULT_ITEMS,
  className = "",
}: PricingFluidPlansProps) {
  const reduce = useReducedMotion();
  const { ease, base, fast } = useKitMotion();

  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "0px 0px -8% 0px" },
    transition: { duration: base, ease, delay },
  });

  return (
    <section aria-label={label || title} className={`py-[var(--section-space)] text-foreground ${className}`}>
      <div className="mx-auto w-[var(--container)]">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-end lg:gap-12">
          <div className="min-w-0">
            {label && (
              <motion.div {...rise(0)} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-[length:var(--text-small)] text-foreground/85">
                <Sparkle size={12} fill="currentColor" aria-hidden="true" />
                <p>{label}</p>
              </motion.div>
            )}
            <MutedAccentTitle text={title} muted={mutedTitle} as="h2" className="mt-5 max-w-[18ch] text-[length:var(--text-h1)]" />
          </div>
          {(description || button) && (
            <div className="min-w-0">
              {description && (
                <motion.p {...rise(0.12)} className="text-balance text-[length:var(--text-body-lg)] leading-[1.55] text-muted-foreground">
                  {description}
                </motion.p>
              )}
              {button && (
                <motion.div {...rise(0.18)} className="mt-6">
                  <a href={button.href} className="btn-primary">
                    {button.text}
                    <ArrowRight size={14} aria-hidden="true" />
                  </a>
                </motion.div>
              )}
            </div>
          )}
        </div>

        <ul className={`mt-[clamp(2rem,4vw,3.5rem)] grid gap-[var(--gap)] ${columns(items.length)}`}>
          {items.map((plan, index) => (
            <motion.li
              key={`${plan.name}-${index}`}
              initial={reduce ? false : "hide"}
              whileInView="show"
              viewport={{ once: true, margin: "0px 0px -10% 0px" }}
              className="kit-card flex min-w-0 flex-col p-3"
            >
              <motion.div
                variants={{
                  hide: { clipPath: "inset(48% 0% 48% 0% round 14px)" },
                  show: { clipPath: "inset(0% 0% 0% 0% round 14px)" },
                }}
                transition={{ duration: 0.9, ease, delay: index * 0.1 }}
              >
                <FluidPanel
                  seed={70 + index}
                  imageSrc={plan.imageSrc}
                  imageAlt={plan.imageAlt}
                  className="flex aspect-[16/8] flex-col items-start justify-between gap-4 rounded-[var(--radius-image)] p-[clamp(0.75rem,1.4vw,1rem)] xl:aspect-[16/9]"
                >
                  <motion.div
                    variants={{ hide: { opacity: 0, y: 12, scale: 0.96 }, show: { opacity: 1, y: 0, scale: 1 } }}
                    transition={{ duration: base, ease, delay: 0.2 + index * 0.05 }}
                    className="rounded-full border border-white/15 bg-black/30 px-3 py-1 text-white backdrop-blur-md"
                  >
                    <p className="whitespace-nowrap text-[length:var(--text-small)] font-medium leading-[1.4]">{plan.name}</p>
                  </motion.div>
                  <motion.div
                    variants={{ hide: { opacity: 0, y: 24, scale: 0.96 }, show: { opacity: 1, y: 0, scale: 1 } }}
                    transition={{ duration: base, ease, delay: 0.25 + index * 0.05 }}
                    className="flex max-w-full items-baseline gap-1.5 rounded-[var(--radius)] border border-white/15 bg-black/30 px-4 py-2.5 text-white backdrop-blur-md"
                  >
                    <p className="whitespace-nowrap text-[length:var(--text-h1)] font-medium leading-none tracking-[-0.04em] tabular-nums">{plan.price}</p>
                    {plan.period && <p className="whitespace-nowrap text-[length:var(--text-small)] text-white/65">{plan.period}</p>}
                  </motion.div>
                </FluidPanel>
              </motion.div>

              <div className="flex flex-1 flex-col px-3 pb-4 pt-5">
                {plan.description && (
                  <motion.p
                    variants={{ hide: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                    transition={{ duration: base, ease, delay: 0.15 + index * 0.05 }}
                    className="text-balance text-[length:var(--text-body)] leading-[1.55] text-muted-foreground"
                  >
                    {plan.description}
                  </motion.p>
                )}
                <div className="relative mt-5 h-px">
                  <motion.div
                    aria-hidden="true"
                    className="absolute inset-0 origin-left bg-border"
                    variants={{ hide: { scaleX: 0 }, show: { scaleX: 1 } }}
                    transition={{ duration: 0.8, ease, delay: 0.2 + index * 0.05 }}
                  />
                </div>
                {plan.features && plan.features.length > 0 && (
                  <ul className="mb-7 mt-5 flex flex-col gap-3">
                    {plan.features.map((feature, row) => (
                      <motion.li
                        key={`${feature}-${row}`}
                        variants={{ hide: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                        transition={{ duration: fast + 0.2, ease, delay: 0.2 + index * 0.05 + row * 0.04 }}
                        className="flex items-start gap-3"
                      >
                        <div aria-hidden="true" className="grid size-5 shrink-0 place-items-center rounded-full bg-foreground/[0.08] text-foreground">
                          <Check size={12} />
                        </div>
                        <p className="min-w-0 text-[length:var(--text-small)] leading-[1.45] text-foreground/85">{feature}</p>
                      </motion.li>
                    ))}
                  </ul>
                )}
                {plan.button && (
                  <a href={plan.button.href} className="btn-primary mt-auto w-full">
                    {plan.button.text}
                  </a>
                )}
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
