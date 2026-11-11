import { useEffect, useRef, type CSSProperties } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type MotionStyle } from "motion/react";
import {
  ArrowLeftRight,
  BarChart3,
  Bell,
  Calendar,
  Circle,
  CircleHelp,
  CreditCard,
  FileText,
  Folder,
  Globe,
  Inbox,
  LayoutDashboard,
  ListChecks,
  Mail,
  MessageSquare,
  Settings,
  ShoppingCart,
  Sparkle,
  Star,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import FluidPanel from "@/components/kit/FluidPanel";
import MutedAccentTitle from "@/components/kit/MutedAccentTitle";
import { useKitMotion } from "@/components/kit/kitMotion";

type Button = { text: string; href: string };
type NavItem = { label: string; icon?: string };
type Stat = { label: string; value: string; delta?: string; points?: number[] };
type Bar = { label: string; value: number; target?: number };
type Row = { title: string; meta?: string; value?: string };
type BoardCard = { title: string; meta?: string; owner?: string; progress?: number };
type BoardColumn = { title: string; cards: BoardCard[] };
type Series = { label: string; points: number[] };

type Dashboard = {
  appName?: string;
  menuLabel?: string;
  navItems?: NavItem[];
  activeIndex?: number;
  generalLabel?: string;
  generalItems?: NavItem[];
  pageTitle?: string;
  greeting?: string;
  subline?: string;
  stats?: Stat[];
  chart?: { title: string; legend?: string[]; bars: Bar[] };
  table?: { title: string; columns?: string[]; rows: Row[] };
  promo?: { title: string; text?: string; progress?: number; button?: Button };
  columns?: BoardColumn[];
  trend?: { title: string; labels?: string[]; series: Series[] };
};

type HeroFluidDashboardProps = {
  tag?: string;
  title?: string;
  mutedTitle?: string;
  description?: string;
  primaryButton?: Button;
  secondaryButton?: Button;
  variant?: "overview" | "board" | "chart";
  dashboard?: Dashboard;
  introDelay?: number;
  className?: string;
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase();

const linePath = (points: number[], max: number) =>
  points.length < 2 ? "" : points.map((p, i) => `${i ? "L" : "M"}${((i / (points.length - 1)) * 100).toFixed(2)} ${(100 - (Math.max(0, p) / max) * 100).toFixed(2)}`).join(" ");

const ICONS: Record<string, LucideIcon> = {
  overview: LayoutDashboard,
  bell: Bell,
  wallet: Wallet,
  card: CreditCard,
  file: FileText,
  transfer: ArrowLeftRight,
  chart: BarChart3,
  folder: Folder,
  users: Users,
  chat: MessageSquare,
  mail: Mail,
  calendar: Calendar,
  inbox: Inbox,
  tasks: ListChecks,
  cart: ShoppingCart,
  star: Star,
  globe: Globe,
  settings: Settings,
  help: CircleHelp,
};

const iconFor = (key?: string) => (key && ICONS[key]) || Circle;

const splitValue = (value: string) => {
  const m = value.match(/^(.*?)(\.\d+)$/);
  return m ? [m[1], m[2]] : [value, ""];
};

const sparkPath = (points: number[]) => {
  if (points.length < 2) return "";
  const min = Math.min(...points);
  const span = Math.max(...points) - min || 1;
  return points.map((p, i) => `${i ? "L" : "M"}${((i / (points.length - 1)) * 100).toFixed(1)} ${(36 - ((p - min) / span) * 32).toFixed(1)}`).join(" ");
};

const axisTicks = (max: number) => {
  const raw = (max > 0 ? max : 1) / 5;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = ([1, 2, 2.5, 5, 10].find((s) => s * mag >= raw) ?? 10) * mag;
  const count = Math.max(1, Math.ceil((max > 0 ? max : 1) / step - 1e-9));
  return Array.from({ length: count + 1 }, (_, i) => Number(((count - i) * step).toPrecision(12)));
};

const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

const CountValue = ({ value, delay, className }: { value: string; delay: number; className?: string }) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { ease, slow } = useKitMotion();

  useEffect(() => {
    const node = ref.current;
    const m = value.match(/^(\D*)(\d[\d,]*(?:\.\d+)?)(.*)$/);
    if (!node || !m || reduce) return;
    const [, prefix, digits, suffix] = m;
    const target = Number(digits.replace(/,/g, ""));
    if (!Number.isFinite(target)) return;
    const decimals = digits.split(".")[1]?.length ?? 0;
    const grouped = digits.includes(",");
    const show = (n: number) => {
      node.textContent = `${prefix}${grouped ? n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : n.toFixed(decimals)}${suffix}`;
    };
    show(0);
    const controls = animate(0, target, { duration: slow * 1.6, ease, delay, onUpdate: show });
    return () => controls.stop();
  }, [value, delay, reduce, ease, slow]);

  return (
    <>
      <p className="sr-only">{value}</p>
      <p ref={ref} aria-hidden="true" className={className}>
        {value}
      </p>
    </>
  );
};

export default function HeroFluidDashboard({
  tag = "Now with AI-powered insights",
  title = "One platform to run your work.",
  mutedTitle = "to run your work.",
  description = "Plan projects, track results and keep your team in sync, all in one calm view, without the noise.",
  primaryButton = { text: "Start for free", href: "#pricing" },
  secondaryButton = { text: "View demo", href: "#contact" },
  variant = "overview",
  dashboard,
  introDelay = 0,
  className = "",
}: HeroFluidDashboardProps) {
  const reduce = useReducedMotion();
  const { ease, base, slow } = useKitMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const tilt = useTransform(scrollYProgress, [0, 1], [0, 8]);
  const shrink = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const lift = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const textFade = useTransform(scrollYProgress, [0, 1], [1, 0.4]);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const mouseRotateY = useSpring(pointerX, { stiffness: 120, damping: 20, mass: 0.6 });
  const mouseRotateX = useSpring(pointerY, { stiffness: 120, damping: 20, mass: 0.6 });
  const winRef = useRef<HTMLDivElement>(null);
  const fit = variant !== "overview";

  useEffect(() => {
    const win = winRef.current;
    const section = ref.current;
    if (!fit || !win || !section) return;
    const observer = new ResizeObserver(() => section.style.setProperty("--fit-h", `${win.offsetHeight}px`));
    observer.observe(win);
    return () => {
      observer.disconnect();
      section.style.removeProperty("--fit-h");
    };
  }, [fit]);

  useEffect(() => {
    const node = ref.current;
    if (!node || reduce || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = node.getBoundingClientRect();
      pointerX.set(((e.clientX - r.left) / r.width - 0.5) * 10);
      pointerY.set(-((e.clientY - r.top) / r.height - 0.5) * 10);
    };
    const leave = () => {
      pointerX.set(0);
      pointerY.set(0);
    };
    node.addEventListener("pointermove", move);
    node.addEventListener("pointerleave", leave);
    return () => {
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerleave", leave);
      leave();
    };
  }, [reduce, pointerX, pointerY]);

  const d = dashboard ?? {};
  const boardColumns = d.columns ?? [];
  const trend = d.trend;
  const series = trend?.series ?? [];
  const trendTicks = axisTicks(Math.max(0, ...series.flatMap((s) => s.points)));
  const trendMax = trendTicks[0] || 1;
  const trendLabels = trend?.labels ?? [];
  const nav = d.navItems ?? [];
  const activeIndex = d.activeIndex ?? 0;
  const general = d.generalItems ?? [];
  const stats = d.stats ?? [];
  const bars = d.chart?.bars ?? [];
  const ticks = axisTicks(Math.max(0, ...bars.map((b) => Math.max(b.value, b.target ?? 0))));
  const max = ticks[0] || 1;
  const rows = d.table?.rows ?? [];
  const columns = d.table?.columns ?? [];
  const legend = d.chart?.legend ?? [];
  const settle = introDelay + 0.6;

  const rise = (i: number) => ({
    initial: reduce ? false : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: base * 0.9, ease, delay: introDelay + 0.28 + i * 0.05 },
  });

  const widget = (i: number) => ({
    initial: reduce ? false : { opacity: 0, y: 24, scale: 0.96 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: base * 0.9, ease, delay: settle + 0.15 + i * 0.06 },
  });

  return (
    <section ref={ref} aria-label="Hero" className={`relative min-h-svh overflow-x-clip lg:flex lg:items-center ${className}`}>
      <motion.div style={reduce ? undefined : { y: textY, opacity: textFade }} className="relative z-10 mx-auto w-[var(--container)] pb-10 pt-[7rem] lg:pb-3 lg:pt-[5rem]">
        <div className="lg:w-[47%] lg:pr-[clamp(1rem,3vw,3rem)]">
          <motion.div {...rise(0)} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-foreground/85">
            <Sparkle aria-hidden="true" size={12} fill="currentColor" />
            <p className="text-[length:var(--text-small)] leading-none">{tag}</p>
          </motion.div>
          <MutedAccentTitle as="h1" text={title} muted={mutedTitle} play delay={introDelay + 0.1} className="mt-6 max-w-[16ch] text-[length:calc(var(--text-display)*0.84)]" />
          {description && (
            <motion.p {...rise(2)} className="mt-6 max-w-[34rem] text-balance text-[length:var(--text-body-lg)] leading-[1.55] text-muted-foreground">
              {description}
            </motion.p>
          )}
          {(primaryButton || secondaryButton) && (
            <motion.div {...rise(3)} className="mt-8 flex flex-wrap gap-3">
              {primaryButton && (
                <a href={primaryButton.href} className="btn-primary">
                  <p>{primaryButton.text}</p>
                </a>
              )}
              {secondaryButton && (
                <a href={secondaryButton.href} className="btn-secondary">
                  <p>{secondaryButton.text}</p>
                </a>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>

      <div className="mx-auto w-[var(--container)] pb-6 lg:contents">
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease, delay: introDelay }}
          className="h-[calc(var(--fit-h,46rem)*0.62+2.5rem)] w-full lg:absolute lg:bottom-3 lg:left-[calc((100%-var(--container))/2+var(--container)*0.5)] lg:right-0 lg:top-[5rem] lg:h-auto lg:w-auto"
        >
        <FluidPanel seed={3} className="size-full rounded-[var(--radius-card)] lg:rounded-r-none">
          <motion.div
            style={reduce ? undefined : ({ rotateX: tilt, scale: shrink, y: lift, transformPerspective: 1400 } as unknown as MotionStyle)}
            className="absolute inset-0 origin-top will-change-transform"
          >
            <motion.div
              style={reduce ? undefined : { rotateX: mouseRotateX, rotateY: mouseRotateY, transformPerspective: 1600 }}
              className="absolute inset-0 will-change-transform"
            >
            <div ref={winRef} aria-hidden="true" className={`absolute left-[1.25rem] top-[1.25rem] ${fit ? "h-auto" : "h-[46rem]"} w-[40rem] origin-top-left scale-[0.62] lg:left-[11%] lg:top-[11%] lg:h-[50rem] lg:w-[64rem] lg:scale-[0.8] xl:scale-100`}>
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: slow * 0.9, ease, delay: settle }}
                className="flex size-full overflow-hidden rounded-xl border border-foreground/10 bg-background/95 text-foreground"
              >
                <div className="hidden w-[15rem] shrink-0 flex-col border-r border-foreground/10 p-4 lg:flex">
                  {d.appName && (
                    <div className="flex items-center gap-2 px-2 pt-2">
                      <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4 fill-current">
                        <rect x="1" y="1" width="7.5" height="7.5" rx="1.5" />
                        <rect x="1" y="11.5" width="7.5" height="7.5" rx="1.5" />
                        <rect x="11.5" y="11.5" width="7.5" height="7.5" rx="1.5" />
                      </svg>
                      <p className="text-[length:var(--text-body-lg)] font-medium leading-none tracking-[-0.03em]">{d.appName}</p>
                    </div>
                  )}
                  {d.menuLabel && <p className="mt-7 px-2 text-[length:var(--text-label)] text-muted-foreground">{d.menuLabel}</p>}
                  {nav.length > 0 && (
                    <div className="mt-2 flex flex-col gap-0.5">
                      {nav.map((item, i) => {
                        const Icon = iconFor(item.icon);
                        return (
                          <motion.div key={`${item.label}-${i}`} {...widget(i * 0.5)} className={`flex items-center gap-3 rounded-lg px-2 py-2.5 ${i === activeIndex ? "bg-foreground/[0.07]" : ""}`}>
                            <Icon aria-hidden="true" size={15} className="shrink-0 text-foreground/80" />
                            <p className="truncate text-[length:var(--text-small)] leading-none pb-[0.2em] -mb-[0.2em]">{item.label}</p>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                  {general.length > 0 && (
                    <>
                      <div className="mx-2 mt-4 h-px bg-foreground/10" />
                      {d.generalLabel && <p className="mt-5 px-2 text-[length:var(--text-label)] text-muted-foreground">{d.generalLabel}</p>}
                      <div className="mt-2 flex flex-col gap-0.5">
                        {general.map((item, i) => {
                          const Icon = iconFor(item.icon);
                          return (
                            <div key={`${item.label}-${i}`} className="flex items-center gap-3 rounded-lg px-2 py-2.5">
                              <Icon aria-hidden="true" size={15} className="shrink-0 text-foreground/80" />
                              <p className="truncate text-[length:var(--text-small)] leading-none pb-[0.2em] -mb-[0.2em]">{item.label}</p>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                  {d.promo && (
                    <motion.div {...widget(5)} className="mt-auto rounded-[var(--radius)] border border-foreground/10 bg-card p-4">
                      <p className="text-[length:var(--text-small)] font-medium">{d.promo.title}</p>
                      {d.promo.progress !== undefined && (
                        <div className="mt-3 h-1 overflow-hidden rounded-full bg-foreground/20">
                          <motion.div
                            initial={reduce ? false : { scaleX: 0 }}
                            animate={{ scaleX: Math.min(1, Math.max(0, d.promo.progress)) }}
                            transition={{ duration: slow, ease, delay: settle + 0.8 }}
                            className="h-full origin-left rounded-full bg-foreground"
                          />
                        </div>
                      )}
                      {d.promo.text && <p className="mt-3 text-[length:var(--text-label)] leading-[1.45] text-muted-foreground">{d.promo.text}</p>}
                      {d.promo.button && (
                        <a href={d.promo.button.href} tabIndex={-1} className="mt-3 flex h-9 items-center justify-center whitespace-nowrap rounded-lg bg-foreground px-3 text-background">
                          <p className="text-[length:var(--text-small)] font-medium">{d.promo.button.text}</p>
                        </a>
                      )}
                    </motion.div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  {d.pageTitle && (
                    <div className="border-b border-foreground/10 px-6 py-5">
                      <p className="text-[length:var(--text-body)] font-medium leading-none">{d.pageTitle}</p>
                    </div>
                  )}
                  <div className="p-6">
                    {(d.greeting || d.subline) && (
                      <motion.div {...widget(0)} className="mb-6">
                        {d.greeting && <h3 className="text-[length:var(--text-h2)]">{d.greeting}</h3>}
                        {d.subline && <p className="mt-2 text-[length:var(--text-small)] text-muted-foreground">{d.subline}</p>}
                      </motion.div>
                    )}
                    {variant === "board" && boardColumns.length > 0 && (
                      <div style={{ gridTemplateColumns: `repeat(${boardColumns.length}, minmax(0, 1fr))` }} className="grid items-start gap-3">
                        {boardColumns.map((col, ci) => (
                          <motion.div key={`${col.title}-${ci}`} {...widget(1 + ci)} className="flex min-w-0 flex-col gap-2 rounded-[var(--radius)] border border-foreground/10 bg-card p-3">
                            <div className="flex items-center gap-2 px-1 pb-1 pt-0.5">
                              <div aria-hidden="true" style={{ opacity: boardColumns.length > 1 ? 0.3 + (0.7 * ci) / (boardColumns.length - 1) : 1 }} className="size-2 shrink-0 rounded-full bg-foreground" />
                              <p className="truncate text-[length:var(--text-small)] font-medium">{col.title}</p>
                              <p className="ml-auto shrink-0 rounded-full bg-foreground/10 px-2 py-0.5 text-[length:var(--text-label)] tabular-nums">{col.cards.length}</p>
                            </div>
                            {col.cards.map((card, i) => (
                              <motion.div
                                key={`${card.title}-${i}`}
                                initial={reduce ? false : { opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: base, ease, delay: settle + 0.45 + ci * 0.08 + i * 0.08 }}
                                className="rounded-lg border border-foreground/10 bg-foreground/[0.04] p-3"
                              >
                                <p className="text-[length:var(--text-small)] leading-[1.35]">{card.title}</p>
                                {(card.meta || card.owner) && (
                                  <div className="mt-3 flex items-center gap-2">
                                    {card.meta && <p className="min-w-0 truncate text-[length:var(--text-label)] text-muted-foreground">{card.meta}</p>}
                                    {card.owner && (
                                      <div className="ml-auto flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground/[0.12]">
                                        <p className="text-[length:var(--text-label)] font-medium leading-none">{initials(card.owner)}</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                                {card.progress !== undefined && (
                                  <div className="mt-3 h-1 overflow-hidden rounded-full bg-foreground/20">
                                    <motion.div
                                      initial={reduce ? false : { scaleX: 0 }}
                                      animate={{ scaleX: Math.min(1, Math.max(0, card.progress)) }}
                                      transition={{ duration: slow, ease, delay: settle + 0.7 + ci * 0.08 + i * 0.08 }}
                                      className="h-full origin-left rounded-full bg-foreground"
                                    />
                                  </div>
                                )}
                              </motion.div>
                            ))}
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {variant === "chart" && (
                      <>
                        {stats.length > 0 && (
                          <div style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }} className="mb-3 grid gap-3">
                            {stats.map((stat, i) => {
                              const [whole, cents] = splitValue(stat.value);
                              return (
                                <motion.div key={`${stat.label}-${i}`} {...widget(1 + i)} className="min-w-0 rounded-[var(--radius)] border border-foreground/10 bg-card p-4">
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="truncate text-[length:var(--text-small)] text-muted-foreground">{stat.label}</p>
                                    {stat.delta && (
                                      <motion.p
                                        initial={reduce ? false : { scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: base, ease, delay: settle + 0.6 + i * 0.08 }}
                                        className="shrink-0 rounded-full bg-foreground/10 px-2 py-0.5 text-[length:var(--text-label)] tabular-nums"
                                      >
                                        {stat.delta}
                                      </motion.p>
                                    )}
                                  </div>
                                  <div className="mt-3 flex whitespace-nowrap text-[length:var(--text-h3)] font-medium leading-none tracking-[-0.03em] tabular-nums">
                                    <CountValue value={whole} delay={settle + 0.4 + i * 0.1} />
                                    {cents && <p className="text-muted-foreground">{cents}</p>}
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        )}
                        <div className="grid grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] items-start gap-3">
                          {trend && series.length > 0 && (
                            <motion.div {...widget(4)} className="min-w-0 rounded-[var(--radius)] border border-foreground/10 bg-card p-5">
                              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                                <p className="text-[length:var(--text-body)] font-medium">{trend.title}</p>
                                <div className="flex flex-wrap items-center gap-4 text-[length:var(--text-label)] text-muted-foreground">
                                  {series.map((s, i) => (
                                    <div key={`${s.label}-${i}`} className="flex items-center gap-1.5">
                                      <div aria-hidden="true" style={{ opacity: Math.max(0.25, 1 - i * 0.55) }} className="h-0.5 w-3 rounded-full bg-foreground" />
                                      <p>{s.label}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="mt-5 flex gap-4">
                                <div className="flex h-[12rem] flex-col justify-between text-right text-[length:var(--text-label)] leading-none text-muted-foreground tabular-nums">
                                  {trendTicks.map((tick, i) => (
                                    <p key={`${tick}-${i}`}>{compact.format(tick)}</p>
                                  ))}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="relative h-[12rem]">
                                    <div aria-hidden="true" className="absolute inset-0 flex flex-col justify-between">
                                      {trendTicks.map((tick, i) => (
                                        <div key={`${tick}-${i}`} className="h-px bg-foreground/[0.06]" />
                                      ))}
                                    </div>
                                    <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible text-foreground">
                                      {series[0].points.length > 1 && (
                                        <motion.path
                                          d={`${linePath(series[0].points, trendMax)} L100 100 L0 100 Z`}
                                          fill="currentColor"
                                          fillOpacity={0.1}
                                          initial={reduce ? false : { opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          transition={{ duration: slow, ease, delay: settle + 0.9 }}
                                        />
                                      )}
                                      {series.map((s, i) => (
                                        <motion.path
                                          key={`${s.label}-${i}`}
                                          d={linePath(s.points, trendMax)}
                                          fill="none"
                                          stroke="currentColor"
                                          strokeOpacity={Math.max(0.25, 1 - i * 0.55)}
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          vectorEffect="non-scaling-stroke"
                                          initial={reduce ? false : { pathLength: 0 }}
                                          animate={{ pathLength: 1 }}
                                          transition={{ duration: slow * 1.3, ease, delay: settle + 0.5 + i * 0.12 }}
                                        />
                                      ))}
                                    </svg>
                                  </div>
                                  {trendLabels.length > 0 && (
                                    <div className="mt-3 flex justify-between gap-2">
                                      {trendLabels.map((label, i) => (
                                        <p key={`${label}-${i}`} className="truncate text-[length:var(--text-label)] text-muted-foreground">
                                          {label}
                                        </p>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                          {d.table && rows.length > 0 && (
                            <motion.div {...widget(5)} className="min-w-0 rounded-[var(--radius)] border border-foreground/10 bg-card">
                              <p className="px-4 pb-3 pt-5 text-[length:var(--text-body)] font-medium">{d.table.title}</p>
                              {rows.map((row, i) => (
                                <motion.div
                                  key={`${row.title}-${i}`}
                                  initial={reduce ? false : { opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: base, ease, delay: settle + 0.7 + i * 0.08 }}
                                  className="flex items-center gap-3 border-t border-foreground/10 px-4 py-3"
                                >
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-[length:var(--text-small)]">{row.title}</p>
                                    {row.meta && <p className="truncate text-[length:var(--text-label)] text-muted-foreground">{row.meta}</p>}
                                  </div>
                                  {row.value && <p className="shrink-0 text-[length:var(--text-small)] tabular-nums">{row.value}</p>}
                                </motion.div>
                              ))}
                            </motion.div>
                          )}
                        </div>
                      </>
                    )}

                    {variant === "overview" && stats.length > 0 && (
                      <div className={`mb-3 grid gap-3 ${stats.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                        {stats.slice(0, 2).map((stat, i) => {
                          const [whole, cents] = splitValue(stat.value);
                          return (
                            <motion.div key={`${stat.label}-${i}`} {...widget(1 + i)} className="rounded-[var(--radius)] border border-foreground/10 bg-card p-5">
                              <div className="flex items-center justify-between gap-3">
                                <p className="truncate text-[length:var(--text-small)] text-muted-foreground">{stat.label}</p>
                                {stat.delta && (
                                  <motion.p
                                    initial={reduce ? false : { scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: base, ease, delay: settle + 0.6 + i * 0.08 }}
                                    className="shrink-0 rounded-full bg-foreground/10 px-2 py-0.5 text-[length:var(--text-label)] tabular-nums"
                                  >
                                    {stat.delta}
                                  </motion.p>
                                )}
                              </div>
                              <div className="mt-4 flex items-end justify-between gap-4">
                                <div className="flex whitespace-nowrap text-[length:var(--text-h2)] font-medium leading-none tracking-[-0.03em] tabular-nums">
                                  <CountValue value={whole} delay={settle + 0.4 + i * 0.1} />
                                  {cents && <p className="text-muted-foreground">{cents}</p>}
                                </div>
                                {stat.points && stat.points.length > 1 && (
                                  <svg aria-hidden="true" viewBox="0 0 100 40" preserveAspectRatio="none" className="h-9 w-[7.5rem] shrink-0 overflow-visible text-foreground">
                                    <motion.path
                                      d={sparkPath(stat.points)}
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      vectorEffect="non-scaling-stroke"
                                      initial={reduce ? false : { pathLength: 0 }}
                                      animate={{ pathLength: 1 }}
                                      transition={{ duration: slow, ease, delay: settle + 0.5 + i * 0.1 }}
                                    />
                                  </svg>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}

                    {variant === "overview" && d.chart && bars.length > 0 && (
                      <motion.div {...widget(3)} className="mb-3 rounded-[var(--radius)] border border-foreground/10 bg-card p-5">
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                          <p className="text-[length:var(--text-body)] font-medium">{d.chart.title}</p>
                          {legend.length > 0 && (
                            <div className="flex items-center gap-4 text-[length:var(--text-label)] text-muted-foreground">
                              {legend.slice(0, 2).map((item, i) => (
                                <div key={`${item}-${i}`} className="flex items-center gap-1.5">
                                  <div aria-hidden="true" className={`size-2 rounded-sm ${i === 0 ? "bg-foreground" : "bg-foreground/25"}`} />
                                  <p>{item}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="mt-5 flex gap-4">
                          <div className="flex h-[11rem] flex-col justify-between text-right text-[length:var(--text-label)] leading-none text-muted-foreground tabular-nums">
                            {ticks.map((tick, i) => (
                              <p key={`${tick}-${i}`}>{compact.format(tick)}</p>
                            ))}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex h-[11rem] items-end gap-3">
                              {bars.map((bar, i) => (
                                <div key={`${bar.label}-${i}`} className="relative h-full min-w-0 flex-1">
                                  {bar.target !== undefined && (
                                    <motion.div
                                      initial={reduce ? false : { scaleY: 0 }}
                                      animate={{ scaleY: 1 }}
                                      transition={{ duration: slow, ease, delay: settle + 0.45 + i * 0.06 }}
                                      style={{ height: `${(bar.target / max) * 100}%` } as CSSProperties}
                                      className="absolute inset-x-0 bottom-0 origin-bottom rounded-md bg-foreground/20"
                                    />
                                  )}
                                  <motion.div
                                    initial={reduce ? false : { scaleY: 0 }}
                                    animate={{ scaleY: 1 }}
                                    transition={{ duration: slow, ease, delay: settle + 0.6 + i * 0.06 }}
                                    style={{ height: `${(bar.value / max) * 100}%` } as CSSProperties}
                                    className="absolute inset-x-0 bottom-0 origin-bottom rounded-md bg-foreground"
                                  />
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 flex gap-3">
                              {bars.map((bar, i) => (
                                <p key={`${bar.label}-${i}`} className="min-w-0 flex-1 truncate text-center text-[length:var(--text-label)] text-muted-foreground">
                                  {bar.label}
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {variant === "overview" && d.table && rows.length > 0 && (
                      <motion.div {...widget(4)} className="rounded-[var(--radius)] border border-foreground/10 bg-card">
                        <p className="px-5 pb-3 pt-5 text-[length:var(--text-body)] font-medium">{d.table.title}</p>
                        {columns.length > 0 && (
                          <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] border-t border-foreground/10 px-5 py-2.5 text-[length:var(--text-label)] text-muted-foreground">
                            <p>{columns[0]}</p>
                            {columns[1] && <p>{columns[1]}</p>}
                          </div>
                        )}
                        {rows.map((row, i) => (
                          <motion.div
                            key={`${row.title}-${i}`}
                            initial={reduce ? false : { opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: base, ease, delay: settle + 0.7 + i * 0.08 }}
                            className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-center border-t border-foreground/10 px-5 py-3"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-foreground/[0.07]">
                                <p className="text-[length:var(--text-label)] font-medium">{row.title.charAt(0)}</p>
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-[length:var(--text-small)]">{row.title}</p>
                                {row.meta && <p className="truncate text-[length:var(--text-label)] text-muted-foreground">{row.meta}</p>}
                              </div>
                            </div>
                            {row.value && <p className="truncate text-[length:var(--text-small)] tabular-nums">{row.value}</p>}
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
            </motion.div>
          </motion.div>
        </FluidPanel>
        </motion.div>
      </div>
    </section>
  );
}
