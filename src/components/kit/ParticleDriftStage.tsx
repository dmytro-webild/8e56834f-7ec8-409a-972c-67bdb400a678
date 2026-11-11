"use client";

import { useEffect, useRef } from "react";
import { driftCount, publishDriftStats } from "@/components/kit/driftStats";
import * as THREE from "three";
import { stageHush } from "@/components/kit/stageHush";
import { useWebildHold } from "@/components/kit/webildReady";
import { DRIFT_SETS, type DriftSet } from "@/components/kit/driftShapes";

type DriftRole = "hero" | "galaxy" | "stars" | "model" | "close";

const ROLES: DriftRole[] = ["hero", "galaxy", "stars", "model", "close"];
const publish = publishDriftStats;

const NOISE = `
vec3 mod289(vec3 x){ return x - floor(x * (1. / 289.)) * 289.; }
vec4 mod289(vec4 x){ return x - floor(x * (1. / 289.)) * 289.; }
vec4 permute(vec4 x){ return mod289(((x * 34.) + 1.) * x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - .85373472095314 * r; }
float snoise(vec3 v){
  const vec2 C = vec2(1. / 6., 1. / 3.); const vec4 D = vec4(0., .5, 1., 2.);
  vec3 i = floor(v + dot(v, C.yyy)); vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz); vec3 l = 1. - g; vec3 i1 = min(g.xyz, l.zxy); vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx; vec3 x2 = x0 - i2 + C.yyy; vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(i.z + vec4(0., i1.z, i2.z, 1.)) + i.y + vec4(0., i1.y, i2.y, 1.)) + i.x + vec4(0., i1.x, i2.x, 1.));
  float n_ = .142857142857; vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49. * floor(p * ns.z * ns.z); vec4 x_ = floor(j * ns.z); vec4 y_ = floor(j - 7. * x_);
  vec4 x = x_ * ns.x + ns.yyyy; vec4 y = y_ * ns.x + ns.yyyy; vec4 h = 1. - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy); vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2. + 1.; vec4 s1 = floor(b1) * 2. + 1.; vec4 sh = -step(h, vec4(0.));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy; vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x); vec3 p1 = vec3(a0.zw, h.y); vec3 p2 = vec3(a1.xy, h.z); vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.); m = m * m;
  return 42. * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
mat3 rotY(float a){ float c = cos(a), s = sin(a); return mat3(c, 0., -s, 0., 1., 0., s, 0., c); }
mat3 rotX(float a){ float c = cos(a), s = sin(a); return mat3(1., 0., 0., 0., c, s, 0., -s, c); }`;

const VERTEX = `
attribute vec3 aHero, aGalaxy, aStars, aModel, aClose; attribute vec2 aSeed;
uniform float uTime, uFrom, uTo, uMix, uPower, uSize, uPR, uCalm, uRing; uniform vec3 uPointer; uniform vec2 uTilt;
uniform vec3 teal, blue, violet, pink;
varying vec3 vColor; varying float vAlpha;
${NOISE}
vec3 role(int k, out vec3 col){
  float t = uTime * uCalm;
  if (k == 0) {
    vec3 p = aHero;
    vec3 tc = uRing > 0. ? vec3(normalize(p.xy + 1e-4) * uRing, 0.) : vec3(0.);
    vec3 n = normalize(p - tc + 1e-4);
    float w = snoise(p * .6 + vec3(0., 0., t * .25)) * .3 + snoise(p * 1.6 - t * .2) * .09;
    p += n * w;
    p = rotY(sin(t * .25) * .35 + uTilt.x) * rotX(.2 + uTilt.y) * p;
    col = mix(violet, teal, smoothstep(-2.8, 2.6, p.y + p.x * .3));
    return p;
  }
  if (k == 1) {
    vec3 p = aGalaxy; float r = length(p.xz);
    p = rotY(t * .35 / (.35 + r * .5)) * p;
    p = rotX(.38) * p;
    p.y -= .25;
    col = mix(pink, blue, smoothstep(0., 1.4, r)); col = mix(col, teal, smoothstep(1.6, 3.4, r));
    return p * .92;
  }
  if (k == 3) {
    vec3 p = rotY(sin(t * .3) * .45 - .35 + uTilt.x) * aModel;
    p = rotX(uTilt.y * .6) * p;
    col = mix(violet, teal, smoothstep(-1.4, 1.6, aModel.y));
    return p;
  }
  vec3 p = k == 2 ? aStars : aClose; p.z += mod(t * .6 + aSeed.x * 12., 12.) - 13.;
  col = mix(vec3(.75, .85, 1.), teal, aSeed.y);
  return p;
}
void main(){
  float local = smoothstep(0., 1., clamp((uMix - aSeed.x * .35) / .65, 0., 1.));
  vec3 ca, cb;
  vec3 pa = role(int(uFrom + .5), ca), pb = role(int(uTo + .5), cb);
  vec3 p = mix(pa, pb, local);
  float mid = sin(local * 3.14159) * uCalm * step(.5, abs(uTo - uFrom));
  p += vec3(snoise(p * .5 + 3.1), snoise(p * .5 + 7.7), snoise(p * .5 + 1.3)) * mid * .3;
  vec3 col = mix(ca, cb, local);
  vec4 wp = modelMatrix * vec4(p, 1.);
  vec3 d = wp.xyz - uPointer; float dist = length(d.xy);
  float fall = exp(-dist * dist * 3.2) * uPower;
  wp.xy += normalize(d.xy + 1e-4) * fall * .16;
  wp.z += fall * .25;
  col = mix(col, vec3(1.), clamp(fall * 1.3, 0., 1.));
  vec4 mv = viewMatrix * wp;
  gl_Position = projectionMatrix * mv;
  float twinkle = .75 + .25 * sin(uTime * 2. + aSeed.y * 60.);
  gl_PointSize = uSize * uPR * (.55 + aSeed.y * .9) * (9. / max(-mv.z, 7.)) * (1. + fall * 1.5);
  vColor = col * (.8 + .5 * twinkle);
  vAlpha = (.7 + .5 * aSeed.y) * smoothstep(1.5, 5., -mv.z);
}`;

const FRAGMENT = `
varying vec3 vColor; varying float vAlpha;
void main(){ float d = length(gl_PointCoord - .5); float a = smoothstep(.5, 0., d); gl_FragColor = vec4(vColor * a, a * vAlpha); }`;

type ParticleDriftStageProps = { variant?: string; set?: DriftSet; className?: string };

export default function ParticleDriftStage({ variant = "drift", set: custom, className }: ParticleDriftStageProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ready = useWebildHold(wrapRef);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const set = custom ?? DRIFT_SETS[variant] ?? DRIFT_SETS.drift;
    const t0 = performance.now();
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = !matchMedia("(min-width: 880px)").matches;
    const N = driftCount();

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 11);

    const built = new Map<unknown, Float32Array>();
    const build = (b: (n: number) => Float32Array) => {
      if (!built.has(b)) built.set(b, b(N));
      return built.get(b)!;
    };
    const seed = new Float32Array(N * 2);
    for (let i = 0; i < N * 2; i++) seed[i] = Math.random();
    const hero = build(set.hero);
    const stars = build(set.stars);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(hero, 3));
    geo.setAttribute("aHero", new THREE.BufferAttribute(hero, 3));
    geo.setAttribute("aGalaxy", new THREE.BufferAttribute(build(set.galaxy), 3));
    geo.setAttribute("aStars", new THREE.BufferAttribute(stars, 3));
    geo.setAttribute("aModel", new THREE.BufferAttribute(build(set.model), 3));
    geo.setAttribute("aClose", new THREE.BufferAttribute(build(set.close), 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 2));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 20);

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 }, uFrom: { value: 0 }, uTo: { value: 0 }, uMix: { value: 0 }, uRing: { value: set.heroRing },
        uPointer: { value: new THREE.Vector3(99, 99, 0) }, uPower: { value: 0 }, uTilt: { value: new THREE.Vector2() },
        uSize: { value: small ? 2.8 : 3.3 }, uPR: { value: renderer.getPixelRatio() }, uCalm: { value: reduced ? 0 : 1 },
        teal: { value: new THREE.Color() }, blue: { value: new THREE.Color() }, violet: { value: new THREE.Color() }, pink: { value: new THREE.Color() },
      },
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const u = mat.uniforms;
    const points = new THREE.Points(geo, mat);
    scene.add(points);

    const moteGeo = new THREE.BufferGeometry().setAttribute(
      "position",
      new THREE.BufferAttribute(Float32Array.from({ length: 90 * 3 }, (_, i) => (i % 3 === 2 ? -6 - Math.random() * 8 : (Math.random() - 0.5) * 26)), 3),
    );
    const moteMat = new THREE.PointsMaterial({ size: 0.09, transparent: true, opacity: 0.45, depthWrite: false, blending: THREE.AdditiveBlending });
    const motes = new THREE.Points(moteGeo, moteMat);
    scene.add(motes);

    const raw = (cs: CSSStyleDeclaration, name: string, out: THREE.Color) => {
      const v = cs.getPropertyValue(name).trim();
      if (v) out.setStyle(v).convertLinearToSRGB();
    };
    let colorKey = "";
    const readColors = () => {
      const cs = getComputedStyle(wrap);
      const key = ["--particle-a", "--particle-b", "--particle-c", "--particle-d"].map((n) => cs.getPropertyValue(n)).join();
      if (key === colorKey) return;
      colorKey = key;
      raw(cs, "--particle-a", u.teal.value);
      raw(cs, "--particle-b", u.violet.value);
      raw(cs, "--particle-c", u.pink.value);
      raw(cs, "--particle-d", u.blue.value);
      moteMat.color.copy(u.violet.value).lerp(u.blue.value, 0.5);
    };
    readColors();
    const observer = new MutationObserver(readColors);
    observer.observe(document.documentElement, { attributes: true });
    const host = wrap.closest("main");
    if (host) observer.observe(host, { attributes: true });

    const sections = () =>
      Array.from(document.querySelectorAll<HTMLElement>("[data-drift]"))
        .map((el) => ({ el, k: ROLES.indexOf(el.dataset.drift as DriftRole) }))
        .filter((s) => s.k >= 0);

    const listPos = (list: { el: HTMLElement }[]) => {
      if (!list.length) return 0;
      const mid = innerHeight / 2;
      const ys = list.map(({ el }) => {
        const r = el.getBoundingClientRect();
        return r.top + Math.min(r.height, innerHeight) / 2;
      });
      if (mid <= ys[0]) return 0;
      for (let i = 0; i < ys.length - 1; i++) {
        if (mid >= ys[i] && mid <= ys[i + 1]) return i + THREE.MathUtils.smoothstep((mid - ys[i]) / (ys[i + 1] - ys[i]), 0.35, 0.65);
      }
      return ys.length - 1;
    };

    const ndc = new THREE.Vector2();
    const ray = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const hit = new THREE.Vector3();
    const tilt = new THREE.Vector2();
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
      camera.position.z = camera.aspect < 0.8 ? 17 : 11;
      camera.updateProjectionMatrix();
    };
    addEventListener("resize", resize);
    resize();

    publish({ count: N, frameMs: 0, firstFrame: 0, fps: 0 });
    let frames = 0, acc = 0, firstFrame = 0;
    let pos = 0;
    let last = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      canvas.style.opacity = String(stageHush('[data-drift="none"]'));
      const list = sections();
      const target = listPos(list);
      pos += (target - pos) * Math.min(1, dt * (reduced ? 20 : 4));
      const i = Math.min(Math.floor(pos), Math.max(list.length - 1, 0));
      const from = list[i]?.k ?? 0;
      const to = list[Math.min(i + 1, list.length - 1)]?.k ?? from;
      const f = THREE.MathUtils.clamp(pos - i, 0, 1);
      u.uFrom.value = from;
      u.uTo.value = to;
      u.uMix.value = f;
      u.uTime.value = now / 1000;
      power += ((pointerOn ? 1 : 0) - power) * Math.min(1, dt * 5);
      u.uPower.value = power * (reduced ? 0.4 : 1);
      tilt.x += ((pointerOn ? ndc.x * 0.35 : 0) - tilt.x) * Math.min(1, dt * 2.5);
      tilt.y += ((pointerOn ? -ndc.y * 0.2 : 0) - tilt.y) * Math.min(1, dt * 2.5);
      u.uTilt.value.copy(tilt);
      const heroWeight = (from === 0 ? 1 - f : 0) + (to === 0 ? f : 0);
      const shift = small ? 0 : heroWeight * 0.35;
      points.position.x += (shift - points.position.x) * Math.min(1, dt * 4);
      motes.rotation.y += dt * 0.01;

      renderer.render(scene, camera);
      ready();
      if (!firstFrame) {
        firstFrame = (performance.now() - t0) / 1000;
        publish({ firstFrame });
      }
      frames++;
      acc += dt;
      if (acc > 0.5) {
        publish({ fps: Math.round(frames / acc), frameMs: (acc / frames) * 1000 });
        frames = 0;
        acc = 0;
      }
      raf = requestAnimationFrame(frame);
    };
    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      removeEventListener("resize", resize);
      observer.disconnect();
      geo.dispose();
      mat.dispose();
      moteGeo.dispose();
      moteMat.dispose();
      renderer.dispose();
    };
  }, [variant, custom, ready]);

  return (
    <div ref={wrapRef} aria-hidden="true" className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background ${className ?? ""}`}>
      <div className="drift-aurora absolute inset-0 overflow-hidden">
        <div />
        <div />
        <div />
      </div>
      <canvas ref={canvasRef} className="absolute inset-0 block size-full" />
    </div>
  );
}
