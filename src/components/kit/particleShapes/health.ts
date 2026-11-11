import * as THREE from "three";
import { cloud, rnd, spread, type Add } from "./sample";
import { lathe, onSphere, plan, scatter } from "./parts";
import { ribbons } from "./abstract";
import type { ParticleSet, ShapeBuilder } from "./types";

type Atom = { p: THREE.Vector3; r: number };

function buildMolecule() {
  let seed = 34;
  const rand = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const C = 0.3;
  const X = 0.38;
  const H = 0.18;
  const atoms: Atom[] = [];
  const bonds: [number, number, number][] = [];
  const add = (p: THREE.Vector3, r: number) => atoms.push({ p, r }) - 1;
  const free = (p: THREE.Vector3) => atoms.every((a) => a.p.distanceTo(p) > 0.85);
  const perp = (d: THREE.Vector3) => new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).projectOnPlane(d).normalize();
  const sprout = (from: number, dir: THREE.Vector3, depth: number) => {
    const big = depth === 0 && rand() < 0.45;
    const p = atoms[from].p.clone().addScaledVector(dir, 1);
    if (!free(p)) return;
    const k = add(p, big ? X : H);
    bonds.push([from, k, 0]);
    if (big) for (let i = 0; i < 2; i++) {
      const d = dir.clone().applyAxisAngle(perp(dir), (i ? 1 : -1) * 1.1).normalize();
      sprout(k, d, 1);
    }
  };
  let dir = new THREE.Vector3(1, 0.18, 0.25).normalize();
  let start = add(new THREE.Vector3(), C);
  const turns = [-0.6, 0.6, 0.6];
  for (let ring = 0; ring < 3; ring++) {
    const w = perp(dir);
    const v = new THREE.Vector3().crossVectors(dir, w);
    const c = atoms[start].p.clone().add(dir);
    const ids = [start];
    for (let i = 1; i < 6; i++) {
      const a = Math.PI + (i * Math.PI) / 3;
      const hetero = ring === 1 && i === 2;
      ids.push(add(c.clone().addScaledVector(dir, Math.cos(a)).addScaledVector(w, Math.sin(a)), hetero ? X : C));
    }
    for (let i = 0; i < 6; i++) bonds.push([ids[i], ids[(i + 1) % 6], i % 2 ? 0 : 1]);
    for (const i of [1, 2, 4, 5]) {
      const out = atoms[ids[i]].p.clone().sub(c).normalize();
      if (rand() < 0.8) sprout(ids[i], out.addScaledVector(v, (rand() - 0.5) * 0.5).normalize(), 0);
    }
    const tip = ids[3];
    dir = dir.clone().applyAxisAngle(v, turns[ring]).normalize();
    if (ring < 2) {
      const link = add(atoms[tip].p.clone().addScaledVector(dir, 1), C);
      bonds.push([tip, link, 0]);
      dir.applyAxisAngle(w, -turns[ring] * 0.6).normalize();
      start = add(atoms[link].p.clone().addScaledVector(dir, 1), C);
      bonds.push([link, start, 0]);
    } else sprout(tip, dir, 0);
  }
  return { atoms, bonds };
}

const molecule: ShapeBuilder = (count) => {
  const { atoms, bonds } = buildMolecule();
  const B = 0.035;
  type Part = { w: number; at: (v: THREE.Vector3) => void };
  const parts: Part[] = [];
  for (const a of atoms) parts.push({ w: 4 * Math.PI * a.r * a.r, at: (v) => onSphere(v, a.r).add(a.p) });
  for (const [i, j, dbl] of bonds) {
    const p = atoms[i].p;
    const q = atoms[j].p;
    const d = q.clone().sub(p);
    const len = d.length();
    d.normalize();
    const n = new THREE.Vector3(0, 1, 0).projectOnPlane(d).normalize();
    const m = new THREE.Vector3().crossVectors(d, n);
    const t0 = atoms[i].r / len;
    const t1 = 1 - atoms[j].r / len;
    const tube = (off: THREE.Vector3, a: number, b: number) =>
      parts.push({ w: 2 * Math.PI * B * len * (b - a) * 0.45, at: (v) => {
        const k = rnd() * Math.PI * 2;
        v.copy(p).lerp(q, a + rnd() * (b - a)).add(off).addScaledVector(n, Math.cos(k) * B).addScaledVector(m, Math.sin(k) * B);
      } });
    tube(new THREE.Vector3(), t0, t1);
    if (dbl) {
      const inward = atoms.filter((a) => a.p.distanceTo(p) < 1.75 && a.p.distanceTo(q) < 1.75 && a.p !== p && a.p !== q);
      if (inward.length) {
        const ctr = new THREE.Vector3();
        for (const a of inward) ctr.add(a.p);
        ctr.divideScalar(inward.length);
        const off = ctr.sub(p.clone().add(q).multiplyScalar(0.5)).projectOnPlane(d).setLength(0.17);
        tube(off.clone(), t0 + 0.18, t1 - 0.18);
      }
    }
  }
  let total = 0;
  const cum = parts.map((p) => (total += p.w));
  const pose = new THREE.Euler(5.51, 3.44, 5.73, "XYZ");
  const positions = spread(count, (v) => {
    const r = rnd() * total;
    let lo = 0;
    let hi = cum.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cum[mid] < r) lo = mid + 1;
      else hi = mid;
    }
    parts[lo].at(v);
    v.applyEuler(pose);
  }, 1.2);
  return { positions, motion: "static" };
};

function buildCapsule(add: Add) {
  const r = 0.5;
  const half = (len: number, rr: number) =>
    lathe([[rr, 0], ...Array.from({ length: 11 }, (_, i): [number, number] => {
      const a = (i / 10) * (Math.PI / 2);
      return [Math.cos(a) * rr, len + Math.sin(a) * rr];
    })], 48);
  const pose = (g: THREE.BufferGeometry) => g.rotateZ(1.2).rotateY(0.4);
  add(pose(half(0.85, r)), 60);
  add(pose(half(0.75, r * 0.97).scale(1, -1, 1).translate(0, 0.08, 0)), 60);
  add(pose(new THREE.TorusGeometry(r * 1.004, 0.014, 6, 64).rotateX(Math.PI / 2)), 60);
}

const tissue: ShapeBuilder = (N) =>
  plan(N, 16, (p) => {
    const R = 0.66;
    const dx = R * 1.5;
    const dy = R * Math.sqrt(3);
    for (let c = -9; c <= 9; c++)
      for (let r = -4; r <= 4; r++) {
        const x = c * dx;
        const y = r * dy + (c % 2 ? dy / 2 : 0);
        const e = (x / 7.7) ** 2 + (y / 3.7) ** 2;
        if (e > 1) continue;
        const k = 1 - e;
        const hex = Array.from({ length: 6 }, (_, i): [number, number] => [x + Math.cos((i * Math.PI) / 3) * R * 0.9, y + Math.sin((i * Math.PI) / 3) * R * 0.9]);
        const id = (c + 9) * 9 + r + 4;
        p.poly(hex, { z: k * 0.5, w: 0.3 + k * 0.7 });
        p.ring(x + Math.sin(id * 2.1) * 0.08, y + Math.cos(id * 1.7) * 0.08, 0.13 + k * 0.06, { z: k * 0.5 + 0.08, fill: 0.6, g: id % 11 === 5 ? 0.07 + (id % 13) * 0.06 : 0 });
      }
  });
const capsule: ShapeBuilder = (count) => ({ ...cloud(buildCapsule, count, 0.2), motion: "static" });

const heart: ShapeBuilder = (count) => {
  const f = (x: number, y: number, z: number) => (x * x + 2.25 * z * z + y * y - 1) ** 3 - x * x * y ** 3 - 0.1125 * z * z * y ** 3;
  const d = new THREE.Vector3();
  return scatter(count, "drift", (v) => {
    onSphere(d, 1);
    let lo = 0;
    let hi = 1.6;
    for (let i = 0; i < 10; i++) {
      const m = (lo + hi) / 2;
      if (f(d.x * m, d.y * m + 0.1, d.z * m) < 0) lo = m;
      else hi = m;
    }
    const s = lo * (rnd() < 0.85 ? 1 : 0.9 + rnd() * 0.1);
    v.set(d.x * s * 0.6, (d.y * s + 0.1 - 0.15) * 0.6, d.z * s * 0.6);
  });
};

export const health: ParticleSet = {
  id: "health",
  label: "Biotech & Medtech",
  industries: ["biotech", "medtech", "pharma", "life sciences", "lab equipment", "diagnostics", "clinical research", "medical devices", "healthcare it"],
  hero: molecule,
  overview: tissue,
  scan: capsule,
  ambient: ribbons,
  close: heart,
  scanBox: true,
  heroLayout: "split",
  heroFill: 1.1,
  heroDensity: 0.62,
};
