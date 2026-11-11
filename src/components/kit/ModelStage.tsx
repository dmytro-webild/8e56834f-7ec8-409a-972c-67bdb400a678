"use client";
/* eslint-disable react-hooks/immutability */

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, createPortal, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useEnvironment, useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { setModelParts, type ModelPose, type ModelPoseFields } from "./modelPose";
import ModelErrorBoundary from "./ModelErrorBoundary";
import { localModelSrc } from "./localModelSrc";
import { SHAPES, paintShape, readShapeTone, type ShapeTone } from "./velornShapes";
import { useWebildHold } from "./webildReady";

type Pose = Required<ModelPoseFields>;
type Key = { s: number; pose: Pose; ax: number; ay: number; fit: number; chapter: HTMLElement; free: number };
type PartEl = { el: HTMLElement; name: string; base: number };
type Store = {
  keys: Key[];
  parts: PartEl[];
  smooth: number;
  focus: number;
  introStart: number | null;
  px: number;
  py: number;
  tx: number;
  ty: number;
  vx: number;
  vy: number;
  spin: number;
  size: number;
  wide: number;
  tall: number;
  max: number;
  found: boolean | null;
  stage: HTMLElement | null;
  view: string;
  ready: () => void;
};
type Finish = { color?: string; metalness?: number; roughness?: number };
type Finishes = Record<string, Finish>;
type Spot = { x: number; y: number; scale: number };
export type ModelScroll = { rotate?: number; tilt?: number; scale?: number; x?: number };
export type ModelFixed = Partial<Spot> & { sm?: Partial<Spot>; scroll?: ModelScroll };
type Motion = { lg: Spot; sm: Spot; spin: number; float: number; pointer: number; scroll?: ModelScroll };
type ModelStageProps = {
  node?: string;
  size?: number;
  finishes?: Finishes;
  hide?: string[];
  shape?: string;
  fixed?: ModelFixed;
  autoRotate?: number;
  float?: number;
  pointer?: number;
  dpr?: { lg: number; sm: number };
  scale?: number;
} & ({ src?: string; model?: never } | { model: ReactNode; src?: never });
type RigProps = { store: Store; node?: string; size: number; finishes: Finishes; hide: string[]; motion?: Motion; idle: Motion; zoom?: number };

const DEFAULTS: Pose = {
  x: 0,
  y: 0,
  z: 0,
  rx: 0,
  ry: 0,
  rz: 0,
  radius: 10,
  scale: 1,
  opacity: 1,
  dial: 1,
  explode: 0,
  spread: 0.66,
  tone: 1,
  free: 0,
};
const KEYS = Object.keys(DEFAULTS) as (keyof Pose)[];
const DEG = Math.PI / 180;
const ENV = 1;
const CALM = typeof window === "undefined" ? null : window.matchMedia("(prefers-reduced-motion: reduce)");
const METAL =/metal|steel|chrome|silver|gold|alumin|brass|copper|titan/i;
const FIXED_LG: Spot = { x: 0.72, y: 0.5, scale: 0.62 };
const FIXED_SM: Spot = { x: 0.5, y: 0.6, scale: 0.74 };

const WATCH_DIR = "https://storage.googleapis.com/webild/default/models/watch/";
export const MODEL_URL = `${WATCH_DIR}model.83f47b74d9ca.glb`;
const DEFAULT_SRC = "https://storage.googleapis.com/webild/default/models/bust-marble/model.f0fc871204b2.glb";
const WATCH_HIDE = ["glowdial"];
const WATCH_ENV = localModelSrc(`${WATCH_DIR}envmap.b70a253b421b.exr`);
const WATCH_NOISE = localModelSrc(`${WATCH_DIR}noise.f89691c0682f.png`);
type Look = { env: THREE.Texture; noise: THREE.Texture };
type WatchFinish = Finish & { env?: number; normal?: number };
const WATCH_LOOK: Record<string, WatchFinish> = {
  "metal-glossy": { color: "#d5d5d5", roughness: 0.1, metalness: 1 },
  "metal-glossy-no-bake": { color: "#d5d5d5", roughness: 0.26, metalness: 1 },
  "metal-glossy-ext": { color: "#dfdfdf", roughness: 0, metalness: 1 },
  "metal-brushed": { color: "#ededed", roughness: 0.32, metalness: 1, normal: 1 },
  "metal-brushed-ext": { color: "#ffffff", roughness: 0.3, metalness: 1, normal: 0.4 },
  "metal-geneva": { roughness: 0.1541, metalness: 1, normal: 0.25 },
  "single-metal-glossy": { color: "#fbfbfb", roughness: 0.1, metalness: 1 },
  "single-metal-brushed": { color: "#cccccc", roughness: 0.39, metalness: 1 },
  dial: { color: "#8c8c8c", roughness: 0, metalness: 1 },
  white: { color: "#ffffff", roughness: 0.2565, metalness: 0.3, env: 3 },
  "white.001": { color: "#ffffff", roughness: 1, metalness: 0.52, env: 2 },
  "-numbers-nekst": { roughness: 1, metalness: 0, env: 1.5 },
  "-ruby": { color: "#713e72", roughness: 0, metalness: 1, env: 5 },
  "-glass": { color: "#ffffff", roughness: 0, metalness: 1 },
  "shadow-planes": { color: "#000000", roughness: 1, metalness: 0, env: 0 },
};
const WATCH_GRADE = "gl_FragColor.rgb = pow(clamp((gl_FragColor.rgb - 0.5) * 1.15 + 0.5, 0.0, 1.0), vec3(1.0 / 1.6));";
const WATCH_GOLD = new THREE.Color("#fde9be");
const WATCH_BLUE = new THREE.Color("#7aa0cc");

const ease = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const partName = (id: string) => {
  const words = id.replace(/[-_.]+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

const tuneWatch = (material: THREE.MeshPhysicalMaterial, look: Look) => {
  const name = material.name;
  const set = WATCH_LOOK[name];
  if (set?.color) material.color.set(set.color);
  if (set?.metalness !== undefined) material.metalness = set.metalness;
  if (set?.roughness !== undefined) material.roughness = set.roughness;
  if (set?.normal !== undefined) material.normalScale.set(Math.sign(material.normalScale.x || 1) * set.normal, Math.sign(material.normalScale.y || 1) * set.normal);
  material.envMap = look.env;
  material.userData.env = (set?.env ?? 1) * 1.3;
  material.envMapIntensity = material.userData.env as number;
  if (material.transmission > 0) material.transmission = 0;
  if (name === "glow") material.visible = false;
  if (name === "-glass") {
    material.opacity = 1;
    material.alphaTest = 0;
  }
  if (name === "automaticChronograph" || name === "-numbers-nekst") {
    material.alphaTest = name === "automaticChronograph" ? 0.4 : 0.5;
    material.transparent = false;
    material.depthWrite = true;
  }
  if (name === "shadow-planes") material.opacity = 0.4;
  if (name === "-glass" || name === "shadow-planes") {
    material.transparent = true;
    material.depthWrite = false;
  }
  const gears = name === "metal-glossy" || name === "metal-glossy-no-bake";
  const kind = name === "dial" ? "dial" : name === "-glass" ? "glass" : gears ? "gears" : name === "metal-brushed-ext" ? "brushedExt" : name === "metal-glossy-ext" ? "glossyExt" : "plain";
  material.customProgramCacheKey = () => `watch-${kind}`;
  material.onBeforeCompile = (shader) => {
    let end = WATCH_GRADE;
    if (kind === "glass") end = `gl_FragColor.a = opacity * (0.02 + 0.2 * smoothstep(0.0, 1.0, dot(gl_FragColor.rgb, vec3(1.0 / 3.0))));\n${end}`;
    if (kind === "gears") {
      shader.uniforms.watchGold = { value: WATCH_GOLD };
      shader.uniforms.watchBlue = { value: WATCH_BLUE };
      shader.vertexShader = `varying float vWatchPart;\n#ifndef USE_UV1\nattribute vec2 uv1;\n#endif\n${shader.vertexShader}`.replace("#include <uv_vertex>", "#include <uv_vertex>\nvWatchPart = uv1.x;");
      shader.fragmentShader = `uniform vec3 watchGold;\nuniform vec3 watchBlue;\nvarying float vWatchPart;\n${shader.fragmentShader}`.replace(
        "#include <color_fragment>",
        "#include <color_fragment>\ndiffuseColor.rgb = mix(mix(diffuseColor.rgb, watchGold, step(1.0, vWatchPart)), watchBlue, step(2.0, vWatchPart));",
      );
    }
    if (kind === "brushedExt" || kind === "glossyExt") {
      shader.vertexShader = `varying vec2 vWatchUv1;\nvarying vec3 vWatchPos;\nvarying vec3 vWatchObjNormal;\nvarying mat3 vWatchNormalMatrix;\n#ifndef USE_UV1\nattribute vec2 uv1;\n#endif\n${shader.vertexShader}`.replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvWatchUv1 = uv1;\nvWatchPos = position;\nvWatchObjNormal = objectNormal;\nvWatchNormalMatrix = normalMatrix;",
      );
      shader.fragmentShader = `varying vec2 vWatchUv1;\nvarying vec3 vWatchPos;\nvarying vec3 vWatchObjNormal;\nvarying mat3 vWatchNormalMatrix;\nuniform sampler2D watchNoise;\n${shader.fragmentShader}`;
    }
    if (kind === "brushedExt") {
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.2, step(vWatchUv1.x, -3.0));")
        .replace(
          "#include <normal_fragment_maps>",
          "#include <normal_fragment_maps>\nfloat linkMask = step(1.0, vWatchUv1.x);\nfloat linkTilt = (smoothstep(1.0, 2.0, vWatchUv1.x - step(2.0, vWatchUv1.x)) - 0.5) * linkMask * mix(-1.0, 1.0, step(2.0, vWatchUv1.x));\nvec3 linkNormal = vWatchObjNormal;\nlinkNormal.x += linkTilt;\nvec3 linkC0 = normalize(vWatchNormalMatrix[0]);\nvec3 linkC1 = normalize(vWatchNormalMatrix[1] - dot(vWatchNormalMatrix[1], linkC0) * linkC0);\nnormal = normalize(mat3(linkC0, linkC1, cross(linkC0, linkC1)) * linkNormal);\n#ifdef DOUBLE_SIDED\nnormal *= faceDirection;\n#endif",
        );
      end = `gl_FragColor.rgb *= mix(1.0, 1.0 - smoothstep(0.002, 0.007, vWatchPos.z) * 0.7, step(vWatchUv1.x, -3.0) * step(vWatchPos.z, 0.0061));\n${end}`;
    }
    if (kind === "glossyExt") {
      shader.uniforms.watchNoise = { value: look.noise };
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <normal_fragment_maps>",
        "#include <normal_fragment_maps>\nfloat caseMask = step(1.0, vWatchUv1.x);\nnormal.y += sin(length(vWatchPos.xy) * 1000.0) * 0.01 * caseMask;\nnormal += (texture2D(watchNoise, vWatchUv1 * vec2(1.0, 0.01)).rgb + vWatchPos.y * 200.0) * caseMask * 0.03;\nnormal = normalize(normal);",
      );
    }
    if (kind === "dial") {
      shader.uniforms.watchNoise = { value: look.noise };
      shader.vertexShader = `varying vec3 vWatchDial;\n${shader.vertexShader}`.replace("#include <begin_vertex>", "#include <begin_vertex>\nvWatchDial = position;");
      shader.fragmentShader = `uniform sampler2D watchNoise;\nvarying vec3 vWatchDial;\n${shader.fragmentShader}`.replace(
        "#include <normal_fragment_maps>",
        "#include <normal_fragment_maps>\nfloat dialR = length(vWatchDial.xy);\nfloat dialEdge = pow(smoothstep(0.0, 0.08, dialR), 3.0);\nvec2 dialGrain = texture2D(watchNoise, sin(dialR * 5.0) * 0.05 + length(vWatchDial.xy * 5.0) * 0.1 * vec2(sin(180.0 * atan(vWatchDial.x, vWatchDial.y)))).rg;\nnormal.xy += dialGrain * 0.2;\nnormal.xy += normalize(vWatchDial.xy) * dialEdge * 4.0;\nnormal = normalize(normal);",
      );
      end = `gl_FragColor.rgb = max(gl_FragColor.rgb, vec3(0.3 * smoothstep(0.5, 0.8, length(dialGrain)))) * ambientOcclusion;\n${end}`;
    }
    shader.fragmentShader = shader.fragmentShader.replace("#include <dithering_fragment>", `#include <dithering_fragment>\n${end}`);
  };
  material.needsUpdate = true;
};

const tuneMaterial = (material: THREE.MeshPhysicalMaterial, finish: Finish | undefined, look?: Look) => {
  const hint = `${material.name} ${String(material.userData.material ?? "")}`;
  if (look) tuneWatch(material, look);
  else if (METAL.test(hint) && material.metalness < 0.5) material.metalness = 1;
  if (finish?.color) material.color.set(finish.color);
  if (finish?.metalness !== undefined) material.metalness = finish.metalness;
  if (finish?.roughness !== undefined) material.roughness = finish.roughness;
  material.aoMapIntensity = 0;
  if (!look && material.transmission > 0) {
    material.transmission = 0;
    material.transparent = true;
    material.opacity = Math.min(material.opacity, 0.12);
    material.depthWrite = false;
    material.userData.glass = true;
  }
  material.userData.baseOpacity = material.opacity;
  material.userData.baseTransparent = material.transparent;
};

const buildRig = (source: THREE.Object3D, node: string | undefined, size: number, finishes: Finishes, hide: string[], own = false, look?: Look) => {
  if (own) {
    source.removeFromParent();
    source.position.set(0, 0, 0);
    source.rotation.set(0, 0, 0);
    source.scale.set(1, 1, 1);
  }
  const scene = own ? source : source.clone(true);
  const object = (!own && node && scene.getObjectByName(node)) || scene;
  scene.updateMatrixWorld(true);
  const root = new THREE.Group();
  const fit = new THREE.Group();
  root.add(fit);
  fit.attach(object);

  const dims = new THREE.Box3().setFromObject(object).getSize(new THREE.Vector3());
  const s = (size * (Number(object.userData.fill) || 1)) / Math.max(dims.x, dims.y, dims.z, 1e-6);
  const lying = dims.x >= Math.max(dims.y, dims.z) && dims.x > dims.z * 1.6;
  fit.rotation.y = dims.z > Math.max(dims.x, dims.y) * 1.2 ? Math.PI / 2 : lying ? -32 * DEG : 0;
  fit.scale.setScalar(s);
  root.updateMatrixWorld(true);
  const placed = new THREE.Box3().setFromObject(fit);
  const centre = placed.getCenter(new THREE.Vector3());
  if (object === scene && !own) centre.x = centre.z = 0;
  fit.position.sub(centre);
  const span = placed.getSize(new THREE.Vector3());

  const materials: THREE.MeshPhysicalMaterial[] = [];
  let tris = 0;
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    const geo = mesh.geometry;
    tris += (geo.index ? geo.index.count : geo.attributes.position.count) / 3;
    (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((m) => {
      const material = m as THREE.MeshPhysicalMaterial;
      if (materials.includes(material)) return;
      materials.push(material);
      if (!own) return tuneMaterial(material, finishes[material.name], look);
      if (material.userData.baseOpacity !== undefined) {
        material.opacity = material.userData.baseOpacity as number;
        material.transparent = material.userData.baseTransparent as boolean;
      }
      if ((material as THREE.Material & { isMeshStandardMaterial?: boolean }).isMeshStandardMaterial) return tuneMaterial(material, finishes[material.name]);
      material.userData.baseOpacity = material.opacity;
      material.userData.baseTransparent = material.transparent;
    });
    if ((Array.isArray(mesh.material) ? mesh.material : [mesh.material]).some((m) => m.userData.glass)) mesh.renderOrder = 1;
  });

  const xroot = object.getObjectByName("xploded");
  const named = (xroot?.children ?? [])
    .filter((child) => /^xploded-\d+$/.test(child.name))
    .sort((a, b) => Number(a.name.split("-")[1]) - Number(b.name.split("-")[1]));
  const loose = named.length ? object.children.filter((child) => child !== xroot) : [];
  const groups: THREE.Object3D[] = [];
  object.traverse((child) => {
    if (!/^part-/.test(child.name)) return;
    let up = child.parent;
    while (up && !/^part-/.test(up.name)) up = up.parent;
    if (!up) groups.push(child);
  });
  root.updateMatrixWorld(true);
  const sources: THREE.Object3D[] = named.length ? named : groups.length > 1 ? groups : [];
  const inv = new THREE.Matrix4();
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const parts = sources.map((o, i) => {
    inv.copy(o.parent!.matrixWorld).invert();
    a.set(0, 0, 0).applyMatrix4(inv);
    b.set(0, 0, 1).applyMatrix4(inv);
    const rest = new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3());
    const pivot = named.length ? new THREE.Vector3() : o.worldToLocal(rest.clone());
    const hover = String(o.userData.hover ?? "") || (named.length ? `part-${i + 1}` : o.name.replace(/^part-/, ""));
    return { o, base: o.position.clone(), ry: o.rotation.y, dir: b.clone().sub(a), pivot, rest, hover };
  });

  hide.forEach((name) => {
    const target = object.getObjectByName(name);
    if (target) target.visible = false;
  });

  const pitch = dims.y < Math.min(dims.x, dims.z) ? -1 : 1;
  return { root, materials, xroot, xrootZ: xroot?.position.z ?? 0, parts, named: named.length > 0, loose, wide: span.x / size, tall: span.y / size, pitch, tris };
};

const sample = (store: Store, s: number) => {
  const keys = store.keys;
  if (keys.length === 0) return null;
  let i = 0;
  while (i < keys.length - 1 && keys[i + 1].s <= s) i += 1;
  const k0 = keys[i];
  const k1 = keys[Math.min(i + 1, keys.length - 1)];
  const span = k1.s - k0.s;
  const linear = k0.pose === k1.pose;
  const t = s <= k0.s || span <= 0 ? (s > k0.s ? 1 : 0) : (linear ? clamp01 : (v: number) => ease(clamp01(v)))((s - k0.s) / span);
  const raw = i === 0 && s < k0.s ? 0 : t;
  const pose = {} as Pose;
  KEYS.forEach((key) => {
    pose[key] = lerp(k0.pose[key], k1.pose[key], raw);
  });
  return { pose, ax: lerp(k0.ax, k1.ax, raw), ay: lerp(k0.ay, k1.ay, raw), fit: lerp(k0.fit, k1.fit, raw), chapter: raw < 0.5 ? k0.chapter : k1.chapter };
};

const scan = (store: Store) => {
  const vh = store.stage?.clientHeight || window.innerHeight;
  const vw = window.innerWidth;
  const small = vw < 880;
  const max = Math.max(0, document.documentElement.scrollHeight - vh);
  const keys: Key[] = [];
  const parts: PartEl[] = [];
  const trail = (key: Key, s: number): Key => ({ ...key, s, ay: key.ay - (s - key.s) * (1 - key.free), pose: { ...key.pose, opacity: 0 } });
  const ride = (key: Key, s: number, hide = false): Key => ({ ...key, s, ay: key.ay - (s - key.s), pose: hide ? { ...key.pose, opacity: 0 } : key.pose });
  let end = 0;
  let prev: Key | undefined;
  const chapters = document.querySelectorAll<HTMLElement>("[data-model]");
  store.found = chapters.length > 0;
  chapters.forEach((chapter) => {
    const own = keys.length;
    let poses: ModelPose[] = [];
    try {
      poses = JSON.parse(chapter.dataset.model ?? "[]");
    } catch {
      return;
    }
    const rect = chapter.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const h = rect.height;
    const a = top - vh / 2;
    const b = top + h - vh / 2;
    const before = end;
    end = Math.max(end, top + h);
    const box = chapter.querySelector<HTMLElement>("[data-model-anchor]")?.getBoundingClientRect();
    const clip = box ? new DOMRect(Math.max(0, box.left), box.top, Math.min(vw, box.right) - Math.max(0, box.left), box.height) : undefined;
    const anchor = clip && clip.width > 24 && clip.height > 24 ? clip : undefined;
    const centred = anchor ? anchor.top + window.scrollY + anchor.height / 2 - vh / 2 : 0;
    const fov = 25 / Math.min(1, (vw / vh) * 1.5);
    poses.forEach((p, i) => {
      const at = p.at ?? (poses.length === 1 ? 0.5 : i / (poses.length - 1));
      const s = Math.min(max, Math.max(0, poses.length === 1 && p.at === undefined && anchor && h > vh * 1.2 ? centred : a + (b - a) * at));
      const merged = { ...p, ...(small ? p.sm : undefined) };
      const pose = { ...DEFAULTS };
      KEYS.forEach((key) => {
        const value = merged[key];
        if (typeof value === "number") pose[key] = value;
      });
      const free = clamp01(anchor ? pose.free : 1);
      const ax = anchor ? (anchor.left + anchor.width / 2 - vw / 2) * (1 - free) : 0;
      const upp = (2 * Math.max(0.5, pose.radius - pose.z) * Math.tan((fov * DEG) / 2)) / vh;
      const loose = (pose.scale * store.size) / upp;
      const bound = pose.scale > 1 ? Math.max(store.wide, store.tall) : 0;
      const fit = anchor ? lerp(Math.min(anchor.height / Math.max(store.tall, bound), anchor.width / Math.max(store.wide, bound)) * pose.scale, loose, free) : loose;
      const ay = anchor ? (anchor.top + window.scrollY + anchor.height / 2 - (s + vh / 2)) * (1 - free) : 0;
      keys.push({ s, pose, ax, ay, fit, chapter, free });
    });
    const mine = keys.slice(own).sort((p, q) => p.s - q.s);
    if (prev && mine.length && top - before > vh * 0.25) {
      const exit = prev.s + vh;
      const enter = mine[0].s - vh;
      if (exit + 2 < enter) keys.push(ride(prev, exit), ride(prev, exit + 1, true), ride(mine[0], enter - 1, true), ride(mine[0], enter));
    }
    if (mine.length) prev = mine[mine.length - 1];
    chapter.querySelectorAll<HTMLElement>("[data-model-part]").forEach((el) => {
      el.style.removeProperty("--model-dx");
      const r = el.getBoundingClientRect();
      parts.push({ el, name: el.dataset.modelPart ?? "", base: r.left + r.width / 2 });
    });
  });
  keys.sort((p, q) => p.s - q.s);
  const last = keys[keys.length - 1];
  if (last && end < max && end > last.s) keys.push(trail(last, end));
  else if (last && last.free < 1 && max > last.s) keys.push(ride(last, max));
  store.keys = keys;
  store.parts = parts;
  store.max = max;
};

const v3 = new THREE.Vector3();

function Model({ src, ...rest }: RigProps & { src: string }) {
  const gltf = useGLTF(localModelSrc(src), false);
  return <Rig source={gltf.scene} {...rest} />;
}

function WatchModel({ src, ...rest }: RigProps & { src: string }) {
  const gltf = useGLTF(localModelSrc(src), false);
  const env = useEnvironment({ files: WATCH_ENV });
  const noise = useTexture(WATCH_NOISE);
  const look = useMemo<Look>(() => {
    noise.wrapS = noise.wrapT = THREE.RepeatWrapping;
    noise.needsUpdate = true;
    return { env, noise };
  }, [env, noise]);
  return (
    <>
      <Environment map={env} />
      <ambientLight intensity={1} />
      <Rig source={gltf.scene} look={look} {...rest} />
    </>
  );
}

function ShapeModel({ shape, tone, ...rest }: RigProps & { shape: string; tone: ShapeTone }) {
  const source = useMemo(() => SHAPES[shape]?.build() ?? new THREE.Group(), [shape]);
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    paintShape(source, tone);
    invalidate();
  }, [source, tone, invalidate]);
  return <Rig source={source} {...rest} />;
}

const shapeOf = (root: THREE.Object3D) => {
  let id = "";
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    id += mesh.isMesh ? `${mesh.id}:${mesh.geometry.id},` : `${o.id},`;
  });
  return id;
};

function CodeModel({ model, ...rest }: RigProps & { model: ReactNode }) {
  const holder = useMemo(() => new THREE.Group(), []);
  const [build, setBuild] = useState(0);
  const seen = useRef("");
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    invalidate();
    if (build > 0) return;
    const id = window.setInterval(invalidate, 200);
    return () => window.clearInterval(id);
  }, [build, invalidate]);
  useFrame(() => {
    if (!holder.children.length) return;
    const id = shapeOf(holder);
    if (id === seen.current) return;
    seen.current = id;
    setBuild((n) => n + 1);
  });
  return (
    <>
      {createPortal(model, holder)}
      {build > 0 && <Rig source={holder} build={build} {...rest} />}
    </>
  );
}

function Rig({ store, source, build, look, node, size, finishes, hide, motion: fixedMotion, idle, zoom = 1 }: RigProps & { source: THREE.Object3D; build?: number; look?: Look }) {
  const rig = useMemo(() => buildRig(source, node, size, finishes, hide, build !== undefined, look), [source, build, node, size, finishes, hide, look]);
  const { invalidate, scene, setDpr } = useThree();

  useLayoutEffect(() => {
    if (build === undefined) return;
    const fit = rig.root.children[0];
    if (source.parent !== fit) fit.add(source);
    invalidate();
  }, [rig, source, build, invalidate]);

  useEffect(() => {
    if (rig.tris > 150000 && window.innerWidth < 880) setDpr(1);
  }, [rig, setDpr]);

  useEffect(() => {
    setModelParts(rig.parts.length > 1 ? rig.parts.map((p) => ({ part: p.hover, name: partName(p.hover) })) : []);
    return () => setModelParts(null);
  }, [rig]);

  useEffect(() => {
    let timer = 0;
    store.size = size;
    store.wide = rig.wide;
    store.tall = rig.tall;
    document.documentElement.dataset.modelShape = rig.wide > rig.tall * 1.4 ? "long" : "tall";
    const rescan = () => {
      scan(store);
      const view = `${window.innerWidth}x${store.stage?.clientHeight ?? 0}`;
      if (store.view && store.view !== view) store.smooth = window.scrollY;
      store.view = view;
      invalidate();
    };
    const later = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(rescan, 150);
    };
    const frame = requestAnimationFrame(rescan);
    const onScroll = () => invalidate();
    const onIntro = () => {
      if (store.introStart === null) store.introStart = performance.now() / 1000;
      invalidate();
    };
    const fallback = window.setTimeout(onIntro, 3000);
    const resize = new ResizeObserver(later);
    resize.observe(document.body);
    if (store.stage) resize.observe(store.stage);
    const mutation = new MutationObserver(later);
    mutation.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-model"] });
    const fine = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const onPointer = (event: PointerEvent) => {
      if (!fine.matches || event.pointerType !== "mouse") return;
      store.tx = (event.clientX / window.innerWidth) * 2 - 1;
      store.ty = (event.clientY / window.innerHeight) * 2 - 1;
      invalidate();
    };
    const onFine = () => {
      if (fine.matches) return;
      store.tx = 0;
      store.ty = 0;
      invalidate();
    };
    fine.addEventListener("change", onFine);
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("kit:intro", onIntro);
    return () => {
      window.removeEventListener("pointermove", onPointer);
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      window.clearTimeout(fallback);
      resize.disconnect();
      mutation.disconnect();
      fine.removeEventListener("change", onFine);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("kit:intro", onIntro);
      delete document.documentElement.dataset.modelShape;
    };
  }, [store, invalidate, rig, size]);

  const warmed = useRef<typeof rig | null>(null);

  useFrame((state, delta) => {
    if (warmed.current !== rig && state.scene.environment) {
      warmed.current = rig;
      const hidden: THREE.Object3D[] = [];
      rig.root.traverse((o) => {
        if (o.visible) return;
        hidden.push(o);
        o.visible = true;
      });
      state.gl.render(state.scene, state.camera);
      rig.materials.forEach((m) => (m.transparent = true));
      state.gl.render(state.scene, state.camera);
      rig.materials.forEach((m) => (m.transparent = m.userData.baseTransparent as boolean));
      hidden.forEach((o) => (o.visible = false));
    }
    const dt = Math.min(delta, 0.1);
    const motion = fixedMotion ?? (store.found === false ? idle : undefined);
    const camera = state.camera as THREE.PerspectiveCamera;
    const vw = state.size.width;
    const vh = state.size.height;
    const aspect = vw / Math.max(1, vh);
    const target = window.scrollY;
    store.smooth = store.smooth + (target - store.smooth) * (1 - Math.exp(-dt * 4.5));
    let moving = Math.abs(target - store.smooth) > 0.5;

    const sampled = sample(store, store.smooth) ?? (motion ? { pose: DEFAULTS, ax: 0, ay: 0, fit: 0, chapter: document.body } : null);
    if (!sampled) return;
    const { pose, ax, ay, fit, chapter } = sampled;

    const focusName = chapter.dataset.modelFocus ?? "";
    const focusTarget = focusName ? 1 : 0;
    store.focus += (focusTarget - store.focus) * (1 - Math.exp(-dt * 5));
    if (Math.abs(focusTarget - store.focus) > 0.002) moving = true;
    const F = store.focus;

    let introE = 1;
    if (store.introStart === null) introE = 0;
    else {
      const t = clamp01((performance.now() / 1000 - store.introStart) / 2);
      introE = 1 - Math.pow(1 - t, 3);
      if (t < 1) moving = true;
    }
    const fly = 1 - introE;
    if (introE >= 1 && warmed.current === rig) store.ready();

    const fov = 25 / Math.min(1, aspect * 1.5);
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
    const radius = (motion ? DEFAULTS.radius : pose.radius) * (1 - 0.4 * F);
    camera.position.set(0, 0, radius);
    camera.lookAt(0, 0, 0);

    const restZ = motion ? 0 : pose.z;
    const z = restZ + 10 * fly;
    const depth = Math.max(0.5, radius - z);
    const upp = (2 * depth * Math.tan((fov * DEG) / 2)) / vh;

    const E = pose.explode;
    if (motion) {
      store.vx += ((store.tx - store.px) * 40 - store.vx * 9) * dt;
      store.vy += ((store.ty - store.py) * 40 - store.vy * 9) * dt;
      store.px += store.vx * dt;
      store.py += store.vy * dt;
    } else {
      const follow = 1 - Math.exp(-dt * 3);
      store.px += (store.tx - store.px) * follow;
      store.py += (store.ty - store.py) * follow;
    }
    if (Math.abs(store.tx - store.px) + Math.abs(store.ty - store.py) + Math.abs(store.vx) + Math.abs(store.vy) > 0.002) moving = true;
    const tilt = 1 - clamp01(E * 2);

    const root = rig.root;
    const W = pose.opacity * (store.introStart === null ? 0 : 1);
    root.visible = W > 0.01;
    const restUpp = (2 * Math.max(0.5, radius - restZ) * Math.tan((fov * DEG) / 2)) / vh;
    const t = state.clock.getElapsedTime();
    const fl = CALM?.matches ? 0 : tilt * (1 - F) * (root.visible ? 1 : 0);
    let scale: number;
    if (motion) {
      const spot = vw < 880 ? motion.sm : motion.lg;
      const reach = spot.scale * Math.min(vw, vh) * pose.scale * restUpp;
      const drift = fl * motion.float;
      const lean = tilt * motion.pointer;
      if (!CALM?.matches && root.visible) store.spin += dt * motion.spin;
      const sc = motion.scroll;
      const p = sc && !CALM?.matches ? clamp01(store.smooth / Math.max(1, store.max)) : 0;
      const wave = Math.sin(p * Math.PI * 2);
      scale = (reach / size) * (1 + Math.sin(p * Math.PI * 3) * (sc?.scale ?? 0));
      root.position.set(
        (spot.x - 0.5 + wave * (sc?.x ?? 0)) * vw * upp + (Math.sin(t * 0.37) * 0.03 * drift + store.px * 0.04 * lean) * reach,
        (0.5 - spot.y) * vh * upp + (Math.sin(t * 0.8) * 0.04 * drift - store.py * 0.03 * lean) * reach,
        z,
      );
      root.rotation.set(
        (pose.rx - 54 * fly + wave * (sc?.tilt ?? 0) + store.py * 14 * lean + Math.cos(t * 0.5) * 4 * drift) * rig.pitch * DEG,
        (pose.ry + 81 * fly + p * (sc?.rotate ?? 0) + store.spin + store.px * 22 * lean + Math.sin(t * 0.4) * 5 * drift) * DEG,
        (pose.rz + Math.sin(t * 0.3) * 2 * drift) * DEG,
      );
      if (drift > 0.001 || (motion.spin && root.visible && !CALM?.matches)) moving = true;
    } else {
      scale = (fit * restUpp) / size;
      const bob = Math.sin(t * 0.9) * 0.025 * scale * size * fl;
      root.position.set(pose.x + ax * upp + store.px * 0.06 * tilt, pose.y - ay * upp - store.py * 0.04 * tilt + bob, z);
      root.rotation.set(
        (pose.rx - 54 * fly + store.py * 3 * tilt + Math.cos(t * 0.35) * 2.5 * fl) * rig.pitch * DEG,
        (pose.ry + 81 * fly + store.px * 5 * tilt + Math.sin(t * 0.3) * 3.5 * fl) * DEG,
        (pose.rz + Math.sin(t * 0.25) * 1.2 * fl) * DEG,
      );
      if (fl > 0.001) moving = true;
    }
    scale = zoom > 1 ? Math.min(scale * zoom, Math.max(scale, (0.92 * vw * upp) / size)) : scale * zoom;
    root.scale.setScalar(scale);
    rig.materials.forEach((m) => {
      m.opacity = (m.userData.baseOpacity as number) * W;
      if (m.userData.env !== undefined) m.envMapIntensity = (m.userData.env as number) * pose.tone * ENV;
      m.transparent = (m.userData.baseTransparent as boolean) || W < 0.999;
    });

    const n = rig.parts.length;
    const worldWidth = 2 * depth * Math.tan((fov * DEG) / 2) * aspect;
    const sinRy = Math.max(0.2, Math.abs(Math.sin(pose.ry * DEG)));
    const spacing = n > 1 ? (pose.spread * worldWidth) / (n - 1) / (scale * sinRy) : 0;
    const worldSpacing = n > 1 ? (pose.spread * worldWidth) / (n - 1) : 0;
    if (!rig.named && n) root.updateMatrixWorld(true);
    const dialOff = 1 - pose.dial;
    rig.parts.forEach((p, rank) => {
      let offset = (rank - (n - 1) / 2) * spacing * E;
      let rot = p.ry + (rig.named ? 0.1 * Math.PI * E : 0);
      const focused = p.hover === focusName;
      if (focusName) {
        if (focused) {
          offset *= 1 - F;
          rot = lerp(rot, p.ry - pose.ry * DEG, F);
        } else offset *= 1 + 3 * F;
      }
      if (rig.named) p.o.position.copy(p.base).addScaledVector(p.dir, offset);
      else {
        const k = E * (focusName ? (focused ? 1 - F : 1 + 3 * F) : 1);
        const at = v3.copy(p.rest).applyMatrix4(root.matrixWorld);
        const from = p.o.parent!.worldToLocal(at.clone());
        at.x += k * ((rank - (n - 1) / 2) * worldSpacing + root.position.x - at.x);
        at.y += k * (root.position.y - at.y);
        p.o.position.copy(p.base).add(p.o.parent!.worldToLocal(at).sub(from));
      }
      if (p.hover === "dial") {
        p.o.position.addScaledVector(p.dir, 2.6 * size * dialOff);
        p.o.visible = pose.dial > 0.02;
      }
      p.o.rotation.y = rot;
    });
    const peel = Math.max(E, dialOff);
    if (rig.xroot) rig.xroot.position.z = rig.xrootZ * (1 - peel);
    rig.loose.forEach((o) => {
      o.visible = peel < 0.5;
    });

    scene.environmentIntensity = pose.tone * ENV;
    if (store.parts.length && E > 0.01) {
      root.updateMatrixWorld(true);
      camera.updateMatrixWorld();
      store.parts.forEach((part) => {
        const group = rig.parts.find((g) => g.hover === part.name);
        if (!group) return;
        group.o.localToWorld(v3.copy(group.pivot)).project(camera);
        const px = ((v3.x + 1) / 2) * vw;
        part.el.style.setProperty("--model-dx", `${(px - part.base).toFixed(1)}px`);
      });
    }

    if (moving) invalidate();
  });

  return <primitive object={rig.root} />;
}

function Studio({ rim, light }: { rim?: string; light?: boolean }) {
  return (
    <Environment key={`${rim}${light ? "-light" : ""}`} resolution={512} frames={1}>
      <color attach="background" args={light ? [0.4, 0.4, 0.42] : rim ? [0.05, 0.05, 0.055] : [0.16, 0.16, 0.17]} />
      <Lightformer form="rect" intensity={2.4} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[8, 3, 1]} />
      <Lightformer form="rect" intensity={2.6} position={[-6, 0.5, 1]} rotation-y={Math.PI / 2} scale={[1.5, 9, 1]} />
      <Lightformer form="rect" intensity={2.6} position={[6, 0.5, 1]} rotation-y={-Math.PI / 2} scale={[1.5, 9, 1]} />
      <Lightformer form="rect" intensity={1.2} position={[0, 2.5, 8]} scale={[9, 1.2, 1]} />
      <Lightformer form="rect" intensity={0.8} position={[0, -2.5, 8]} scale={[9, 0.6, 1]} />
      <Lightformer form="rect" intensity={2.4} position={[-3, 2, -6]} scale={[2, 7, 1]} />
      <Lightformer form="rect" intensity={1.8} position={[4, -1, -6]} scale={[2, 5, 1]} />
      <Lightformer form="rect" color="rgb(26, 26, 26)" intensity={1} position={[0, -6, 0]} rotation-x={-Math.PI / 2} scale={[12, 6, 1]} />
    </Environment>
  );
}

const NO_FINISHES: Finishes = {};
const NO_HIDE: string[] = [];

export default function ModelStage({ src = DEFAULT_SRC, model, node, size = 2.26, finishes, hide, shape, fixed, autoRotate = 9, float = 1, pointer = 1, dpr, scale = 1 }: ModelStageProps) {
  const [dprRange] = useState<[number, number]>(() => [1, dpr ? (typeof window !== "undefined" && window.innerWidth < 880 ? dpr.sm : dpr.lg) : 1.5]);
  const watch = src === MODEL_URL;
  node ??= watch ? "theWatch" : undefined;
  finishes ??= NO_FINISHES;
  hide ??= watch ? WATCH_HIDE : NO_HIDE;
  const ready = useWebildHold();
  const store = useMemo<Store>(
    () => ({ keys: [], parts: [], smooth: typeof window === "undefined" ? 0 : window.scrollY, focus: 0, introStart: null, px: 0, py: 0, tx: 0, ty: 0, vx: 0, vy: 0, spin: 0, size: 1, wide: 1, tall: 1, max: 1, found: null, stage: null, view: "", ready }),
    [ready],
  );
  const { sm: fixedSm, scroll, ...fixedLg } = fixed ?? {};
  const motion: Motion | undefined = fixed && {
    lg: { ...FIXED_LG, ...fixedLg },
    sm: { ...FIXED_SM, ...fixedSm },
    spin: autoRotate,
    float,
    pointer,
    scroll,
  };
  const idle: Motion = { lg: FIXED_LG, sm: FIXED_SM, spin: autoRotate, float, pointer };
  const [tone, setTone] = useState<ShapeTone | null>(null);

  useEffect(() => {
    if (!shape) return;
    const read = () => {
      const next = readShapeTone();
      setTone((prev) => (prev && prev.accent === next.accent && prev.face === next.face && prev.light === next.light ? prev : next));
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["style", "class", "data-theme"] });
    const host = document.querySelector("main");
    if (host) observer.observe(host, { attributes: true, attributeFilter: ["style", "class", "data-theme", "data-palette"] });
    return () => observer.disconnect();
  }, [shape]);

  return (
    <div
      ref={(el) => {
        store.stage = el;
      }}
      data-model-stage
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-40 h-lvh"
    >
      <Canvas
        frameloop="demand"
        flat={watch}
        linear={watch}
        dpr={dprRange}
        camera={{ position: [0, 0, 10], fov: 25, near: 0.1, far: 60 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl, setDpr }) => {
          if (!dpr) return;
          const ctx = gl.getContext();
          const info = ctx.getExtension("WEBGL_debug_renderer_info");
          const renderer = String(info ? ctx.getParameter(info.UNMASKED_RENDERER_WEBGL) : ctx.getParameter(ctx.RENDERER));
          if (/swiftshader|llvmpipe|software|basic render/i.test(renderer)) setDpr(0.5);
        }}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <ModelErrorBoundary key={shape ?? src} onError={(error) => {
          ready();
          console.warn(`ModelStage: could not load ${shape ?? (model ? "code model" : src)}`, error);
        }}>
          {shape ? (
            tone && (
              <Suspense fallback={null}>
                <Studio rim={tone.accent} light={tone.light} />
                <ShapeModel store={store} shape={shape} tone={tone} node={node} size={size} finishes={finishes} hide={hide} motion={motion} idle={idle} />
              </Suspense>
            )
          ) : model ? (
            <Suspense fallback={null}>
              <Studio />
              <CodeModel store={store} model={model} node={node} size={size} finishes={finishes} hide={hide} motion={motion} idle={idle} zoom={scale} />
            </Suspense>
          ) : watch ? (
            <Suspense fallback={null}>
              <WatchModel store={store} src={src} node={node} size={size} finishes={finishes} hide={hide} motion={motion} idle={idle} zoom={scale} />
            </Suspense>
          ) : (
            <Suspense fallback={null}>
              <Studio />
              <Model store={store} src={src} node={node} size={size} finishes={finishes} hide={hide} motion={motion} idle={idle} zoom={scale} />
            </Suspense>
          )}
        </ModelErrorBoundary>
      </Canvas>
    </div>
  );
}
