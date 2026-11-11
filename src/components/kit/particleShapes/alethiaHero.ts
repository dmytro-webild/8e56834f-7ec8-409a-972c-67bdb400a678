import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { cloud, rnd, type Add } from "./sample";
import { between, box, cyl, cylX, cylZ, extrude, lathe, scatter } from "./parts";
import { TRADE_HERO, canopyTree, treeAvenue } from "./trades";
import type { ParticleRole, ShapeBuilder } from "./types";

const shape = (build: (add: Add) => void, edge = 0.4): ShapeBuilder => (count) => cloud(build, count, edge);

const moved = (add: Add, x: number, y: number, z: number, s = 1): Add => {
  const m = new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion(), new THREE.Vector3(s, s, s));
  return (g, t) => add(g.applyMatrix4(m), t);
};

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

const turbineParts = (add: Add, phase: number, H = 9) => {
  add(cyl(0.24, 0.46, H, 0, H / 2, 0, 40), 40);
  add(cyl(0.9, 0.9, 0.2, 0, 0.1, 0, 40), 40);
  for (const y of [H * 0.34, H * 0.67]) add(cyl(0.42 - y * 0.024, 0.42 - y * 0.024, 0.05, 0, y, 0, 40), 40);
  add(new RoundedBoxGeometry(0.95, 0.95, 2.6, 3, 0.22).translate(0, H + 0.35, -0.55), 30);
  add(cylZ(0.5, 0.35, 0, H + 0.35, 0.85, 40), 40);
  add(lathe([[0, 1.1], [0.3, 0.95], [0.5, 0.55], [0.6, 0]], 40).rotateX(Math.PI / 2).translate(0, H + 0.35, 1.0), 40);
  for (let i = 0; i < 3; i++) add(blade(4.8).rotateX(0.35).rotateZ(Math.PI / 2 + (i * Math.PI * 2) / 3 + phase).translate(0, H + 0.35, 1.25), 30);
};

const turbine = (phase: number, H = 9) => shape((add) => turbineParts(add, phase, H), 0.3);


const COIN_T = 0.17;

const coinAt = (add: Add, m: THREE.Matrix4, R: number, face: boolean) => {
  const h = (COIN_T * R) / 2;
  add(new THREE.CylinderGeometry(R, R, h * 2, 80, 1, true).applyMatrix4(m), 25);
  for (const y of [-h, h]) add(new THREE.TorusGeometry(R * 0.985, R * 0.02, 4, 80).rotateX(Math.PI / 2).translate(0, y, 0).applyMatrix4(m), 50);
  if (!face) return;
  add(new THREE.RingGeometry(R * 0.72, R * 0.86, 80, 1).rotateX(-Math.PI / 2).translate(0, h, 0).applyMatrix4(m), 25);
  for (const r of [0.55, 0.36]) add(new THREE.TorusGeometry(R * r, R * 0.012, 4, 64).rotateX(Math.PI / 2).translate(0, h, 0).applyMatrix4(m), 20);
  add(new THREE.CylinderGeometry(R * 0.18, R * 0.18, R * 0.05, 40, 1).translate(0, h + R * 0.025, 0).applyMatrix4(m), 22);
};

const pose = (x: number, y: number, z: number, rx = 0, ry = 0, rz = 0) =>
  new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, "YXZ")), new THREE.Vector3(1, 1, 1));

const oneCoin = shape((add) => coinAt(add, pose(0, 0, 0, Math.PI / 2 - 0.3, 0.4), 1, true), 0.45);

const bars = shape((add) => {
  const hs = [1.0, 1.6, 1.3, 2.0, 2.3, 2.1, 3.0];
  hs.forEach((h, i) => add(box(0.5, h, 0.5, i * 0.8, h / 2, 0), 20));
  add(box(5.8, 0.04, 0.04, 2.4, 0, 0.35));
  add(box(0.04, 3.6, 0.04, -0.45, 1.8, 0.35));
  const pts = hs.map((h, i) => new THREE.Vector3(i * 0.8, h + 0.45, 0.3));
  for (let i = 0; i < pts.length - 1; i++) {
    add(between(pts[i], pts[i + 1], 0.03, 6), 40);
    add(new THREE.SphereGeometry(0.08, 10, 8).translate(pts[i + 1].x, pts[i + 1].y, pts[i + 1].z), 40);
  }
}, 0.5);

const boxIn = (add: Add, L: number, dx: number, dy: number, dz: number, ry: number) => {
  const H = 2.59;
  const W = 2.44;
  const g = (geo: THREE.BufferGeometry, t?: number) => add(geo.rotateY(ry).translate(dx, dy, dz), t);
  for (const sz of [-1, 1]) for (const y of [0.06, H - 0.06]) g(box(L, 0.12, 0.12, 0, y, (sz * W) / 2));
  for (const sx of [-1, 1]) for (const y of [0.06, H - 0.06]) g(box(0.12, 0.12, W, (sx * L) / 2, y, 0));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g(box(0.12, H, 0.12, (sx * L) / 2, H / 2, (sz * W) / 2));
  for (let x = -L / 2 + 0.25; x < L / 2 - 0.15; x += 0.3) {
    for (const sz of [-1, 1]) g(box(0.04, H - 0.24, 0.04, x, H / 2, (sz * W) / 2));
    g(box(0.04, 0.04, W - 0.2, x, H, 0));
  }
  for (const z of [-0.8, -0.28, 0.28, 0.8]) g(box(0.04, H - 0.24, 0.04, L / 2 + 0.04, H / 2, z));
  for (const z of [-0.6, 0.6]) g(box(0.04, 0.04, 0.5, L / 2 + 0.06, H / 2, z));
  g(box(0.04, H - 0.24, 0.04, L / 2 + 0.04, H / 2, 0));
};

const container = (len: number) => shape((add) => boxIn(add, len, 0, 0, 0, 0), 0.55);

const containerTower = shape((add) => {
  boxIn(add, 6.06, 0, 0, 0, 0);
  boxIn(add, 6.06, 0.15, 2.62, 0.05, 0.1);
}, 0.55);

const house = shape((add) => {
  const W = 4;
  const D = 3;
  const H = 2.4;
  const R = 1.6;
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(box(0.1, H, 0.1, (sx * W) / 2, H / 2, (sz * D) / 2));
  for (const y of [0, H]) for (const sz of [-1, 1]) add(box(W, 0.1, 0.1, 0, y, (sz * D) / 2));
  for (const y of [0, H]) for (const sx of [-1, 1]) add(box(0.1, 0.1, D, (sx * W) / 2, y, 0));
  for (const sx of [-1, 1]) {
    add(between(V((sx * W) / 2 + sx * 0.25, H - 0.15, D / 2 + 0.1), V(0, H + R, D / 2 + 0.1), 0.05, 6), 60);
    add(between(V((sx * W) / 2 + sx * 0.25, H - 0.15, -D / 2 - 0.1), V(0, H + R, -D / 2 - 0.1), 0.05, 6), 60);
    add(between(V((sx * W) / 2 + sx * 0.25, H - 0.15, D / 2 + 0.1), V((sx * W) / 2 + sx * 0.25, H - 0.15, -D / 2 - 0.1), 0.05, 6), 60);
    for (let k = 1; k < 6; k++) {
      const t = k / 6;
      add(between(V(sx * (W / 2 + 0.25) * (1 - t), H - 0.15 + (R + 0.15) * t, D / 2 + 0.1), V(sx * (W / 2 + 0.25) * (1 - t), H - 0.15 + (R + 0.15) * t, -D / 2 - 0.1), 0.02, 4), 60);
    }
  }
  add(between(V(0, H + R, D / 2 + 0.1), V(0, H + R, -D / 2 - 0.1), 0.05, 6), 60);
  add(box(0.8, 1.6, 0.06, -0.9, 0.8, D / 2 + 0.03));
  for (const x of [0.5, 1.3]) add(box(0.6, 0.6, 0.06, x, 1.4, D / 2 + 0.03));
  for (const z of [-0.6, 0.6]) add(box(0.06, 0.6, 0.7, W / 2 + 0.03, 1.4, z));
  add(box(0.4, 1.0, 0.4, 1.1, H + R * 0.7, -0.6), 20);
}, 0.6);

const pallet = shape((add) => {
  add(box(2.4, 0.12, 2.0, 0, 0.06, 0));
  for (const x of [-1, 0, 1]) add(box(0.2, 0.2, 2.0, x * 1.05, 0.22, 0));
  add(box(2.4, 0.08, 2.0, 0, 0.36, 0));
  const crates: [number, number, number, number][] = [[-0.6, 0.4, -0.45, 0.8], [0.55, 0.4, -0.45, 0.8], [-0.6, 0.4, 0.5, 0.8], [0.55, 0.4, 0.5, 0.8], [0, 1.2, 0, 0.8]];
  for (const [x, y, z, s] of crates) {
    add(new RoundedBoxGeometry(s * 1.2, s, s, 1, 0.03).translate(x, y + s / 2, z), 30);
    add(box(s * 1.21, 0.06, 0.04, x, y + s / 2, z + s / 2), 30);
  }
}, 0.5);


const turning = (s: ShapeBuilder): ShapeBuilder => async (count) => ({ ...(await s(count)), motion: "spin" });

const crane = shape((add) => {
  const H = 8;
  const J = H + 0.3;
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  for (const [x, z] of [[-0.3, -0.3], [0.3, -0.3], [0.3, 0.3], [-0.3, 0.3]]) add(box(0.05, H, 0.05, x, H / 2, z));
  for (let y = 0.6; y <= H; y += 0.6) {
    for (const s of [-1, 1]) {
      add(box(0.6, 0.03, 0.03, 0, y, s * 0.3));
      add(box(0.03, 0.03, 0.6, s * 0.3, y, 0));
    }
    add(between(V(-0.3, y - 0.6, 0.3), V(0.3, y, 0.3), 0.015, 4), 60);
    add(between(V(0.3, y - 0.6, -0.3), V(-0.3, y, -0.3), 0.015, 4), 60);
  }
  for (const z of [-0.2, 0.2]) add(box(6, 0.05, 0.05, 2.7, J, z));
  add(box(6, 0.05, 0.05, 2.7, J + 0.45, 0));
  for (let x = -0.2; x < 5.6; x += 0.5) {
    add(between(V(x, J, 0.2), V(x + 0.25, J + 0.45, 0), 0.012, 4), 60);
    add(between(V(x + 0.25, J + 0.45, 0), V(x + 0.5, J, -0.2), 0.012, 4), 60);
  }
  add(box(2.4, 0.05, 0.4, -1.5, J, 0));
  add(box(0.7, 0.7, 0.5, -2.3, J - 0.3, 0), 20);
  add(box(0.3, 1.6, 0.3, 0, J + 0.8, 0));
  add(between(V(0, J + 1.6, 0), V(5.6, J + 0.45, 0), 0.012, 4), 60);
  add(between(V(0, J + 1.6, 0), V(-2.5, J, 0), 0.012, 4), 60);
  add(box(0.6, 0.5, 0.6, 0.55, J - 0.4, 0.4), 20);
  add(box(0.015, 3, 0.015, 4.2, J - 1.5, 0), 60);
  add(box(0.25, 0.25, 0.25, 4.2, J - 3.1, 0), 20);
  add(box(1.8, 0.12, 0.12, 4.2, J - 3.5, 0), 20);
  add(box(1.6, 0.3, 1.6, 0, 0.15, 0), 20);
}, 0.55);

const helix: ShapeBuilder = (count) =>
  scatter(count, "static", (v) => {
    const turns = 2.6;
    const r = rnd();
    if (r < 0.68) {
      const t = rnd();
      const a = t * Math.PI * 2 * turns + (r < 0.34 ? 0 : Math.PI);
      const rr = 0.6 + (rnd() - 0.5) * 0.05;
      v.set(Math.cos(a) * rr, (t - 0.5) * 4 + (rnd() - 0.5) * 0.04, Math.sin(a) * rr);
    } else {
      const k = Math.floor(rnd() * 34) / 33;
      const a = k * Math.PI * 2 * turns;
      const u = rnd() * 2 - 1;
      v.set(Math.cos(a) * 0.6 * u, (k - 0.5) * 4, Math.sin(a) * 0.6 * u);
    }
  });

const tilted = (s: ShapeBuilder, a: number): ShapeBuilder => async (count) => {
  const res = await s(count);
  const p = res.positions;
  const c = Math.cos(a);
  const n = Math.sin(a);
  for (let i = 0; i < p.length; i += 3) {
    const x = p[i];
    const y = p[i + 1];
    p[i] = c * x - n * y;
    p[i + 1] = n * x + c * y;
  }
  return res;
};

const rackParts = (add: Add) => {
  const W = 0.62;
  const H = 2.0;
  const D = 0.9;
  for (const x of [-1, 1]) for (const z of [-1, 1]) add(box(0.04, H, 0.04, (x * W) / 2, H / 2, (z * D) / 2));
  for (const y of [0.02, H]) {
    add(box(W, 0.04, 0.04, 0, y, D / 2));
    add(box(W, 0.04, 0.04, 0, y, -D / 2));
    add(box(0.04, 0.04, D, -W / 2, y, 0));
    add(box(0.04, 0.04, D, W / 2, y, 0));
  }
  const units = [2, 1, 1, 2, 3, 1, 1, 2, 2, 1, 1, 3, 2, 1, 1, 2];
  let y = 0.14;
  for (const u of units) {
    const h = u * 0.09;
    if (y + h > H - 0.08) break;
    add(box(W - 0.08, h - 0.02, 0.02, 0, y + h / 2, D / 2 - 0.02), 30);
    add(box(0.03, 0.03, 0.02, W / 2 - 0.1, y + h / 2, D / 2 + 0.01), 60);
    add(box(0.03, 0.03, 0.02, W / 2 - 0.16, y + h / 2, D / 2 + 0.01), 60);
    y += h + 0.01;
  }
  for (let k = 0; k < 9; k++) add(box(0.01, 0.02, D - 0.1, W / 2, 0.3 + k * 0.17, 0), 60);
};

const rackRow = shape((add) => {
  for (const x of [-0.74, 0, 0.74]) rackParts(moved(add, x, 0, 0));
  add(box(2.4, 0.04, 1.2, 0, 0, 0), 40);
}, 0.6);

const conifer = (add: Add, x: number, y: number, z: number, h: number) => {
  const r = h * 0.3;
  add(cyl(h * 0.03, h * 0.045, h * 0.18, x, y + h * 0.09, z, 6), 40);
  add(new THREE.ConeGeometry(r, h * 0.55, 10).translate(x, y + h * 0.18 + h * 0.275, z), 30);
  add(new THREE.ConeGeometry(r * 0.78, h * 0.45, 10).translate(x, y + h * 0.42 + h * 0.225, z), 30);
  add(new THREE.ConeGeometry(r * 0.52, h * 0.35, 10).translate(x, y + h * 0.65 + h * 0.175, z), 30);
};

const ring = (r: number, y: number, x = 0, z = 0, t = 0.03) => new THREE.TorusGeometry(r, t, 4, 96).rotateX(Math.PI / 2).translate(x, y, z);

export const grove = shape((add) => {
  const R = 3;
  const dome = (r: number) => 1.5 * Math.exp(-((r / 2.2) ** 2));
  for (let k = 0; k <= 7; k++) {
    const r = R * (1 - k / 8);
    add(ring(r, dome(r), 0, 0, k ? 0.025 : 0.045), 40);
  }
  conifer(add, 0, dome(0) - 0.1, 0, 3.8);
  const trees: [number, number, number][] = [[1.5, 0.5, 2.0], [-1.45, 0.8, 1.9], [0.4, 1.9, 1.5], [-0.6, -1.6, 1.8], [1.4, -1.3, 1.5], [-2.2, -0.3, 1.3], [2.4, 1.1, 1.1], [-1.7, 2.0, 1.0]];
  for (const [x, z, h] of trees) conifer(add, x, dome(Math.hypot(x, z)) - 0.05, z, h);
}, 0.5);

export const lakeIsland = shape((add) => {
  const R = 3.6;
  const lx = 0.9;
  const lz = 0.5;
  const lift = (x: number, z: number) => Math.max(0, 0.7 * Math.exp(-(((x + 1.2) / 1.8) ** 2) - (((z - 0.4) / 1.6) ** 2)) + 0.35 * Math.sin(x * 1.3 + z));
  for (let k = 0; k <= 5; k++) {
    const r = R * (1 - k * 0.12);
    const pts = Array.from({ length: 121 }, (_, i) => {
      const a = (i / 120) * Math.PI * 2;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      return new THREE.Vector3(x, lift(x, z) * (k / 5), z);
    });
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 240, k ? 0.025 : 0.05, 4, true), 40);
  }
  for (let k = 0; k < 5; k++) add(ring(1.3 - k * 0.24, 0.02, lx, lz, k ? 0.035 : 0.06), 40);
  for (let i = 0; i < 11; i++) {
    const a = i * 2.39996;
    const r = 1.2 + ((i * 0.618) % 1) * 1.9;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (Math.hypot(x - lx, z - lz) < 1.55) continue;
    conifer(add, x, lift(x, z), z, 1.7 + ((i * 0.37) % 1) * 1.1);
  }
}, 0.5);

const riverRidge = shape((add) => {
  const W = 5.8;
  const y = (x: number, z: number) => 1.35 * ridge(x * 1.9, z) - 0.3;
  const rows = [-1.8, -1.0, -0.2, 0.6];
  for (const z of rows) {
    const pts = Array.from({ length: 80 }, (_, i) => {
      const x = -W / 2 + (i / 79) * W;
      return new THREE.Vector3(x, Math.max(0, y(x, z)), z);
    });
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, z === rows[0] ? 0.05 : 0.03, 6, false), 40);
  }
  for (const off of [-0.18, 0.18]) {
    const pts = Array.from({ length: 60 }, (_, i) => {
      const x = -W / 2 + (i / 59) * W;
      return new THREE.Vector3(x, 0.01, 1.35 + Math.sin(x * 0.9) * 0.45 + off * (1 + 0.4 * Math.cos(x * 1.3)));
    });
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, 0.03, 4, false), 40);
  }
  for (let i = 0; i < 7; i++) {
    const x = -W / 2 + 0.5 + (i * (W - 1)) / 6;
    const z = 0.7 - (i % 2) * 0.5;
    conifer(add, x, Math.max(0, y(x, z)) - 0.05, z, 0.9 + ((i * 0.53) % 1) * 0.6);
  }
}, 0.5);
const solarPanel = shape((add) => {
  const turn: Add = (g, t) => add(g.rotateY(-0.55), t);
  const cols = 5;
  const rows = 3;
  const C = 0.72;
  const G = 0.16;
  const W = cols * C + (cols + 1) * G;
  const D = rows * C + (rows + 1) * G;
  const tilt: Add = (g, t) => turn(g.rotateX(0.75).translate(0, 1.3, 0), t);
  for (let c = 0; c < cols; c++)
    for (let r = 0; r < rows; r++) tilt(box(C, 0.04, C, -W / 2 + G + C / 2 + c * (C + G), 0, -D / 2 + G + C / 2 + r * (C + G)), 20);
  for (const s of [-1, 1]) {
    tilt(box(W + 0.16, 0.16, 0.08, 0, -0.03, s * (D / 2 + 0.04)));
    tilt(box(0.08, 0.16, D, s * (W / 2 + 0.04), -0.03, 0));
  }
  for (const x of [-1.3, 1.3]) {
    turn(box(0.12, 0.62, 0.12, x, 0.31, 0.75));
    turn(box(0.12, 1.95, 0.12, x, 0.975, -0.75));
    turn(box(0.1, 0.1, 1.9, x, 0.05, 0));
  }
}, 0.6);

const laptop = shape((add) => {
  const turn: Add = (g, t) => add(g.rotateY(-0.7), t);
  const W = 4;
  const D = 2.8;
  const T = 0.16;
  const H = 2.7;
  turn(box(W, T, D, 0, T / 2, 0));
  turn(box(3.4, 0.02, 1.3, 0, T + 0.01, -0.55));
  turn(box(1.3, 0.02, 0.75, 0, T + 0.01, 0.85));
  const lid: Add = (g, t) => turn(g.rotateX(-0.3).translate(0, T, -D / 2 + 0.05), t);
  lid(box(W, H, 0.1, 0, H / 2, 0));
  lid(box(W - 0.4, H - 0.45, 0.02, 0, H / 2 + 0.05, 0.07));
}, 0.6);

const coinPile = shape((add) => {
  const stacks: [number, number, number][] = [[-1.15, -0.6, 7], [1.15, -0.6, 5], [0, 1.1, 3]];
  for (const [x, z, n] of stacks)
    for (let i = 0; i < n; i++) coinAt(add, pose(x + Math.sin(i * 2.3) * 0.03, COIN_T * 2 * (i + 0.5), z + Math.cos(i * 1.7) * 0.03), 1, i === n - 1);
}, 0.75);

const barBlock = shape((add) => {
  const B = 0.8;
  const G = 0.5;
  const hs = [1.8, 3.0, 4.4, 6.0];
  const L = hs.length * B + (hs.length + 1) * G;
  add(new RoundedBoxGeometry(L, 0.34, B + 2 * G, 2, 0.06).translate(0, -0.17, 0), 30);
  add(box(L + 0.02, 0.02, B + 2 * G + 0.02, 0, -0.17, 0), 50);
  hs.forEach((h, i) => {
    const x = -L / 2 + G + B / 2 + i * (B + G);
    add(new RoundedBoxGeometry(B, h, B, 2, 0.05).translate(x, h / 2, 0), 22);
    for (let k = 1; k * 0.5 < h - 0.1; k++) add(box(B + 0.02, 0.02, B + 0.02, x, k * 0.5, 0), 60);
  });
}, 0.55);

const medCross = shape((add) => {
  const a = 0.58;
  const b = 1.6;
  const s = new THREE.Shape();
  const pts: [number, number][] = [[-a, b], [a, b], [a, a], [b, a], [b, -a], [a, -a], [a, -b], [-a, -b], [-a, -a], [-b, -a], [-b, a], [-a, a]];
  pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  s.closePath();
  add(extrude(s, 0.7, 0.08), 30);
}, 0.4);

export const contourField: ShapeBuilder = (count) => {
  const W = 2;
  const Hh = 1.2;
  const topo = (x: number, y: number) => Math.sin(x * 1.1 + Math.sin(y * 1.6) * 1.2) * 0.55 + Math.sin(y * 2.1 - x * 0.7) * 0.35 + Math.sin(x * 2.6 + y * 2.9) * 0.1;
  return scatter(count, "flow", (v) => {
    for (let n = 0; n < 48; n++) {
      const x = (rnd() * 2 - 1) * W;
      const y = (rnd() * 2 - 1) * Hh;
      const h = topo(x, y);
      const f = (((h + 2) * 4.5) % 1 + 1) % 1;
      if (f < 0.08 || n === 47) return void v.set(x, y, h * 0.25 + (rnd() - 0.5) * 0.04);
    }
  });
};


const windRow = (wide: boolean) =>
  shape((add) => {
    const row: [number, number, number][] = wide ? [[-13, 0.7, 0.2], [-4.5, 1, 0.9], [4, 0.8, 0.5], [11, 0.6, 1.3]] : [[-6, 0.75, 0.2], [0, 1, 0.9], [5.5, 0.65, 0.5]];
    for (const [x, s, phase] of row) turbineParts(moved(add, x, 0, 0, s), phase);
    add(box(wide ? 31 : 19.5, 0.06, 0.06, wide ? -1.25 : -0.5, 0, 0.6), 40);
  }, 0.3);

const candleChart = (wide: boolean) =>
  shape((add) => {
    const closes = (wide ? [0, 0.9, 0.4, 1.6, 1.1, 2.2, 3.0, 2.5, 3.6, 4.4, 3.9, 5.1, 6.0] : [0, 1.1, 0.5, 2.0, 1.5, 2.9, 2.4, 4.0]).map((c) => c * 0.8);
    const step = wide ? 1.4 : 1.3;
    const B = 1.0;
    const x0 = (-(closes.length - 1) * step) / 2;
    let open = -0.6;
    closes.forEach((c, i) => {
      const x = x0 + i * step;
      const lo = Math.min(open, c);
      const hi = Math.max(open, c, lo + 0.6);
      const top = hi + 0.4 + (i % 3) * 0.18;
      const bot = lo - 0.35 - (i % 2) * 0.2;
      add(box(0.16, top - hi, 0.16, x, (top + hi) / 2, 0), 40);
      add(box(0.16, lo - bot, 0.16, x, (lo + bot) / 2, 0), 40);
      if (c >= open) add(new RoundedBoxGeometry(B, hi - lo, B, 1, 0.04).translate(x, (hi + lo) / 2, 0), 25);
      else
        for (const s of [-1, 1]) {
          add(box(0.1, hi - lo, B, x + s * (B / 2 - 0.05), (hi + lo) / 2, 0));
          add(box(B, 0.1, B, x, s > 0 ? hi - 0.05 : lo + 0.05, 0));
        }
      open = c;
    });
    add(box((closes.length - 1) * step + B * 2, 0.08, 0.08, 0, -1.4, 0), 40);
  }, 0.5);

const skyline = (wide: boolean) =>
  shape((add) => {
    const blocks: [number, number][] = wide
      ? [[1.6, 3.0], [1.2, 4.4], [1.8, 3.6], [1.4, 5.2], [2.0, 6.6], [1.3, 5.6], [1.7, 4.2], [1.1, 4.8]]
      : [[1.4, 3.4], [1.6, 4.8], [2.0, 6.4], [1.5, 5.2], [1.3, 3.8]];
    const G = wide ? 0.9 : 0.7;
    const total = blocks.reduce((a, [w]) => a + w, 0) + G * (blocks.length - 1);
    const tall = blocks.reduce((m, b, i) => (b[1] > blocks[m][1] ? i : m), 0);
    let x = -total / 2;
    blocks.forEach(([w, h], i) => {
      const cx = x + w / 2;
      const d = 1.2 + (i % 3) * 0.25;
      const z = (i % 2) * 0.2 - 0.1;
      add(box(w, h, d, cx, h / 2, z), 30);
      for (let y = 0.5; y < h - 0.2; y += 0.5) add(box(w + 0.05, 0.04, d + 0.05, cx, y, z), 60);
      for (let k = 1; k * 0.38 < w - 0.15; k++) add(box(0.03, h - 0.3, 0.03, cx - w / 2 + k * 0.38, h / 2, z + d / 2 + 0.02), 60);
      if (i === tall) {
        add(box(w * 0.6, 0.35, d * 0.6, cx, h + 0.17, z));
        add(cyl(0.03, 0.06, 1.0, cx, h + 0.85, z, 8), 40);
      }
      x += w + G;
    });
    add(box(total + 0.6, 0.06, 0.06, 0, 0, 0.9), 40);
  }, 0.45);

const truck = (wide: boolean) =>
  shape((add) => {
    const v: Add = (g, t) => add(g.rotateY(0.08), t);
    const L = wide ? 6.06 : 4.4;
    const W = 2.44;
    const rear = -0.45 - L;
    const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
    v(box(L + 2.7, 0.25, 1.6, (rear + 2.25) / 2, 0.78, 0));
    v(box(L + 0.1, 0.2, W, -0.45 - L / 2, 1.18, 0), 25);
    boxIn(v, L, -0.45 - L / 2, 1.28, 0, 0);
    const side = new THREE.Shape();
    side.moveTo(0, 0.9);
    side.lineTo(2.3, 0.9);
    side.lineTo(2.3, 2.2);
    side.lineTo(1.9, 3.4);
    side.lineTo(0, 3.4);
    side.closePath();
    const pane = new THREE.Path();
    pane.moveTo(0.88, 2.3);
    pane.lineTo(1.9, 2.3);
    pane.lineTo(1.9, 2.95);
    pane.lineTo(1.78, 3.2);
    pane.lineTo(0.88, 3.2);
    pane.closePath();
    side.holes.push(pane);
    for (const s of [-1, 1]) v(extrude(side, 0.08, 0.02).translate(0, 0, s * (W / 2 - 0.04)), 25);
    v(box(1.9, 0.08, W, 0.95, 3.4, 0), 25);
    v(box(0.08, 2.5, W, 0.04, 2.15, 0), 25);
    v(box(0.08, 1.3, W, 2.26, 1.55, 0), 25);
    const zs = W / 2 - 0.15;
    const a = V(2.32, 2.3, zs);
    const b = V(1.95, 3.3, zs);
    const c = V(1.95, 3.3, -zs);
    const d = V(2.32, 2.3, -zs);
    for (const [p, q] of [[a, b], [b, c], [c, d], [d, a]]) v(between(p, q, 0.05, 6), 60);
    v(between(V(2.32, 2.3, 0), V(1.95, 3.3, 0), 0.04, 6), 60);
    for (const s of [-1, 1]) {
      const z = s * (W / 2 + 0.07);
      v(box(0.04, 1.2, 0.04, 2.0, 1.55, z), 60);
      v(cylX(0.14, 0.06, 2.34, 1.15, s * (W / 2 - 0.32)), 40);
      v(cylX(0.3, 0.9, 0.5, 0.6, s * (W / 2 - 0.4), 20), 40);
    }
    for (const y of [1.35, 1.6, 1.85]) v(box(0.05, 0.06, W - 0.9, 2.33, y, 0), 60);
    v(box(0.2, 0.3, W + 0.1, 2.38, 1.0, 0));
    for (const x of [1.55, rear + 0.9, rear + 2.1])
      for (const s of [-1, 1]) {
        const z = s * (W / 2 - 0.25);
        v(new THREE.TorusGeometry(0.4, 0.2, 8, 32).translate(x, 0.6, z), 40);
        v(cylZ(0.28, 0.3, x, 0.6, z + s * 0.05, 16), 40);
      }
  }, 0.5);

const chipBoard = (wide: boolean) =>
  shape((add) => {
    const f: Add = (g, t) => add(g.rotateX(-0.35), t);
    const S = 3;
    const T = 0.36;
    const V = (x: number, y: number) => new THREE.Vector3(x, y, 0);
    f(new RoundedBoxGeometry(S, S, T, 2, 0.08), 30);
    f(box(1.7, 1.7, 0.08, 0, 0, T / 2 + 0.04), 30);
    f(new THREE.TorusGeometry(0.62, 0.02, 4, 64).translate(0, 0, T / 2 + 0.09), 40);
    f(new THREE.TorusGeometry(0.1, 0.025, 4, 24).translate(-1.05, 1.05, T / 2 + 0.01), 40);
    const n = 10;
    for (let i = 0; i < n; i++) {
      const t = -S / 2 + 0.25 + (i * (S - 0.5)) / (n - 1);
      const dy = t > 0 ? 0.25 : -0.25;
      for (const s of [-1, 1]) {
        f(box(0.36, 0.08, 0.06, s * (S / 2 + 0.18), t, 0));
        f(box(0.08, 0.36, 0.06, t, s * (S / 2 + 0.18), 0));
        if (i % 2) continue;
        const len = (wide ? 1.6 : 0.4) + ((i * 7 + (s > 0 ? 3 : 0)) % 5) * (wide ? 0.35 : 0.18);
        const x1 = s * (S / 2 + 0.36 + len);
        f(box(len, 0.04, 0.03, s * (S / 2 + 0.36 + len / 2), t, 0), 60);
        f(between(V(x1, t), V(x1 + s * 0.3, t + dy), 0.02, 4), 60);
        f(new THREE.TorusGeometry(0.08, 0.025, 4, 16).translate(x1 + s * 0.38, t + dy * 1.3, 0), 60);
        const up = 0.15 + (i % 3) * 0.1;
        f(box(0.04, up, 0.03, t, s * (S / 2 + 0.36 + up / 2), 0), 60);
        f(new THREE.TorusGeometry(0.07, 0.022, 4, 16).translate(t, s * (S / 2 + 0.45 + up), 0), 60);
      }
    }
  }, 0.5);

const dna = (wide: boolean) =>
  shape((add) => {
    const L = wide ? 7.4 : 5.4;
    const R = 1.4;
    const P = 3.4;
    const at = (x: number, ph: number) => {
      const a = (x / P) * Math.PI * 2 + ph;
      return new THREE.Vector3(x, R * Math.cos(a), R * Math.sin(a));
    };
    for (const ph of [0, Math.PI]) {
      const curve = new THREE.CatmullRomCurve3(Array.from({ length: 120 }, (_, i) => at(-L / 2 + (i / 119) * L, ph)));
      add(new THREE.TubeGeometry(curve, 240, wide ? 0.11 : 0.14, 8, false), 40);
    }
    for (let x = -L / 2 + 0.25; x < L / 2; x += wide ? 0.42 : 0.5) {
      const p = at(x, 0);
      const q = at(x, Math.PI);
      add(between(p, q, wide ? 0.05 : 0.07, 6), 40);
      for (const e of [p, q]) add(new THREE.SphereGeometry(wide ? 0.15 : 0.19, 10, 8).translate(e.x, e.y, e.z), 40);
    }
  }, 0.4);

const ridge = (x: number, z: number) =>
  1.7 * Math.exp(-(((x - 2.4) / 3) ** 2)) + 1.2 * Math.exp(-(((x + 3.6) / 2.6) ** 2)) + 0.3 * Math.sin(x * 0.8 + z * 0.9) + 0.2 * Math.cos(x * 1.7 - z) - z * 0.3;

export const hills = (wide: boolean) =>
  shape((add) => {
    const tilt: Add = (g, t) => add(g.rotateX(0.3), t);
    const W = wide ? 14 : 9;
    const k = 14 / W;
    const y = (x: number, z: number) => ridge(x * k, z);
    const rows = wide ? [-2.4, -1.6, -0.8, 0, 0.8, 1.6] : [-2.4, -1.2, 0, 1.2];
    for (const z of rows) {
      const pts = Array.from({ length: 80 }, (_, i) => {
        const x = -W / 2 + (i / 79) * W;
        return new THREE.Vector3(x, y(x, z), z);
      });
      tilt(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, z === rows[0] ? 0.05 : 0.03, 6, false), 40);
    }
    const trees = wide ? 20 : 10;
    const step = (W - 1.2) / trees;
    for (let i = 0; i < trees; i++) {
      const x = -W / 2 + 0.6 + (i + 0.5) * step + Math.sin(i * 12.9) * step * 0.2;
      const z = rows[rows.length - 1 - (i % 3)] - 0.2;
      const h = (wide ? 1.0 : 1.25) * (0.8 + 0.4 * ((Math.sin(i * 7.3) + 1) / 2));
      const r = h * 0.3;
      const b = y(x, z);
      tilt(cyl(0.05, 0.07, 0.3, x, b + 0.15, z, 6), 40);
      tilt(new THREE.ConeGeometry(r, h, 8).translate(x, b + 0.3 + h / 2, z), 30);
      tilt(new THREE.ConeGeometry(r * 0.75, h * 0.6, 8).translate(x, b + 0.3 + h * 0.75, z), 30);
    }
  }, 0.5);

const heartPulse = shape((add) => {
  const s = new THREE.Shape();
  s.moveTo(0, -0.85);
  s.bezierCurveTo(-0.4, -0.45, -1, -0.05, -1, 0.38);
  s.bezierCurveTo(-1, 0.78, -0.62, 0.98, -0.42, 0.98);
  s.bezierCurveTo(-0.2, 0.98, -0.05, 0.84, 0, 0.64);
  s.bezierCurveTo(0.05, 0.84, 0.2, 0.98, 0.42, 0.98);
  s.bezierCurveTo(0.62, 0.98, 1, 0.78, 1, 0.38);
  s.bezierCurveTo(1, -0.05, 0.4, -0.45, 0, -0.85);
  add(extrude(s, 0.4, 0.06), 30);
  const pts: [number, number][] = [[-1.25, 0.1], [-0.45, 0.1], [-0.3, 0.42], [-0.12, -0.3], [0.06, 0.62], [0.22, 0.1], [1.25, 0.1]];
  for (let i = 0; i < pts.length - 1; i++) add(between(new THREE.Vector3(pts[i][0], pts[i][1], 0.32), new THREE.Vector3(pts[i + 1][0], pts[i + 1][1], 0.32), 0.035, 6), 60);
}, 0.5);

export type AlethiaRole = ParticleRole | "visit";

export const ALETHIA_ROLES: Record<string, Partial<Record<AlethiaRole, ShapeBuilder>>> = {
  earth: { overview: lakeIsland, scan: grove, visit: riverRidge },
  landscaping: { overview: treeAvenue, scan: canopyTree, visit: riverRidge },
  energy: { overview: solarPanel, scan: turbine(0.3, 4.4), visit: solarPanel },
  architecture: { overview: house, scan: crane, close: turning(house), visit: skyline(false) },
  health: { overview: medCross, scan: tilted(helix, -0.7), visit: heartPulse },
  tech: { overview: laptop, scan: rackRow, visit: chipBoard(false) },
  finance: { overview: coinPile, scan: barBlock, close: turning(oneCoin), visit: bars },
  logistics: { overview: container(6.06), scan: containerTower, visit: pallet },
};

const HERO: Record<string, (wide: boolean) => ShapeBuilder> = {
  earth: hills,
  energy: windRow,
  architecture: skyline,
  health: dna,
  tech: chipBoard,
  finance: candleChart,
  logistics: truck,
  landscaping: hills,
  ...TRADE_HERO,
};

export const ALETHIA_HERO: Record<string, ShapeBuilder> = Object.fromEntries(Object.entries(HERO).map(([id, make]) => [id, make(true)]));

export const ALETHIA_HERO_SMALL: Record<string, ShapeBuilder> = Object.fromEntries(Object.entries(HERO).map(([id, make]) => [id, make(false)]));
