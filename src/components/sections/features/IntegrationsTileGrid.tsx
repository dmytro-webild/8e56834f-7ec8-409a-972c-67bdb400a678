import { motion, useReducedMotion } from "motion/react";
import {
  ArrowLeftRight,
  ArrowRight,
  BarChart3,
  BookOpen,
  Calendar,
  Cloud,
  CreditCard,
  Database,
  FileText,
  Globe,
  Landmark,
  LayoutGrid,
  Mail,
  MessageSquare,
  Plug,
  Receipt,
  ShoppingCart,
  Sparkle,
  Table,
  Users,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";
import MutedAccentTitle from "@/components/kit/MutedAccentTitle";
import { useKitMotion } from "@/components/kit/kitMotion";

type Integration = { name: string; category?: string; icon?: string };

type IntegrationsTileGridProps = {
  label?: string;
  title?: string;
  mutedTitle?: string;
  description?: string;
  button?: { text: string; href: string };
  items?: Integration[];
  className?: string;
};

const ICONS: Record<string, LucideIcon> = {
  card: CreditCard,
  wallet: Wallet,
  transfer: ArrowLeftRight,
  bank: Landmark,
  cart: ShoppingCart,
  receipt: Receipt,
  book: BookOpen,
  grid: LayoutGrid,
  table: Table,
  chat: MessageSquare,
  users: Users,
  chart: BarChart3,
  mail: Mail,
  calendar: Calendar,
  cloud: Cloud,
  database: Database,
  file: FileText,
  zap: Zap,
  globe: Globe,
};

const DEFAULT_ITEMS: Integration[] = [
  { name: "Payments", category: "Card processing", icon: "card" },
  { name: "Wallets", category: "Online checkout", icon: "wallet" },
  { name: "Transfers", category: "Global payouts", icon: "transfer" },
  { name: "Banks", category: "Bank sync", icon: "bank" },
  { name: "Storefront", category: "Commerce", icon: "cart" },
  { name: "Point of sale", category: "In person", icon: "receipt" },
  { name: "Ledger", category: "Accounting", icon: "book" },
  { name: "Bookkeeping", category: "Accounting", icon: "grid" },
  { name: "Spreadsheets", category: "Exports", icon: "table" },
  { name: "Team chat", category: "Alerts", icon: "chat" },
  { name: "Payroll", category: "People", icon: "users" },
  { name: "Dashboards", category: "Reporting", icon: "chart" },
];

export default function IntegrationsTileGrid({
  label = "Integrations",
  title = "Works with the tools you already use.",
  mutedTitle = "you already use.",
  description = "Connect your bank accounts, payment providers and accounting tools in minutes. Every number stays in sync, so you never export a spreadsheet again.",
  button = { text: "Browse all integrations", href: "#" },
  items = DEFAULT_ITEMS,
  className = "",
}: IntegrationsTileGridProps) {
  const reduce = useReducedMotion();
  const { ease, base } = useKitMotion();

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

        <div className="mt-[clamp(2rem,4vw,3.5rem)]">
          <motion.ul
            initial={reduce ? false : "hide"}
            whileInView="show"
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            className="flex snap-x snap-mandatory gap-[var(--gap)] overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:snap-none lg:grid-cols-4 lg:overflow-visible xl:grid-cols-6"
          >
            {items.map((item, index) => {
              const Icon = ICONS[item.icon ?? ""] ?? Plug;
              const light = index % 2 === 0;
              return (
                <li key={`${item.name}-${index}`} className="w-[70%] min-w-0 shrink-0 snap-start [perspective:900px] lg:w-auto">
                  <motion.div
                    variants={{ hide: { rotateX: -70, opacity: 0 }, show: { rotateX: 0, opacity: 1 } }}
                    transition={{ duration: base, ease, delay: 0.1 + index * 0.04 }}
                    style={{ transformOrigin: "50% 0%" }}
                    className="kit-card flex h-full min-h-[clamp(9.5rem,14vw,12rem)] flex-col justify-between gap-6 p-[clamp(1rem,1.8vw,1.5rem)]"
                  >
                    <div
                      aria-hidden="true"
                      className={`grid size-10 place-items-center rounded-lg ${light ? "bg-foreground text-background" : "border border-border bg-secondary text-foreground"}`}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[length:var(--text-body)] font-medium leading-[1.3] text-foreground [overflow-wrap:anywhere]">{item.name}</p>
                      {item.category && (
                        <p className="mt-1 text-[length:var(--text-small)] leading-[1.35] text-muted-foreground [overflow-wrap:anywhere]">{item.category}</p>
                      )}
                    </div>
                  </motion.div>
                </li>
              );
            })}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
