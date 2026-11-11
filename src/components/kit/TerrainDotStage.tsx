"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useWebildHold } from "@/components/kit/webildReady";

type Mood = "rise" | "valley" | "pulse" | "calm";

const MOODS: Mood[] = ["rise", "valley", "pulse", "calm"];

const PARAMS: number[][] = [
  [1, 1, 1.2, 0.1, 5.5, 0.45, 0.7, 24, 1, 1, 2.85, 1],
  [1.15, 1.7, 0.95, 0.25, 5.5, 1, 0.5, 26, 1, 1, 2.85, 0],
  [0.85, 1, 1.9, -0.25, 5.2, 0.3, 1.8, 21, 0.9, 0.7, 1.6, 0],
  [0.12, 0.15, 2.8, -0.6, 5, 0.15, 0, 11, 0.5, 0.4, 4, 0],
];

const BEACON = { x: 0, y: 0.1, z: -2.5 };

const GROUND = `
uniform float uTime, uTravel, uAmp, uWall, uBump, uPulse, uPulseR, uPulseFade, uBeacon;
uniform vec2 uBumpAt;
vec3 perm3(vec3 x){ return mod(((x * 34.) + 1.) * x, 289.); }
float sn(vec2 v){
  const vec4 C = vec4(.211324865405187, .366025403784439, -.577350269189626, .024390243902439);
  vec2 i = floor(v + dot(v, C.yy)); vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = x0.x > x0.y ? vec2(1., 0.) : vec2(0., 1.);
  vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
  i = mod(i, 289.);
  vec3 p = perm3(perm3(i.y + vec3(0., i1.y, 1.)) + i.x + vec3(0., i1.x, 1.));
  vec3 m = max(.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.); m = m * m; m = m * m;
  vec3 x = 2. * fract(p * C.www) - 1.; vec3 h = abs(x) - .5; vec3 a0 = x - floor(x + .5);
  m *= 1.79284291400159 - .85373472095314 * (a0 * a0 + h * h);
  vec3 g; g.x = a0.x * x0.x + h.x * x0.y; g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130. * dot(m, g);
}
const vec2 FOCUS = vec2(0., -2.5);
float ground(vec2 rel, out float ring){
  vec2 w = vec2(rel.x, rel.y - uTravel);
  float r = distance(rel, FOCUS);
  float h = (sn(w * .365) + sn(w * .91 + 7.3) * .45) * .2 * uAmp * mix(1., smoothstep(.25, 1.8, r), uBeacon);
  h += sin(r * .785 - uTime * 2.2) * .02 * exp(-r * .07) * uAmp;
  h += min(pow(max(abs(rel.x) - 1.8, 0.), 1.85) * .425, 7.) * uWall;
  vec2 b = rel - uBumpAt;
  h += exp(-dot(b, b) / .42) * .14 * uBump;
  ring = exp(-pow((r - uPulseR) / .55, 2.)) * uPulseFade * uPulse + exp(-r * r / .05) * uBeacon * .9;
  return h + ring * .06;
}`;

const DOT_VERTEX = `
attribute float aSeed;
uniform float uDepth, uNear, uSize, uPR, uReveal, uFogNear, uFogFar;
uniform vec2 uEye;
varying float vFog, vRing, vPx;
${GROUND}
void main(){
  vec2 rel = vec2(position.x, mod(position.z + uTravel, uDepth) - uDepth + uNear);
  float ring;
  float h = ground(rel, ring);
  vec4 mv = viewMatrix * vec4(rel.x, h + .045, rel.y, 1.);
  gl_Position = projectionMatrix * mv;
  float depth = -mv.z;
  float reveal = 1. - smoothstep(uReveal - 2.5, uReveal, distance(rel, uEye));
  gl_PointSize = uSize * uPR * (.45 + aSeed * 1.1) * clamp(8. / depth, .4, 1.6) * (1. + ring * .85) * reveal * smoothstep(.3, 1.2, depth);
  vFog = smoothstep(uFogNear, uFogFar, depth);
  vRing = ring;
  vPx = gl_PointSize;
}`;

const DOT_FRAGMENT = `
uniform vec3 uDot, uBg; uniform vec2 uRes; uniform float uFringe, uLight;
varying float vFog, vRing, vPx;
void main(){
  vec2 pc = gl_PointCoord - .5;
  vec2 off = (gl_FragCoord.xy / uRes - .5) * uFringe * smoothstep(3., 6., vPx);
  vec3 disc = 1. - smoothstep(.36, .5, vec3(length(pc - off), length(pc), length(pc + off)));
  if (max(disc.r, max(disc.g, disc.b)) < .5) discard;
  vec3 n = vec3(pc.x * 2., -pc.y * 2., 0.); n.z = sqrt(max(1. - dot(n.xy, n.xy), 0.));
  vec3 L = normalize(vec3(.4, .8, .6));
  float diff = max(dot(n, L), 0.);
  float spec = pow(max(reflect(-L, n).z, 0.), 11.);
  vec3 c = uDot * (.48 + .44 * diff + vRing * .5) + spec * .34;
  c = mix(c * step(.5, disc), mix(uBg, c, step(.5, disc)), uLight);
  gl_FragColor = vec4(mix(c, uBg, vFog), 1.);
}`;

const MESH_VERTEX = `
uniform float uFogNear, uFogFar;
varying vec3 vN; varying float vFog, vH;
${GROUND}
void main(){
  float ring;
  float h = ground(position.xz, ring);
  vN = normalize(vec3(h - ground(position.xz + vec2(.15, 0.), ring), .15, h - ground(position.xz + vec2(0., .15), ring)));
  vH = h;
  vec4 mv = viewMatrix * vec4(position.x, h, position.z, 1.);
  gl_Position = projectionMatrix * mv;
  vFog = smoothstep(uFogNear * .6, uFogFar * .8, -mv.z);
}`;

const MESH_FRAGMENT = `
uniform vec3 uDot, uBg, uInk; uniform float uMesh;
varying vec3 vN; varying float vFog, vH;
void main(){
  float lam = max(dot(normalize(vN), normalize(vec3(-.3, .35, .9))), 0.);
  vec3 base = mix(mix(uBg, uDot, .07), uBg, smoothstep(-.15, .35, vH));
  vec3 c = base + uDot * lam * .05 + uInk * .012;
  gl_FragColor = vec4(mix(uBg, c, uMesh * (1. - vFog)), 1.);
}`;

const DUST_VERTEX = `
attribute vec3 aSeed;
uniform float uPR, uReveal, uFogNear, uFogFar, uLift;
uniform vec2 uEye;
varying float vA;
${GROUND}
void main(){
  float life = fract(uTime * .05 * (.6 + aSeed.y) + aSeed.x);
  vec2 rel = vec2(position.x + sin(uTime * .2 + aSeed.x * 6.28) * .4 + life * .6, mod(position.z + uTravel, 24.) - 21.);
  float ring;
  float h = ground(rel, ring) + .05 + life * 2.2 * uLift;
  vec4 mv = viewMatrix * vec4(rel.x, h, rel.y, 1.);
  gl_Position = projectionMatrix * mv;
  float depth = -mv.z;
  gl_PointSize = uPR * (1. + aSeed.z * 1.6) * clamp(8. / depth, .4, 1.6);
  float reveal = 1. - smoothstep(uReveal - 2.5, uReveal, distance(rel, uEye));
  vA = sin(life * 3.14159) * .55 * (1. - smoothstep(uFogNear, uFogFar, depth)) * reveal * smoothstep(.3, 1.2, depth);
}`;

const DUST_FRAGMENT = `
uniform vec3 uDot, uInk;
varying float vA;
void main(){ float d = length(gl_PointCoord - .5); float a = smoothstep(.5, .1, d) * vA; if (a < .01) discard; gl_FragColor = vec4(mix(uInk, uDot, .5), a); }`;

type TerrainDotStageProps = { className?: string };

export default function TerrainDotStage({ className }: TerrainDotStageProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ready = useWebildHold(wrapRef);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = !matchMedia("(min-width: 880px)").matches;
    const fine = matchMedia("(pointer: fine)").matches;
    const GRID = small ? 160 : 260;
    const W = small ? 28 : 40;
    const D = small ? 34 : 40;
    const NEAR = 6;
    const N = GRID * GRID;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.25 : 1.5));
    renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(small ? 70 : 52, 1, 0.1, 80);

    const shared = {
      uTime: { value: 0 }, uTravel: { value: 0 }, uAmp: { value: 0 }, uWall: { value: 1 }, uBump: { value: 0 },
      uBumpAt: { value: new THREE.Vector2(99, 99) }, uBeacon: { value: 0 }, uPulse: { value: 0 }, uPulseR: { value: 0 }, uPulseFade: { value: 0 },
      uPR: { value: renderer.getPixelRatio() }, uReveal: { value: reduced ? 60 : 2 }, uEye: { value: new THREE.Vector2(0, 5.5) },
      uFogNear: { value: 4 }, uFogFar: { value: 24 }, uDot: { value: new THREE.Color() }, uBg: { value: new THREE.Color() },
      uInk: { value: new THREE.Color() }, uRes: { value: new THREE.Vector2(1, 1) },
    };

    const grid = new Float32Array(N * 3);
    const seed = new Float32Array(N);
    for (let j = 0, k = 0; j < GRID; j++) {
      for (let i = 0; i < GRID; i++, k++) {
        grid[k * 3] = ((i + Math.random() * 0.6) / GRID - 0.5) * W;
        grid[k * 3 + 2] = ((j + Math.random() * 0.6) / GRID) * D;
        seed[k] = Math.random();
      }
    }
    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute("position", new THREE.BufferAttribute(grid, 3));
    dotGeo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    const dotMat = new THREE.ShaderMaterial({
      uniforms: { ...shared, uDepth: { value: D }, uNear: { value: NEAR }, uSize: { value: small ? 2 : 2.2 }, uFringe: { value: small ? 0 : 0.12 }, uLight: { value: 0 } },
      vertexShader: DOT_VERTEX,
      fragmentShader: DOT_FRAGMENT,
    });
    const dots = new THREE.Points(dotGeo, dotMat);
    dots.frustumCulled = false;
    dots.renderOrder = 1;
    scene.add(dots);

    const segs = small ? 80 : 130;
    const meshGeo = new THREE.PlaneGeometry(W, D, segs, segs);
    meshGeo.rotateX(-Math.PI / 2);
    meshGeo.translate(0, 0, NEAR - D / 2);
    const meshMat = new THREE.ShaderMaterial({
      uniforms: { ...shared, uMesh: { value: 1 } },
      vertexShader: MESH_VERTEX,
      fragmentShader: MESH_FRAGMENT,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(meshGeo, meshMat);
    mesh.frustumCulled = false;
    scene.add(mesh);

    const DUST = 2000;
    const dustPos = new Float32Array(DUST * 3);
    const dustSeed = new Float32Array(DUST * 3);
    for (let i = 0; i < DUST; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * 9;
      dustPos[i * 3] = Math.cos(a) * r;
      dustPos[i * 3 + 2] = Math.random() * 24;
      dustSeed.set([Math.random(), Math.random(), Math.random()], i * 3);
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    dustGeo.setAttribute("aSeed", new THREE.BufferAttribute(dustSeed, 3));
    const dustMat = new THREE.ShaderMaterial({
      uniforms: { ...shared, uLift: { value: 1 } },
      vertexShader: DUST_VERTEX,
      fragmentShader: DUST_FRAGMENT,
      transparent: true,
      depthWrite: false,
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    dust.frustumCulled = false;
    dust.renderOrder = 2;
    scene.add(dust);

    const readVar = (cs: CSSStyleDeclaration, name: string, fallback: string, out: THREE.Color) => {
      out.setStyle(cs.getPropertyValue(name).trim() || fallback).convertLinearToSRGB();
    };
    let colorKey = "";
    const readColors = () => {
      const cs = getComputedStyle(wrap);
      const key = ["--background", "--accent", "--foreground"].map((n) => cs.getPropertyValue(n)).join();
      if (key === colorKey) return false;
      colorKey = key;
      readVar(cs, "--background", "rgb(8, 9, 13)", shared.uBg.value);
      readVar(cs, "--accent", "rgb(236, 255, 62)", shared.uDot.value);
      readVar(cs, "--foreground", "rgb(232, 236, 239)", shared.uInk.value);
      const bg = shared.uBg.value;
      dotMat.uniforms.uLight.value = bg.r + bg.g + bg.b > 1.5 ? 1 : 0;
      return true;
    };
    readColors();

    const p = PARAMS[0].slice();
    const target = PARAMS[0].slice();
    const readMood = () => {
      const mid = innerHeight * 0.5;
      const band = innerHeight * 0.6;
      let cur = -1;
      let next = -1;
      let nextTop = 0;
      for (const el of document.querySelectorAll<HTMLElement>("[data-terrain]")) {
        const k = MOODS.indexOf(el.dataset.terrain as Mood);
        if (k < 0) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= mid) cur = k;
        else {
          next = k;
          nextTop = top;
          break;
        }
      }
      if (cur < 0) cur = next < 0 ? 0 : next;
      const t = next < 0 ? 0 : THREE.MathUtils.smoothstep((mid + band / 2 - nextTop) / band, 0, 1);
      const a = PARAMS[cur];
      const b = PARAMS[next < 0 ? cur : next];
      for (let i = 0; i < a.length; i++) target[i] = a[i] + (b[i] - a[i]) * t;
    };

    const ndc = new THREE.Vector2();
    const ray = new THREE.Raycaster();
    const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hit = new THREE.Vector3();
    const hit2 = new THREE.Vector2();
    let pointerOn = false;
    const onPointer = (e: PointerEvent) => {
      ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
      pointerOn = true;
    };
    const onLeave = () => (pointerOn = false);
    if (fine && !reduced) {
      addEventListener("pointermove", onPointer, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }

    const look = new THREE.Vector3();
    const place = (yaw: number, pitch: number, lift: number) => {
      camera.position.set(Math.sin(yaw) * p[4], p[2] + lift + pitch * 3, Math.cos(yaw) * p[4]);
      look.set(0, p[3], 0);
      camera.lookAt(look);
      shared.uEye.value.set(camera.position.x, camera.position.z);
      shared.uAmp.value = p[0];
      shared.uWall.value = p[1];
      shared.uPulse.value = p[6];
      shared.uFogFar.value = p[7];
      meshMat.uniforms.uMesh.value = p[8];
      dustMat.uniforms.uLift.value = p[9];
      shared.uBeacon.value = p[11];
    };

    const marker = new THREE.Vector3();
    let beaconEl: HTMLElement | null = null;
    const placeBeacon = (fade: number) => {
      if (!beaconEl?.isConnected) beaconEl = document.querySelector<HTMLElement>("[data-terrain-beacon]");
      if (!beaconEl) return;
      camera.updateMatrixWorld();
      marker.set(BEACON.x, BEACON.y, BEACON.z).project(camera);
      beaconEl.style.transform = `translate3d(${((marker.x + 1) / 2) * innerWidth}px, ${((1 - marker.y) / 2) * innerHeight}px, 0)`;
      beaconEl.style.opacity = String(Math.max(0, Math.min(1, p[11] * fade)));
    };

    const resize = () => {
      renderer.setSize(innerWidth, innerHeight, false);
      renderer.getDrawingBufferSize(shared.uRes.value);
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
    };

    const renderStill = () => {
      readMood();
      p.splice(0, p.length, ...target);
      place(0, 0, 0);
      placeBeacon(1);
      renderer.render(scene, camera);
      ready();
    };

    let raf = 0;
    const onResize = () => {
      resize();
      if (reduced) renderStill();
    };
    addEventListener("resize", onResize);
    resize();

    const observer = new MutationObserver(() => {
      if (readColors() && reduced) renderStill();
    });
    observer.observe(document.documentElement, { attributes: true });
    const host = wrap.closest("main");
    if (host) observer.observe(host, { attributes: true });

    let scrollQueued = false;
    const onScrollStill = () => {
      if (scrollQueued) return;
      scrollQueued = true;
      requestAnimationFrame(() => {
        scrollQueued = false;
        renderStill();
      });
    };

    if (reduced) {
      addEventListener("scroll", onScrollStill, { passive: true });
      renderStill();
      return () => {
        removeEventListener("scroll", onScrollStill);
        removeEventListener("resize", onResize);
        observer.disconnect();
        dotGeo.dispose();
        dotMat.dispose();
        meshGeo.dispose();
        meshMat.dispose();
        dustGeo.dispose();
        dustMat.dispose();
        renderer.dispose();
      };
    }

    let intro = 0;
    let travel = 0;
    let travelTarget = 0;
    let lastScroll = scrollY;
    let pulseAge = 0;
    let bump = 0;
    let yaw = 0, yawV = 0, pitch = 0, pitchV = 0;
    let last = performance.now();
    const spring = (x: number, v: number, to: number, dt: number) => {
      v += (to - x) * 30 * dt;
      v *= Math.exp(-9 * dt);
      return [x + v * dt, v];
    };
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      readMood();
      const ease = Math.min(1, dt * 2.2);
      for (let i = 0; i < p.length; i++) p[i] += (target[i] - p[i]) * ease;

      intro = Math.min(1, intro + dt / 3.2);
      const e = 1 - Math.pow(1 - intro, 3);
      shared.uReveal.value = 2 + e * 50;

      const y = scrollY;
      travelTarget += Math.abs(y - lastScroll) < innerHeight * 3 ? (y - lastScroll) * 0.0065 * p[5] : 0;
      lastScroll = y;
      travel += (travelTarget - travel) * Math.min(1, dt * 3);
      shared.uTravel.value = travel;

      pulseAge += dt;
      if (pulseAge > p[10]) pulseAge = 0;
      const pa = pulseAge / p[10];
      shared.uPulseR.value = (1 - Math.pow(1 - pa, 3)) * 14;
      shared.uPulseFade.value = Math.sin(Math.min(pa * 6, 1) * Math.PI * 0.5) * (1 - pa);
      shared.uTime.value = now / 1000;

      [yaw, yawV] = spring(yaw, yawV, pointerOn ? ndc.x * 0.18 : 0, dt);
      [pitch, pitchV] = spring(pitch, pitchV, pointerOn ? ndc.y * 0.08 : 0, dt);
      place(yaw, pitch, (1 - e) * 8);
      shared.uAmp.value = p[0] * THREE.MathUtils.smoothstep(intro, 0, 0.55);

      bump += ((pointerOn ? 1 : 0) - bump) * Math.min(1, dt * 4);
      shared.uBump.value = bump;
      if (pointerOn) {
        camera.updateMatrixWorld();
        ray.setFromCamera(ndc, camera);
        if (ray.ray.intersectPlane(ground, hit)) shared.uBumpAt.value.lerp(hit2.set(hit.x, hit.z), Math.min(1, dt * 10));
      }
      placeBeacon(e);

      renderer.render(scene, camera);
      ready();
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
      removeEventListener("resize", onResize);
      observer.disconnect();
      dotGeo.dispose();
      dotMat.dispose();
      meshGeo.dispose();
      meshMat.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      renderer.dispose();
    };
  }, [ready]);

  return (
    <div ref={wrapRef} aria-hidden="true" className={`pointer-events-none fixed inset-0 z-0 overflow-hidden bg-background ${className ?? ""}`}>
      <canvas ref={canvasRef} className="absolute inset-0 block size-full" />
    </div>
  );
}
