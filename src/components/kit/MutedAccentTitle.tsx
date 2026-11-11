"use client";

import { motion, useReducedMotion } from "motion/react";
import { useKitMotion } from "@/components/kit/kitMotion";

type Props = {
  text: string;
  muted?: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
  delay?: number;
  play?: boolean;
  wrap?: "balance" | "pretty";
};

const clean = (word: string) => word.toLowerCase().replace(/[.,!?;:]+$/, "");

export default function MutedAccentTitle({ text, muted, as = "h2", className = "", delay = 0, play, wrap = "balance" }: Props) {
  const reduce = useReducedMotion();
  const { ease, base } = useKitMotion();
  const Tag = motion[as];
  const words = text.split(/\s+/).filter(Boolean);
  const target = (muted ?? "").split(/\s+/).filter(Boolean).map(clean);
  const start = target.length
    ? words.findIndex((_, i) => target.every((t, j) => words[i + j] !== undefined && clean(words[i + j]) === t))
    : -1;
  const isMuted = (i: number) => start >= 0 && i >= start && i < start + target.length;
  const trigger = play === undefined ? { whileInView: "show", viewport: { once: true, margin: "0px 0px -8% 0px" } } : { animate: play ? "show" : "hide" };

  return (
    <Tag initial={reduce ? false : "hide"} {...trigger} className={`${wrap === "pretty" ? "text-pretty" : "text-balance"} ${className}`} aria-label={text}>
      {words.map((word, i) => (
        <div key={`${word}-${i}`} aria-hidden="true" className="inline-block overflow-hidden pb-[0.15em] -mb-[0.15em] align-bottom mr-[0.24em] last:mr-0">
          <motion.div
            className={isMuted(i) ? "inline-block text-muted-foreground" : "inline-block"}
            variants={{ hide: { y: "105%" }, show: { y: "0%" } }}
            transition={{ duration: base, ease, delay: delay + i * 0.04 }}
          >
            {word}
          </motion.div>
        </div>
      ))}
    </Tag>
  );
}
