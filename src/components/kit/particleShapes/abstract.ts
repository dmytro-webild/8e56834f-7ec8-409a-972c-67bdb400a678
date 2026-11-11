import * as THREE from "three";
import { cloud, rnd, type Add } from "./sample";
import { box, extrude, plan, scatter, sphere } from "./parts";
import type { ParticleSet, ShapeBuilder } from "./types";

const tile = (size: number, r: number) => {
  const h = size / 2;
  const s = new THREE.Shape();
  s.moveTo(-h + r, -h);
  s.lineTo(h - r, -h);
  s.quadraticCurveTo(h, -h, h, -h + r);
  s.lineTo(h, h - r);
  s.quadraticCurveTo(h, h, h - r, h);
  s.lineTo(-h + r, h);
  s.quadraticCurveTo(-h, h, -h, h - r);
  s.lineTo(-h, -h + r);
  s.quadraticCurveTo(-h, -h, -h + r, -h);
  return extrude(s, 0.06, 0.03);
};

function buildCube(add: Add) {
  const faces: [number, number, number][] = [[0, 0, 0], [0, Math.PI / 2, 0], [0, Math.PI, 0], [0, -Math.PI / 2, 0], [-Math.PI / 2, 0, 0], [Math.PI / 2, 0, 0]];
  for (const [rx, ry] of faces)
    for (let a = -1; a <= 1; a++)
      for (let b = -1; b <= 1; b++) add(tile(0.86, 0.16).translate(a, b, 1.47).rotateX(rx).rotateY(ry), 30);
}

const cube: ShapeBuilder = (count) => ({ ...cloud(buildCube, count, 0.45), motion: "twist" });

const field: ShapeBuilder = (N) =>
  plan(N, 16, (p) => {
    const z = (x: number, y: number) => {
      const a = Math.hypot(x + 3, y - 0.4);
      const b = Math.hypot(x - 3.6, y + 0.7);
      return 0.5 * (Math.cos(a * 1.4) * Math.exp(-a * 0.2) + Math.cos(b * 1.4) * Math.exp(-b * 0.2)) + 0.5;
    };
    const X = 7.6;
    const Y = 3.6;
    const step = 0.15;
    for (let y = -Y; y <= Y + 1e-6; y += 0.3)
      for (let x = -X; x < X - 1e-6; x += step) {
        const f = Math.min(1, (X - Math.abs(x)) / 1.5);
        p.seg([x, y, z(x, y)], [x + step, y, z(x + step, y)], { w: 0.2 + f * 0.8 });
      }
    const nodes: [number, number][] = [[-3, 0.4], [3.6, -0.7], [-5.9, -2.3], [0.4, 2.6], [6.2, 2.4], [-0.9, -2.9]];
    nodes.forEach(([x, y], i) => p.ring(x, y, 0.14, { z: z(x, y), fill: 0.5, g: 0.09 + i * 0.13 }));
  });

function buildLattice(add: Add) {
  const n = 4;
  const s = 1;
  const h = ((n - 1) * s) / 2;
  const t = 0.05;
  const L = (n - 1) * s + t;
  for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) {
    const u = -h + a * s;
    const w = -h + b * s;
    add(box(L, t, t, 0, u, w), 30);
    add(box(t, L, t, u, 0, w), 30);
    add(box(t, t, L, u, w, 0), 30);
  }
  for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) for (let c = 0; c < n; c++) {
    const big = (a + b + c) % 3 === 0;
    add(box(big ? 0.22 : 0.12, big ? 0.22 : 0.12, big ? 0.22 : 0.12, -h + a * s, -h + b * s, -h + c * s), 30);
  }
  add(box(0.9, 0.9, 0.9, -h + 1.5 * s, -h + 1.5 * s, -h + 1.5 * s), 30);
}

const lattice: ShapeBuilder = (count) => ({ ...cloud((add) => buildLattice((g, t) => add(g.rotateY(0.6).rotateX(0.45), t)), count, 0.55), motion: "static" });

export const ribbons: ShapeBuilder = (count) => {
  const k = 7;
  const seeds = Array.from({ length: k }, () => [rnd() * 6, rnd() * 6, 0.1 + rnd() * 0.16, (rnd() - 0.5) * 1.4, (rnd() - 0.5) * 0.7]);
  return scatter(count, "flow", (v) => {
    if (rnd() < 0.05) {
      v.set((rnd() - 0.5) * 2, (rnd() - 0.5) * 1.2, rnd() * 2 - 1);
      return;
    }
    const [p, q, w, ox, oy] = seeds[Math.floor(rnd() * k)];
    const z = rnd() * 2 - 1;
    const u = (z + 1) * Math.PI;
    const cx = ox + 0.18 * Math.sin(u * 2 + p) + 0.08 * Math.sin(u * 3 + q);
    const cy = oy + 0.12 * Math.cos(u * 2 + q) + 0.06 * Math.sin(u * 5 + p);
    const twist = u * 2 + p;
    const s = (rnd() - 0.5) * w;
    const edge = rnd() < 0.35;
    const across = edge ? Math.sign(s) * w * 0.5 : s;
    v.set(cx + Math.cos(twist) * across, cy + Math.sin(twist) * across * 0.6, z);
  });
};

export const abstract: ParticleSet = {
  id: "abstract",
  label: "Abstract",
  industries: ["analytics", "machine learning", "platform", "automation", "research", "consulting", "agency", "any b2b"],
  hero: cube,
  overview: field,
  scan: lattice,
  ambient: ribbons,
  close: sphere,
  scanBox: true,
};
