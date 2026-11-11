import * as THREE from "three";
import { cloud, type Add } from "./sample";
import { architecture } from "./architecture";
import { between, box, cyl, cylX, cylZ, extrude, outline, plan, type Plan } from "./parts";
import type { HeroLayout, ParticleSet, ShapeBuilder, ShapeMotion } from "./types";

type P3 = [number, number, number];

const V = (x: number, y: number, z = 0) => new THREE.Vector3(x, y, z);

const solid = (build: (add: Add) => void, edge = 0.45, motion: ShapeMotion = "static"): ShapeBuilder => (count) => ({ ...cloud(build, count, edge), motion });

const view = (add: Add, yaw: number, pitch = 0.12): Add => (g, t) => add(g.rotateY(yaw).rotateX(pitch), t);

const tube = (pts: P3[], r: number, seg = 72) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(([x, y, z]) => V(x, y, z))), seg, r, 12);

const seeded = (s: number) => () => (s = (s * 16807) % 2147483647) / 2147483647;

const sag = (a: THREE.Vector3, b: THREE.Vector3, d: number, n = 28): P3[] =>
  Array.from({ length: n + 1 }, (_, i): P3 => {
    const t = i / n;
    const p = a.clone().lerp(b, t);
    return [p.x, p.y - d * Math.sin(Math.PI * t), p.z];
  });

type Opt = Parameters<Plan["line"]>[4];

const arc = (p: Plan, x: number, y: number, r: number, a0: number, a1: number, o?: Opt, n = 64, gaps = false) => {
  for (let i = 0; i < n; i++) {
    if (gaps && i % 2) continue;
    const a = a0 + ((a1 - a0) * i) / n;
    const b = a0 + ((a1 - a0) * (i + 1)) / n;
    p.line(x + Math.cos(a) * r, y + Math.sin(a) * r, x + Math.cos(b) * r, y + Math.sin(b) * r, o);
  }
};

const loop = (n: number, f: (a: number) => [number, number]) => Array.from({ length: n }, (_, i) => f((i / n) * Math.PI * 2));

const sprig = (p: Plan, x: number, y: number, a: number, s: number, o?: Opt) => {
  const pts: [number, number][] = [];
  for (let i = 0; i <= 16; i++) {
    const u = i <= 8 ? i / 8 : (16 - i) / 8;
    const w = (i <= 8 ? 1 : -1) * 0.3 * s * Math.sin(Math.PI * u);
    const l = u * s;
    pts.push([x + Math.cos(a) * l - Math.sin(a) * w, y + Math.sin(a) * l + Math.cos(a) * w]);
  }
  p.poly(pts, o);
  p.line(x, y, x + Math.cos(a) * s, y + Math.sin(a) * s, { ...o, w: (o?.w ?? 1) * 0.5 });
};

const ground = (add: Add, W: number) => add(box(W, 0.05, 0.05, 0, 0, 0.9), 40);

function buildRoof(add: Add, walls: boolean) {
  const W = 6.4;
  const H = 2.1;
  const D = 2.7;
  const L = Math.hypot(H, D);
  const th = Math.asin(H / L);
  const rows = 8;
  const row = L / rows;
  for (const side of [1, -1]) {
    const dir = V(0, -H, side * D).normalize();
    const n = V(0, D, side * H).normalize();
    for (let j = 0; j < rows; j++) {
      const c = V(0, H, 0).addScaledVector(dir, (j + 0.55) * row).addScaledVector(n, 0.03 + (j % 2) * 0.03);
      add(box(W, 0.06, row * 1.2, 0, 0, 0).rotateX(side * th).translate(c.x, c.y, c.z));
      const tabs = 9;
      for (let k = 0; k < tabs; k++) {
        const x = -W / 2 + ((k + 0.5 + (j % 2) * 0.5) * W) / tabs;
        if (x > W / 2 - 0.1) continue;
        const q = c.clone().addScaledVector(dir, row * 0.3).addScaledVector(n, 0.04);
        add(box(0.035, 0.05, row * 0.5, 0, 0, 0).rotateX(side * th).translate(x, q.y, q.z));
      }
    }
  }
  add(cylX(0.13, W + 0.2, 0, H + 0.08, 0, 24), 40);
  add(box(0.55, 1.6, 0.55, 1.7, H - 0.1, -0.9));
  add(box(0.7, 0.14, 0.7, 1.7, H + 0.7, -0.9));
  if (!walls) return;
  const wy = -H / 2 - 1.2;
  add(box(W - 0.6, 2.4, 2 * D - 1, 0, wy + 0.85, 0), 20);
  const gable = outline([[-(D - 0.5), 0], [D - 0.5, 0], [0, H * 0.82]]);
  for (const x of [-1, 1]) add(extrude(gable, 0.05).rotateY(Math.PI / 2).translate(x * (W / 2 - 0.3), wy + 2.05, 0), 30);
  add(box(0.8, 1.4, 0.06, -1.2, wy + 0.35, D - 0.48));
  for (const x of [0.4, 1.8]) add(box(0.9, 0.7, 0.06, x, wy + 0.95, D - 0.48));
}

function buildRoofEdge(add: Add) {
  const L = 6.6;
  const H = 2;
  const D = 2.6;
  const O = 0.35;
  const th = Math.atan2(H, D);
  const len = Math.hypot(H, D);
  const tail = -(O * H) / D;
  add(box(L, 0.18, 0.1, 0, H, 0));
  for (const s of [1, -1]) {
    add(box(L, 0.12, 0.16, 0, 0, s * D));
    add(box(L, 0.24, 0.05, 0, tail - 0.08, s * (D + O)));
    add(between(V(L / 2 + 0.05, tail, s * (D + O)), V(L / 2 + 0.05, H + 0.08, 0), 0.06, 8), 40);
  }
  for (let x = -L / 2 + 0.1; x <= L / 2 - 0.05; x += 0.42) for (const s of [1, -1]) add(between(V(x, tail, s * (D + O)), V(x, H, 0), 0.045, 6), 40);
  const n = V(0, D, H).normalize();
  const c = V(0, H / 2, D / 2);
  const x0 = 0.3;
  const wd = L / 2 - x0;
  const at = (g: THREE.BufferGeometry, x: number, off: number) => g.rotateX(th).translate(x, c.y + n.y * off, c.z + n.z * off);
  add(at(box(wd, 0.025, len + 0.3, 0, 0, 0), x0 + wd / 2, 0.09), 30);
  for (let x = x0 + 0.05; x <= L / 2; x += 0.3) add(at(box(0.04, 0.07, len + 0.3, 0, 0, 0), x, 0.13), 30);
}

function pylon(add: Add, x: number, z: number, s: number): THREE.Vector3[] {
  const H = 6 * s;
  const neck = H * 0.6;
  const b0 = 0.85 * s;
  const b1 = 0.26 * s;
  const w = (y: number) => (y <= neck ? b0 + ((b1 - b0) * y) / neck : b1 * (1 - (0.5 * (y - neck)) / (H - neck)));
  const lv = [0, neck * 0.3, neck * 0.56, neck * 0.8, neck, H * 0.8, H * 0.94];
  const C = [[1, 1], [1, -1], [-1, -1], [-1, 1]];
  const at = (k: number, y: number) => V(x + C[k % 4][0] * w(y), y, z + C[k % 4][1] * w(y));
  for (let i = 0; i < lv.length - 1; i++) {
    const a = lv[i];
    const b = lv[i + 1];
    for (let k = 0; k < 4; k++) {
      add(between(at(k, a), at(k, b), 0.04 * s, 6), 40);
      add(between(at(k, a), at(k + 1, a), 0.018 * s, 4), 60);
      add(between(at(k, a), at(k + 1, b), 0.016 * s, 4), 60);
      add(between(at(k + 1, a), at(k, b), 0.016 * s, 4), 60);
    }
  }
  const top = lv[lv.length - 1];
  for (let k = 0; k < 4; k++) add(between(at(k, top), V(x, H, z), 0.03 * s, 6), 40);
  const tips: THREE.Vector3[] = [V(x, H, z)];
  for (const [y, L] of [[neck, 2.0 * s], [H * 0.8, 1.55 * s]]) {
    for (const sx of [-1, 1]) {
      const tip = V(x + sx * L, y, z);
      for (const sz of [-1, 1]) {
        add(between(V(x + sx * w(y), y, z + sz * w(y)), tip, 0.03 * s, 6), 40);
        add(between(V(x + sx * w(y + 0.6 * s), y + 0.6 * s, z + sz * w(y + 0.6 * s)), tip, 0.022 * s, 6), 40);
      }
      add(cyl(0.03 * s, 0.03 * s, 0.6 * s, tip.x, y - 0.3 * s, z, 8), 40);
      for (let d = 1; d <= 4; d++) add(cyl(0.11 * s, 0.11 * s, 0.03 * s, tip.x, y - d * 0.13 * s, z, 16), 40);
      tips.push(V(tip.x, y - 0.6 * s, z));
    }
  }
  return tips;
}

function buildPylons(add: Add, wide: boolean) {
  const row: P3[] = wide ? [[-6.6, 2.4, 1], [-1.8, -1.2, 0.86], [2.4, -4.6, 0.74], [5.9, -7.8, 0.64]] : [[-3.4, 1.6, 1], [0.4, -1.8, 0.84], [3.6, -5, 0.7]];
  const tips = row.map(([x, z, s]) => pylon(add, x, z, s));
  for (let i = 0; i < tips.length - 1; i++) tips[i].forEach((a, j) => add(tube(sag(a, tips[i + 1][j], j ? 0.7 : 0.45), 0.022, 80), 60));
  const lead = tips[0].map((a) => a.clone().add(V(-3.4, -0.4, 3)));
  tips[0].forEach((a, j) => add(tube(sag(lead[j], a, j ? 0.5 : 0.3), 0.022, 60), 60));
}

function buildFrame(add: Add) {
  const W = 5.6;
  const D = 3.6;
  const y0 = -2;
  const y1 = 0.4;
  const y2 = 2.2;
  const b = 0.13;
  for (const z of [-D / 2, D / 2]) for (const y of [y0, y1]) add(box(W, b, b, 0, y, z));
  for (const x of [-W / 2, W / 2]) for (const y of [y0, y1]) add(box(b, b, D, x, y, 0));
  const door = (x: number) => Math.abs(x + 0.9) < 0.45;
  for (let x = -W / 2; x <= W / 2 + 1e-3; x += 0.62) {
    for (const z of [-D / 2, D / 2]) {
      if (z > 0 && door(x)) {
        add(box(b, y1 - 0.2 - (y0 + 1.9), b, x, (y1 + y0 + 1.9) / 2 - 0.1, z));
        continue;
      }
      add(box(b, y1 - y0, b, x, (y0 + y1) / 2, z));
    }
    add(between(V(x, y1, D / 2 + 0.3), V(x, y2, 0), b / 2, 6), 40);
    add(between(V(x, y1, -D / 2 - 0.3), V(x, y2, 0), b / 2, 6), 40);
  }
  for (const x of [-1.35, -0.45]) add(box(b, 1.9, b, x, y0 + 0.95, D / 2));
  add(box(1.0, b, b, -0.9, y0 + 1.9, D / 2));
  add(box(1.2, b, b, 1.3, y0 + 0.9, D / 2));
  add(box(1.2, b, b, 1.3, y0 + 1.9, D / 2));
  for (const x of [-W / 2, W / 2]) for (let z = -D / 2 + 0.6; z < D / 2; z += 0.6) {
    const top = y1 + (y2 - y1) * (1 - Math.abs(z) / (D / 2));
    add(box(b, top - y0, b, x, (y0 + top) / 2, z));
  }
  add(box(W + 0.4, 0.2, 0.12, 0, y2 + 0.05, 0));
  add(between(V(-W / 2, y0, D / 2), V(-W / 2 + 1.2, y1, D / 2), b / 2, 6), 40);
}

function buildSteelNode(add: Add) {
  const b = 0.62;
  const h = 0.82;
  const t = 0.1;
  const w = 0.07;
  const I = (len: number) => extrude(outline([[-b / 2, -h / 2], [b / 2, -h / 2], [b / 2, -h / 2 + t], [w / 2, -h / 2 + t], [w / 2, h / 2 - t], [b / 2, h / 2 - t], [b / 2, h / 2], [-b / 2, h / 2], [-b / 2, h / 2 - t], [-w / 2, h / 2 - t], [-w / 2, -h / 2 + t], [-b / 2, -h / 2 + t]]), len);
  const top = 1.8;
  const L = 3.8;
  add(I(4.6).rotateX(Math.PI / 2), 30);
  add(box(0.9, 0.05, 1.1, 0, 2.33, 0));
  add(box(1.3, 0.08, 1.5, 0, -2.34, 0));
  for (const x of [-0.48, 0.48]) for (const z of [-0.6, 0.6]) add(cyl(0.05, 0.05, 0.26, x, -2.2, z, 12), 40);
  for (const y of [top, -0.7]) {
    add(I(L).translate(0, y, h / 2 + 0.03 + L / 2), 30);
    add(I(L).rotateY(Math.PI / 2).translate(b / 2 + 0.03 + L / 2, y, 0), 30);
    add(box(0.5, 0.9, 0.04, 0, y, h / 2 + 0.02));
    add(box(0.04, 0.9, 0.5, b / 2 + 0.02, y, 0));
    for (const dy of [-0.28, 0, 0.28]) for (const d of [-0.14, 0.14]) {
      add(cylZ(0.04, 0.16, d, y + dy, h / 2 + 0.08, 10), 40);
      add(cylX(0.04, 0.16, b / 2 + 0.08, y + dy, d, 10), 40);
    }
  }
  add(between(V(b / 2 + 0.2, -2.2, 0.1), V(b / 2 + L - 0.3, top - 0.5, 0.1), 0.06, 8), 40);
  add(between(V(0.1, -2.2, h / 2 + 0.2), V(0.1, -0.7 - 0.5, h / 2 + L - 0.3), 0.06, 8), 40);
}

const leafGeo = (s: number) => {
  const pts: [number, number][] = [];
  for (let i = 0; i <= 20; i++) {
    const u = i <= 10 ? i / 10 : (20 - i) / 10;
    pts.push([(i <= 10 ? 1 : -1) * 0.3 * s * Math.sin(Math.PI * u) * (1 - 0.25 * u), u * s]);
  }
  return extrude(outline(pts), 0.015);
};

function buildTree(add: Add, x0: number, z0: number, s: number, rand: () => number) {
  const grow = (p: THREE.Vector3, dir: THREE.Vector3, len: number, r: number, depth: number) => {
    const q = p.clone().addScaledVector(dir, len);
    add(between(p, q, r, 8), 40);
    if (depth === 0) {
      for (let k = 0; k < 10; k++)
        add(leafGeo(0.6 * s * (0.75 + rand() * 0.5))
          .rotateZ((rand() - 0.5) * 2.4)
          .rotateX((rand() - 0.5) * 1.6)
          .rotateY(rand() * Math.PI * 2)
          .translate(q.x + (rand() - 0.5) * 0.5 * s, q.y + (rand() - 0.3) * 0.4 * s, q.z + (rand() - 0.5) * 0.5 * s), 30);
      return;
    }
    const n = depth > 2 ? 2 : 3;
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + rand() * 1.2;
      const nd = dir.clone().add(V(Math.cos(a) * 0.75, 0.35, Math.sin(a) * 0.75)).normalize();
      grow(q, nd, len * 0.74, r * 0.66, depth - 1);
    }
  };
  grow(V(x0, 0, z0), V(0, 1, 0), 1.7 * s, 0.13 * s, 4);
}

const leaf = solid((add) => {
  const Lh = 2.2;
  const half = (u: number) => 1.05 * Math.sin(Math.PI * u) ** 0.85 * (1 - 0.3 * u);
  const at = (x: number, y: number): P3 => [x, y, 0.3 * x * x + 0.35 * (y / Lh) ** 2];
  const yAt = (u: number) => -Lh + 2 * Lh * u;
  const edge = Array.from({ length: 81 }, (_, i): P3 => {
    const u = i <= 40 ? i / 40 : (80 - i) / 40;
    return at((i <= 40 ? 1 : -1) * half(u), yAt(u));
  });
  const bend: Add = (g, t) => add(g.rotateZ(-0.55).rotateY(-0.4).rotateX(0.3), t);
  bend(tube(edge, 0.03, 240), 60);
  bend(tube(Array.from({ length: 30 }, (_, i): P3 => at(0, -Lh - 0.9 + (i / 29) * (2 * Lh + 0.9))), 0.045, 120), 60);
  for (let j = 1; j <= 8; j++) {
    const u0 = 0.06 + j * 0.1;
    const u1 = Math.min(u0 + 0.13, 0.97);
    for (const s of [1, -1]) {
      const y0 = yAt(u0);
      const y1 = yAt(u1);
      const x1 = s * half(u1) * 0.94;
      bend(tube([at(0, y0), at(x1 * 0.5, y0 + (y1 - y0) * 0.55), at(x1 * 0.85, y0 + (y1 - y0) * 0.88), at(x1, y1)], 0.018, 48), 60);
    }
  }
}, 0.3);

export const canopyTree = solid((add) => buildTree(view(add, -0.3, 0.1), 0, 0, 1, seeded(11)), 0.35);

export const treeAvenue = solid((add) => {
  const rand = seeded(5);
  for (const [x, z, s] of [[-3.4, 0.4, 0.8], [0, -0.4, 1], [3.3, 0.5, 0.85]]) buildTree(view(add, -0.2, 0.15), x, z, s, rand);
  ground(view(add, -0.2, 0.15), 10);
}, 0.35);

export const gardenPlan: ShapeBuilder = (N) =>
  plan(N, 16, (p) => {
    p.rect(0, 0, 15.4, 8.2, { w: 0.5 });
    for (let k = 0; k < 6; k++) {
      const r0 = 3.1 - k * 0.5;
      p.poly(loop(96, (a) => {
        const m = 1 + 0.08 * Math.sin(3 * a + k * 0.5) + 0.05 * Math.sin(5 * a - k);
        return [-2.4 + Math.cos(a) * r0 * 1.3 * m, 0.4 + Math.sin(a) * r0 * 0.95 * m];
      }), { z: k * 0.22, w: k ? 0.6 : 0.8 });
    }
    for (let k = 0; k < 5; k++) sprig(p, -2.4, 0.4, (k * Math.PI * 2) / 5 + 0.3, 0.55, { z: 1.32, g: k === 0 ? 0.5 : 0 });
    for (const s of [1, 0.68]) p.poly(loop(64, (a) => [4.4 + Math.cos(a) * 1.7 * s * (1 + 0.1 * Math.sin(2 * a)), -1.2 + Math.sin(a) * 1.0 * s]), { w: s === 1 ? 0.8 : 0.4 });
    for (const off of [-0.22, 0.22]) for (let i = 0; i < 39; i++) {
      const xa = -7.4 + i * 0.38;
      const xb = xa + 0.38;
      p.line(xa, -3.3 + 0.5 * Math.sin(xa * 0.6) + off, xb, -3.3 + 0.5 * Math.sin(xb * 0.6) + off, { w: 0.5 });
    }
    for (let i = 0; i < 9; i++) {
      const x = 2.4 + i * 0.6;
      sprig(p, x, 2.7, Math.PI / 2 + (i % 2 ? 0.5 : -0.5), 0.5, { g: i % 4 === 1 ? 0.2 + i * 0.08 : 0 });
      sprig(p, x + 0.3, 1.5, Math.PI / 2 + (i % 2 ? -0.5 : 0.5), 0.42);
    }
    for (let i = 0; i < 12; i++) {
      const x = -6.8 + i * 0.75;
      sprig(p, x, -2.2 + 0.5 * Math.sin(x * 0.6), Math.PI / 2 + (i % 2 ? 0.45 : -0.45), 0.45, { g: i % 5 === 2 ? 0.3 + i * 0.05 : 0 });
    }
    p.rect(4.8, 3.7, 4.6, 0.3, { h: 0.3, fill: 0.3 });
  });

const roofHouse = solid((add) => buildRoof(view(add, -0.55, 0.2), true), 0.55);
const roofOnly = solid((add) => buildRoof(view(add, -0.4, 0.28), false), 0.55);
const roofEdge = solid((add) => buildRoofEdge(view(add, -0.6, 0.25)), 0.5);
const roofPlan: ShapeBuilder = (N) =>
  plan(N, 16, (p) => {
    const x0 = -6.6;
    const x1 = 1.4;
    const y0 = 2.3;
    const zm = 1.38;
    const zw = 1.68;
    p.line(x1, -y0, x0, -y0, { w: 1 });
    p.line(x0, -y0, x0, y0, { w: 1 });
    p.line(x0, y0, x1, y0, { w: 1 });
    p.rect(4.2, 0, 5.6, 7.2, { w: 1 });
    p.seg([-4.3, 0, zm], [3.7, 0, zm], { w: 1.3, g: 0.5 });
    p.seg([4.2, -0.8, zw], [4.2, 0.8, zw], { w: 1.3 });
    for (const s of [1, -1]) {
      p.seg([x0, s * y0, 0], [-4.3, 0, zm]);
      p.seg([x1, s * y0, 0], [3.7, 0, zm]);
      p.seg([x1, s * 3.6, 0], [4.2, s * 0.8, zw]);
      p.seg([7, s * 3.6, 0], [4.2, s * 0.8, zw]);
    }
    for (let x = -4; x <= 1.2; x += 0.4) p.seg([x, -y0, 0], [x, 0, zm], { w: 0.25 });
    for (let y = -3.2; y <= 3.21; y += 0.4) {
      const xe = Math.max(4.2, 3.4 + Math.abs(y));
      p.seg([7, y, 0], [xe, y, 0.6 * (7 - xe)], { w: 0.25 });
    }
    for (const x of [-2.6, -0.8]) p.rect(x, 1.1, 0.8, 0.6, { z: 0.72, h: 0.08, g: 0.3 - x * 0.1 });
    for (const [x, y, g] of [[x0, -y0, 0.12], [x0, y0, 0.3], [x1, -3.6, 0.48], [x1, 3.6, 0.64], [7, -3.6, 0.8], [7, 3.6, 0.95]]) p.rect(x, y, 0.3, 0.3, { h: 0.1, g });
  });

const pylonRun = solid((add) => buildPylons(view(add, -0.15, 0.1), false), 0.4);
const pylonOne = solid((add) => {
  const v = view(add, -0.5, 0.12);
  const tips = pylon(v, 0, 0, 1);
  for (const a of tips) v(tube(sag(a, a.clone().add(V(0.6, -0.5, -4)), 0.3, 16), 0.022, 40), 60);
}, 0.4);
const waveform = solid((add) => {
  const env = (x: number) => 0.3 + 0.7 * Math.exp(-((x / 2.6) ** 2));
  const y = (x: number, ph: number) => 1.25 * env(x) * Math.sin(x * 1.5 + ph);
  for (let k = 0; k < 3; k++) {
    const z = (k - 1) * 0.9;
    const ph = (k * Math.PI * 2) / 3;
    add(tube(Array.from({ length: 121 }, (_, i): P3 => [-4.2 + i * 0.07, y(-4.2 + i * 0.07, ph), z]), 0.04, 360), 60);
    add(cylX(0.012, 8.6, 0, 0, z, 8), 40);
  }
  for (let x = -4; x <= 4.01; x += 0.25) {
    const v = y(x, (Math.PI * 2) / 3);
    if (Math.abs(v) > 0.06) add(cyl(0.012, 0.012, Math.abs(v), x, v / 2, 0, 6), 40);
  }
}, 0.3);
const busPlan: ShapeBuilder = (N) =>
  plan(N, 16, (p) => {
    p.rect(0.4, 1.1, 13.6, 5.6, { w: 0.5 });
    p.rect(-7.3, -2.8, 1, 1, { h: 0.5, fill: 0.15 });
    p.rect(-7.3, -2.8, 0.6, 0.6, { h: 0.5 });
    p.rect(0, -2.8, 14, 0.3, { h: 0.3, fill: 0.3 });
    for (const x of [-3, 3.5]) p.rect(x, -2.8, 2, 0.12, { h: 0.32, fill: 0.6, g: -1 });
    [-4.5, -1.5, 1.5, 4.5].forEach((x, i) => {
      p.line(x, -2.65, x, -0.6, { w: 0.9 });
      p.rect(x, -1.7, 0.42, 0.42, { h: 0.35 });
      p.rect(x, 0, 1.7, 1.2, { h: 0.45, fill: 0.2, g: 0.2 + i * 0.17 });
      for (const dy of [-0.3, 0, 0.3]) p.line(x - 0.6, dy, x + 0.6, dy, { z: 0.45, w: 0.4 });
      p.line(x, 0.6, x, 2.6, { w: 0.6 });
      p.line(x - 0.9, 2.6, x + 0.9, 2.6, { w: 0.6 });
      for (const dx of [-0.9, 0.9]) p.rect(x + dx, 2.6, 0.36, 0.24, { h: 0.12, g: 0.1 + i * 0.2 + (dx > 0 ? 0.09 : 0) });
    });
    p.line(-6, 3.5, 6.6, 3.5, { dash: 0.2, w: 0.3 });
    for (let x = -5.6; x <= 6.4; x += 1.5) p.rect(x, 3.5, 0.5, 0.14);
  });

const frame = solid((add) => buildFrame(view(add, -0.55, 0.2)), 0.6);
const steelNode = solid((add) => buildSteelNode(view(add, 2.35, 0.25)), 0.55);
const sitePlan: ShapeBuilder = (N) =>
  plan(N, 16, (p) => {
    p.rect(0, 0, 15.4, 8.2, { dash: 0.35, w: 0.6 });
    for (let x = -6; x <= 6; x += 2) p.line(x, -3.4, x, 3.7, { dash: 0.16, w: 0.22 });
    for (let y = -1; y <= 3; y += 2) p.line(-7.2, y, 7.2, y, { dash: 0.16, w: 0.22 });
    p.rect(-2, 1, 8, 4, { h: 0.5, fill: 0.12 });
    for (let x = -6; x <= 2; x += 2) for (const y of [-1, 1, 3]) p.rect(x, y, 0.26, 0.26, { h: 0.9, g: x === -2 && y === 1 ? 0.3 : 0 });
    p.rect(4.6, 1.8, 3.4, 2.4, { h: 0.3, fill: 0.16 });
    p.rect(4.6, 1.8, 2.2, 1.2, { h: 0.3 });
    const cx = 1.4;
    const cy = -2.2;
    const R = 5.4;
    p.rect(cx, cy, 0.7, 0.7, { h: 1.6, fill: 0.3 });
    arc(p, cx, cy, R, 0.18, Math.PI - 0.18, { w: 0.5 }, 72, true);
    arc(p, cx, cy, 1.2, 0, Math.PI * 2, { w: 0.4 }, 32);
    p.line(cx, cy, cx + Math.cos(1.05) * R, cy + Math.sin(1.05) * R, { w: 1.2, z: 1.6, g: 0.45 });
    p.line(cx, cy, cx - Math.cos(1.05) * 1.6, cy - Math.sin(1.05) * 1.6, { w: 1.2, z: 1.6 });
    for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) p.rect(-5.8 + i * 0.95, -2.7 + j * 0.8, 0.65, 0.5, { h: 0.15, fill: 0.3, g: i === 2 && j === 1 ? 0.62 : 0 });
    p.line(-7.4, -3.55, 7.4, -3.55, { dash: 0.5, w: 0.6 });
    for (const x of [-2.6, 4.2]) p.rect(x, -3.55, 1.3, 0.4, { h: 0.26, fill: 0.4, g: -1 });
  });

const ambient = architecture.ambient;

const compact = (s: ShapeBuilder, k = 0.58): ShapeBuilder => async (count) => {
  const r = await s(count);
  for (let i = 0; i < r.positions.length; i++) r.positions[i] *= k;
  return { ...r, box: r.box && [r.box[0] * k, r.box[1] * k, r.box[2] * k] };
};

const trade = (id: string, label: string, industries: string[], hero: ShapeBuilder, overview: ShapeBuilder, scan: ShapeBuilder, close: ShapeBuilder, heroLayout?: HeroLayout): ParticleSet => ({ id, label, industries, hero, overview, scan, ambient, close: compact(close), scanBox: true, heroLayout });

export const landscapingRoles = { overview: gardenPlan, scan: canopyTree, close: compact(leaf) };

export const roofing = trade("roofing", "Roofing", ["roofing", "roofer", "gutters", "exteriors"], roofHouse, roofPlan, roofOnly, roofEdge);
export const electrical = trade("electrical", "Electrical", ["electrician", "electrical contractor", "lighting", "ev chargers"], pylonRun, busPlan, pylonOne, waveform, "stacked");
export const construction = trade("construction", "Construction", ["builder", "general contractor", "handyman", "home services", "renovation", "carpentry"], solid((add) => buildSiteWide(view(add, -0.3, 0.12), false), 0.5), sitePlan, frame, steelNode);

function buildRoofRow(add: Add, wide: boolean) {
  const row: [number, number, number][] = wide ? [[-6.2, 0.62, 0.3], [0, 0.8, -0.2], [6, 0.66, 0.4]] : [[-2.8, 0.58, 0.3], [2.6, 0.68, -0.2]];
  for (const [x, s, z] of row) buildRoof((g, t) => add(g.rotateY(-0.32).scale(s, s, s).translate(x, 2.6 * s, z), t), true);
  ground(add, wide ? 19 : 10.5);
}

function buildSiteWide(add: Add, wide: boolean) {
  const bays = wide ? 6 : 3;
  const floors = wide ? 3 : 5;
  const S = 1.5;
  const FH = 1.0;
  const D = 1.6;
  const b = 0.08;
  const L = bays * S;
  const x0 = wide ? -L / 2 + 0.6 : -3.6;
  const c = wide ? -1 : 1;
  const xm = c > 0 ? x0 + L + 1.6 : x0 - 1.6;
  const j = -c;
  for (let f = 0; f <= floors; f++) {
    const top = f === floors;
    const n = top ? bays - (wide ? 3 : 1) : bays;
    const xa = c > 0 ? x0 : x0 + (bays - n) * S;
    if (f > 0 && f < floors) add(box(L + 0.2, 0.09, D + 0.2, x0 + L / 2, f * FH, 0), 20);
    if (f === floors) for (const z of [-D / 2, D / 2]) add(box(n * S, b, b, xa + (n * S) / 2, f * FH, z));
    if (f === floors) for (let i = 0; i <= n; i++) add(box(b, b, D, xa + i * S, f * FH, 0));
    if (f === 0) continue;
    const m = f === floors ? n : bays;
    const xs = f === floors ? xa : x0;
    for (let i = 0; i <= m; i++) for (const z of [-D / 2, D / 2]) add(box(b, FH, b, xs + i * S, (f - 0.5) * FH, z));
  }
  const top = floors * FH;
  for (let i = 0; i <= bays; i++) if (i < bays) add(between(V(x0 + i * S, top - FH, D / 2), V(x0 + (i + 0.5) * S, top - FH + 0.5, D / 2), b / 2, 6), 40);
  const xsc = c > 0 ? x0 - 0.45 : x0 + L + 0.45;
  const hs = top - 0.4;
  for (const z of [-D / 2, D / 2]) add(box(0.04, hs, 0.04, xsc, hs / 2, z), 60);
  for (let y = 0.5; y <= hs; y += 0.5) {
    add(box(0.04, 0.04, D, xsc, y, 0), 60);
    add(between(V(xsc, y - 0.5, -D / 2), V(xsc, y, D / 2), 0.015, 4), 60);
  }
  const Hc = top + 2.2;
  const h = 0.22;
  for (const [dx, dz] of [[-h, -h], [h, -h], [h, h], [-h, h]]) add(box(0.06, Hc, 0.06, xm + dx, Hc / 2, dz));
  for (let y = 0.45; y < Hc; y += 0.45) {
    for (const s of [-1, 1]) {
      add(box(2 * h, 0.03, 0.03, xm, y, s * h), 60);
      add(box(0.03, 0.03, 2 * h, xm + s * h, y, 0), 60);
    }
    add(between(V(xm - h, y - 0.45, h), V(xm + h, y, h), 0.015, 4), 60);
    add(between(V(xm + j * h, y - 0.45, -h), V(xm + j * h, y, h), 0.015, 4), 60);
  }
  add(box(1.3, 0.3, 1.3, xm, 0.15, 0), 20);
  const Lj = wide ? 9.6 : 6.6;
  const tail = xm - j * 2.2;
  for (const z of [-0.16, 0.16]) add(box(Lj + 2.2, 0.05, 0.05, xm + (j * (Lj - 2.2)) / 2, Hc, z));
  add(box(Lj, 0.05, 0.05, xm + (j * Lj) / 2, Hc + 0.38, 0));
  for (let k = 0; k < Lj / 0.42 - 1; k++) {
    const x = xm + j * k * 0.42;
    add(between(V(x, Hc, 0.16), V(x + j * 0.21, Hc + 0.38, 0), 0.012, 4), 60);
    add(between(V(x + j * 0.21, Hc + 0.38, 0), V(x + j * 0.42, Hc, -0.16), 0.012, 4), 60);
  }
  add(box(0.7, 0.55, 0.5, tail + j * 0.4, Hc - 0.3, 0), 20);
  add(box(0.5, 0.45, 0.5, xm + j * 0.45, Hc - 0.35, 0.3), 20);
  add(box(0.24, 1.3, 0.24, xm, Hc + 0.65, 0));
  add(between(V(xm, Hc + 1.3, 0), V(xm + j * Lj * 0.65, Hc + 0.38, 0), 0.014, 4), 60);
  add(between(V(xm, Hc + 1.3, 0), V(tail, Hc, 0), 0.014, 4), 60);
  const xt = c > 0 ? x0 + L - 0.75 : x0 + 0.75;
  add(box(0.36, 0.12, 0.42, xt, Hc - 0.08, 0), 20);
  const yh = top + 0.9;
  add(box(0.015, Hc - yh, 0.015, xt, (Hc + yh) / 2, 0), 60);
  add(box(0.18, 0.22, 0.12, xt, yh - 0.1, 0), 20);
  for (const s of [-1, 1]) add(between(V(xt, yh - 0.2, 0), V(xt + s * 0.6, yh - 0.6, 0), 0.01, 4), 60);
  add(box(1.5, 0.12, 0.12, xt, yh - 0.66, 0), 20);
  ground(add, wide ? 16 : 10);
}

const wideShape = (build: (add: Add, wide: boolean) => void, edge = 0.45) => (wide: boolean): ShapeBuilder => solid((add) => build((g, t) => add(g.rotateY(-0.12).rotateX(0.22), t), wide), edge);

export const TRADE_HERO: Record<string, (wide: boolean) => ShapeBuilder> = {
  electrical: wideShape(buildPylons, 0.4),
  roofing: wideShape(buildRoofRow, 0.55),
  construction: wideShape(buildSiteWide, 0.5),
};
