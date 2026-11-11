import * as THREE from "three";
import { cloud, rnd, type Add } from "./sample";
import { box, cyl, extrude, plan, scatter } from "./parts";
import type { ParticleSet, ShapeBuilder } from "./types";

function addTower(add: Add, x: number, z: number, tiers: [number, number, number][], spire: boolean) {
  const F = 3.6;
  let y = 7.4;
  for (const [n, w, d] of tiers) {
    const h = n * F;
    for (let f = 0; f < n; f++) add(box(w + 0.4, 0.35, d + 0.4, x, y + f * F, z));
    add(box(w - 0.6, h, d - 0.6, x, y + h / 2, z), 20);
    for (let i = 0; i <= 8; i++) for (const s of [-1, 1]) add(box(0.14, h, 0.2, x - w / 2 + (i * w) / 8, y + h / 2, z + s * (d / 2 + 0.05)));
    for (let i = 0; i <= 6; i++) for (const s of [-1, 1]) add(box(0.2, h, 0.14, x + s * (w / 2 + 0.05), y + h / 2, z - d / 2 + (i * d) / 6));
    y += h;
  }
  const [, w, d] = tiers[tiers.length - 1];
  add(box(w, 0.6, d, x, y, z));
  if (!spire) return;
  add(box(w * 0.4, 3, d * 0.4, x, y + 1.8, z));
  add(cyl(0.15, 0.3, 10, x, y + 8.3, z, 8), 40);
}

function buildTower(add: Add) {
  const L = 96;
  const D = 24;
  add(box(L, 7, D, 0, 3.5, 0), 20);
  add(box(L + 1, 0.4, D + 1, 0, 7.2, 0));
  for (let i = 0; i < 9; i++) add(box(0.25, 6, 0.25, -L / 2 + 2 + i * ((L - 4) / 8), 3, D / 2 + 0.1));
  addTower(add, 0, 0, [[9, 24, 18], [3, 16.8, 13.5]], true);
  addTower(add, -32, 0, [[5, 26, 18]], false);
  addTower(add, 31, -1, [[7, 22, 16]], false);
}

function buildFrame(add: Add) {
  const nx = 5;
  const nz = 4;
  const S = 6;
  const FH = 3.6;
  const floors = 4;
  const X0 = (-(nx - 1) * S) / 2;
  const Z0 = (-(nz - 1) * S) / 2;
  for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) {
    const x = X0 + i * S;
    const z = Z0 + k * S;
    const h = i < 3 ? floors * FH : (floors - 1) * FH;
    add(box(0.4, h, 0.4, x, h / 2, z), 20);
    add(box(1.2, 0.5, 1.2, x, -0.25, z));
  }
  for (let f = 1; f <= floors; f++) {
    const y = f * FH;
    const span = f === floors ? 3 : nx;
    for (let k = 0; k < nz; k++) add(box((span - 1) * S + 0.4, 0.5, 0.3, X0 + ((span - 1) * S) / 2, y - 0.25, Z0 + k * S));
    for (let i = 0; i < span; i++) add(box(0.3, 0.5, (nz - 1) * S, X0 + i * S, y - 0.25, Z0 + ((nz - 1) * S) / 2));
    if (f < floors) add(box((nx - 1) * S + 1, 0.2, (nz - 1) * S + 1, 0, y + 0.1, 0));
  }
  for (let s = 0; s < 12; s++) add(box(1.2, 0.18, 0.3, X0 + S * 3 + 1, s * 0.3, Z0 + 0.6 + s * 0.3));
  for (let i = 0; i < nx - 1; i++) add(box(Math.hypot(S, FH), 0.08, 0.08, 0, 0, 0).rotateZ(Math.atan2(FH, S)).translate(X0 + (i + 0.5) * S, FH / 2, Z0), 30);
}

function buildArch(add: Add) {
  const W = 10;
  const H = 12;
  const r = 3;
  const s = new THREE.Shape();
  s.moveTo(-W / 2, 0);
  s.lineTo(-W / 2, H);
  s.lineTo(W / 2, H);
  s.lineTo(W / 2, 0);
  s.lineTo(r, 0);
  s.lineTo(r, H - 5 - r);
  s.absarc(0, H - 5 - r, r, 0, Math.PI, false);
  s.lineTo(-r, 0);
  s.lineTo(-W / 2, 0);
  add(extrude(s, 2.4), 20);
  add(box(W + 0.8, 0.6, 3, 0, H + 0.3, 0));
  add(box(W + 0.4, 1.4, 2.8, 0, H + 1.3, 0));
  for (const x of [-1, 1]) add(box(W / 2 - r + 0.6, 0.8, 3, x * (W / 2 + r) / 2, 0.4, 0));
  for (let i = 0; i < 9; i++) {
    const a = (i / 8) * Math.PI;
    const g = box(0.08, 0.8, 2.5, 0, 0, 0).translate(0, r + 0.4, 0).rotateZ(a - Math.PI / 2);
    add(g.translate(0, H - 5 - r, 0), 40);
  }
  add(box(1.0, 1.3, 2.6, 0, H - 5 + 0.5, 0));
  for (const x of [-1, 1]) for (let y = 1.2; y < H - 1; y += 1.2) add(box(W / 2 - r, 0.06, 2.5, x * (W / 2 + r) / 2, y, 0));
}

const tower: ShapeBuilder = (count) => ({ ...cloud(buildTower, count, 0.5), motion: "static" });
const skyline: ShapeBuilder = (N) =>
  plan(N, 16, (p) => {
    const towers: Record<string, number> = { "2,1": 3.6, "3,1": 2.8, "1,0": 2.2, "4,2": 1.8 };
    for (let i = 0; i < 6; i++)
      for (let j = 0; j < 3; j++) {
        const x = -6.25 + i * 2.5;
        const y = 2.4 - j * 2.4;
        const t = towers[`${i},${j}`];
        if (t) {
          p.rect(x, y, 1.9, 1.8, { h: 0.2, fill: 0.08 });
          p.rect(x, y, 0.85, 0.85, { h: t, fill: 0.15, g: 0.15 + i * 0.11 + j * 0.2 });
          for (let f = 1; f < t / 0.45; f++) p.rect(x, y, 0.85, 0.85, { z: f * 0.45, w: 0.4 });
          continue;
        }
        for (const a of [-1, 1]) for (const b of [-1, 1]) p.rect(x + a * 0.5, y + b * 0.47, 0.82, 0.78, { h: 0.2 + (((i * 3 + j * 5 + a * 7 + b * 11 + 40) % 4) / 3) * 0.3, fill: 0.15 });
      }
    for (let i = 0; i < 5; i++) p.line(-5 + i * 2.5, -3.5, -5 + i * 2.5, 3.5, { dash: 0.35, w: 0.5 });
    for (const y of [1.2, -1.2]) p.line(-7.6, y, 7.6, y, { dash: 0.35, w: 0.5 });
  });
const frame: ShapeBuilder = (count) => ({ ...cloud((add) => buildFrame((g, t) => add(g.rotateY(0.5), t)), count, 0.55), motion: "static" });
const arch: ShapeBuilder = (count) => ({ ...cloud(buildArch, count, 0.4), motion: "drift" });

const terrain: ShapeBuilder = (count) => {
  const h = (x: number, z: number) => {
    const u = (z + 1) * Math.PI;
    return 0.5 * Math.sin(x * 2.1 + Math.sin(u) * 1.2) * Math.cos(u * 2 + x * 0.8) + 0.3 * Math.sin(u * 3 - x * 3.4) + 0.2 * Math.cos(x * 5.3 + u * 5);
  };
  const levels = 12;
  return scatter(count, "flow", (v) => {
    for (let n = 0; n < 30; n++) {
      const x = (rnd() - 0.5) * 2;
      const z = rnd() * 2 - 1;
      const y = h(x, z);
      const f = (((y + 1.2) * levels) % 1 + 1) % 1;
      if (f < 0.12 || n === 29) {
        v.set(x, -0.35 + y * 0.18, z);
        return;
      }
    }
  });
};

export const architecture: ParticleSet = {
  id: "architecture",
  label: "Architecture",
  industries: ["construction", "infrastructure", "engineering", "architecture", "commercial real estate", "property development", "facilities", "proptech"],
  hero: tower,
  overview: skyline,
  scan: frame,
  ambient: terrain,
  close: arch,
  scanBox: true,
};
