import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { cloud, rnd, type Add } from "./sample";
import { box, cyl, globe, plan, scatter, wrap } from "./parts";
import type { ParticleSet, ShapeBuilder } from "./types";

function buildRack(add: Add) {
  const W = 0.6;
  const H = 2.0;
  const D = 1.0;
  for (const x of [-1, 1]) for (const z of [-1, 1]) add(box(0.04, H, 0.04, x * (W / 2 - 0.02), H / 2, z * (D / 2 - 0.02)));
  add(box(W, 0.06, D, 0, H - 0.03, 0));
  add(box(W, 0.08, D, 0, 0.1, 0));
  for (const x of [-1, 1]) {
    add(box(0.01, H - 0.2, D - 0.06, x * (W / 2 - 0.005), H / 2 + 0.03, 0));
    for (let y = 0.4; y < H - 0.2; y += 0.12) add(box(0.012, 0.015, 0.5, x * (W / 2 + 0.002), y, 0.1));
  }
  for (const x of [-1, 1]) for (const z of [-1, 1]) add(cyl(0.025, 0.025, 0.06, x * 0.24, 0.03, z * 0.42, 10));
  const front = D / 2 - 0.03;
  let y = 0.18;
  const units = [2, 1, 1, 2, 4, 1, 1, 2, 2, 1, 1, 4, 2, 1, 1, 2];
  for (const u of units) {
    const h = u * 0.0445;
    if (y + h > H - 0.1) break;
    add(new RoundedBoxGeometry(W - 0.1, h - 0.006, D - 0.12, 1, 0.004).translate(0, y + h / 2, -0.02), 30);
    add(box(W - 0.06, h - 0.008, 0.012, 0, y + h / 2, front));
    if (u >= 2) for (let i = 0; i < 8; i++) add(box(0.05, h * 0.62, 0.01, -0.21 + i * 0.06, y + h / 2, front + 0.008));
    else for (let i = 0; i < 4; i++) add(box(0.09, 0.012, 0.01, -0.2 + i * 0.11, y + h / 2, front + 0.008));
    add(box(0.012, 0.012, 0.01, 0.255, y + h / 2, front + 0.01));
    y += h + 0.004;
  }
  add(box(0.012, H - 0.12, 0.02, -W / 2 + 0.035, H / 2, front + 0.02));
  add(box(0.012, H - 0.12, 0.02, W / 2 - 0.035, H / 2, front + 0.02));
}

function buildBoard(add: Add) {
  const W = 3.05;
  const D = 2.44;
  add(new RoundedBoxGeometry(W, 0.016, D, 1, 0.006), 30);
  const top = 0.008;
  add(box(0.42, 0.04, 0.42, -0.35, top + 0.02, -0.25));
  add(box(0.32, 0.02, 0.32, -0.35, top + 0.05, -0.25));
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    for (let j = 0; j < 12; j++) {
      const t = -0.19 + j * 0.035;
      add(box(0.012, 0.004, 0.06, 0, 0, 0).rotateY(a).translate(-0.35 + Math.cos(a) * 0.24 + Math.sin(a) * t, top + 0.004, -0.25 + Math.sin(a) * 0.24 + Math.cos(a) * t));
    }
  }
  for (let i = 0; i < 4; i++) add(box(0.06, 0.1, 1.33, 0.35 + i * 0.13, top + 0.05, -0.2));
  for (let i = 0; i < 3; i++) add(box(1.0, 0.08, 0.16, -0.6, top + 0.04, 0.55 + i * 0.22));
  for (let i = 0; i < 14; i++) add(cyl(0.035, 0.035, 0.09, -1.2 + (i % 7) * 0.09, top + 0.045, -0.85 + Math.floor(i / 7) * 0.09, 12), 40);
  for (let i = 0; i < 9; i++) add(box(0.012, 0.14, 0.4, -0.95 + i * 0.04, top + 0.07, -0.25));
  add(box(0.5, 0.18, 0.3, 1.2, top + 0.09, -0.95));
  add(box(0.3, 0.14, 0.3, 1.25, top + 0.07, -0.5));
  add(box(0.24, 0.06, 0.24, 0.9, top + 0.03, 0.75));
  for (let i = 0; i < 26; i++) {
    const x0 = -1.4 + rnd() * 2.8;
    const z0 = -1.1 + rnd() * 2.2;
    const len = 0.2 + rnd() * 0.6;
    const along = rnd() < 0.5;
    add(along ? box(len, 0.003, 0.012, x0, top + 0.002, z0) : box(0.012, 0.003, len, x0, top + 0.002, z0), 60);
  }
  for (let i = 0; i < 6; i++) add(cyl(0.04, 0.04, 0.02, -1.45 + (i % 2) * 2.9, top - 0.002, -1.1 + Math.floor(i / 2) * 1.1, 12), 60);
}

const rack: ShapeBuilder = (count) => ({
  ...cloud((add) => {
    for (let i = 0; i < 5; i++) buildRack((g, t) => add(g.translate((i - 2) * 0.66, 0, 0), t));
  }, count, 0.45),
  motion: "static",
});
const hall: ShapeBuilder = (N) =>
  plan(N, 16, (p) => {
    p.rect(0, 0, 15.6, 7.4, { w: 0.6 });
    for (let r = 0; r < 6; r++) {
      const y = 2.6 - r * 1.05;
      p.rect(-1.4, y, 11, 0.5, { h: 0.45, fill: 0.12, g: r === 1 ? 0.37 : r === 4 ? 0.71 : 0 });
      for (let i = 1; i < 18; i++) p.line(-6.9 + (i * 11) / 18, y - 0.25, -6.9 + (i * 11) / 18, y + 0.25, { z: 0.45, w: 0.7 });
    }
    for (let i = 0; i < 4; i++) p.rect(6.1, 2.4 - i * 1.6, 1.5, 0.9, { h: 0.55, fill: 0.08 });
    p.line(-6.9, 3.35, 4.1, 3.35, { dash: 0.35, w: 0.6 });
    p.line(-6.9, -3.35, 4.1, -3.35, { dash: 0.35, w: 0.6 });
  });
const board: ShapeBuilder = (count) => ({ ...cloud(buildBoard, count, 0.45), motion: "static" });

const stream: ShapeBuilder = (count) => {
  const lanes: [number, number, number, number][] = [];
  for (let i = 0; i < 90; i++) {
    const a = rnd() * Math.PI * 2;
    const r = 0.28 + rnd() * 0.6;
    lanes.push([Math.cos(a) * r, Math.sin(a) * r * 0.6, 3 + Math.floor(rnd() * 6), rnd()]);
  }
  return scatter(count, "flow", (v) => {
    if (rnd() < 0.08) {
      v.set((rnd() - 0.5) * 2, (rnd() - 0.5) * 1.2, rnd() * 2 - 1);
      return;
    }
    const [x, y, k, o] = lanes[Math.floor(rnd() * lanes.length)];
    let z = rnd() * 2 - 1;
    while ((((z + 1) * k + o) % 1) > 0.42) z = rnd() * 2 - 1;
    v.set(x + (rnd() - 0.5) * 0.008, y + (rnd() - 0.5) * 0.008, wrap(z));
  });
};

export const tech: ParticleSet = {
  id: "tech",
  label: "Tech",
  industries: ["technology", "saas", "software", "cloud", "data", "cybersecurity", "ai", "it services", "hardware", "telecom"],
  hero: rack,
  overview: hall,
  scan: board,
  ambient: stream,
  close: globe(36, true),
  scanBox: true,
};
