import { useRef } from "react";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ArrowRight, Sparkle } from "lucide-react";
import FluidPanel from "@/components/kit/FluidPanel";
import MutedAccentTitle from "@/components/kit/MutedAccentTitle";
import { useImageReady, useKitMotion } from "@/components/kit/kitMotion";
import Media from "@/components/kit/Media";

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

type ContactFluidFormProps = {
  tag?: string;
  title?: string;
  mutedTitle?: string;
  nameLabel?: string;
  emailLabel?: string;
  companyLabel?: string;
  messageLabel?: string;
  submitText?: string;
  variant?: "reply" | "calendar" | "status";
  avatars?: Avatar[];
  note?: string;
  calendar?: Calendar;
  status?: Status;
  imageSrc?: string;
  imageAlt?: string;
  ariaLabel?: string;
  className?: string;
};

type Avatar = { imageSrc?: string; imageAlt?: string; initials?: string };
type Calendar = { title?: string; days?: { label: string; date: string }[]; activeDay?: number; slots?: string[]; buttonText?: string; href?: string };
type Status = { online?: string; responseLabel?: string; responseValue?: string; queue?: { title: string; meta: string; done?: boolean }[] };

const px = (id: number) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=160`;

const DEFAULT_AVATARS: Avatar[] = [
  { imageSrc: px(1181686), imageAlt: "Support teammate portrait", initials: "MV" },
  { imageSrc: px(2182970), imageAlt: "Support teammate portrait", initials: "MS" },
  { imageSrc: px(8790862), imageAlt: "Support teammate portrait", initials: "EM" },
];

const row = { hide: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };
const pop = { hide: { opacity: 0, scale: 0.8 }, show: { opacity: 1, scale: 1 } };

const ContactFluidForm = ({
  tag = "Contact",
  title = "Talk to a real person.",
  mutedTitle = "a real person.",
  nameLabel = "Name",
  emailLabel = "Work email",
  companyLabel = "Company",
  messageLabel = "Message",
  submitText = "Send message",
  variant = "reply",
  avatars = DEFAULT_AVATARS,
  note = "Replies in under 2 hours",
  calendar = {},
  status = {},
  imageSrc,
  imageAlt,
  ariaLabel,
  className,
}: ContactFluidFormProps) => {
  const mediaRef = useRef<HTMLDivElement>(null);
  const reduce = Boolean(useReducedMotion());
  const mediaInView = useInView(mediaRef, { once: true, margin: "0px 0px -10% 0px" });
  const mediaReady = useImageReady(mediaRef, mediaInView);
  const { ease, base } = useKitMotion();
  const { scrollYProgress } = useScroll({ target: mediaRef, offset: ["start end", "end start"] });
  const drift = useTransform(scrollYProgress, [0, 1], ["-4%", "4%"]);
  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: base, ease, delay },
  });

  return (
    <section aria-label={ariaLabel ?? title} className={cn("relative py-[var(--section-space)] text-foreground", className)}>
      <div className="mx-auto w-[var(--container)]">
        {tag && (
          <motion.div {...rise(0)} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-foreground/85">
            <Sparkle aria-hidden="true" size={12} fill="currentColor" />
            <p className="text-[length:var(--text-small)]">{tag}</p>
          </motion.div>
        )}
        <MutedAccentTitle text={title} muted={mutedTitle} as="h2" className="mt-5 max-w-[18ch] text-[length:var(--text-h1)] [overflow-wrap:anywhere]" />
        <div className="mt-[clamp(2rem,4vw,3.5rem)] grid gap-[var(--gap)] lg:grid-cols-2">
          <motion.form {...rise(0.1)} onSubmit={(event) => event.preventDefault()} className="kit-card flex flex-col gap-5 p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-[length:var(--text-small)] text-muted-foreground">
                {nameLabel}
                <input type="text" name="name" autoComplete="name" placeholder="Your name" className="h-11 w-full rounded-lg border border-border bg-background px-3 text-[length:var(--text-body)] text-foreground placeholder:text-muted-foreground focus:border-foreground/40 focus:outline-none" />
              </label>
              <label className="flex flex-col gap-2 text-[length:var(--text-small)] text-muted-foreground">
                {emailLabel}
                <input type="email" name="email" autoComplete="email" placeholder="you@email.com" className="h-11 w-full rounded-lg border border-border bg-background px-3 text-[length:var(--text-body)] text-foreground placeholder:text-muted-foreground focus:border-foreground/40 focus:outline-none" />
              </label>
            </div>
            <label className="flex flex-col gap-2 text-[length:var(--text-small)] text-muted-foreground">
              {companyLabel}
              <input type="text" name="company" autoComplete="organization" placeholder="Your company" className="h-11 w-full rounded-lg border border-border bg-background px-3 text-[length:var(--text-body)] text-foreground placeholder:text-muted-foreground focus:border-foreground/40 focus:outline-none" />
            </label>
            <label className="flex flex-1 flex-col gap-2 text-[length:var(--text-small)] text-muted-foreground">
              {messageLabel}
              <textarea name="message" rows={5} placeholder="Tell us a little about your team" className="min-h-32 w-full flex-1 resize-none rounded-lg border border-border bg-background px-3 py-3 text-[length:var(--text-body)] text-foreground placeholder:text-muted-foreground focus:border-foreground/40 focus:outline-none" />
            </label>
            <button type="submit" className="btn-primary w-full">
              {submitText}
              <ArrowRight size={14} aria-hidden="true" />
            </button>
          </motion.form>
          <motion.div
            ref={mediaRef}
            initial={reduce ? false : "hide"}
            animate={reduce || (mediaInView && mediaReady) ? "show" : "hide"}
            className="min-w-0"
          >
            <motion.div
              variants={{ hide: { clipPath: "inset(48% 0% 48% 0% round 14px)" }, show: { clipPath: "inset(0% 0% 0% 0% round 14px)" } }}
              transition={{ duration: 0.9, ease }}
              className="relative aspect-[4/3] min-h-[17rem] overflow-hidden rounded-[var(--radius-image)] lg:aspect-auto lg:h-full"
            >
              <motion.div style={reduce ? undefined : { y: drift }} className="absolute inset-x-0 -inset-y-[6%] will-change-transform">
                <FluidPanel seed={120} imageSrc={imageSrc} imageAlt={imageAlt} className="h-full w-full" />
              </motion.div>
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <motion.div
                  variants={{ hide: { opacity: 0, y: 24, scale: 0.96 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: base, ease, delay: 0.2, delayChildren: 0.3, staggerChildren: 0.06 } } }}
                  className={cn(
                    "rounded-[var(--radius)] border border-white/15 bg-black/30 p-3 text-white backdrop-blur-md",
                    variant === "reply" ? "flex w-max max-w-full items-center gap-3" : "flex w-full max-w-[21rem] flex-col gap-3",
                  )}
                >
                  {variant === "reply" && (
                    <>
                      {avatars.length > 0 && (
                        <div className="flex shrink-0">
                          {avatars.map((avatar, index) => (
                            <motion.div
                              key={index}
                              variants={pop}
                              className="-ml-2 flex size-8 items-center justify-center overflow-hidden rounded-full border-2 border-black/40 bg-white text-black first:ml-0"
                            >
                              {avatar.imageSrc ? (
                                <Media src={avatar.imageSrc} alt={avatar.imageAlt ?? ""} loading="lazy" decoding="async" className="size-full object-cover saturate-[0.9]" />
                              ) : (
                                <p className="text-[length:var(--text-label)] font-medium leading-none">{avatar.initials}</p>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      )}
                      {note && <motion.p variants={row} className="whitespace-nowrap text-[length:var(--text-small)] leading-[1.3]">{note}</motion.p>}
                    </>
                  )}
                  {variant === "calendar" && (
                    <>
                      {calendar.title && <motion.p variants={row} className="text-[length:var(--text-small)] font-medium leading-[1.3]">{calendar.title}</motion.p>}
                      {calendar.days && calendar.days.length > 0 && (
                        <motion.div variants={row} className="grid auto-cols-fr grid-flow-col gap-1 border-y border-white/10 py-2">
                          {calendar.days.map((day, index) => (
                            <div key={index} className={cn("flex flex-col items-center gap-1 rounded-lg py-1.5", index === calendar.activeDay ? "bg-white text-black" : "text-white/70")}>
                              <p className="text-[length:var(--text-label)] leading-none">{day.label}</p>
                              <p className="text-[length:var(--text-small)] font-medium leading-none tabular-nums">{day.date}</p>
                            </div>
                          ))}
                        </motion.div>
                      )}
                      {calendar.slots && calendar.slots.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {calendar.slots.map((slot, index) => (
                            <motion.p key={index} variants={pop} className={cn("whitespace-nowrap rounded-full px-2.5 py-1 text-[length:var(--text-label)] leading-none tabular-nums", index === 0 ? "bg-white text-black" : "border border-white/30 text-white")}>
                              {slot}
                            </motion.p>
                          ))}
                        </div>
                      )}
                      {calendar.buttonText && (
                        <motion.a variants={row} href={calendar.href ?? "#"} className="flex h-9 items-center justify-center whitespace-nowrap rounded-lg bg-white px-3 text-[length:var(--text-small)] font-medium text-black">
                          {calendar.buttonText}
                        </motion.a>
                      )}
                    </>
                  )}
                  {variant === "status" && (
                    <>
                      {status.online && (
                        <motion.div variants={row} className="flex items-center gap-2">
                          <div aria-hidden="true" className="size-2 shrink-0 rounded-full bg-emerald-400" />
                          <p className="text-[length:var(--text-small)] font-medium leading-[1.3]">{status.online}</p>
                        </motion.div>
                      )}
                      {status.responseValue && (
                        <motion.div variants={row} className="flex items-baseline justify-between gap-4 border-t border-white/10 pt-3">
                          <p className="text-[length:var(--text-small)] text-white/70">{status.responseLabel}</p>
                          <p className="whitespace-nowrap text-[length:var(--text-h3)] font-medium leading-none tabular-nums">{status.responseValue}</p>
                        </motion.div>
                      )}
                      {status.queue && status.queue.length > 0 && (
                        <div className="flex flex-col">
                          {status.queue.map((item, index) => (
                            <motion.div key={index} variants={row} className="flex items-center justify-between gap-3 border-t border-white/10 py-2">
                              <p className="min-w-0 text-[length:var(--text-small)] leading-[1.3] [overflow-wrap:anywhere]">{item.title}</p>
                              <p className={cn("shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[length:var(--text-label)]", item.done ? "bg-white text-black" : "border border-white/30 text-white")}>{item.meta}</p>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactFluidForm;
