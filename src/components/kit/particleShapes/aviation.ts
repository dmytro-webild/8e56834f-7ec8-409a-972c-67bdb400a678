import * as THREE from "three";
import { cloud, rnd, type Add } from "./sample";
import { box, globe, lathe, onSphere, outline, plan, scatter, wrap } from "./parts";
import type { ParticleSet, ShapeBuilder } from "./types";

const surface = (pts: [number, number][], thick: number) => new THREE.ExtrudeGeometry(outline(pts), { depth: thick, bevelEnabled: false }).translate(0, 0, -thick / 2);

const R = 1.98;
const LEN = 37.6;
const NOSE = 6.4;
const TAIL = 26;

const section = (s: number): [number, number] => {
  if (s < NOSE) {
    const t = 1 - s / NOSE;
    return [R * Math.sqrt(Math.max(0, 1 - t * t)), -0.3 * R * t * t];
  }
  if (s < TAIL) return [R, 0];
  const t = (s - TAIL) / (LEN - TAIL);
  return [R * (1 - 0.88 * Math.pow(t, 1.5)), 0.62 * R * Math.pow(t, 1.7)];
};

const onHull = (s: number, a: number, lift = 0) => {
  const [r, yc] = section(s);
  return new THREE.Vector3(LEN / 2 - s, yc + (r + lift) * Math.cos(a), (r + lift) * Math.sin(a));
};

function fuselage(detail: boolean) {
  const seg = detail ? 48 : 16;
  const ss: number[] = [];
  const nose = detail ? 36 : 10;
  for (let i = 1; i <= nose; i++) ss.push(NOSE * (i / nose) ** 2);
  const mid = detail ? 24 : 6;
  for (let i = 1; i <= mid; i++) ss.push(NOSE + ((TAIL - NOSE) * i) / mid);
  const tail = detail ? 24 : 8;
  for (let i = 1; i < tail; i++) ss.push(TAIL + ((LEN - TAIL) * i) / tail);
  const pos: number[] = [];
  const idx: number[] = [];
  const tip = onHull(0, 0);
  pos.push(tip.x, tip.y, tip.z);
  for (const s of ss) for (let j = 0; j < seg; j++) {
    const p = onHull(s, (j / seg) * Math.PI * 2);
    pos.push(p.x, p.y, p.z);
  }
  const end = section(LEN);
  pos.push(-LEN / 2, end[1], 0);
  const ring = (k: number, j: number) => 1 + k * seg + (j % seg);
  for (let j = 0; j < seg; j++) idx.push(0, ring(0, j + 1), ring(0, j));
  for (let k = 0; k < ss.length - 1; k++) for (let j = 0; j < seg; j++) {
    idx.push(ring(k, j), ring(k, j + 1), ring(k + 1, j));
    idx.push(ring(k, j + 1), ring(k + 1, j + 1), ring(k + 1, j));
  }
  const last = pos.length / 3 - 1;
  for (let j = 0; j < seg; j++) idx.push(ring(ss.length - 1, j), ring(ss.length - 1, j + 1), last);
  const g = new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  return g;
}

function windscreen() {
  const line = (pts: [number, number][]) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(([s, a]) => onHull(s, a, 0.02))), 32, 0.045, 4);
  const sill: [number, number][] = [];
  const top: [number, number][] = [];
  for (let i = -6; i <= 6; i++) {
    const a = (i / 6) * 1.05;
    sill.push([2.3 + 0.75 * Math.abs(a), a]);
    top.push([3.3 + 0.6 * Math.abs(a), a * 0.9]);
  }
  const parts = [line(sill), line(top)];
  for (const a of [-1.05, -0.62, -0.2, 0.2, 0.62, 1.05]) parts.push(line([[2.3 + 0.75 * Math.abs(a), a], [3.3 + 0.6 * Math.abs(a), a * 0.9]]));
  return parts;
}

function addPlane(add: Add, at: THREE.Vector3, scale: number, yaw: number, detail: boolean) {
  const place = (g: THREE.BufferGeometry) => g.scale(scale, scale, scale).rotateY(yaw).translate(at.x, at.y, at.z);
  add(place(fuselage(detail)), 30);
  if (detail) for (const g of windscreen()) add(place(g), 60);
  for (const s of [-1, 1]) {
    const dihedral = -s * 0.09;
    add(place(surface([[0, 0], [-7.9, 16.9 * s], [-9.5, 16.9 * s], [-6.6, 0]], 0.32).rotateX(Math.PI / 2).rotateX(dihedral).translate(3.6, -1.1, 0)), 20);
    add(place(surface([[0, 0], [-1.3, 1.9], [-1.9, 1.9], [-1.7, 0]], 0.08).translate(3.6 - 7.9, -1.1 + 16.9 * Math.sin(0.09), 16.9 * s)), 20);
    add(place(surface([[0, 0], [-3.6, 6.3 * s], [-4.9, 6.3 * s], [-3.8, 0]], 0.18).rotateX(Math.PI / 2).rotateX(-s * 0.1).translate(-13.6, 0.5, 0)), 20);
    const ez = 5.9 * s;
    add(place(lathe([[1.0, 0], [1.08, 0.4], [1.1, 2.6], [0.85, 3.9], [0.55, 4.3]], detail ? 32 : 12).rotateZ(Math.PI / 2).translate(3.3, -2.15, ez)), 30);
    if (detail) add(place(new THREE.CylinderGeometry(0.88, 0.88, 0.06, 32).rotateZ(Math.PI / 2).translate(3.15, -2.15, ez)), 40);
    add(place(box(2.8, 0.8, 0.22, 1.3, -1.3, ez)), 20);
    if (detail) for (let i = 0; i < 25; i++) add(place(box(0.2, 0.28, 0.05, 13.4 - i * 0.82, 0.55, s * (R - 0.02))), 60);
  }
  add(place(surface([[0, 0], [-4.2, 6], [-6.4, 6], [-6.8, 0]], 0.3).translate(-11.6, R * 0.7, 0)), 20);
}

function buildPlane(add: Add) {
  addPlane((g, t) => add(g.rotateY(-0.9).rotateX(0.6), t), new THREE.Vector3(), 1, 0, true);
}

function buildEngine(add: Add) {
  add(lathe([[1.2, 0], [1.35, -0.1], [1.42, 0.1], [1.46, 0.6], [1.42, 2.4], [1.25, 3.4], [1.05, 3.8], [1.02, 3.8], [1.12, 0.2], [1.2, 0]], 64), 25);
  add(lathe([[0.01, -0.5], [0.15, -0.4], [0.32, -0.05], [0.38, 0.25]], 32).translate(0, 0.5, 0), 40);
  add(new THREE.CylinderGeometry(0.38, 0.36, 0.2, 32).translate(0, 0.85, 0), 40);
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2;
    add(box(0.75, 0.04, 0.24, 0, 0, 0).rotateX(0.55).translate(0.75, 0.95, 0).rotateY(a), 40);
  }
  add(lathe([[0.9, 3.8], [0.82, 4.4], [0.55, 4.6], [0.5, 4.6]], 48), 30);
  add(lathe([[0.48, 4.0], [0.4, 4.9], [0.01, 5.4]], 32), 40);
  add(box(0.8, 2.8, 0.25, 1.86, 2.2, 0), 30);
}

const plane: ShapeBuilder = (count) => ({ ...cloud(buildPlane, count, 0.35), motion: "static" });
const JET: [number, number][] = [[0, 0.85], [0.07, 0.75], [0.08, 0.3], [0.8, -0.1], [0.8, -0.2], [0.08, -0.05], [0.07, -0.55], [0.3, -0.72], [0.3, -0.8], [0.04, -0.75], [0, -0.85]];
const jet = (x: number, y: number, yaw: number, k = 1): [number, number][] => {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  const half = [...JET, ...JET.slice(1, -1).reverse().map(([a, b]): [number, number] => [-a, b])];
  return half.map(([a, b]) => [x + (a * c - b * s) * k, y + (a * s + b * c) * k]);
};

const airport: ShapeBuilder = (N) =>
  plan(N, 16, (p) => {
    const C = -2.2;
    const arc = (r: number, a0: number, a1: number, n = 40) => Array.from({ length: n + 1 }, (_, i): [number, number] => {
      const a = a0 + ((a1 - a0) * i) / n;
      return [Math.cos(a) * r, C + Math.sin(a) * r];
    });
    const A0 = 0.62;
    const A1 = Math.PI - 0.62;
    for (const [r, z] of [[5.9, 0.45], [5.25, 0.45], [5.25, 0], [5.9, 0]]) {
      const pts = arc(r, A0, A1);
      for (let i = 0; i < pts.length - 1; i++) p.line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], { z, w: z ? 1.1 : 0.45 });
    }
    for (let k = 0; k <= 8; k++) {
      const a = A0 + ((A1 - A0) * k) / 8;
      p.line(Math.cos(a) * 5.25, C + Math.sin(a) * 5.25, Math.cos(a) * 5.9, C + Math.sin(a) * 5.9, { z: 0.45, w: 0.5 });
      if (k % 8 === 0) for (const r of [5.25, 5.9]) p.seg([Math.cos(a) * r, C + Math.sin(a) * r, 0], [Math.cos(a) * r, C + Math.sin(a) * r, 0.45]);
    }
    for (let i = 0; i < 3; i++) {
      const a = Math.PI / 2 + (i - 1) * 0.42;
      const r = 4.15;
      p.poly(jet(Math.cos(a) * r, C + Math.sin(a) * r, a - Math.PI / 2, 0.85), { z: 0.06, g: i === 2 ? 0.43 : 0 });
      const b = a + 0.07;
      p.line(Math.cos(b) * 5.25, C + Math.sin(b) * 5.25, Math.cos(b) * 4.75, C + Math.sin(b) * 4.75, { z: 0.3, w: 1.6 });
    }
    const taxi = arc(3.2, A0 - 0.12, A1 + 0.12, 60);
    for (let i = 0; i < taxi.length - 1; i++) p.line(taxi[i][0], taxi[i][1], taxi[i + 1][0], taxi[i + 1][1], { dash: 0.22, w: 0.6 });
    p.line(-7.6, -2.05, 7.6, -2.05, { dash: 0.3, w: 0.6 });
    for (const s of [-1, 1]) p.line(s * 4.2, -2.05, s * taxi[0][0], taxi[0][1], { dash: 0.22, w: 0.6 });
    for (const x of [-6.2, 0, 6.2]) p.line(x, -2.05, x + 0.4, -2.75, { dash: 0.22, w: 0.6 });
    p.rect(0, -3.25, 15.4, 0.9, { w: 0.9 });
    p.line(-6.6, -3.25, 6.6, -3.25, { dash: 0.6, w: 0.7 });
    for (const x of [-7.3, 7.3]) for (let k = 0; k < 5; k++) p.line(x - 0.25, -3.57 + k * 0.16, x + 0.25, -3.57 + k * 0.16, { w: 0.6 });
    p.poly(jet(-1.0, -2.05, -Math.PI / 2, 0.85), { z: 0.06, g: -1 });
    p.ring(6.6, 1.6, 0.22, { h: 1.3, w: 0.8 });
    p.ring(6.6, 1.6, 0.42, { z: 1.3, h: 0.18, fill: 0.2 });
  });
const engine: ShapeBuilder = (count) => ({ ...cloud((add) => buildEngine((g, t) => add(g.rotateZ(Math.PI / 2).rotateY(-0.7), t)), count, 0.3), motion: "static" });

const clouds: ShapeBuilder = (count) => {
  const puffs: [number, number, number, number][] = [];
  for (let c = 0; c < 26; c++) {
    const cx = (rnd() - 0.5) * 1.6;
    const cz = rnd() * 2 - 1;
    const cy = -0.35 + rnd() * 0.15;
    const size = 0.08 + rnd() * 0.1;
    for (let p = 0; p < 7; p++) puffs.push([cx + (rnd() - 0.5) * size * 3, cy + rnd() * size * 0.6, cz + (rnd() - 0.5) * size * 2, size * (0.5 + rnd() * 0.6)]);
  }
  const area = puffs.map((p) => p[3] * p[3]);
  const total = area.reduce((a, b) => a + b, 0);
  return scatter(count, "flow", (v) => {
    if (rnd() < 0.06) {
      v.set((rnd() - 0.5) * 2, 0.2 + rnd() * 0.5, rnd() * 2 - 1);
      return;
    }
    let r = rnd() * total;
    let i = 0;
    while (r > area[i] && i < puffs.length - 1) r -= area[i++];
    const [x, y, z, s] = puffs[i];
    onSphere(v, s);
    v.y = Math.max(v.y, -s * 0.2);
    v.set(v.x + x, v.y + y, wrap(v.z + z));
  });
};

export const aviation: ParticleSet = {
  id: "aviation",
  label: "Aviation",
  industries: ["aviation", "aerospace", "airports", "airlines", "air cargo", "aircraft maintenance", "flight operations", "defense", "business aviation"],
  hero: plane,
  overview: airport,
  scan: engine,
  ambient: clouds,
  close: globe(28),
  scanBox: true,
  heroLayout: "split",
};
