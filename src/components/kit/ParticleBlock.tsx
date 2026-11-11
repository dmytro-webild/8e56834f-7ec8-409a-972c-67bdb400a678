"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useWebildHold } from "@/components/kit/webildReady";
import { PARTICLE_SETS, type ParticleSet, type ShapeBuilder, type ShapeResult } from "@/components/kit/particleShapes";
import { ALETHIA_HERO, ALETHIA_HERO_SMALL, ALETHIA_ROLES, contourField, type AlethiaRole } from "@/components/kit/particleShapes/alethiaHero";

type ParticleBlockProps = { role: AlethiaRole; delay?: number; fallback?: string; fitTo?: string; haze?: number; shape?: (variant: string) => ShapeBuilder | undefined; settle?: boolean; yaw?: number; turn?: number; fill?: number; together?: boolean; className?: string };

type Entry = { el: HTMLElement; score: number; near: () => void; wake: () => void; together: boolean };

const blocks = new Set<Entry>();
let current: Entry | null = null;

const sectionOf = (e: Entry) => e.el.closest("section") ?? e.el.parentElement;

const active = (e: Entry) => current === e || (e.together && !!current?.together && sectionOf(current) === sectionOf(e));

const wakeGroup = (e: Entry | null) => {
  if (!e) return;
  if (!e.together) return e.wake();
  const s = sectionOf(e);
  blocks.forEach((b) => b.together && sectionOf(b) === s && b.wake());
};
let queued = 0;
let timer = 0;

const measure = () => {
  queued = 0;
  const vh = innerHeight;
  let best: Entry | null = null;
  for (const b of blocks) {
    const r = b.el.getBoundingClientRect();
    if (r.bottom > -vh && r.top < vh * 2) b.near();
    const seen = Math.min(r.bottom, vh) - Math.max(r.top, 0);
    let score = seen > 0 && r.width > 0 ? seen / Math.max(1, Math.min(r.height, vh)) : 0;
    if (score > 0) {
      const x = Math.min(Math.max(r.left + r.width / 2, 0), innerWidth - 1);
      const y = (Math.max(r.top, 0) + Math.min(r.bottom, vh)) / 2;
      const hit = document.elementFromPoint(x, y);
      const scope = b.el.closest("section") ?? b.el.parentElement;
      if (hit && scope && !scope.contains(hit)) score = 0;
    }
    b.score = score;
    if (score > (best?.score ?? 0)) best = b;
  }
  if (best === current) return;
  const prev = current;
  current = best;
  wakeGroup(prev);
  wakeGroup(best);
};

const schedule = () => {
  if (!queued) queued = requestAnimationFrame(measure);
};

const wakeAll = () => blocks.forEach((b) => b.wake());

const join = (entry: Entry) => {
  if (!blocks.size) {
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    document.addEventListener("visibilitychange", wakeAll);
    timer = window.setInterval(schedule, 800);
  }
  blocks.add(entry);
  schedule();
  return () => {
    blocks.delete(entry);
    if (current === entry) current = null;
    if (blocks.size) return schedule();
    removeEventListener("scroll", schedule);
    removeEventListener("resize", schedule);
    document.removeEventListener("visibilitychange", wakeAll);
    clearInterval(timer);
    cancelAnimationFrame(queued);
    queued = 0;
  };
};

const POSE: Record<AlethiaRole, { pre: number; yaw: number; pitch: number; turn: number; axis: number; fill: number; tight: number }> = {
  hero: { pre: 0, yaw: -0.24, pitch: 0, turn: 0.3, axis: 0, fill: 0.94, tight: 2.05 },
  overview: { pre: 0, yaw: -0.6, pitch: 0.34, turn: 1.6, axis: 1, fill: 0.98, tight: 1.3 },
  scan: { pre: 0, yaw: -0.72, pitch: 0.12, turn: 3, axis: 1, fill: 0.86, tight: 1.14 },
  ambient: { pre: 0, yaw: 0, pitch: 0, turn: 0, axis: 1, fill: 1.04, tight: 1 },
  close: { pre: 0, yaw: 0, pitch: 0.36, turn: 0, axis: 1, fill: 0.86, tight: 1.14 },
  visit: { pre: 0, yaw: -0.45, pitch: 0.18, turn: 0.9, axis: 1, fill: 0.9, tight: 1.2 },
};

const VERTEX = `
attribute vec3 aDust; attribute vec2 aSeed; attribute float aGroup;
uniform float uTime, uIntro, uSize, uPR, uDist, uPower, uExt, uFlow, uDrift, uLow, uHigh, uHaze;
uniform vec3 uAxis, uCenter, uSpread, uPointer, mint, lime, warm, white;
varying vec3 vColor; varying float vAlpha;
void main(){
  vec3 q = position;
  float fade = 1.;
  if (aGroup < 0.) {
    float f = fract(uTime * .3 + aSeed.y * .0025);
    q.x += (f * 2. - 1.) * uFlow;
    fade = smoothstep(0., .2, f) * smoothstep(1., .8, f);
  }
  q.y += sin(uTime * .4 + aSeed.x * 6.28) * uDrift;
  float along = dot(position, uAxis) / max(uExt, 1e-3);
  float a = smoothstep(0., 1., clamp(uIntro * 1.85 - (.5 - along * .5) * .7 - aSeed.x * .15, 0., 1.));
  float haze = step(fract(aSeed.x * 7.31 + aSeed.y * 3.17), uHaze);
  a *= 1. - haze;
  vec3 p = mix(uCenter + aDust * uSpread, (modelMatrix * vec4(q, 1.)).xyz, a);
  p.xy += haze * vec2(sin(uTime * .05 + aSeed.y * 6.28), cos(uTime * .04 + aSeed.x * 6.28)) * .3;
  float scan = mix(-1.35, 1.35, fract(uTime * .08 + .62));
  float band = exp(-pow((along - scan) * 5.6, 2.)) * step(.5, uIntro);
  float pulse = aGroup > 0. ? pow(.5 + .5 * sin((uTime * .12 + aGroup * 7.) * 6.2832), 10.) : 0.;
  float h = clamp((position.y - uLow) / max(uHigh - uLow, 1e-3), 0., 1.);
  vec3 col = mix(mint, warm, smoothstep(.6, 0., h) * .5);
  col = mix(col, lime, max(band, max(pulse, aGroup < 0. ? 1. : 0.)));
  float glow = band + pulse * .5;
  vec4 wp = vec4(p, 1.);
  vec2 d = wp.xy - uPointer.xy; float fall = exp(-dot(d, d) * 1.6) * uPower;
  wp.xy += normalize(d + 1e-4) * fall * .18;
  col = mix(col, white, fall * .8);
  vec4 mv = viewMatrix * wp;
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * uPR * (.5 + aSeed.y * .8) * (uDist / -mv.z) * (1. + glow * .8 + fall) * fade;
  vColor = col * (.7 + glow * .9 + fall * .6);
  vAlpha = (.55 + .45 * aSeed.y) * fade * (1. - haze * .45);
}`;

const FRAGMENT = `
varying vec3 vColor; varying float vAlpha;
void main(){ float d = length(gl_PointCoord - .5); float a = smoothstep(.5, 0., d); gl_FragColor = vec4(vColor * a, a * vAlpha); }`;

export default function ParticleBlock({ role, delay = 0, fallback = "earth", fitTo, haze = 0, shape, settle = false, yaw, turn, fill, together = false, className }: ParticleBlockProps) {
  const ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ready = useWebildHold(ref);

  useEffect(() => {
    const el = ref.current!;
    const canvas = canvasRef.current!;
    const host = el.closest<HTMLElement>("[data-particles]") ?? el.closest("main") ?? document.documentElement;
    const scope = el.closest("section") ?? el;
    const target = fitTo ? scope.querySelector<HTMLElement>(fitTo) : null;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = matchMedia("(max-width: 879px)").matches;
    const N = small ? 14000 : 30000;
    const base = { ...POSE[role], yaw: yaw ?? POSE[role].yaw, turn: turn ?? POSE[role].turn, fill: fill ?? POSE[role].fill, tight: fill === undefined ? POSE[role].tight : 1 };
    const pose = { ...base };
    const born = performance.now();
    let disposed = false;
    let renderer: THREE.WebGLRenderer | null = null;
    let raf = 0;
    let built = false;
    let rotates = false;
    let spin = false;
    let intro = reduced ? 1 : 0;
    let last = born;
    let buildId = 0;
    let variant = "";
    let colorKey = "";
    let sample: THREE.Vector3[] = [];
    let drawn = 0;
    let pointerOn = false;
    let power = 0;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 400);
    const geo = new THREE.BufferGeometry();
    const dust = new Float32Array(N * 3);
    const seed = new Float32Array(N * 2);
    for (let i = 0; i < N; i++) {
      dust.set([Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1], i * 3);
      seed.set([Math.random(), Math.random()], i * 2);
    }
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    geo.setAttribute("aDust", new THREE.BufferAttribute(dust, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 2));
    geo.setAttribute("aGroup", new THREE.BufferAttribute(new Float32Array(N), 1));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e4);
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 }, uIntro: { value: intro }, uSize: { value: small ? 2 : 2.3 }, uPR: { value: 1 }, uDist: { value: 12 }, uPower: { value: 0 },
        uExt: { value: 1 }, uFlow: { value: 0 }, uDrift: { value: 0 }, uLow: { value: -1 }, uHigh: { value: 1 }, uHaze: { value: haze },
        uAxis: { value: new THREE.Vector3(pose.axis ? 0 : 1, pose.axis ? 1 : 0, 0) }, uCenter: { value: new THREE.Vector3() }, uSpread: { value: new THREE.Vector3(1, 1, 1) },
        uPointer: { value: new THREE.Vector3(99, 99, 0) },
        mint: { value: new THREE.Color() }, lime: { value: new THREE.Color() }, warm: { value: new THREE.Color() }, white: { value: new THREE.Color() },
      },
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(geo, mat);
    points.matrixAutoUpdate = false;
    scene.add(points);
    const u = mat.uniforms;

    const readVar = (cs: CSSStyleDeclaration, name: string) => {
      const c = new THREE.Color(1, 1, 1);
      const v = cs.getPropertyValue(name).trim();
      if (v) c.setStyle(v).convertLinearToSRGB();
      return c;
    };
    const readColors = () => {
      const cs = getComputedStyle(host);
      const key = cs.getPropertyValue("--accent") + cs.getPropertyValue("--deep-foreground");
      if (key === colorKey) return false;
      colorKey = key;
      const accent = readVar(cs, "--accent");
      const fg = readVar(cs, "--deep-foreground");
      u.lime.value.copy(accent);
      u.white.value.copy(fg);
      u.mint.value.copy(fg).lerp(accent, 0.15).multiplyScalar(0.92);
      u.warm.value.copy(u.mint.value).lerp(accent, 0.45);
      return true;
    };

    const progress = () => {
      if (role === "hero") {
        const r = scope.getBoundingClientRect();
        return THREE.MathUtils.clamp(-r.top / Math.max(r.height, 1), 0, 1);
      }
      const r = el.getBoundingClientRect();
      return THREE.MathUtils.clamp((innerHeight - r.top) / Math.max(innerHeight + r.height, 1), 0, 1);
    };

    const mA = new THREE.Matrix4();
    const mB = new THREE.Matrix4();
    const place = (yaw: number) => points.matrix.copy(mA.makeRotationX(pose.pitch).multiply(mB.makeRotationY(yaw)));

    const fit = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!renderer || !w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      if (!sample.length) return;
      const angles = spin ? [0, 1, 2, 3, 4, 5, 6, 7].map((i) => (i * Math.PI) / 4) : rotates || turn !== undefined ? [0, 1, 2, 3, 4, 5, 6].map((i) => pose.yaw + (pose.turn * i) / 6) : [pose.yaw];
      const lo = new THREE.Vector3(1e9, 1e9, 1e9);
      const hi = new THREE.Vector3(-1e9, -1e9, -1e9);
      const v = new THREE.Vector3();
      const seen: THREE.Vector3[] = [];
      for (const a of angles) {
        mA.makeRotationX(pose.pitch).multiply(mB.makeRotationY(a));
        for (const p of sample) {
          v.copy(p).applyMatrix4(mA);
          lo.min(v);
          hi.max(v);
          if (fill !== undefined) seen.push(v.clone());
        }
      }
      const hx = (hi.x - lo.x) / 2;
      const cx = (lo.x + hi.x) / 2;
      const cy = (lo.y + hi.y) / 2;
      const hy = (hi.y - lo.y) / 2;
      const hz = (hi.z - lo.z) / 2;
      const box = el.getBoundingClientRect();
      const tr = target?.getBoundingClientRect();
      const tw = tr?.width || w;
      const th = tr?.height || h;
      const ox = tr ? tr.left + tr.width / 2 - (box.left + w / 2) : 0;
      const oy = tr ? tr.top + tr.height / 2 - (box.top + h / 2) : 0;
      const t = Math.tan(THREE.MathUtils.degToRad(15));
      let D = ((role === "ambient" ? Math.min : Math.max)(hy, (hx * th) / tw) * h) / (t * th * pose.fill * (small ? pose.tight : 1)) + hz;
      if (seen.length) {
        const reachAt = (d: number) => {
          let s = 0;
          for (const p of seen) s = Math.max(s, Math.abs(p.x - cx) / ((d - p.z) * t * (tw / th)), Math.abs(p.y - cy) / ((d - p.z) * t));
          return (s * th) / h;
        };
        let near = hi.z + 0.05;
        let far = D * 4;
        for (let i = 0; i < 28; i++) {
          const mid = (near + far) / 2;
          if (reachAt(mid) > pose.fill) near = mid;
          else far = mid;
        }
        D = far;
      }
      const k = (2 * D * t) / h;
      const px = cx - ox * k;
      const py = cy + oy * k;
      camera.position.set(px, py, D);
      camera.lookAt(px, py, 0);
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
      u.uDist.value = D;
      const zs = hz + 1;
      const reach = ((D + zs) / D) * D * t * 1.06;
      geo.setDrawRange(0, role === "ambient" ? drawn : Math.min(drawn, Math.max(6500, Math.round((tw * th * 0.032) / (1 - haze)))));
      u.uCenter.value.set(px, py, 0);
      u.uSpread.value.set(reach * camera.aspect, reach, zs);
    };

    const draw = (now: number) => {
      const t = reduced ? 0 : now / 1000;
      const p = progress();
      place(pose.yaw + p * pose.turn + (spin ? t * 0.12 : 0));
      u.uTime.value = t;
      u.uIntro.value = intro;
      renderer!.render(scene, camera);
      ready();
    };

    const running = () => !reduced && built && !disposed && !document.hidden && active(entry);

    const frame = (now: number) => {
      raf = 0;
      if (!running()) return;
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      if ((now - born) / 1000 >= delay) intro = Math.min(1, intro + dt / 2.6);
      power += ((pointerOn ? 1 : 0) - power) * Math.min(1, dt * 5);
      u.uPower.value = power;
      draw(now);
      raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (running()) {
        if (!raf) {
          last = performance.now();
          raf = requestAnimationFrame(frame);
        }
      } else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const still = () => {
      if (settle && built && !active(entry)) intro = 1;
      if (renderer && built && (reduced || intro > 0) && !raf) draw(performance.now());
    };

    const apply = (res: ShapeResult, set: ParticleSet) => {
      const src = res.positions;
      const n = Math.min(N, Math.floor(src.length / 3));
      const pos = geo.getAttribute("position") as THREE.BufferAttribute;
      const arr = pos.array as Float32Array;
      arr.set(src.subarray(0, n * 3));
      if (pose.pre) {
        const c = Math.cos(pose.pre);
        const s = Math.sin(pose.pre);
        for (let i = 0; i < n; i++) {
          const y = arr[i * 3 + 1];
          const z = arr[i * 3 + 2];
          arr[i * 3 + 1] = c * y - s * z;
          arr[i * 3 + 2] = s * y + c * z;
        }
      }
      const lo = [1e9, 1e9, 1e9];
      const hi = [-1e9, -1e9, -1e9];
      for (let i = 0; i < n * 3; i++) {
        const a = i % 3;
        if (arr[i] < lo[a]) lo[a] = arr[i];
        if (arr[i] > hi[a]) hi[a] = arr[i];
      }
      const half = Math.max(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2], 1e-3) / 2;
      const k = 4 / half;
      for (let i = 0; i < n * 3; i++) arr[i] = (arr[i] - (lo[i % 3] + hi[i % 3]) / 2) * k;
      pos.needsUpdate = true;
      const g = geo.getAttribute("aGroup") as THREE.BufferAttribute;
      (g.array as Float32Array).fill(0);
      if (res.groups) (g.array as Float32Array).set(res.groups.subarray(0, n));
      g.needsUpdate = true;
      const motion = res.motion ?? "static";
      spin = motion === "spin" || motion === "twist";
      rotates = spin || pose.turn > 1;
      u.uDrift.value = motion === "drift" || motion === "flow" ? 0.1 : 0;
      u.uFlow.value = (2 / 7.6) * k;
      u.uLow.value = ((lo[1] - hi[1]) / 2) * k;
      u.uHigh.value = ((hi[1] - lo[1]) / 2) * k;
      u.uExt.value = ((pose.axis ? hi[1] - lo[1] : hi[0] - lo[0]) / 2) * k;
      const keep = role === "hero" ? (ALETHIA_HERO[set.id] ? 0.74 : set.heroDensity ?? 1) : 1;
      drawn = Math.round(n * keep);
      const step = Math.max(1, Math.floor(n / 4000));
      sample = [];
      for (let i = 0; i < n; i += step) sample.push(new THREE.Vector3(arr[i * 3], arr[i * 3 + 1], arr[i * 3 + 2]));
      pose.fill = role === "hero" && !ALETHIA_HERO[set.id] ? Math.min(1, POSE.hero.fill * (set.heroFill ?? 1)) : base.fill;
      pose.tight = role === "hero" && small && ALETHIA_HERO_SMALL[set.id] ? 1 : base.tight;
      built = true;
      fit();
      still();
      wake();
    };

    const build = () => {
      const id = host.dataset.particles && PARTICLE_SETS[host.dataset.particles] ? host.dataset.particles : fallback;
      if (id === variant) return;
      variant = id;
      const set = PARTICLE_SETS[id] ?? PARTICLE_SETS.earth;
      const token = ++buildId;
      built = false;
      wake();
      if (!reduced) intro = 0;
      Promise.resolve()
        .then(() => (shape?.(set.id) ?? (role === "hero" ? (small && ALETHIA_HERO_SMALL[set.id]) || ALETHIA_HERO[set.id] || set.hero : role === "ambient" ? contourField : ALETHIA_ROLES[set.id]?.[role] ?? set[role === "visit" ? "close" : role]))(N))
        .then((res) => {
          if (token === buildId && !disposed) apply(res, set);
        })
        .catch((e) => console.warn(`particle ${set.id}.${role}`, e));
    };

    const start = () => {
      if (renderer || disposed) return;
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25));
      u.uPR.value = renderer.getPixelRatio();
      readColors();
      fit();
      build();
    };

    const entry: Entry = { el, score: 0, near: start, wake, together };
    const leave = join(entry);
    const hasIdle = typeof window.requestIdleCallback === "function";
    const later = role === "hero" ? start : () => undefined;
    const idle = hasIdle ? window.requestIdleCallback(later, { timeout: 6000 }) : globalThis.setTimeout(later, 3000);

    const observer = new MutationObserver(() => {
      if (!renderer) return;
      if (readColors()) still();
      build();
    });
    observer.observe(host, { attributes: true });
    if (host !== document.documentElement) observer.observe(document.documentElement, { attributes: true });

    const resize = new ResizeObserver(() => {
      fit();
      still();
    });
    resize.observe(el);
    if (target) resize.observe(target);

    const ndc = new THREE.Vector2();
    const ray = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const hit = new THREE.Vector3();
    const onPointer = (e: PointerEvent) => {
      if (!active(entry)) return;
      const r = canvas.getBoundingClientRect();
      pointerOn = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (!pointerOn) return;
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      if (ray.ray.intersectPlane(plane, hit)) u.uPointer.value.copy(hit);
    };
    if (!reduced) addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      disposed = true;
      if (hasIdle) window.cancelIdleCallback(idle as number);
      else globalThis.clearTimeout(idle);
      leave();
      cancelAnimationFrame(raf);
      observer.disconnect();
      resize.disconnect();
      removeEventListener("pointermove", onPointer);
      geo.dispose();
      mat.dispose();
      renderer?.dispose();
    };
  }, [role, delay, fallback, fitTo, haze, shape, settle, yaw, turn, fill, together, ready]);

  return (
    <div ref={ref} aria-hidden="true" className={`pointer-events-none ${className ?? ""}`}>
      <canvas ref={canvasRef} className="absolute inset-0 block size-full" />
    </div>
  );
}
