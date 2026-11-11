"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { stageHush } from "@/components/kit/stageHush";
import { useWebildHold } from "@/components/kit/webildReady";
import { PARTICLE_SETS, type ParticleRole, type ParticleSet, type ShapeBuilder, type ShapeResult } from "@/components/kit/particleShapes";

type ParticleYardStageProps = { introDelay?: number; variant?: string; set?: ParticleSet; className?: string; maxDpr?: number; density?: number; pauseOffscreen?: boolean };
type Box = [number, number, number];

const ROLES: ParticleRole[] = ["hero", "overview", "scan", "ambient", "close"];
const ATTR: Record<ParticleRole, string> = { hero: "aHero", overview: "aOverview", scan: "aScan", ambient: "aAmbient", close: "aClose" };
const MOTION = { static: 0, spin: 1, flow: 2, drift: 3, twist: 4 };
const GATE_STEP = 0.75;
const rnd = Math.random;

const bounds = (p: Float32Array): Box => {
  const lo = [1e9, 1e9, 1e9];
  const hi = [-1e9, -1e9, -1e9];
  for (let i = 0; i < p.length; i++) {
    const a = i % 3;
    lo[a] = Math.min(lo[a], p[i]);
    hi[a] = Math.max(hi[a], p[i]);
  }
  return [hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]];
};

const fitObject = (b: Box) => Math.min(9.4 / Math.max(b[0], b[2], 1e-3), 4.4 / Math.max(b[1], 1e-3));

const VERTEX = `
attribute vec3 aHero, aOverview, aScan, aAmbient, aClose, aDust; attribute vec2 aSeed; attribute float aGroup;
uniform float uTime, uFrom, uTo, uMix, uIntro, uScroll, uPower, uSize, uPR, uCalm, uSmall, uYardY;
uniform float uHeroS, uHeroLift, uHeroHalfX, uHeroM, uHeroKeep, uScanS, uScanH, uAmbS, uAmbM, uCloseM; uniform vec3 uAmbOff, uAmbY;
uniform vec3 uPointer, uHeroOff; uniform mat4 uGate;
uniform vec3 mint, lime, warm, white;
varying vec3 vColor; varying float vAlpha;
mat3 rotY(float a){ float c = cos(a), s = sin(a); return mat3(c, 0., -s, 0., 1., 0., s, 0., c); }
mat3 rotX(float a){ float c = cos(a), s = sin(a); return mat3(1., 0., 0., 0., c, s, 0., -s, c); }
mat3 rotZ(float a){ float c = cos(a), s = sin(a); return mat3(c, s, 0., -s, c, 0., 0., 0., 1.); }
float hash(float n){ return fract(sin(n) * 43758.5453); }
vec3 move(vec3 q, float m, float S, float t, inout float fade){
  if (m > .5 && m < 1.5) q = rotY(t * .12) * q;
  if (m > 1.5 && m < 2.5) { q.z = mod(q.z + t * 9. + S, 2. * S) - S; fade *= smoothstep(S, S * .78, abs(q.z)); }
  if (m > 2.5 && m < 3.5) q.y += sin(t * .4 + aSeed.x * 6.28) * .25 * S * .1;
  return q;
}
vec3 shape(int k, out vec3 col, out float glow, out float fade){
  float t = uTime * uCalm; glow = 0.; fade = 1.;
  if (k == 0) {
    vec3 h = aHero;
    if (uHeroM > 3.5) {
      float c = t * .16; float n = mod(floor(c), 3.); float ang = smoothstep(.6, .95, fract(c)) * 1.5708;
      if (n < .5 && h.y > .33) h = rotY(ang) * h;
      else if (n > .5 && n < 1.5 && h.x > .33) h = rotX(ang) * h;
      else if (n > 1.5 && h.z > .33) h = rotZ(ang) * h;
      h = rotX(.6) * rotY(.6 + sin(t * .12) * .3) * h * .7;
    }
    vec3 q = h * uHeroS;
    vec3 p = rotY(-.24 + uScroll * .3) * q + uHeroOff;
    p.x += uScroll * 2.5;
    float hx = max(uHeroHalfX, 1e-3);
    float order = .5 - q.x / hx * .5;
    float a = smoothstep(0., 1., clamp(uIntro * 1.85 - order * .7 - aSeed.x * .15, 0., 1.));
    vec3 from = aDust * vec3(1., .5, .6) + vec3(12., 1.5, 0.);
    p = mix(from, p, a);
    float scanX = mix(1.35, -1.35, fract(t * .08 + .62)) * hx;
    float band = exp(-pow((q.x - scanX) / hx * 11.3, 2.)) * step(.5, uIntro);
    col = mix(mint, warm, smoothstep(1.2, -.2, q.y + uHeroLift) * .5);
    col = mix(col, lime, band);
    glow = band;
    return p;
  }
  if (k == 1) {
    vec3 q = aOverview * 7.6;
    vec3 p = q;
    if (aGroup < 0.) {
      float f = fract(t * .3 + aSeed.y * .0025);
      p.x += f * 4. - 2.;
      fade = smoothstep(0., .2, f) * smoothstep(1., .8, f);
    }
    p = rotX(-1.0) * p; p = rotY(-.12) * p;
    p *= uSmall > .5 ? .55 : .74; p.y += uYardY - .2;
    float scan = exp(-pow((q.x - mix(-10.5, 10.5, fract(t * .055))) * 1.6, 2.));
    float pulse = aGroup > 0. ? pow(.5 + .5 * sin((t * .12 + aGroup * 7.) * 6.2832), 10.) : 0.;
    col = mix(mint * .9, lime, max(pulse, aGroup < 0. ? 1. : 0.));
    col = mix(col, white, scan * .7);
    glow = scan * .6 + pulse * .5;
    return p;
  }
  if (k == 2) {
    vec3 q = aScan * uScanS;
    vec3 p = (uGate * vec4(q, 1.)).xyz;
    float scanY = mix(-1.1, 1.1, 1. - abs(1. - 2. * fract(t * .09))) * uScanH;
    float band = exp(-pow((q.y - scanY) * 5., 2.));
    col = mix(mint, lime, band); glow = band;
    return p;
  }
  if (k == 3) {
    vec3 aq = aAmbient; aq.y = (aq.y - uAmbY.x) * uAmbY.y + uAmbY.z;
    vec3 p = move(aq * uAmbS, uAmbM, uAmbS, t, fade) + uAmbOff;
    col = mix(mint, warm, step(.9, aSeed.y) * .6);
    glow = 1.1;
    return p;
  }
  vec3 p = move(aClose * 6.2, uCloseM, 6.2, t, fade);
  float band = exp(-pow((aClose.y - mix(-1.45, 1.45, fract(t * .06))) * 9., 2.));
  p = rotX(.36 + sin(t * .15) * .05) * p;
  p *= uSmall > .5 ? .62 : 1.;
  p.y += .55 + sin(t * .4) * .1;
  float front = smoothstep(-3.4, 3.4, p.z);
  col = mix(mint * (.32 + .4 * front), lime, band * .7);
  glow = band * .5;
  return p;
}
void main(){
  int ka = int(uFrom + .5), kb = int(uTo + .5);
  float local = smoothstep(0., 1., clamp((uMix - aSeed.x * .3) / .7, 0., 1.));
  vec3 ca, cb; float ga, gb, fa, fb;
  vec3 pa = shape(ka, ca, ga, fa), pb = shape(kb, cb, gb, fb);
  vec3 p = mix(pa, pb, local);
  float mid = sin(local * 3.14159) * uCalm;
  p += (vec3(hash(aSeed.x * 91.), hash(aSeed.y * 37.), hash(aSeed.x * 13. + aSeed.y)) - .5) * mid * 3.;
  vec3 col = mix(ca, cb, local); float glow = mix(ga, gb, local);
  vec4 wp = modelMatrix * vec4(p, 1.);
  vec2 d = wp.xy - uPointer.xy; float fall = exp(-dot(d, d) * 1.6) * uPower;
  wp.xy += normalize(d + 1e-4) * fall * .18;
  col = mix(col, white, fall * .8);
  vec4 mv = viewMatrix * wp;
  gl_Position = projectionMatrix * mv;
  float hk = step(hash(aSeed.x * 57.3 + aSeed.y * 11.1), uHeroKeep);
  float keep = mix(ka == 0 ? hk : 1., kb == 0 ? hk : 1., local) * mix(fa, fb, local);
  gl_PointSize = uSize * uPR * (.5 + aSeed.y * .8) * (12. / -mv.z) * (1. + glow * .8 + fall) * keep;
  vColor = col * (.7 + glow * .9 + fall * .6);
  vAlpha = (.55 + .45 * aSeed.y) * smoothstep(.8, 4., -mv.z) * keep;
}`;

const FRAGMENT = `
varying vec3 vColor; varying float vAlpha;
void main(){ float d = length(gl_PointCoord - .5); float a = smoothstep(.5, 0., d); gl_FragColor = vec4(vColor * a, a * vAlpha); }`;

export default function ParticleYardStage({ introDelay = 0, variant = "logistics", set: custom, className, maxDpr, density = 1, pauseOffscreen = false }: ParticleYardStageProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ready = useWebildHold(wrapRef);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const sky = skyRef.current!;
    const canvas = canvasRef.current!;
    const set = custom ?? PARTICLE_SETS[variant] ?? PARTICLE_SETS.logistics;
    const host = wrap.closest("main") ?? document.documentElement;
    const heroLayout = set.heroLayout ?? "split";
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = matchMedia("(max-width: 900px)").matches;
    const N = Math.round((small ? 34000 : 80000) * density);
    let disposed = false;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio, maxDpr ?? (small ? 1.5 : 2)));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 200);

    const dust = new Float32Array(N * 3);
    const seed = new Float32Array(N * 2);
    for (let i = 0; i < N; i++) {
      dust.set([(rnd() - 0.5) * 34, (rnd() - 0.5) * 18, (rnd() - 0.5) * 16 - 4], i * 3);
      seed.set([rnd(), rnd()], i * 2);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(dust, 3));
    geo.setAttribute("aDust", new THREE.BufferAttribute(dust, 3));
    for (const role of ROLES) geo.setAttribute(ATTR[role], new THREE.BufferAttribute(dust.slice(), 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 2));
    geo.setAttribute("aGroup", new THREE.BufferAttribute(new Float32Array(N), 1));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 80);

    const gateM = new THREE.Matrix4();
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uGate: { value: gateM }, uYardY: { value: 0 },
        uHeroS: { value: 4.7 }, uHeroLift: { value: 0.92 }, uHeroHalfX: { value: 4.7 }, uHeroM: { value: 0 }, uHeroKeep: { value: set.heroDensity ?? 1 }, uHeroOff: { value: new THREE.Vector3() }, uScanS: { value: 4.7 }, uScanH: { value: 0.92 },
        uAmbS: { value: 4.2 }, uAmbM: { value: 0 }, uAmbOff: { value: new THREE.Vector3() }, uAmbY: { value: new THREE.Vector3(0, 1, 0) }, uCloseM: { value: 1 },
        uTime: { value: 0 }, uFrom: { value: 0 }, uTo: { value: 0 }, uMix: { value: 0 }, uIntro: { value: 0 }, uScroll: { value: 0 }, uPointer: { value: new THREE.Vector3(99, 99, 0) }, uPower: { value: 0 },
        uSize: { value: small ? 2.2 : 2.6 }, uPR: { value: renderer.getPixelRatio() }, uCalm: { value: reduced ? 0 : 1 }, uSmall: { value: small ? 1 : 0 },
        mint: { value: new THREE.Color() }, lime: { value: new THREE.Color() }, warm: { value: new THREE.Color() }, white: { value: new THREE.Color() },
      },
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    scene.add(new THREE.Points(geo, mat));
    const u = mat.uniforms;

    let heroBox: Box | null = null;
    let heroPts: THREE.Vector3[] = [];
    const UP = new THREE.Vector3(0, 1, 0);
    const RIGHT = new THREE.Vector3(1, 0, 0);
    let scanBox: Box | null = null;
    const runs = new Map<ShapeBuilder, Promise<ShapeResult>>();
    const run = (b: ShapeBuilder) => {
      let p = runs.get(b);
      if (!p) {
        p = Promise.resolve().then(() => b(N));
        runs.set(b, p);
      }
      return p;
    };
    for (const role of ROLES) {
      run(set[role])
        .then((res) => {
          if (disposed) return;
          const attr = geo.getAttribute(ATTR[role]) as THREE.BufferAttribute;
          (attr.array as Float32Array).set(res.positions.subarray(0, N * 3));
          attr.needsUpdate = true;
          const box = res.box ?? bounds(res.positions);
          const m = MOTION[res.motion ?? "static"];
          if (role === "hero") {
            u.uHeroM.value = m;
            const arr = attr.array as Float32Array;
            const lo = [1e9, 1e9, 1e9];
            const hi = [-1e9, -1e9, -1e9];
            for (let i = 0; i < arr.length; i++) {
              const a = i % 3;
              if (arr[i] < lo[a]) lo[a] = arr[i];
              if (arr[i] > hi[a]) hi[a] = arr[i];
            }
            for (let i = 0; i < arr.length; i++) arr[i] -= (lo[i % 3] + hi[i % 3]) / 2;
            heroBox = [hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]];
            const step = Math.max(1, Math.floor(N / 10000));
            heroPts = [];
            for (let i = 0; i < N; i += step) {
              const v = new THREE.Vector3(arr[i * 3], arr[i * 3 + 1], arr[i * 3 + 2]);
              if (m > 3.5) v.applyAxisAngle(UP, 0.6).applyAxisAngle(RIGHT, 0.6).multiplyScalar(0.7);
              heroPts.push(v);
            }
            heroKey = "";
          }
          if (role === "scan") {
            u.uScanS.value = fitObject(box);
            u.uScanH.value = (u.uScanS.value * box[1]) / 2;
            scanBox = box;
          }
          if (role === "overview" && res.groups) {
            const g = geo.getAttribute("aGroup") as THREE.BufferAttribute;
            (g.array as Float32Array).set(res.groups.subarray(0, N));
            g.needsUpdate = true;
          }
          if (role === "ambient") {
            u.uAmbM.value = m;
            u.uAmbS.value = m === MOTION.flow ? 33 : 4.2;
            u.uAmbOff.value.set(0, m === MOTION.flow ? -2.3 : 0.3, m === MOTION.flow ? -27 : 0);
            if (m === MOTION.flow) {
              const a = res.positions;
              let lo = 1e9, hi = -1e9;
              for (let i = 1; i < a.length; i += 3) {
                if (a[i] < lo) lo = a[i];
                if (a[i] > hi) hi = a[i];
              }
              const h = Math.max(hi - lo, 1e-3);
              u.uAmbY.value.set((lo + hi) / 2, THREE.MathUtils.clamp(1.2 / h, 1, 3), 0.1);
            }
          }
          if (role === "close") u.uCloseM.value = m;
        })
        .catch((e) => console.warn(`particle ${set.id}.${role}`, e));
    }

    const readVar = (cs: CSSStyleDeclaration, name: string) => {
      const c = new THREE.Color(1, 1, 1);
      const v = cs.getPropertyValue(name).trim();
      if (v) c.setStyle(v).convertLinearToSRGB();
      return c;
    };
    let colorKey = "";
    const readColors = () => {
      const cs = getComputedStyle(host);
      const key = cs.getPropertyValue("--accent") + cs.getPropertyValue("--deep-foreground");
      if (key === colorKey) return;
      colorKey = key;
      const accent = readVar(cs, "--accent");
      const fg = readVar(cs, "--deep-foreground");
      u.lime.value.copy(accent);
      u.white.value.copy(fg);
      u.mint.value.copy(fg).lerp(accent, 0.15).multiplyScalar(0.92);
      u.warm.value.copy(u.mint.value).lerp(accent, 0.45);
    };
    readColors();
    const observer = new MutationObserver(readColors);
    observer.observe(document.documentElement, { attributes: true });
    if (host !== document.documentElement) observer.observe(host, { attributes: true });

    const sections = () =>
      Array.from(document.querySelectorAll<HTMLElement>("[data-particle]"))
        .map((el) => ({ el, k: ROLES.indexOf(el.dataset.particle as ParticleRole) }))
        .filter((s) => s.k >= 0);

    const stageFromScroll = (list: { el: HTMLElement; k: number }[], fallback: number) => {
      if (!list.length) return fallback;
      const mid = innerHeight / 2;
      const pts = list.map(({ el, k }) => {
        const r = el.getBoundingClientRect();
        const h = Math.min(r.height, innerHeight) / 2;
        return { a: r.top + h, b: Math.max(r.top + h, r.bottom - h), k };
      });
      if (mid <= pts[0].b) return 0;
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const n = pts[i + 1];
        if (mid >= p.a && mid <= p.b) return i;
        if (n && mid > p.b && mid < n.a) return i + THREE.MathUtils.smoothstep((mid - p.b) / (n.a - p.b), 0.15, 0.85);
      }
      return pts.length - 1;
    };

    const ndc = new THREE.Vector2();
    const ray = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const hit = new THREE.Vector3();
    let pointerOn = false;
    let power = 0;
    const onPointer = (e: PointerEvent) => {
      ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
      pointerOn = true;
      ray.setFromCamera(ndc, camera);
      if (ray.ray.intersectPlane(plane, hit)) u.uPointer.value.copy(hit);
    };
    const onLeave = () => (pointerOn = false);
    addEventListener("pointermove", onPointer, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    const resize = () => {
      renderer.setSize(innerWidth, innerHeight, false);
      camera.aspect = innerWidth / innerHeight;
      camera.position.set(0, 1.1, camera.aspect < 0.85 ? 19 : 13.5);
      camera.lookAt(0, 0.5, 0);
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
    };
    addEventListener("resize", resize);
    resize();

    const tmp = new THREE.Vector3();
    const gateScale = small ? 0.42 : 0.74;
    const gateOffset = small ? new THREE.Vector3(0, 3.1, 0) : new THREE.Vector3(1.9, -0.07, 0);
    const mA = new THREE.Matrix4();
    let gateStep = 0;
    const poseGate = (gate: HTMLElement | undefined, dt: number) => {
      let g = 0;
      if (gate) {
        const mid = innerHeight / 2;
        const cs = Array.from(gate.querySelectorAll("ol > li"), (li) => {
          const r = li.getBoundingClientRect();
          return r.top + r.height / 2;
        });
        for (let i = 0; i < cs.length - 1; i++) if (mid >= cs[i]) g = i + THREE.MathUtils.clamp((mid - cs[i]) / (cs[i + 1] - cs[i]), 0, 1);
      }
      gateStep += (g - gateStep) * Math.min(1, dt * (reduced ? 20 : 4));
      gateM.makeTranslation(gateOffset.x, gateOffset.y, gateOffset.z)
        .multiply(mA.makeScale(gateScale, gateScale, gateScale))
        .multiply(mA.makeRotationX(0.12))
        .multiply(mA.makeRotationY(-0.72 + gateStep * GATE_STEP));
    };
    const ry0 = new THREE.Raycaster();
    const v2 = new THREE.Vector2();
    const worldY = (y: number) => {
      v2.set(0, -(y / innerHeight) * 2 + 1);
      ry0.setFromCamera(v2, camera);
      return ry0.ray.intersectPlane(plane, tmp) ? tmp.y : 0;
    };
    let scanOn = true;
    const placeScan = (gate: HTMLElement, scanW: number, time: number) => {
      const off = 1 - scanW;
      if (off >= 0.4 || !scanBox || set.scanBox === false) {
        if (scanOn) gate.style.setProperty("--scan-o", "0");
        scanOn = false;
        return;
      }
      scanOn = true;
      const s = u.uScanS.value / 2;
      let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
      for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) {
        tmp.set(x * scanBox[0] * s, y * scanBox[1] * s, z * scanBox[2] * s).applyMatrix4(gateM).project(camera);
        const px = ((tmp.x + 1) / 2) * innerWidth;
        const py = ((1 - tmp.y) / 2) * innerHeight;
        minX = Math.min(minX, px); maxX = Math.max(maxX, px); minY = Math.min(minY, py); maxY = Math.max(maxY, py);
      }
      const r = gate.getBoundingClientRect();
      const st = gate.style;
      st.setProperty("--scan-x", `${(minX - 14 - r.left).toFixed(1)}px`);
      st.setProperty("--scan-y", `${(minY - 14 - r.top).toFixed(1)}px`);
      st.setProperty("--scan-w", `${(maxX - minX + 28).toFixed(1)}px`);
      st.setProperty("--scan-h", `${(maxY - minY + 28).toFixed(1)}px`);
      st.setProperty("--scan-p", (reduced ? 0 : 1 - Math.abs(1 - 2 * ((time * 0.09) % 1))).toFixed(3));
      st.setProperty("--scan-o", (1 - THREE.MathUtils.smoothstep(off, 0.12, 0.38)).toFixed(3));
    };

    const toWorld = (x: number, y: number, out: THREE.Vector3) => {
      v2.set((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1);
      ry0.setFromCamera(v2, camera);
      return ry0.ray.intersectPlane(plane, out) ?? out.set(0, 0, 0);
    };
    const wa = new THREE.Vector3();
    const wb = new THREE.Vector3();
    let heroKey = "";
    const range = document.createRange();
    const textRight = (el: HTMLElement) => {
      let r = -1e9;
      const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      for (let n = walk.nextNode(); n; n = walk.nextNode()) {
        range.selectNodeContents(n);
        const q = range.getBoundingClientRect();
        if (q.width > 0) r = Math.max(r, q.right);
      }
      el.querySelectorAll("a").forEach((a) => (r = Math.max(r, a.getBoundingClientRect().right)));
      return r;
    };
    const heroBounds = (s: number, off: THREE.Vector3) => {
      let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
      for (const p of heroPts) {
        tmp.copy(p).multiplyScalar(s).applyAxisAngle(UP, -0.24).add(off).project(camera);
        const px = ((tmp.x + 1) / 2) * innerWidth;
        const py = ((1 - tmp.y) / 2) * innerHeight;
        minX = Math.min(minX, px); maxX = Math.max(maxX, px); minY = Math.min(minY, py); maxY = Math.max(maxY, py);
      }
      return { minX, minY, maxX, maxY };
    };
    const fitHero = (hero: HTMLElement) => {
      if (!heroBox || !heroPts.length) return;
      const anchor = hero.querySelector<HTMLElement>("[data-particle-anchor]") ?? hero;
      const text = hero.querySelector<HTMLElement>("[data-particle-text]");
      const hr = hero.getBoundingClientRect();
      const ar = anchor.getBoundingClientRect();
      const top = ar.top - hr.top;
      const tr = text?.getBoundingClientRect();
      const tRight = text ? textRight(text) : 0;
      const key = `${ar.left}|${top}|${ar.width}|${ar.height}|${tRight.toFixed(0)}|${tr ? `${tr.top - hr.top}|${tr.height}` : ""}|${innerWidth}|${innerHeight}`;
      if (key === heroKey || ar.width < 2 || ar.height < 2) return;
      heroKey = key;
      const mode = tr && ar.left >= tRight - 1 ? "side" : tr && ar.bottom <= tr.top + 1 ? "above" : "anchor";
      const fill = set.heroFill ?? 1;
      const tw = (mode === "side" ? Math.min(ar.width, innerWidth - tRight - 48) : ar.width) * fill;
      const th = ar.height * fill;
      const cx = mode === "anchor" ? ar.left + ar.width / 2 : mode === "side" ? (tRight + innerWidth) / 2 : innerWidth / 2;
      let cy = mode === "side" && tr ? tr.top - hr.top + tr.height / 2 : top + ar.height / 2;
      const off = u.uHeroOff.value as THREE.Vector3;
      toWorld(cx, cy, off);
      let s = 1;
      for (let it = 0; it < 6; it++) {
        let b = heroBounds(s, off);
        s *= Math.min(tw / Math.max(b.maxX - b.minX, 1e-3), th / Math.max(b.maxY - b.minY, 1e-3));
        b = heroBounds(s, off);
        if (mode === "above" && tr) {
          const h = b.maxY - b.minY;
          const gap = small ? (innerWidth - (b.maxX - b.minX)) / 2 : 0;
          const bottom = THREE.MathUtils.clamp(tr.top - hr.top - gap, top + h, top + ar.height);
          cy = bottom - h / 2;
        }
        toWorld(cx, cy, wa);
        toWorld((b.minX + b.maxX) / 2, (b.minY + b.maxY) / 2, wb);
        off.x += wa.x - wb.x;
        off.y += wa.y - wb.y;
      }
      u.uHeroS.value = s;
      u.uHeroLift.value = (s * heroBox[1]) / 2;
      u.uHeroHalfX.value = (s * heroBox[0]) / 2;    };

    let stage = 0;
    let intro = reduced ? 1 : 0;
    const start = performance.now();
    let last = start;
    let raf = 0;
    let clip = "";
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      if (heroKey && (now - start) / 1000 >= introDelay) intro = Math.min(1, intro + dt / 2.6);
      const list = sections();
      stage += (stageFromScroll(list, stage) - stage) * Math.min(1, dt * (reduced ? 20 : 3.5));
      const si = Math.max(0, Math.min(Math.floor(stage), list.length - 2));
      const kFrom = list[si]?.k ?? 0;
      const kTo = list[si + 1]?.k ?? kFrom;
      const mix = THREE.MathUtils.clamp(stage - si, 0, 1);
      const weight = (k: number) => (kFrom === k ? 1 - mix : 0) + (kTo === k ? mix : 0);
      const hero = list.find((s) => s.k === 0)?.el;
      if (hero) {
        if (hero.dataset.heroLayout !== heroLayout) hero.dataset.heroLayout = heroLayout;
        fitHero(hero);
        const hr = hero.getBoundingClientRect();
        u.uScroll.value = THREE.MathUtils.clamp(-hr.top / hr.height, 0, 1);
      }
      u.uFrom.value = kFrom;
      u.uTo.value = kTo;
      u.uMix.value = mix;
      u.uIntro.value = intro;
      u.uTime.value = now / 1000;
      power += ((pointerOn ? 1 : 0) - power) * Math.min(1, dt * 5);
      u.uPower.value = power * (reduced ? 0.4 : 1);
      const show = stageHush('[data-particle="none"]');
      sky.style.opacity = String(THREE.MathUtils.clamp(weight(0), 0.18, 1) * show);
      const foot = document.querySelector<HTMLElement>("footer");
      canvas.style.opacity = String((foot ? THREE.MathUtils.clamp((foot.getBoundingClientRect().top - innerHeight * 0.3) / (innerHeight * 0.4), 0, 1) : 1) * show);

      let path = "";
      for (const { el } of list) {
        const r = el.getBoundingClientRect();
        const top = Math.max(0, Math.floor(r.top));
        const bottom = Math.min(innerHeight, Math.ceil(r.bottom));
        if (bottom > top) path += `M${Math.floor(r.left)} ${top}H${Math.ceil(r.right)}V${bottom}H${Math.floor(r.left)}Z`;
      }
      const nextClip = path ? `path("${path}")` : "inset(100%)";
      if (nextClip !== clip) {
        clip = nextClip;
        wrap.style.clipPath = clip;
      }

      const gate = list.find((s) => s.k === 2)?.el;
      poseGate(gate, dt);
      if (gate) placeScan(gate, weight(2), now / 1000);
      const focus = list.find((s) => s.k === 1)?.el.querySelector<HTMLElement>("[data-particle-focus]");
      if (focus) {
        const fr = focus.getBoundingClientRect();
        u.uYardY.value = THREE.MathUtils.clamp(worldY(fr.top + fr.height / 2) - worldY(innerHeight / 2), -6, 6);
      }
      if (path) {
        renderer.render(scene, camera);
        ready();
      }
      raf = requestAnimationFrame(frame);
    };
    let active = !pauseOffscreen;
    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && active) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    if (active) raf = requestAnimationFrame(frame);

    const onScreen = new Set<Element>();
    const io = pauseOffscreen
      ? new IntersectionObserver((entries) => {
          for (const e of entries) {
            if (e.isIntersecting) onScreen.add(e.target);
            else onScreen.delete(e.target);
          }
          const on = onScreen.size > 0;
          if (on === active) return;
          active = on;
          cancelAnimationFrame(raf);
          if (on && !document.hidden) {
            last = performance.now();
            raf = requestAnimationFrame(frame);
          } else if (!on) {
            clip = "inset(100%)";
            wrap.style.clipPath = clip;
          }
        })
      : null;
    const watch = () => {
      if (!io) return;
      io.disconnect();
      onScreen.clear();
      for (const { el } of sections()) io.observe(el);
    };
    watch();
    const tree = io ? new MutationObserver(watch) : null;
    tree?.observe(host, { childList: true });

    return () => {
      disposed = true;
      io?.disconnect();
      tree?.disconnect();
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      removeEventListener("resize", resize);
      observer.disconnect();
      geo.dispose();
      mat.dispose();
      renderer.dispose();
    };
  }, [introDelay, variant, custom, maxDpr, density, pauseOffscreen, ready]);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 -z-10 bg-[color-mix(in_oklab,var(--deep),black_72%)] [clip-path:inset(100%)] ${className ?? ""}`}
    >
      <div
        ref={skyRef}
        className="absolute inset-0 transition-opacity duration-[600ms]"
        style={{ background: "radial-gradient(90% 55% at 62% 58%, color-mix(in oklab, var(--deep), var(--accent) 22%) 0%, color-mix(in oklab, var(--deep), black 15%) 32%, color-mix(in oklab, var(--deep), black 55%) 62%, color-mix(in oklab, var(--deep), black 72%) 100%)" }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 block size-full" />
    </div>
  );
}
