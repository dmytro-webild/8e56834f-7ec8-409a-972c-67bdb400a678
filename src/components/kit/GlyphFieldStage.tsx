"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { stageHush } from "@/components/kit/stageHush";
import { useWebildHold } from "@/components/kit/webildReady";
import { GLYPH_MOBILE_POSE, GLYPH_SETS } from "@/components/kit/glyphShapes";
import GlyphDust from "@/components/kit/GlyphDust";
import type { ParticleSet } from "@/components/kit/particleShapes";

type GlyphFieldStageProps = { introDelay?: number; variant?: string; set?: ParticleSet; className?: string };

const GLYPHS = " .,:-*_<>/+oO#SF";
const TRAIL = 12;
const TRAIL_LIFE = 0.6;
const FOV = 34;
const rnd = Math.random;

const POINTS_VERTEX = `
attribute vec3 aHero, aClose, aDust; attribute vec2 aSeed;
uniform float uTime, uCalm, uIntro, uMix, uFly, uHeroS, uCloseS, uPower, uSize, uCam;
uniform vec3 uHeroOff, uCloseOff, uPointer;
uniform vec2 uPose;
uniform float uGain;
varying float vW;
mat3 rotY(float a){ float c = cos(a), s = sin(a); return mat3(c, 0., -s, 0., 1., 0., s, 0., c); }
mat3 rotX(float a){ float c = cos(a), s = sin(a); return mat3(1., 0., 0., 0., c, s, 0., -s, c); }
mat3 rotZ(float a){ float c = cos(a), s = sin(a); return mat3(c, s, 0., -s, c, 0., 0., 0., 1.); }
float hash(float n){ return fract(sin(n) * 43758.5453); }
void main(){
  float t = uTime * uCalm;
  vec3 h = rotZ(uPose.y) * rotX(.32 + sin(t * .17) * .05) * rotY(-.5 + uPose.x + sin(t * .1) * .3) * aHero * uHeroS * (1. + uFly * .45);
  h += uHeroOff + vec3(0., uFly * .4, uFly * 3.2);
  float order = .5 - aHero.x * .5;
  float a = smoothstep(0., 1., clamp(uIntro * 1.8 - order * .6 - aSeed.x * .2, 0., 1.));
  h = mix(aDust, h, a);
  vec3 c = rotX(.55 + sin(t * .15) * .06) * rotY(.8 + t * .05) * aClose * uCloseS + uCloseOff;
  float local = smoothstep(0., 1., clamp((uMix - aSeed.x * .3) / .7, 0., 1.));
  vec3 p = mix(h, c, local);
  p += (vec3(hash(aSeed.x * 91.), hash(aSeed.y * 37.), hash(aSeed.x * 13. + aSeed.y)) - .5) * sin(local * 3.14159) * 2.5 * uCalm;
  vec2 d = p.xy - uPointer.xy;
  p.xy += normalize(d + 1e-4) * exp(-dot(d, d) * 1.6) * uPower * .1;
  vec4 mv = modelViewMatrix * vec4(p, 1.);
  gl_Position = projectionMatrix * mv;
  float z = -mv.z;
  float near = smoothstep(uCam + 5.5, uCam - 5.5, z);
  gl_PointSize = clamp(uSize / z, 1., 3.);
  vW = (.35 + .65 * near) * (.6 + .4 * aSeed.y) * smoothstep(.6, 2.5, z) * mix(.25, 1., a) * mix(uGain, 1., local);
}`;

const POINTS_FRAGMENT = `
varying float vW;
void main(){ gl_FragColor = vec4(vW * .4, 0., 0., 1.); }`;

const GLYPH_VERTEX = `void main(){ gl_Position = vec4(position.xy, 0., 1.); }`;

const GLYPH_FRAGMENT = `
uniform sampler2D uField, uAtlas;
uniform vec2 uGrid, uView;
uniform float uPR, uLift, uAlpha, uHot;
uniform vec3 uFg, uAccent;
uniform vec3 uTrail[${TRAIL}];
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float field(vec2 c){ return texture2D(uField, (c + .5) / uGrid).r; }
void main(){
  vec2 css = gl_FragCoord.xy / uPR;
  vec2 g = css / uView * uGrid;
  vec2 cell = floor(g);
  vec2 f = fract(g);
  float h = hash(vec2(cell.x, 7.31));
  float lift = clamp((uLift - h * .25) / .75, 0., 1.) * (1.2 + h);
  vec2 src = cell - vec2(0., floor(lift * uGrid.y));
  if (src.y < 0.) discard;
  float b = field(src);
  if (b < .02) discard;
  float lo = min(min(field(src + vec2(1., 0.)), field(src - vec2(1., 0.))), min(field(src + vec2(0., 1.)), field(src - vec2(0., 1.))));
  float edge = smoothstep(.12, .45, b - lo);
  float fade = 1. - smoothstep(.2, 1.1, lift);
  if (hash(src * 1.7 + 3.) > fade * 1.3) discard;
  float tr = 0.;
  if (uHot > 0.) {
    for (int i = 0; i < ${TRAIL}; i++) {
      vec2 d = (css - uTrail[i].xy) / 70.;
      tr += exp(-dot(d, d)) * uTrail[i].z;
    }
  }
  tr = min(tr, 1.) * max(edge, .35);
  float idx = clamp(floor(b * 12. + edge * 4. + tr * 2. + (hash(src) - .5) * 1.6), 1., 15.);
  float glyph = texture2D(uAtlas, vec2((idx + f.x) / 16., f.y)).r;
  float a = glyph * mix(.4, 1., clamp(b * .6 + edge * .6, 0., 1.)) * fade * uAlpha;
  vec3 col = mix(uFg, uAccent, tr);
  gl_FragColor = vec4(col * a, a);
}`;

const normalize = (p: Float32Array, n: number) => {
  const lo = [1e9, 1e9, 1e9];
  const hi = [-1e9, -1e9, -1e9];
  for (let i = 0; i < n * 3; i++) {
    const k = i % 3;
    if (p[i] < lo[k]) lo[k] = p[i];
    if (p[i] > hi[k]) hi[k] = p[i];
  }
  const half = Math.max(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]) / 2 || 1;
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n * 3; i++) out[i] = (p[i] - (lo[i % 3] + hi[i % 3]) / 2) / half;
  return { out, box: [(hi[0] - lo[0]) / 2 / half, (hi[1] - lo[1]) / 2 / half, (hi[2] - lo[2]) / 2 / half] };
};

export default function GlyphFieldStage({ introDelay = 0, variant = "finance", set: custom, className }: GlyphFieldStageProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const firstFrame = useWebildHold(wrapRef);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const set = custom ?? GLYPH_SETS[variant] ?? GLYPH_SETS.finance;
    const host = wrap.closest("main") ?? document.documentElement;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = !matchMedia("(min-width: 880px)").matches;
    const fine = matchMedia("(pointer: fine)").matches;
    const N = small ? 16000 : 24000;
    const CELL = small ? 6 : 7;
    let disposed = false;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1 : 1.5));
    renderer.setClearColor(0, 0);
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 200);
    camera.position.set(0, 0, 13.5);

    const dust = new Float32Array(N * 3);
    const seed = new Float32Array(N * 2);
    for (let i = 0; i < N; i++) {
      dust.set([(rnd() - 0.5) * 30, (rnd() - 0.5) * 16, (rnd() - 0.5) * 14 - 3], i * 3);
      seed.set([rnd(), rnd()], i * 2);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(dust, 3));
    geo.setAttribute("aDust", new THREE.BufferAttribute(dust, 3));
    geo.setAttribute("aHero", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    geo.setAttribute("aClose", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 2));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 80);

    const pointMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 }, uCalm: { value: reduced ? 0 : 1 }, uIntro: { value: reduced ? 1 : 0 }, uMix: { value: 0 }, uFly: { value: 0 },
        uHeroS: { value: 3 }, uCloseS: { value: 4 }, uPower: { value: 0 }, uSize: { value: small ? 16 : 20 }, uCam: { value: 13.5 },
        uHeroOff: { value: new THREE.Vector3() }, uCloseOff: { value: new THREE.Vector3() }, uPointer: { value: new THREE.Vector3(99, 99, 0) },
        uPose: { value: new THREE.Vector2() }, uGain: { value: 1 },
      },
      vertexShader: POINTS_VERTEX,
      fragmentShader: POINTS_FRAGMENT,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const pointScene = new THREE.Scene();
    pointScene.add(new THREE.Points(geo, pointMat));
    const pu = pointMat.uniforms;
    let heroBox = [1, 1, 1];
    let heroReach = [1, 1];
    const pose = GLYPH_MOBILE_POSE[variant] ?? [0, 0];
    let closeBox = [1, 1, 1];
    let ready = 0;

    const field = new THREE.WebGLRenderTarget(1, 1, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: false });

    const atlasCanvas = document.createElement("canvas");
    atlasCanvas.width = 512;
    atlasCanvas.height = 32;
    const atlas = new THREE.CanvasTexture(atlasCanvas);
    atlas.minFilter = THREE.LinearMipmapLinearFilter;
    const font = getComputedStyle(host).getPropertyValue("--font-label").trim() || "monospace";
    const drawAtlas = () => {
      const ctx = atlasCanvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, 512, 32);
      ctx.fillStyle = "white";
      ctx.font = `26px ${font}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      Array.from(GLYPHS).forEach((c, i) => ctx.fillText(c, i * 32 + 16, 17));
      atlas.needsUpdate = true;
    };
    drawAtlas();
    document.fonts?.load(`26px ${font}`).then(() => !disposed && drawAtlas()).catch(() => {});

    const trail = Array.from({ length: TRAIL }, () => new THREE.Vector3(-999, -999, 0));
    const trailTime = trail.map(() => -1e9);
    const glyphMat = new THREE.ShaderMaterial({
      uniforms: {
        uField: { value: field.texture }, uAtlas: { value: atlas }, uGrid: { value: new THREE.Vector2(1, 1) }, uView: { value: new THREE.Vector2(1, 1) },
        uPR: { value: renderer.getPixelRatio() }, uLift: { value: 0 }, uAlpha: { value: 1 }, uHot: { value: 0 },
        uFg: { value: new THREE.Color(1, 1, 1) }, uAccent: { value: new THREE.Color(1, 0.4, 0.1) }, uTrail: { value: trail },
      },
      vertexShader: GLYPH_VERTEX,
      fragmentShader: GLYPH_FRAGMENT,
      depthTest: false,
      depthWrite: false,
      blending: THREE.NoBlending,
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), glyphMat);
    quad.frustumCulled = false;
    const glyphScene = new THREE.Scene();
    glyphScene.add(quad);
    const gu = glyphMat.uniforms;

    const readColors = () => {
      const cs = getComputedStyle(host);
      const fg = cs.getPropertyValue("--foreground").trim();
      const ac = cs.getPropertyValue("--accent").trim();
      if (fg) (gu.uFg.value as THREE.Color).setStyle(fg).convertLinearToSRGB();
      if (ac) (gu.uAccent.value as THREE.Color).setStyle(ac).convertLinearToSRGB();
    };
    readColors();
    const colorWatch = new MutationObserver(readColors);
    colorWatch.observe(document.documentElement, { attributes: true });
    if (host !== document.documentElement) colorWatch.observe(host, { attributes: true });

    const viewH = () => 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const fit = () => {
      const vh = viewH();
      const vw = vh * camera.aspect;
      const hero = document.querySelector<HTMLElement>('[data-particle="hero"]');
      const anchor = hero?.querySelector<HTMLElement>("[data-particle-anchor]") ?? hero;
      let cx = innerWidth / 2;
      let cy = innerHeight / 2;
      let aw = innerWidth;
      let ah = innerHeight;
      if (hero && anchor) {
        const hr = hero.getBoundingClientRect();
        const ar = anchor.getBoundingClientRect();
        cx = ar.left + ar.width / 2;
        cy = ar.top - hr.top + Math.min(ar.height, innerHeight) / 2;
        aw = ar.width;
        ah = Math.min(ar.height, innerHeight);
      }
      const wx = (aw / innerWidth) * vw;
      const wy = (ah / innerHeight) * vh;
      const halfW = heroBox[0] * 0.92 + heroBox[2] * 0.55;
      const halfH = heroBox[1] * 0.95 + heroBox[2] * 0.45;
      const narrow = innerWidth < 880;
      if (narrow) {
        const s = Math.min((wx * 0.44) / heroReach[0], (vh * 0.24) / heroReach[1]);
        pu.uHeroS.value = s;
        (pu.uPose.value as THREE.Vector2).set(...pose);
        pu.uGain.value = THREE.MathUtils.clamp(((s * innerHeight) / vh / CELL / 78) ** 2 * (24000 / N), 0.35, 1);
        hero?.style.setProperty("--glyph-h", `${Math.round(Math.max(((2.2 * heroReach[1] * s) / vh) * innerHeight, innerWidth * 0.6))}px`);
      } else {
        (pu.uPose.value as THREE.Vector2).set(0, 0);
        pu.uGain.value = 1;
        hero?.style.removeProperty("--glyph-h");
        pu.uHeroS.value = Math.min((wx * 0.43) / halfW, (wy * 0.4) / halfH);
      }
      (pu.uHeroOff.value as THREE.Vector3).set((cx / innerWidth - 0.5) * vw, -(cy / innerHeight - 0.5) * vh, 0);
      pu.uCloseS.value = (Math.max(vw, vh * 0.85) * 0.62) / Math.max(closeBox[0], closeBox[2]);
      (pu.uCloseOff.value as THREE.Vector3).set(0, 0, 2.2);
    };

    const load = (role: "hero" | "close") =>
      Promise.resolve()
        .then(() => set[role](N))
        .then((res) => {
          if (disposed) return;
          const { out, box } = normalize(res.positions, Math.min(N, res.positions.length / 3));
          const attr = geo.getAttribute(role === "hero" ? "aHero" : "aClose") as THREE.BufferAttribute;
          (attr.array as Float32Array).set(out);
          attr.needsUpdate = true;
          if (role === "hero") {
            heroBox = box;
            heroReach = [0, 0];
            const ca = Math.cos(0.32);
            const sa = Math.sin(0.32);
            const cr = Math.cos(pose[1]);
            const sr = Math.sin(pose[1]);
            for (let k = -3; k <= 3; k++) {
              const b = -0.5 + pose[0] + k * 0.1;
              const cb = Math.cos(b);
              const sb = Math.sin(b);
              for (let i = 0; i < out.length; i += 3) {
                const x = cb * out[i] + sb * out[i + 2];
                const y = ca * out[i + 1] - sa * (cb * out[i + 2] - sb * out[i]);
                heroReach[0] = Math.max(heroReach[0], Math.abs(cr * x - sr * y));
                heroReach[1] = Math.max(heroReach[1], Math.abs(sr * x + cr * y));
              }
            }
          } else closeBox = box;
          ready++;
          fit();
        })
        .catch((e) => console.warn(`glyph ${set.id}.${role}`, e));
    load("hero");
    load("close");

    const resize = () => {
      renderer.setSize(innerWidth, innerHeight, false);
      camera.aspect = innerWidth / innerHeight;
      camera.position.z = camera.aspect < 0.85 ? 17 : 13.5;
      pu.uCam.value = camera.position.z;
      camera.updateProjectionMatrix();
      const cols = Math.ceil(innerWidth / CELL);
      const rows = Math.ceil(innerHeight / CELL);
      field.setSize(cols, rows);
      (gu.uGrid.value as THREE.Vector2).set(cols, rows);
      (gu.uView.value as THREE.Vector2).set(innerWidth, innerHeight);
      fit();
    };
    addEventListener("resize", resize);
    resize();

    const ndc = new THREE.Vector2();
    const ray = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const hit = new THREE.Vector3();
    let pointerOn = false;
    let power = 0;
    let head = 0;
    let lastSample = 0;
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointerOn = true;
      ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      if (ray.ray.intersectPlane(plane, hit)) (pu.uPointer.value as THREE.Vector3).copy(hit);
      const now = performance.now();
      if (now - lastSample < 30) return;
      lastSample = now;
      head = (head + 1) % TRAIL;
      trail[head].set(e.clientX, innerHeight - e.clientY, 0);
      trailTime[head] = now;
    };
    const onLeave = () => (pointerOn = false);
    if (fine && !reduced) {
      addEventListener("pointermove", onPointer, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }

    let list: HTMLElement[] = [];
    let intro = reduced ? 1 : 0;
    let mix = 0;
    const start = performance.now();
    let last = start;
    let raf = 0;
    let clip = "";
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      canvas.style.opacity = String(stageHush('[data-particle="none"]'));
      if (ready && (now - start) / 1000 >= introDelay) intro = Math.min(1, intro + dt / 2);
      const H = innerHeight;
      const hero = list.find((el) => el.dataset.particle === "hero");
      const about = list.find((el) => el.dataset.particle === "close");
      let fly = 0;
      let target = 0;
      let lift = 0;
      let rest = H;
      if (hero) {
        const r = hero.getBoundingClientRect();
        fly = THREE.MathUtils.clamp(-r.top / Math.max(r.height, 1), 0, 1);
        rest = THREE.MathUtils.clamp(r.bottom + scrollY, 1, H);
      }
      if (about) {
        const r = about.getBoundingClientRect();
        target = THREE.MathUtils.smoothstep((rest - r.top) / (rest * 0.85), 0, 1);
        const mid = r.top + r.height / 2;
        if (!reduced) lift = THREE.MathUtils.clamp((H / 2 - mid) / (H / 2 + r.height / 2), 0, 1);
      }
      mix += (target - mix) * Math.min(1, dt * (reduced ? 30 : 5));
      pu.uFly.value = reduced ? 0 : fly * (1 - mix);
      pu.uMix.value = mix;
      pu.uIntro.value = intro;
      pu.uTime.value = now / 1000;
      power += ((pointerOn ? 1 : 0) - power) * Math.min(1, dt * 5);
      pu.uPower.value = power;
      gu.uLift.value = lift;
      gu.uAlpha.value = reduced ? 1 : Math.min(1, intro * 3);
      let hot = 0;
      trail.forEach((p, i) => {
        p.z = Math.max(0, 1 - (now - trailTime[i]) / 1000 / TRAIL_LIFE) * 0.45;
        hot = Math.max(hot, p.z);
      });
      gu.uHot.value = hot;

      let path = "";
      for (const el of list) {
        const r = el.getBoundingClientRect();
        const top = Math.max(0, Math.floor(r.top));
        const bottom = Math.min(H, Math.ceil(r.bottom));
        if (bottom > top) path += `M${Math.floor(r.left)} ${top}H${Math.ceil(r.right)}V${bottom}H${Math.floor(r.left)}Z`;
      }
      const nextClip = path && lift < 1 ? `path("${path}")` : "inset(100%)";
      if (nextClip !== clip) {
        clip = nextClip;
        wrap.style.clipPath = clip;
      }
      if (nextClip !== "inset(100%)") {
        renderer.setRenderTarget(field);
        renderer.setClearColor(0, 1);
        renderer.clear();
        renderer.render(pointScene, camera);
        renderer.setRenderTarget(null);
        renderer.setClearColor(0, 0);
        renderer.clear();
        renderer.render(glyphScene, camera);
        firstFrame();
      }
      raf = requestAnimationFrame(frame);
    };

    let active = false;
    const run = (on: boolean) => {
      cancelAnimationFrame(raf);
      if (on && !document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    const onVisibility = () => run(active);
    document.addEventListener("visibilitychange", onVisibility);

    const onScreen = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) onScreen.add(e.target);
        else onScreen.delete(e.target);
      }
      const on = onScreen.size > 0;
      if (on === active) return;
      active = on;
      run(on);
      if (!on) {
        clip = "inset(100%)";
        wrap.style.clipPath = clip;
      }
    });
    const sizes = new ResizeObserver(() => fit());
    const watch = () => {
      io.disconnect();
      sizes.disconnect();
      onScreen.clear();
      list = Array.from(document.querySelectorAll<HTMLElement>('[data-particle="hero"], [data-particle="close"]'));
      list.forEach((el) => io.observe(el));
      document.querySelectorAll('[data-particle="hero"] [data-particle-anchor]').forEach((el) => sizes.observe(el));
      fit();
    };
    watch();
    const tree = new MutationObserver(watch);
    tree.observe(host, { childList: true });

    return () => {
      disposed = true;
      io.disconnect();
      sizes.disconnect();
      tree.disconnect();
      colorWatch.disconnect();
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      removeEventListener("resize", resize);
      geo.dispose();
      pointMat.dispose();
      glyphMat.dispose();
      quad.geometry.dispose();
      atlas.dispose();
      field.dispose();
      renderer.dispose();
    };
  }, [introDelay, variant, custom, firstFrame]);

  return (
    <>
      <GlyphDust />
      <div ref={wrapRef} aria-hidden="true" className={`pointer-events-none fixed inset-0 -z-10 [clip-path:inset(100%)] ${className ?? ""}`}>
        <canvas ref={canvasRef} className="absolute inset-0 block size-full" />
      </div>
    </>
  );
}
