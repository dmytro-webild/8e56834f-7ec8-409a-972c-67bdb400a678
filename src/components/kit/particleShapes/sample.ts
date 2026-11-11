import * as THREE from "three";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import type { ShapeBuilder, ShapeMotion, ShapeResult } from "./types";

export type Add = (geo: THREE.BufferGeometry, thr?: number) => void;

export const rnd = Math.random;

export function spread(count: number, draw: (v: THREE.Vector3, i: number, total: number) => number | void, extra = 0.3, res = 96, tagsOut?: Float32Array): Float32Array {
  const total = Math.ceil(count * (1 + extra));
  const pts = new Float32Array(total * 3);
  const tags = tagsOut ? new Float32Array(total) : null;
  const v = new THREE.Vector3();
  const lo = [Infinity, Infinity, Infinity];
  const hi = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < total; i++) {
    const tag = draw(v, i, total);
    if (tags) tags[i] = tag ?? 0;
    pts[i * 3] = v.x;
    pts[i * 3 + 1] = v.y;
    pts[i * 3 + 2] = v.z;
    for (let a = 0; a < 3; a++) {
      lo[a] = Math.min(lo[a], pts[i * 3 + a]);
      hi[a] = Math.max(hi[a], pts[i * 3 + a]);
    }
  }
  const cell = Math.max(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2], 1e-6) / res;
  const n = res + 1;
  const keys = new Int32Array(total);
  const counts = new Map<number, number>();
  for (let i = 0; i < total; i++) {
    const k = Math.floor((pts[i * 3] - lo[0]) / cell) + n * (Math.floor((pts[i * 3 + 1] - lo[1]) / cell) + n * Math.floor((pts[i * 3 + 2] - lo[2]) / cell));
    keys[i] = k;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const filled = (cap: number) => {
    let s = 0;
    for (const c of counts.values()) s += Math.min(c, cap);
    return s;
  };
  let a = 1;
  let b = Math.max(...counts.values());
  while (a < b) {
    const m = (a + b) >> 1;
    if (filled(m) >= count) b = m;
    else a = m + 1;
  }
  const used = new Map<number, number>();
  const keep: number[] = [];
  for (let i = 0; i < total; i++) {
    const u = used.get(keys[i]) ?? 0;
    if (u < a) {
      used.set(keys[i], u + 1);
      keep.push(i);
    }
  }
  for (let i = keep.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [keep[i], keep[j]] = [keep[j], keep[i]];
  }
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    out.set(pts.subarray(keep[i] * 3, keep[i] * 3 + 3), i * 3);
    if (tags && tagsOut) tagsOut[i] = tags[keep[i]];
  }
  return out;
}

export function sampleSoup(tris: number[], segs: number[], count: number, edgeShare: number): ShapeResult {
  const soup = new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(tris, 3));
  soup.computeBoundingBox();
  const bb = soup.boundingBox!;
  const c = bb.getCenter(new THREE.Vector3());
  const s = bb.getSize(new THREE.Vector3());
  const k = 2 / Math.max(s.x, s.y, s.z);
  const sampler = new MeshSurfaceSampler(new THREE.Mesh(soup)).build();
  const lens: number[] = [];
  let total = 0;
  for (let i = 0; i < segs.length; i += 6) {
    total += Math.hypot(segs[i + 3] - segs[i], segs[i + 4] - segs[i + 1], segs[i + 5] - segs[i + 2]);
    lens.push(total);
  }
  const out = spread(count, (v, i, all) => {
    if (i < all * edgeShare && lens.length) {
      const r = rnd() * total;
      let lo = 0;
      let hi = lens.length - 1;
      while (lo < hi) {
        const m = (lo + hi) >> 1;
        if (lens[m] < r) lo = m + 1;
        else hi = m;
      }
      const o = lo * 6;
      const t = rnd();
      v.set(segs[o] + (segs[o + 3] - segs[o]) * t, segs[o + 1] + (segs[o + 4] - segs[o + 1]) * t, segs[o + 2] + (segs[o + 5] - segs[o + 2]) * t);
    } else sampler.sample(v);
    v.sub(c).multiplyScalar(k);
  });
  soup.dispose();
  return { positions: out, box: [s.x * k, s.y * k, s.z * k] };
}

export function cloud(build: (add: Add) => void, count: number, edgeShare = 0.4): ShapeResult {
  const tris: number[] = [];
  const segs: number[] = [];
  build((geo, thr = 25) => {
    const g = geo.index ? geo.toNonIndexed() : geo;
    for (const v of g.attributes.position.array) tris.push(v);
    for (const v of new THREE.EdgesGeometry(geo, thr).attributes.position.array) segs.push(v);
  });
  return sampleSoup(tris, segs, count, edgeShare);
}

const models = new Map<string, Promise<THREE.Object3D>>();

const loadModel = (url: string) => {
  let p = models.get(url);
  if (!p) {
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    p = loader.loadAsync(url).then((g) => g.scene);
    models.set(url, p);
  }
  return p;
};

export function modelShape(url: string, motion: ShapeMotion = "static", edgeShare = 0.3): ShapeBuilder {
  return async (count) => {
    const scene = await loadModel(url);
    scene.updateMatrixWorld(true);
    const tris: number[] = [];
    const segs: number[] = [];
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh || !mesh.geometry?.attributes.position) return;
      const src = mesh.geometry.attributes.position;
      const pos = new Float32Array(src.count * 3);
      const v = new THREE.Vector3();
      for (let i = 0; i < src.count; i++) {
        v.fromBufferAttribute(src, i).applyMatrix4(mesh.matrixWorld);
        pos.set([v.x, v.y, v.z], i * 3);
      }
      const geo = new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(pos, 3));
      if (mesh.geometry.index) geo.setIndex(Array.from(mesh.geometry.index.array));
      const flat = geo.index ? geo.toNonIndexed() : geo;
      for (const x of flat.attributes.position.array) tris.push(x);
      if (edgeShare > 0) for (const x of new THREE.EdgesGeometry(geo, 30).attributes.position.array) segs.push(x);
      geo.dispose();
    });
    return { ...sampleSoup(tris, segs, count, edgeShare), motion };
  };
}
