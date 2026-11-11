import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useInView, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Building2,
  Calendar,
  Check,
  FileText,
  Folder,
  LayoutGrid,
  ListChecks,
  MessageSquare,
  Rocket,
  ShoppingBag,
  Sparkle,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import FluidPanel from "@/components/kit/FluidPanel";
import MutedAccentTitle from "@/components/kit/MutedAccentTitle";
import { useKitMotion } from "@/components/kit/kitMotion";

type Tone = "done" | "pending" | "alert";

type PanelVariant = "status" | "metrics" | "timeline";

type PanelRow = { name: string; status: string; tone?: Tone };

type PanelStat = { label: string; value: string; delta?: string };

type PanelStep = { name: string; time?: string; done?: boolean };

type Panel = {
  variant?: PanelVariant;
  icon?: string;
  title: string;
  meta?: string;
  rows?: PanelRow[];
  stats?: PanelStat[];
  chart?: number[];
  chartType?: "bars" | "line";
  steps?: PanelStep[];
  note?: string;
  action?: string;
};

type UseCase = {
  title: string;
  heading?: string;
  description?: string;
  points?: string[];
  panel?: Panel;
  imageSrc?: string;
  imageAlt?: string;
};

type FeaturesFluidUseCasesProps = {
  label?: string;
  title?: string;
  mutedTitle?: string;
  description?: string;
  button?: { text: string; href: string };
  items?: UseCase[];
  variant?: PanelVariant;
  interval?: number;
  className?: string;
};

const ICONS: Record<string, LucideIcon> = {
  invoice: FileText,
  file: FileText,
  wallet: Wallet,
  shop: ShoppingBag,
  team: Users,
  chart: BarChart3,
  building: Building2,
  briefcase: Briefcase,
  rocket: Rocket,
  grid: LayoutGrid,
  calendar: Calendar,
  chat: MessageSquare,
  folder: Folder,
  tasks: ListChecks,
};

const DEFAULT_ITEMS: UseCase[] = [
  {
    title: "Small teams",
    heading: "Keep every project on track.",
    description: "See what is due, who owns it and what is stuck, in one view your whole team shares.",
    points: ["Tasks tracked from start to done", "Reminders before every deadline", "A weekly summary in your inbox"],
    panel: {
      icon: "team",
      title: "This week",
      meta: "5 tasks",
      rows: [
        { name: "Kickoff call", status: "Done", tone: "done" },
        { name: "Design review", status: "Tomorrow", tone: "pending" },
        { name: "Client feedback", status: "Overdue", tone: "alert" },
      ],
      note: "Client feedback is 2 days late. A friendly follow-up is drafted and ready.",
      action: "Send follow-up",
    },
  },
  {
    title: "Agencies",
    heading: "Run every client from one place.",
    description: "Projects, requests and sign-offs land in one view, sorted by client and due date.",
    points: ["One space per client", "Sign-offs with a clear trail", "Status updates sent for you"],
    panel: {
      icon: "briefcase",
      title: "Client projects",
      meta: "Active",
      rows: [
        { name: "Website refresh", status: "In review", tone: "pending" },
        { name: "Brand guide", status: "Delivered", tone: "done" },
        { name: "Launch plan", status: "Scheduled", tone: "pending" },
      ],
      note: "Two projects need sign-off before Friday to stay on schedule.",
      action: "Review projects",
    },
  },
  {
    title: "Operations",
    heading: "Spot blockers before they slow you down.",
    description: "Checklists, approvals and handoffs in one place, so nothing waits on a lost message.",
    points: ["Checklists that run themselves", "Approvals in one click", "Reports ready every Monday"],
    panel: {
      icon: "chart",
      title: "Weekly check-in",
      meta: "Day 3 of 5",
      rows: [
        { name: "Onboarding", status: "Done", tone: "done" },
        { name: "Approvals", status: "4 waiting", tone: "pending" },
        { name: "Vendor setup", status: "Blocked", tone: "alert" },
      ],
      note: "Vendor setup needs one document before the week can close.",
      action: "Open checklist",
    },
  },
  {
    title: "Founders",
    heading: "See the whole business at a glance.",
    description: "Goals, hiring and launches update as work moves, so every decision starts with real numbers.",
    points: ["Live goals and progress", "Plans for new hires", "Investor updates in one click"],
    panel: {
      icon: "rocket",
      title: "Goals",
      meta: "Updated today",
      rows: [
        { name: "Monthly goal", status: "On track", tone: "done" },
        { name: "Hiring plan", status: "2 roles open", tone: "pending" },
        { name: "Launch date", status: "In 3 weeks", tone: "done" },
      ],
      note: "At the current pace you reach the next milestone two weeks early.",
      action: "Share update",
    },
  },
];

const CHART_W = 240;
const CHART_H = 56;
const CHART_PAD = 4;

const linePath = (values: number[]) => {
  const min = Math.min(...values);
  const range = Math.max(...values) - min || 1;
  return values
    .map((value, index) => {
      const x = CHART_PAD + (index / (values.length - 1)) * (CHART_W - CHART_PAD * 2);
      const y = CHART_H - CHART_PAD - ((value - min) / range) * (CHART_H - CHART_PAD * 2);
      return `${index ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
};

const pillClass = (tone: Tone = "pending") => {
  if (tone === "done") return "rounded-full bg-white px-2 py-0.5 text-[length:var(--text-label)] leading-[1.4] text-black whitespace-nowrap";
  if (tone === "alert") return "rounded-full border border-white/60 px-2 py-0.5 text-[length:var(--text-label)] leading-[1.4] text-white whitespace-nowrap";
  return "rounded-full bg-white/15 px-2 py-0.5 text-[length:var(--text-label)] leading-[1.4] text-white/85 whitespace-nowrap";
};

const Tween = ({ text, run, reduce, delay, className }: { text: string; run: boolean; reduce: boolean; delay: number; className?: string }) => {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const el = ref.current;
    const match = text.match(/\d[\d,]*(?:\.\d+)?/);
    if (!el || !match || match.index === undefined || reduce || !run) return;
    const head = text.slice(0, match.index);
    const tail = text.slice(match.index + match[0].length);
    const digits = match[0];
    const to = Number(digits.replace(/,/g, ""));
    if (!Number.isFinite(to)) return;
    const decimals = digits.includes(".") ? digits.split(".")[1].length : 0;
    const grouped = digits.includes(",");
    const show = (value: number) =>
      `${head}${grouped ? value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : value.toFixed(decimals)}${tail}`;
    el.textContent = show(0);
    const controls = animate(0, to, {
      duration: 0.6,
      delay,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (value) => {
        el.textContent = show(value);
      },
    });
    return () => {
      controls.stop();
      el.textContent = text;
    };
  }, [text, run, reduce, delay]);
  return (
    <>
      <p key={`sr-${text}`} className="sr-only">{text}</p>
      <p key={text} ref={ref} aria-hidden="true" className={className}>
        {text}
      </p>
    </>
  );
};

const ITEM = {
  hidden: { opacity: 0, y: 10 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

const PILL = {
  hidden: { opacity: 0, scale: 0.85 },
  shown: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 420, damping: 26, delay: 0.08 } },
};

const BAR = {
  hidden: { scaleY: 0 },
  shown: (index: number) => ({ scaleY: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const, delay: 0.1 + index * 0.04 } }),
};

const DRAW = {
  hidden: { pathLength: 0 },
  shown: { pathLength: 1, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const, delay: 0.15 } },
};

const FILL = {
  hidden: { scaleY: 0 },
  shown: { scaleY: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const, delay: 0.2 } },
};

type BodyProps = { panel: Panel; run: boolean; reduce: boolean; delay: number };

const MetricsBody = ({ panel, run, reduce, delay }: BodyProps) => {
  const stats = panel.stats ?? [];
  const chart = (panel.chart ?? []).filter(Number.isFinite);
  const max = Math.max(...chart, 1);
  return (
    <>
      <motion.div variants={ITEM} className={`grid gap-2 border-t border-white/10 pt-3 ${stats.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
        {stats.map((stat, index) => (
          <div key={`${stat.label}-${index}`} className="min-w-0 rounded-[calc(var(--radius)-4px)] border border-white/10 bg-white/[0.06] px-3 py-2.5">
            <p className="text-[length:var(--text-label)] leading-[1.4] text-white/60 [overflow-wrap:anywhere]">{stat.label}</p>
            <Tween
              text={stat.value}
              run={run}
              reduce={reduce}
              delay={delay + 0.05 * (index + 1)}
              className="mt-1 whitespace-nowrap text-[length:var(--text-h3)] font-medium leading-[1.1] tracking-[-0.02em] tabular-nums"
            />
            {stat.delta && <p className="mt-1 whitespace-nowrap text-[length:var(--text-label)] leading-[1.4] tabular-nums text-white/70">{stat.delta}</p>}
          </div>
        ))}
      </motion.div>
      {chart.length > 1 && (
        <motion.div variants={ITEM} className="mt-2 rounded-[calc(var(--radius)-4px)] border border-white/10 bg-white/[0.06] p-3">
          {panel.chartType === "line" ? (
            <svg aria-hidden="true" viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="block h-auto w-full overflow-visible text-white">
              <motion.path variants={DRAW} d={linePath(chart)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <div aria-hidden="true" className="flex h-14 items-end gap-1.5">
              {chart.map((value, index) => (
                <motion.div
                  key={index}
                  custom={index}
                  variants={BAR}
                  style={{ height: `${Math.max(8, (value / max) * 100)}%` }}
                  className={`min-w-0 flex-1 origin-bottom rounded-sm ${index === chart.length - 1 ? "bg-white" : "bg-white/25"}`}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </>
  );
};

const TimelineBody = ({ panel }: BodyProps) => {
  const steps = panel.steps ?? [];
  return (
    <ol className="border-t border-white/10 pt-3">
      {steps.map((step, index) => {
        const next = steps[index + 1];
        return (
          <motion.li key={`${step.name}-${index}`} variants={ITEM} className="relative flex items-start gap-3 pb-3 last:pb-0">
            {next && (
              <div aria-hidden="true" className="absolute left-[calc(0.5rem-0.5px)] top-[1.25rem] h-[calc(100%-1.25rem)] w-px bg-white/15">
                {next.done && <motion.div variants={FILL} className="h-full w-full origin-top bg-white" />}
              </div>
            )}
            <motion.div
              variants={PILL}
              aria-hidden="true"
              className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-full ${step.done ? "bg-white text-black" : "border border-white/40"}`}
            >
              {step.done && <Check size={10} strokeWidth={3} />}
            </motion.div>
            <p className={`min-w-0 flex-1 text-[length:var(--text-small)] leading-[1.35] [overflow-wrap:anywhere] ${step.done ? "text-white/90" : "text-white/65"}`}>{step.name}</p>
            {step.time && <p className="shrink-0 whitespace-nowrap text-[length:var(--text-label)] leading-[1.6] tabular-nums text-white/60">{step.time}</p>}
          </motion.li>
        );
      })}
    </ol>
  );
};

const PanelBody = ({ panel, variant, run, reduce, delay = 0 }: { panel: Panel; variant: PanelVariant; run: boolean; reduce: boolean; delay?: number }) => {
  const Icon = ICONS[panel.icon ?? ""] ?? LayoutGrid;
  return (
    <>
      <motion.div variants={ITEM} className="flex items-center gap-3 pb-3">
        <div aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-md bg-white text-black">
          <Icon size={14} />
        </div>
        <p className="min-w-0 flex-1 text-[length:var(--text-body)] font-medium leading-[1.3] [overflow-wrap:anywhere]">{panel.title}</p>
        {panel.meta && (
          <Tween text={panel.meta} run={run} reduce={reduce} delay={delay} className="shrink-0 whitespace-nowrap text-[length:var(--text-label)] tabular-nums text-white/60" />
        )}
      </motion.div>
      {variant === "metrics" && <MetricsBody panel={panel} run={run} reduce={reduce} delay={delay} />}
      {variant === "timeline" && <TimelineBody panel={panel} run={run} reduce={reduce} delay={delay} />}
      {variant !== "metrics" && variant !== "timeline" && (panel.rows ?? []).map((row, index) => (
        <motion.div key={`${row.name}-${index}`} variants={ITEM} className="flex items-center justify-between gap-3 border-t border-white/10 py-2.5">
          <p className="min-w-0 text-[length:var(--text-small)] leading-[1.35] text-white/90 [overflow-wrap:anywhere]">{row.name}</p>
          <motion.div variants={PILL} className="shrink-0">
            <Tween text={row.status} run={run} reduce={reduce} delay={delay + 0.05 * (index + 1)} className={pillClass(row.tone)} />
          </motion.div>
        </motion.div>
      ))}
      {panel.note && (
        <motion.p
          variants={ITEM}
          className="mt-2 rounded-[calc(var(--radius)-4px)] border border-white/10 bg-white/[0.06] px-3 py-2.5 text-[length:var(--text-label)] leading-[1.5] text-white/85"
        >
          {panel.note}
        </motion.p>
      )}
      {panel.action && (
        <motion.div variants={ITEM} className="mt-3 w-full whitespace-nowrap rounded-lg bg-white px-4 py-2.5 text-center text-[length:var(--text-small)] font-medium text-black">
          <p>{panel.action}</p>
        </motion.div>
      )}
    </>
  );
};

export default function FeaturesFluidUseCases({
  label = "Use cases",
  title = "One platform, every way you work.",
  mutedTitle = "every way you work.",
  description = "Adapts to how your team works, whether you run client projects, a small shop or a growing company.",
  button,
  items = DEFAULT_ITEMS,
  variant = "status",
  interval = 6,
  className = "",
}: FeaturesFluidUseCasesProps) {
  const reduce = useReducedMotion();
  const { ease, base } = useKitMotion();
  const rootRef = useRef<HTMLElement>(null);
  const inView = useInView(rootRef, { amount: 0.35 });
  const seen = useInView(rootRef, { amount: 0.35, once: true }) || !!reduce;
  const [active, setActive] = useState(0);
  const [swapped, setSwapped] = useState(false);
  const [hovered, setHovered] = useState(false);
  const count = items.length;
  const current = items[Math.min(active, count - 1)];
  const panel = current?.panel;

  useEffect(() => {
    if (reduce || !inView || hovered || count < 2 || interval <= 0) return;
    const id = window.setTimeout(() => {
      setSwapped(true);
      setActive((value) => (value + 1) % count);
    }, interval * 1000);
    return () => window.clearTimeout(id);
  }, [active, reduce, inView, hovered, count, interval]);

  const select = (index: number) => {
    if (index === active) return;
    setSwapped(true);
    setActive(index);
  };

  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "0px 0px -8% 0px" },
    transition: { duration: base, ease, delay },
  });

  return (
    <section ref={rootRef} aria-label={label || title} className={`py-[var(--section-space)] text-foreground ${className}`}>
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

        <div
          className="mt-[clamp(2rem,4vw,3.5rem)] grid gap-[var(--gap)] lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)]"
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
        >
          <motion.ul
            initial={reduce ? false : "hide"}
            whileInView="show"
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            className="kit-card flex min-w-0 flex-col self-start px-[clamp(1.25rem,2vw,1.75rem)] py-2 lg:self-stretch"
          >
            {items.map((item, index) => {
              const open = index === active;
              return (
                <li key={`${item.title}-${index}`} className="relative">
                  {index > 0 && (
                    <motion.div
                      aria-hidden="true"
                      className="absolute inset-x-0 top-0 h-px origin-left bg-border"
                      variants={{ hide: { scaleX: 0 }, show: { scaleX: 1 } }}
                      transition={{ duration: 0.8, ease, delay: 0.2 + index * 0.05 }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => select(index)}
                    aria-expanded={open}
                    className="flex w-full items-center gap-[clamp(1rem,2.5vw,2rem)] py-[clamp(1.1rem,1.8vw,1.5rem)] text-left"
                  >
                    <p aria-hidden="true" className="w-6 shrink-0 text-[length:var(--text-small)] tabular-nums text-muted-foreground">{String(index + 1).padStart(2, "0")}</p>
                    <p className={`min-w-0 flex-1 text-[length:var(--text-body-lg)] font-medium leading-[1.3] tracking-[-0.01em] transition-colors duration-300 [overflow-wrap:anywhere] ${open ? "text-foreground" : "text-foreground/80"}`}>
                      {item.title}
                    </p>
                    <div
                      aria-hidden="true"
                      className={`size-2 shrink-0 rounded-full border transition-colors duration-300 ${open ? "border-foreground bg-foreground" : "border-muted-foreground bg-transparent"}`}
                    />
                  </button>
                  <div className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <div className="min-h-0 overflow-hidden">
                      <div className={`pb-[clamp(1.25rem,2vw,1.75rem)] pl-[calc(1.5rem+clamp(1rem,2.5vw,2rem))] transition-[opacity,transform] duration-300 ease-out ${open ? "translate-y-0 opacity-100 delay-150" : "-translate-y-1 opacity-0"}`}>
                        {item.heading && (
                          <h3 className="text-balance text-[length:var(--text-h3)] font-medium leading-[1.2] tracking-[-0.02em]">{item.heading}</h3>
                        )}
                        {item.description && (
                          <p className="mt-3 max-w-[46ch] text-balance text-[length:var(--text-body)] leading-[1.55] text-muted-foreground">{item.description}</p>
                        )}
                        {item.points && item.points.length > 0 && (
                          <ul className="mt-5 flex flex-col gap-2.5">
                            {item.points.map((point) => (
                              <li key={point} className="flex items-start gap-2.5">
                                <Check size={14} className="mt-[0.3em] shrink-0 text-foreground/80" aria-hidden="true" />
                                <p className="text-[length:var(--text-small)] leading-[1.45] text-foreground/85">{point}</p>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </motion.ul>

          <motion.div
            initial={reduce ? false : "hide"}
            whileInView="show"
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            className="relative min-w-0"
          >
            <motion.div
              variants={{
                hide: { clipPath: "inset(48% 0% 48% 0% round 16px)" },
                show: { clipPath: "inset(0% 0% 0% 0% round 16px)" },
              }}
              transition={{ duration: 0.9, ease }}
              className="aspect-[4/5] h-full w-full sm:aspect-[5/4] lg:aspect-auto lg:min-h-[32rem]"
            >
              <FluidPanel seed={20 + active * 0.35} imageSrc={current?.imageSrc} imageAlt={current?.imageAlt} className="grid h-full w-full place-items-center rounded-[var(--radius-card)] p-[clamp(1rem,4vw,3rem)]">
                {panel && (
                  <motion.div
                    variants={{
                      hide: { opacity: 0, y: 24 },
                      show: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: base, ease, delay: 0.45 }}
                    className="grid w-full max-w-[26rem] rounded-[var(--radius)] border border-white/15 bg-black/30 p-[clamp(0.875rem,1.6vw,1.25rem)] text-white backdrop-blur-md"
                  >
                    {items.map((item, index) =>
                      item.panel ? (
                        <div key={`size-${index}`} aria-hidden="true" className="invisible [grid-area:1/1]">
                          <PanelBody panel={item.panel} variant={item.panel.variant ?? variant} run={false} reduce />
                        </div>
                      ) : null,
                    )}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={active}
                        initial={reduce ? false : "hidden"}
                        animate={seen ? "shown" : "hidden"}
                        exit="gone"
                        variants={{
                          hidden: { opacity: 1, y: 0 },
                          shown: { opacity: 1, y: 0, transition: { staggerChildren: 0.05, delayChildren: swapped ? 0.02 : 0.8 } },
                          gone: { opacity: 0, y: -8, transition: { duration: reduce ? 0 : 0.25, ease } },
                        }}
                        className="self-center [grid-area:1/1]"
                      >
                        <PanelBody panel={panel} variant={panel.variant ?? variant} run={seen} reduce={!!reduce} delay={swapped ? 0.15 : 0.95} />
                      </motion.div>
                    </AnimatePresence>
                  </motion.div>
                )}
              </FluidPanel>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
