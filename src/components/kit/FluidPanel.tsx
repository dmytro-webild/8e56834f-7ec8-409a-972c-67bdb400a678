"use client";

import { useEffect, useRef, type ReactNode } from "react";
import * as THREE from "three";
import Media from "@/components/kit/Media";

type FluidPanelProps = { seed?: number; speed?: number; lift?: number; imageSrc?: string; imageAlt?: string; className?: string; children?: ReactNode };

type Entry = {
  el: HTMLDivElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  seed: number;
  shown: number;
  from: number;
  at: number;
  speed: number;
  lift: number;
  visible: boolean;
  drawn: boolean;
  colorAt: number;
  colors: [THREE.Vector3, THREE.Vector3, THREE.Vector3];
};

const VERTEX = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`;

const FRAGMENT = `
precision highp float;
uniform vec2 uRes;
uniform float uTime, uSeed, uLift;
uniform vec2 uCss;
uniform vec3 uDeep, uMid, uHigh;
varying vec2 vUv;
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * f * (f * (f * 6. - 15.) + 10.); return mix(mix(hash(i), hash(i + vec2(1., 0.)), u.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), u.x), u.y); }
float fbm(vec2 p){ float v = 0., a = .62; mat2 m = mat2(1.6, 1.2, -1.2, 1.6); for (int i = 0; i < 3; i++) { v += a * noise(p); p = m * p; a *= .3; } return v / .8618; }
float field(vec2 p, vec2 r){ return fbm(p + 1.7 * r); }
void main(){
  float asp = uRes.x / uRes.y;
  vec2 uv = (vUv - .5) * vec2(asp, 1.) / max(1., asp * .55);
  float a = uSeed * 2.4;
  vec2 dir = vec2(cos(a), sin(a));
  mat2 rot = mat2(cos(a), sin(a), -sin(a), cos(a));
  float zoom = 2.1 * mix(1., .62, smoothstep(650., 1100., max(uCss.x, uCss.y)));
  vec2 p = rot * uv * .72 * zoom + vec2(3.1, 1.7);
  float t = uTime * .35 + uSeed * 2.7;
  vec2 q = vec2(fbm(p + vec2(0., t)), fbm(p + vec2(5.2, 1.3) - t * .8));
  vec2 r = vec2(fbm(p + 1.5 * q + vec2(1.7, 9.2) + t * .35), fbm(p + 1.5 * q + vec2(8.3, 2.8) - t * .3));
  float e = .015;
  float h = field(p, r);
  float hx = field(p + vec2(e, 0.), r);
  float hy = field(p + vec2(0., e), r);
  vec3 n = normalize(vec3((h - hx) / e * .7, (h - hy) / e * .7, 1.));
  float diff = clamp(dot(n, normalize(vec3(-.45, .55, .7))), 0., 1.);
  float hs = (h - .5) * 3.4 + .81 + dot(uv, dir) * .2 + uLift;
  vec3 peri = mix(uMid, uHigh, .32);
  vec3 col = mix(uMid * .45, min(uMid * 1.2, vec3(1.)), smoothstep(.08, .5, hs));
  col = mix(col, peri, smoothstep(.6, 1., hs));
  col = mix(col, uHigh, smoothstep(.95, 1.35, hs) * .7);
  col *= .82 + .32 * diff;
  float g = r.x - r.y + (q.x - .5) * .5;
  float zone = smoothstep(.62, .32, hs);
  float w = .035 + .05 * zone;
  float crease = (1. - smoothstep(w * .55, w, abs(g))) * zone;
  float rim = exp(-pow((abs(g) - w * 1.15) / (w * .22), 2.)) * zone;
  col = mix(col, uDeep, crease);
  col = mix(col, uHigh, rim * .55);
  col = mix(uDeep, col, smoothstep(-.06, .18, hs));
  col = mix(vec3(dot(col, vec3(.2126, .7152, .0722))), col, 1.18);
  gl_FragColor = vec4(clamp(col, 0., 1.), 1.);
}`;

const entries = new Set<Entry>();
let renderer: THREE.WebGLRenderer | null = null;
let material: THREE.ShaderMaterial | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.Camera | null = null;
let failed = false;
let raf = 0;
let last = 0;
let clock = 0;
let observer: IntersectionObserver | null = null;
let probe: CanvasRenderingContext2D | null = null;

const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const small = () => matchMedia("(max-width: 879px)").matches;

const engine = () => {
  if (renderer || failed) return renderer;
  try {
    const canvas = document.createElement("canvas");
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, depth: false, stencil: false, powerPreference: "low-power" });
    renderer.setPixelRatio(1);
    renderer.autoClear = false;
    material = new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uRes: { value: new THREE.Vector2(1, 1) },
        uTime: { value: 0 },
        uSeed: { value: 0 },
        uLift: { value: 0 },
        uCss: { value: new THREE.Vector2(400, 300) },
        uDeep: { value: new THREE.Vector3() },
        uMid: { value: new THREE.Vector3() },
        uHigh: { value: new THREE.Vector3() },
      },
    });
    scene = new THREE.Scene();
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));
    camera = new THREE.Camera();
    canvas.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      failed = true;
      entries.forEach((it) => (it.canvas.style.opacity = "0"));
    });
  } catch {
    failed = true;
    renderer = null;
  }
  return renderer;
};

const rgb = (value: string, fallback: [number, number, number]): [number, number, number] => {
  if (!probe) probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!probe || !value) return fallback;
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = "black";
  probe.fillStyle = value;
  probe.fillRect(0, 0, 1, 1);
  const d = probe.getImageData(0, 0, 1, 1).data;
  return [d[0] / 255, d[1] / 255, d[2] / 255];
};

const readColors = (it: Entry) => {
  const css = getComputedStyle(it.el);
  const deep = rgb(css.getPropertyValue("--deep").trim(), [0.012, 0.016, 0.035]);
  const mid = rgb(css.getPropertyValue("--accent").trim(), [0.145, 0.388, 0.922]);
  const high = mid.map((c) => c + (1 - c) * 0.84) as [number, number, number];
  const dark = deep.map((c, i) => Math.min(c * 0.5 + mid[i] * 0.04, mid[i] * 0.12 + 0.01)) as [number, number, number];
  it.colors[0].set(...dark);
  it.colors[1].set(...mid);
  it.colors[2].set(...high);
};

const draw = (it: Entry, time: number) => {
  const r = engine();
  if (!r || !material || !scene || !camera) return;
  const q = Math.min(devicePixelRatio || 1, 2) * (small() ? 0.4 : 0.55);
  const box = it.el.getBoundingClientRect();
  const fit = Math.min(1, 900 / Math.max(box.width * q, box.height * q, 1));
  const w = Math.max(2, Math.round(box.width * q * fit));
  const h = Math.max(2, Math.round(box.height * q * fit));
  if (it.canvas.width !== w || it.canvas.height !== h) {
    it.canvas.width = w;
    it.canvas.height = h;
  }
  const size = r.getSize(new THREE.Vector2());
  if (size.x < w || size.y < h) r.setSize(Math.max(size.x, w), Math.max(size.y, h), false);
  const full = r.getSize(new THREE.Vector2());
  if (time - it.colorAt > 1000 || !it.colorAt) {
    readColors(it);
    it.colorAt = time;
  }
  const k = Math.min(1, Math.max(0, (time - it.at) / 2800));
  it.shown = it.from + (it.seed - it.from) * (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2);
  const u = material.uniforms;
  u.uRes.value.set(w, h);
  u.uCss.value.set(box.width, box.height);
  u.uTime.value = reduced() ? 12 : clock * it.speed;
  u.uSeed.value = it.shown;
  u.uLift.value = it.lift;
  u.uDeep.value.copy(it.colors[0]);
  u.uMid.value.copy(it.colors[1]);
  u.uHigh.value.copy(it.colors[2]);
  r.setViewport(0, 0, w, h);
  r.render(scene, camera);
  it.ctx.drawImage(r.domElement, 0, full.y - h, w, h, 0, 0, w, h);
  if (!it.drawn) {
    it.drawn = true;
    it.canvas.style.opacity = "1";
  }
};

const tick = (now: number) => {
  raf = 0;
  if (document.hidden || failed) return;
  const visible = [...entries].filter((it) => it.visible);
  if (!visible.length) return;
  const still = reduced();
  const step = small() ? 1000 / 30 : 1000 / 60;
  if (now - last >= step - 2) {
    const dt = last ? Math.min(now - last, 100) : 0;
    last = now;
    clock += dt / 1000;
    for (const it of visible) if (!still || !it.drawn) draw(it, now);
  }
  if (!still || visible.some((it) => !it.drawn)) raf = requestAnimationFrame(tick);
};

const wake = () => {
  if (!raf && !document.hidden) {
    last = 0;
    raf = requestAnimationFrame(tick);
  }
};

const onVisibility = () => (document.hidden ? (cancelAnimationFrame(raf), (raf = 0)) : wake());

const join = (it: Entry) => {
  if (!entries.size) {
    observer = new IntersectionObserver(
      (list) => {
        for (const e of list) {
          const hit = [...entries].find((x) => x.el === e.target);
          if (hit) hit.visible = e.isIntersecting;
        }
        wake();
      },
      { rootMargin: "120px 0px" },
    );
    document.addEventListener("visibilitychange", onVisibility);
  }
  entries.add(it);
  observer?.observe(it.el);
  return () => {
    observer?.unobserve(it.el);
    entries.delete(it);
    if (entries.size) return;
    observer?.disconnect();
    observer = null;
    document.removeEventListener("visibilitychange", onVisibility);
    cancelAnimationFrame(raf);
    raf = 0;
  };
};

export default function FluidPanel({ seed = 1, speed = 1, lift = 0, imageSrc, imageAlt = "", className = "", children }: FluidPanelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const entryRef = useRef<Entry | null>(null);

  useEffect(() => {
    const el = ref.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!el || !canvas || !ctx || !engine()) return;
    const it: Entry = {
      el,
      canvas,
      ctx,
      seed,
      shown: seed,
      from: seed,
      at: 0,
      speed,
      lift,
      visible: false,
      drawn: false,
      colorAt: 0,
      colors: [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()],
    };
    entryRef.current = it;
    const leave = join(it);
    const resize = new ResizeObserver(() => {
      if (it.drawn && reduced()) draw(it, performance.now());
    });
    resize.observe(el);
    return () => {
      resize.disconnect();
      leave();
      entryRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const it = entryRef.current;
    if (!it) return;
    if (it.seed !== seed) {
      it.from = it.shown;
      it.at = performance.now();
      it.seed = seed;
    }
    it.speed = speed;
    it.lift = lift;
    if (reduced()) {
      it.shown = seed;
      draw(it, performance.now());
    }
  }, [seed, speed, lift]);

  return (
    <div ref={ref} className={`relative isolate overflow-hidden ${imageSrc ? "bg-muted" : "bg-deep"} ${className}`}>
      {imageSrc ? (
        <>
          <Media src={imageSrc} alt={imageAlt} aria-hidden={imageAlt === ""} loading="lazy" decoding="async" className="absolute inset-0 -z-10 h-full w-full object-cover" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/20" />
        </>
      ) : (
        <>
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(90%_70%_at_25%_20%,color-mix(in_srgb,var(--accent)_30%,white)_0%,var(--accent)_38%,transparent_72%),radial-gradient(80%_80%_at_85%_90%,var(--accent)_0%,transparent_60%)]" />
          <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-0 transition-opacity duration-700" />
        </>
      )}
      {children}
    </div>
  );
}
