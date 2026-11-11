"use client";

import { useEffect, useRef } from "react";

const AREA = 5200;

type Mote = { x: number; y: number; vx: number; vy: number; a: number; p: number; s: number; hot: boolean };

export default function GlyphDust({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    const hero = document.querySelector<HTMLElement>('[data-particle="hero"]');
    if (!ctx || !hero) return;
    const host = canvas.closest("main") ?? document.documentElement;
    const fine = matchMedia("(pointer: fine)").matches;
    let motes: Mote[] = [];
    let w = 0;
    let h = 0;
    let vh = 0;
    let fg = "#8a8a8a";
    let ac = "#fa4c14";
    const mouse = { x: -999, y: -999 };

    const spawn = (s: number, y?: number): Mote => ({
      x: Math.random() * w,
      y: y ?? Math.random() * h,
      vx: (Math.random() - 0.5) * 6,
      vy: -(8 + Math.random() * 12) * (s > 2 ? 1.3 : 1),
      a: s > 2 ? 0.2 + Math.random() * 0.1 : 0.14 + Math.random() * 0.14,
      p: Math.random() * Math.PI * 2,
      s,
      hot: Math.random() < 0.06,
    });
    const size = () => (Math.random() < 0.12 ? 3 : 2);
    const readColors = () => {
      const cs = getComputedStyle(host);
      fg = cs.getPropertyValue("--muted-foreground").trim() || fg;
      ac = cs.getPropertyValue("--accent").trim() || ac;
    };
    const palette = new MutationObserver(readColors);
    palette.observe(document.documentElement, { attributes: true, attributeFilter: ["style", "class", "data-theme", "data-palette"] });
    if (host !== document.documentElement) palette.observe(host, { attributes: true });

    const resize = () => {
      const dpr = Math.min(devicePixelRatio, 1.5);
      w = innerWidth;
      vh = innerHeight;
      h = hero.offsetHeight || vh;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(vh * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      readColors();
      const n = Math.round((w * h) / AREA);
      motes = motes.slice(0, n);
      while (motes.length < n) motes.push(spawn(size()));
    };
    resize();
    addEventListener("resize", resize);

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    if (fine) addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    let last = performance.now();
    let visible = false;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const step = Math.min((now - last) / 1000, 0.05);
      last = now;
      const ease = 1 - Math.exp(-step * 3);
      const top = hero.getBoundingClientRect().top;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const dpr = canvas.width / w;
      ctx.setTransform(dpr, 0, 0, dpr, 0, top * dpr);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w, h);
      ctx.clip();
      const t = now / 1000;
      const my = mouse.y - top;
      for (const m of motes) {
        const dx = m.x - mouse.x;
        const dy = m.y - my;
        const near = Math.max(0, 1 - Math.hypot(dx, dy) / 140);
        const wave = Math.sin(m.y * 0.006 - t * 0.5 + m.x * 0.002);
        const tx = wave * 8 + Math.sin(t * 0.4 + m.p) * 3 + (near ? (dx / 140) * near * 30 : 0);
        const ty = (m.s > 2 ? -12 : -10) + Math.sin(t * 0.3 + m.p) * 3 + (near ? (dy / 140) * near * 30 : 0);
        m.vx += (tx - m.vx) * ease;
        m.vy += (ty - m.vy) * ease;
        m.x += m.vx * step;
        m.y += m.vy * step;
        if (m.y < -24) Object.assign(m, spawn(m.s, h + 24));
        if (m.x < -24) m.x = w + 24;
        else if (m.x > w + 24) m.x = -24;
        const band = 0.5 + 0.5 * Math.sin(m.x * 0.004 + m.y * 0.003 - t * 0.6);
        const twinkle = 0.7 + 0.3 * Math.sin(t * 0.8 + m.p * 3);
        ctx.globalAlpha = Math.min(0.7, m.a * (0.6 + 0.4 * band) * twinkle * 1.3 + near * 0.3);
        ctx.fillStyle = m.hot || near > 0.4 ? ac : fg;
        ctx.fillRect(m.x - m.s / 2, m.y - m.s / 2, m.s, m.s);
      }
      ctx.restore();
    };
    const run = () => {
      cancelAnimationFrame(raf);
      if (visible && !document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      } else {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      run();
    });
    io.observe(hero);
    document.addEventListener("visibilitychange", run);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      palette.disconnect();
      document.removeEventListener("visibilitychange", run);
      removeEventListener("resize", resize);
      removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className={`pointer-events-none fixed inset-0 -z-20 block size-full ${className ?? ""}`} />;
}
