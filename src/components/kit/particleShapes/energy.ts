import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { cloud, rnd, spread, type Add } from "./sample";
import { box, cyl, cylX, cylZ, extrude, lathe, onSphere, plan, scatter, wrap } from "./parts";
import type { ParticleSet, ShapeBuilder } from "./types";

const blade = (len: number) => {
  const s = new THREE.Shape();
  s.moveTo(0, -0.2);
  s.quadraticCurveTo(len * 0.1, -0.24, len * 0.2, -0.42);
  s.quadraticCurveTo(len * 0.6, -0.26, len, -0.04);
  s.lineTo(len, 0.05);
  s.quadraticCurveTo(len * 0.55, 0.2, len * 0.18, 0.26);
  s.quadraticCurveTo(len * 0.08, 0.24, 0, 0.2);
  s.lineTo(0, -0.2);
  return extrude(s, 0.16, 0.05);
};

function buildTurbine(add: Add, H: number, len: number, phase: number) {
  add(cyl(0.24, 0.46, H, 0, H / 2, 0, 40), 40);
  add(cyl(0.9, 0.9, 0.2, 0, 0.1, 0, 40), 40);
  for (const y of [H * 0.34, H * 0.67]) add(cyl(0.42 - y * 0.024, 0.42 - y * 0.024, 0.05, 0, y, 0, 40), 40);
  add(box(0.4, 0.8, 0.05, 0, 0.75, 0.42));
  add(new RoundedBoxGeometry(0.95, 0.95, 2.6, 3, 0.22).translate(0, H + 0.35, -0.55), 30);
  add(box(0.7, 0.18, 0.9, 0, H + 0.9, -1.2));
  add(cylX(0.06, 0.6, 0, H + 1.05, -1.6, 12), 40);
  add(cylZ(0.5, 0.35, 0, H + 0.35, 0.85, 40), 40);
  add(lathe([[0, 1.1], [0.3, 0.95], [0.5, 0.55], [0.6, 0]], 40).rotateX(Math.PI / 2).translate(0, H + 0.35, 1.0), 40);
  for (let i = 0; i < 3; i++) add(blade(len).rotateX(0.35).rotateZ(Math.PI / 2 + (i * Math.PI * 2) / 3 + phase).translate(0, H + 0.35, 1.25), 30);
}

function buildPanels(add: Add, x0: number, z: number, n: number) {
  const W = 2.1;
  const tilt = 0.8;
  for (let c = 0; c < n; c++) {
    const x = x0 + c * (W + 0.15);
    add(box(W, 0.07, 1.6, 0, 0, 0).rotateX(tilt).translate(x, 1, z), 20);
    for (let k = 1; k < 4; k++) add(box(0.025, 0.1, 1.6, 0, 0, 0).rotateX(tilt).translate(x - W / 2 + (k * W) / 4, 1, z), 20);
    add(box(W, 0.1, 0.025, 0, 0, 0).rotateX(tilt).translate(x, 1, z), 20);
    for (const dz of [-0.4, 0.4]) add(box(0.08, 1 - dz * Math.tan(tilt), 0.08, x, (1 - dz * Math.tan(tilt)) / 2, z + dz));
  }
}

function buildTurbines(add: Add) {
  const view: Add = (g, t) => add(g.rotateX(0.16), t);
  buildTurbine((g, t) => view(g.scale(1.2, 1.2, 1.2).translate(-3, 0, 0.5), t), 9, 4.8, 0.2);
  buildTurbine((g, t) => view(g.scale(0.72, 0.72, 0.72).translate(4.2, 0, -5), t), 9, 4.8, 0.75);
  buildTurbine((g, t) => view(g.scale(0.48, 0.48, 0.48).translate(8.6, 0, -10), t), 9, 4.8, 1.3);
  buildPanels(view, 0.4, 3, 4);
  buildPanels(view, 1.2, 5.4, 4);
  view(box(17, 0.03, 0.03, 2.5, 0, 7), 20);
  view(box(15, 0.03, 0.03, 3, 0, -2), 20);
}

function buildNacelle(add: Add) {
  add(new RoundedBoxGeometry(1.0, 1.0, 3.0, 3, 0.18).translate(0, 0, -0.6), 30);
  add(box(0.6, 0.15, 0.8, 0, 0.55, -1.4));
  add(cylZ(0.12, 1.2, 0, 0, 1.1, 24), 40);
  add(cylZ(0.45, 0.25, 0, 0, 0.98, 32), 40);
  add(lathe([[0, 0.9], [0.25, 0.75], [0.45, 0.4], [0.55, 0]], 32).rotateX(Math.PI / 2).translate(0, 0, 1.1), 40);
  for (let i = 0; i < 3; i++) {
    const a = Math.PI / 2 + (i * Math.PI * 2) / 3;
    add(new THREE.CylinderGeometry(0.17, 0.2, 0.9, 24).translate(0, 0.6, 0).rotateZ(a - Math.PI / 2).translate(0, 0, 1.4), 40);
  }
  add(cyl(0.4, 0.4, 0.12, 0, -0.56, -0.3, 32), 40);
  add(cyl(0.32, 0.36, 1.6, 0, -1.4, -0.3, 32), 40);
  for (let i = 0; i < 6; i++) add(box(0.01, 0.6, 0.01, 0.505, 0, -1.8 + i * 0.45));
  add(cylX(0.06, 0.5, 0.25, 0.55, -1.9, 12));
}

const turbine: ShapeBuilder = (count) => {
  const dense = cloud(buildTurbines, Math.ceil(count * 2.2), 0.3);
  const positions = spread(count, (v, i) => {
    v.fromArray(dense.positions, i * 3);
  }, 1.2, 72);
  return { positions, box: dense.box, motion: "static" };
};
const solar: ShapeBuilder = (N) =>
  plan(N, 16, (p) => {
    p.rect(0, -0.6, 15.6, 6.2, { w: 0.5 });
    for (let c = 0; c < 4; c++)
      for (let r = 0; r < 6; r++) p.rect(-5.55 + c * 3.7, -3.0 + r * 0.95, 3.3, 0.5, { h: 0.1, fill: 0.5, g: (c * 6 + r) % 7 === 3 ? 0.2 + c * 0.17 + r * 0.03 : 0 });
    p.rect(7.0, 2.25, 0.8, 0.45, { h: 0.35, fill: 0.1 });
    for (let i = 0; i < 6; i++) {
      const x = -6.5 + i * 2.6;
      const y = 3.3;
      const H = 2.2;
      p.ring(x, y, 0.14, { w: 0.6 });
      p.seg([x, y, 0], [x, y, H]);
      for (let k = 0; k < 3; k++) {
        const a = Math.PI / 2 + i * 0.5 + (k * Math.PI * 2) / 3;
        p.seg([x, y, H], [x + Math.cos(a) * 1.0, y, H + Math.sin(a) * 1.0]);
      }
    }
  });
const nacelle: ShapeBuilder = (count) => ({ ...cloud(buildNacelle, count, 0.4), motion: "static" });

const grid: ShapeBuilder = (count) => {
  const wires: [number, number][] = [[-0.55, 0.35], [-0.32, 0.35], [0.32, 0.35], [0.55, 0.35], [-0.42, 0.5], [0.42, 0.5]];
  return scatter(count, "flow", (v) => {
    const r = rnd();
    const z = rnd() * 2 - 1;
    if (r < 0.55) {
      const [x, y] = wires[Math.floor(rnd() * wires.length)];
      const t = (((z + 1) % 0.5) + 0.5) % 0.5 / 0.5;
      v.set(x, y - 0.06 * Math.sin(t * Math.PI), z);
    } else if (r < 0.8) {
      const pz = Math.round(z * 2) / 2;
      const y = -0.3 + rnd() * 0.82;
      const half = 0.12 * (1 - (y + 0.3) / 1.1) + 0.02;
      const side = rnd();
      if (side < 0.5) v.set((rnd() < 0.5 ? -1 : 1) * half, y, pz);
      else if (side < 0.7) v.set((rnd() - 0.5) * 2 * half, y, pz);
      else v.set((rnd() - 0.5) * 1.2, rnd() < 0.6 ? 0.35 : 0.5, pz);
    } else if (r < 0.95) v.set((rnd() - 0.5) * 2, -0.3, wrap(Math.round(z * 10) / 10 + (rnd() - 0.5) * 0.004));
    else v.set((rnd() - 0.5) * 2, -0.3 + rnd() * 1.2, z);
  });
};

const tilt = new THREE.Vector3(1, 0, 0);

const sun: ShapeBuilder = (count) =>
  scatter(count, "spin", (v) => {
    const r = rnd();
    if (r < 0.5) onSphere(v, 0.42);
    else if (r < 0.72) {
      const a = Math.floor(rnd() * 36) * ((Math.PI * 2) / 36);
      const d = 0.5 + rnd() * (0.12 + 0.1 * (Math.floor(a * 5.73) % 2));
      v.set(Math.cos(a) * d, Math.sin(a) * d, (rnd() - 0.5) * 0.01);
    } else {
      const ring = r < 0.86 ? 0.82 : 0.95;
      const a = rnd() * Math.PI * 2;
      v.set(Math.cos(a) * ring, (rnd() - 0.5) * 0.008, Math.sin(a) * ring).applyAxisAngle(tilt, 1.2);
    }
  });

export const energy: ParticleSet = {
  id: "energy",
  label: "Energy",
  industries: ["energy", "renewables", "solar", "wind", "utilities", "power", "cleantech", "oil and gas", "electrical"],
  hero: turbine,
  overview: solar,
  scan: nacelle,
  ambient: grid,
  close: sun,
  scanBox: true,
  heroDensity: 0.58,
};
